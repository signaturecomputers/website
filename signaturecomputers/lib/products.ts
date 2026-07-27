import { collection, getDocs, doc, getDoc, query, where, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = [
    'laptops', 'desktops', 'monitors', 'accessories', 'memory', 'storage', 'graphics-cards',
    // Accessories subcategories
    'keyboards', 'mouse', 'keyboard-mouse-combo', 'headphones', 'cables',
    'power-adapters', 'bags', 'docks', 'hubs', 'usb-flashdrives', 'dvd-writers',
    // Additional categories
    'workstations', 'cctv'
];

export interface ProductInfo {
    // Basic Info
    title?: string;
    partNo?: string;
    productType?: string; // Added for desktop
    series?: string;
    recommendedUsage?: string;
    idealFor?: string[];

    // Appearance
    appearance?: {
        color?: string;
        design?: string;
        formFactor?: string;
        sizeFit?: string;
    };

    // Operating System
    operatingSystem?: {
        os?: string;
    };

    // Processor
    processor?: {
        generation?: string;
        brand?: string;
        name?: string;
        maxClockSpeed?: string;
        cache?: string;
        cores?: number;
        threads?: number;
        technology?: string;
        chipset?: string;
        frequencyTechnology?: string; // Added for desktop
        footnote?: string; // Added for desktop
    };

    // Memory
    memory?: {
        capacity?: string;
        type?: string;
        speed?: string;
        layout?: string;
        slots?: string; // Added for desktop
        standardMemoryNote?: string; // Added for workstation
    };

    // Storage
    storage?: {
        primaryStorage?: {
            type?: string;
            capacity?: string;
        };
        cloudStorage?: {
            service?: string;
            capacity?: string;
            duration?: string;
        };
        hardDriveDescription?: string; // Added for desktop
        hardDrive2nd?: string; // Added for workstation
        internalDriveBays?: string; // Added for desktop
    };

    // Display
    display?: {
        size?: string;
        diagonal?: string;
        resolution?: string;
        aspectRatio?: string;
        panel?: string;
        antiGlare?: boolean;
        brightness?: string;
        colorGamut?: string;
        touchscreen?: boolean;
        flickerFree?: boolean;
        screenToBodyRatio?: string;
        displayAreaMetric?: string;
        resolutionMaximum?: string;
        resolutionSupported?: string;
        pixelPitch?: string;
        scanFrequencyHorizontal?: string;
        scanFrequencyVertical?: string;
        displayColors?: string;
        onscreenControls?: string;
        features?: string;
        viewAngle?: string;
        tiltAndSwivel?: string;
        vesaMount?: string;
        tilt?: string;
        swivel?: string;
        inputType?: string;
        lowBlueLight?: boolean;
        resolutionNative?: string;
        contrastRatio?: string;
        responseTime?: string;
    };

    // Graphics
    graphics?: {
        gpu?: string;
        dedicated?: boolean;
        footnote?: string; // Added for desktop
    };

    // Audio & Input
    audioAndInput?: {
        speakers?: string;
        touchpad?: string;
        keyboard?: {
            type?: string;
            backlit?: boolean;
            color?: string;
        };
        audioFeatures?: string; // Added for desktop
        pointingDevice?: string; // Added for desktop
    };

    // Connectivity
    connectivity?: {
        wifi?: string;
        bluetooth?: string;
        modernStandby?: boolean;
    };

    // Connectivity and Communications (Added for desktop)
    connectivityAndComms?: {
        networkInterface?: string;
        wireless?: string;
        ioPortLocationFront?: string;
        frontPorts?: string;
        ioPortLocationRear?: string;
        rearPorts?: string;
        expansionSlots?: string;
        expansionSlotsNote?: string; // Added for workstation
        videoConnectors?: string;
    };

    // Ports
    ports?: {
        usbTypeC?: string;
        usbTypeA?: string;
        hdmi?: {
            version?: string;
            count?: number;
        };
        audioJack?: string;
        powerPort?: string;
        rj45?: string; // Added for desktop
    };

    // Camera
    camera?: {
        webcam?: string;
        features?: string[];
    };

    // Battery & Power
    batteryAndPower?: {
        batteryType?: string;
        capacity?: string;
        charger?: string;
        fastCharge?: string;
        power?: string; // Added for desktop
        powerConsumption?: string; // Added for monitor
    };

    security?: {
        micMuteKey?: boolean;
        cameraPrivacyShutter?: boolean;
        fingerprint?: boolean;
        tpm?: string;
        securityManagement?: string; // Added for desktop
        securityManagementFootnote?: string; // Added for workstation
        physicalSecurity?: string; // Added for monitor
    };

    // Software
    software?: {
        preInstalled?: Array<{
            name?: string;
            trialPeriod?: string;
        }>;
        softwareIncluded?: string; // Added for desktop
        managementFeatures?: string; // Added for workstation
        manageabilityFeaturesFootnote?: string; // Added for workstation
        footnote?: string; // Added for desktop
    };

    // Dimensions & Weight
    dimensionsAndWeight?: {
        dimensions?: {
            front?: string;
            rear?: string;
        };
        weight?: string;
        dimensionsText?: string; // Added for desktop
        dimensionNote?: string; // Added for desktop
        weightNote?: string; // Added for desktop
        dimensionsWithStand?: string; // Added for monitor
    };

    // Warranty
    warranty?: {
        duration?: string;
        coverage?: string;
        onSiteService?: boolean;
        warrantyText?: string; // Added for desktop
        footnote?: string; // Added for workstation
    };

    // Certifications
    certifications?: {
        energyStar?: boolean;
    };

    // Environmental
    environmental?: {
        oceanBoundPlastic?: boolean;
        recycledKeycaps?: boolean;
        footnote?: string; // Added for desktop
        operatingTemperature?: string; // Added for monitor
        energyCompliance?: string; // Added for monitor
        general?: string; // Added for monitor
        certifications?: string; // Added for monitor
    };

    // Custom fields for each section (dynamic fields added by admin)
    basicCustomFields?: Array<{ label: string; value: string; type?: string }>;
    appearanceCustomFields?: Array<{ label: string; value: string; type?: string }>;
    osCustomFields?: Array<{ label: string; value: string; type?: string }>;
    processorCustomFields?: Array<{ label: string; value: string; type?: string }>;
    memoryCustomFields?: Array<{ label: string; value: string; type?: string }>;
    storageCustomFields?: Array<{ label: string; value: string; type?: string }>;
    displayCustomFields?: Array<{ label: string; value: string; type?: string }>;
    graphicsCustomFields?: Array<{ label: string; value: string; type?: string }>;
    audioCustomFields?: Array<{ label: string; value: string; type?: string }>;
    connectivityCustomFields?: Array<{ label: string; value: string; type?: string }>;
    portsCustomFields?: Array<{ label: string; value: string; type?: string }>;
    cameraCustomFields?: Array<{ label: string; value: string; type?: string }>;
    batteryCustomFields?: Array<{ label: string; value: string; type?: string }>;
    securityCustomFields?: Array<{ label: string; value: string; type?: string }>;
    dimensionsCustomFields?: Array<{ label: string; value: string; type?: string }>;
    warrantyCustomFields?: Array<{ label: string; value: string; type?: string }>;
    certificationsCustomFields?: Array<{ label: string; value: string; type?: string }>;
    environmentalCustomFields?: Array<{ label: string; value: string; type?: string }>;

    // Custom labels for default fields (when admin edits them)
    fieldLabels?: Record<string, string>;

    // Custom section titles (when admin renames sections)
    sectionTitles?: Record<string, string>;

    // Hidden sections (when admin hides sections)
    hiddenSections?: string[];

    // Monitor additions
    whatsInTheBox?: string;
    legalDisclaimer?: string;

    // Docks and Hubs additions
    powerButton?: string;
    externalPortsLocation04?: string;
    externalPorts04?: string;
    compatibleOS?: string;
    minimumSystemRequirements?: string;
    minDimensions?: string;
    hardwareCompatibility?: string;
    powerToHost?: string;
    powerDelivery?: string;
    cableLength?: string;
    specialFeatures?: string;
    micSensitivity?: string;
    micType?: string;
    speakerSensitivity?: string;
    speakerSize?: string;
    impedance?: string;
    frequencyMhz?: string;
    cableType?: string;
    connector1?: string;
    connector2?: string;
    supportedStandard?: string;
    maxResolution?: string;
    refreshRateSupport?: string;
    compatibleDevices?: string;
    compatiblePorts?: string;
    inputVoltage?: string;
    currentRating?: string;
    connectorType?: string;
    isPowerCable?: boolean;
    hostInterface?: string;
    numberOfPorts?: string;
    usbPortConfiguration?: string;
    hdmiPort?: string;
    vgaPort?: string;
    ethernetPort?: string;
    audioPort?: string;
    sdCardSlot?: string;
    microSdCardSlot?: string;
    usbCPdPort?: string;
    dataTransferSpeed?: string;
    hdmiResolution?: string;
    ethernetSpeed?: string;
    cardReaderSpeed?: string;
    plugAndPlay?: string;
    hotSwappable?: string;
    aluminumBody?: string;
    ledIndicator?: string;
    overcurrentProtection?: string;
    overvoltageProtection?: string;
    material?: string;
    refreshRate?: string;
    capacity?: string;
    'interface'?: string;
    readSpeed?: string;
    writeSpeed?: string;
    usbStandard?: string;
    retractableDesign?: string;
    waterResistant?: string;
    shockResistant?: string;
    passwordProtection?: string;
    weight?: string;
    othersType?: 'dvd' | 'webcam' | 'other';
    driveType?: string;
    opticalDriveType?: string;
    supportedDiscFormats?: string;
    slimDesign?: string;
    busPowered?: string;
    mDiscSupport?: string;
    resolution?: string;
    frameRate?: string;
    imageSensor?: string;
    fieldOfView?: string;
    focusType?: string;
    builtInMicrophone?: string;
    microphoneType?: string;
    privacyShutter?: string;
    autoLightCorrection?: string;
    noiseReduction?: string;
    tripodSupport?: string;
    mountType?: string;

    // Memory & Storage addition
    memoryType?: string;
    speed?: string;
    voltage?: string;
    latency?: string;
    formFactorMemory?: string;
    storageType?: string;
    formFactorStorage?: string;
    tbw?: string;
    nandType?: string;
    trimSupport?: string;
    compatibility?: string;
    features?: string;

    // Graphics Cards additions
    cudaCores?: string;
    boostClock?: string;
    baseClock?: string;
    hdmiPorts?: string;
    displayPortPorts?: string;
    dviPorts?: string;
    usbCPorts?: string;
    maxDisplays?: string;
    coolingSolution?: string;
    powerConnectors?: string;
    tdp?: string;
    maxResolutionGraphics?: string;
    directXSupport?: string;
    openGLSupport?: string;
    rayTracingSupport?: string;
    dlssFsrSupport?: string;
    pcieCompatibility?: string;
    cabinetFormFactorCompatibility?: string;
    rgbLighting?: string;
    overclockedEdition?: string;
    vrReady?: string;
    aiAcceleration?: string;
    lowNoiseCooling?: string;
    recommendedPSU?: string;
    rayTracing?: string;
}

export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    stock: number;
    images: string[];
    description: string;
    specs: Record<string, string>;
    category: string;
    // Map for UI
    image: string;  // Changed from optional to required for UI compatibility
    rating?: number;
    // Structured product info
    productInfo?: ProductInfo;
    partNumber?: string;
}

export async function getAllProducts(): Promise<Product[]> {
    try {
        const productPromises = COLLECTIONS.map(async (collectionName) => {
            try {
                const querySnapshot = await getDocs(collection(db, collectionName));
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        category: collectionName, // Add category for filtering
                        image: data.images?.[0] || '',
                        rating: 4.5,
                        partNumber: data.partNumber || data.partNo || data.productInfo?.partNo || '',
                    } as Product;
                });
            } catch (err) {
                console.warn(`Failed to fetch ${collectionName}:`, err);
                return []; // Return empty array on failure (e.g. permission error)
            }
        });

        const results = await Promise.all(productPromises);

        // Flatten the array of arrays
        return results.flat();
    } catch (error) {
        console.warn('Warning: Some collections could not be fetched (likely due to missing permissions):', error);
        return [];
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const promises = COLLECTIONS.map(async (col) => {
            try {
                const snap = await getDoc(doc(db, col, id));
                return snap;
            } catch (err) {
                // If permission denied or other error, return null-like
                console.warn(`Error checking collection ${col}:`, err);
                return null;
            }
        });

        const snapshots = await Promise.all(promises);

        // Filter out nulls and check for existence
        const foundSnap = snapshots.find(snap => snap && snap.exists());

        if (foundSnap) {
            const data = foundSnap.data() || {};
            const category = foundSnap.ref.parent.id; // Get collection name
            return {
                id: foundSnap.id,
                ...data,
                category,
                image: data.images?.[0] || '',
                partNumber: data.partNumber || data.partNo || data.productInfo?.partNo || '',
            } as Product;
        }

        return null;
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
}

// Get related products from same category
export async function getRelatedProducts(category: string, excludeId: string, limitCount: number = 4): Promise<Product[]> {
    try {
        const colRef = collection(db, category);
        const q = query(colRef, firestoreLimit(limitCount + 1));
        const snapshot = await getDocs(q);

        const products = snapshot.docs
            .filter(doc => doc.id !== excludeId)
            .slice(0, limitCount)
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    category,
                    image: data.images?.[0] || '',
                } as Product;
            });

        return products;
    } catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
}

// Get suggested accessories based on product category
export async function getSuggestedAccessories(productCategory: string): Promise<{ category: string; categoryName: string; products: Product[] }[]> {
    try {
        const suggestions: { category: string; categoryName: string; products: Product[] }[] = [];

        if (productCategory === 'laptops') {
            // For laptops: suggest bags and mouse
            const bagsSnapshot = await getDocs(collection(db, 'bags'));
            const mouseSnapshot = await getDocs(collection(db, 'mouse'));

            if (bagsSnapshot.docs.length > 0) {
                const bags = bagsSnapshot.docs.slice(0, 2).map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, category: 'bags', image: data.images?.[0] || '' } as Product;
                });
                suggestions.push({ category: 'bags', categoryName: 'Laptop Bags', products: bags });
            }

            if (mouseSnapshot.docs.length > 0) {
                const mice = mouseSnapshot.docs.slice(0, 2).map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, category: 'mouse', image: data.images?.[0] || '' } as Product;
                });
                suggestions.push({ category: 'mouse', categoryName: 'Mouse', products: mice });
            }
        } else if (productCategory === 'desktops' || productCategory === 'workstations') {
            // For desktops/workstations: suggest monitors
            const monitorsSnapshot = await getDocs(collection(db, 'monitors'));

            if (monitorsSnapshot.docs.length > 0) {
                const monitors = monitorsSnapshot.docs.slice(0, 2).map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, category: 'monitors', image: data.images?.[0] || '' } as Product;
                });
                suggestions.push({ category: 'monitors', categoryName: 'Monitors', products: monitors });
            }
        }

        return suggestions;
    } catch (error) {
        console.error('Error fetching suggested accessories:', error);
        return [];
    }
}

// Category display names for search results
export const CATEGORY_NAMES: Record<string, string> = {
    'laptops': 'Laptops',
    'desktops': 'Desktops',
    'workstations': 'Workstations',
    'monitors': 'Monitors',
    'memory-storage': 'Memory, Storage & Graphics',
    'memory': 'Memory',
    'storage': 'Storage',
    'accessories': 'Accessories',
    'cctv': 'CCTV',
    'keyboards': 'Keyboards',
    'mouse': 'Mouse',
    'keyboard-mouse-combo': 'Keyboard & Mouse Combo',
    'headphones': 'Headphones',
    'cables': 'Cables',
    'power-adapters': 'Power Adapters',
    'bags': 'Bags',
    'docks': 'Docks',
    'hubs': 'Hubs',
    'usb-flashdrives': 'USB Flash Drives',
    'dvd-writers': 'Others',
    'webcams': 'Webcam',
};

export interface SearchResults {
    products: Product[];
    categories: { id: string; name: string }[];
}

export async function searchProducts(query: string): Promise<SearchResults> {
    if (!query || query.trim().length < 2) {
        return { products: [], categories: [] };
    }

    const searchTerm = query.toLowerCase().trim();

    try {
        // Fetch all products
        const allProducts = await getAllProducts();

        // Filter products by name, brand, or part number
        const matchingProducts = allProducts.filter(product => {
            const name = product.name?.toLowerCase() || '';
            const brand = product.brand?.toLowerCase() || '';
            const partNo = product.productInfo?.partNo?.toLowerCase() || '';

            return name.includes(searchTerm) ||
                brand.includes(searchTerm) ||
                partNo.includes(searchTerm);
        }).slice(0, 5); // Limit to 5 products

        // Find matching categories
        const matchingCategories = Object.entries(CATEGORY_NAMES)
            .filter(([id, name]) =>
                name.toLowerCase().includes(searchTerm) ||
                id.toLowerCase().includes(searchTerm)
            )
            .map(([id, name]) => ({ id, name }))
            .slice(0, 3); // Limit to 3 categories

        return {
            products: matchingProducts,
            categories: matchingCategories,
        };
    } catch (error) {
        console.error('Error searching products:', error);
        return { products: [], categories: [] };
    }
}

// Find product by exact part number match
export async function findProductByPartNumber(partNumber: string): Promise<Product | null> {
    if (!partNumber || !partNumber.trim()) {
        return null;
    }

    const searchTerm = partNumber.toLowerCase().trim();

    try {
        const allProducts = await getAllProducts();
        const matchingProduct = allProducts.find(product => {
            const partNo = product.productInfo?.partNo?.toLowerCase() || '';
            return partNo === searchTerm;
        });

        return matchingProduct || null;
    } catch (error) {
        console.error('Error finding product by part number:', error);
        return null;
    }
}
