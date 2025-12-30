'use client';

import { FiCpu, FiMonitor, FiHardDrive, FiWifi, FiBattery, FiShield, FiPackage, FiAward, FiBox, FiCamera, FiSpeaker, FiSettings } from 'react-icons/fi';
import { ProductInfo } from '@/lib/products';

interface ProductInfoSectionProps {
    productInfo: ProductInfo | undefined;
    isAdmin?: boolean;
}

// Helper to check if an object has any truthy values
const hasContent = (obj: any): boolean => {
    if (!obj) return false;
    if (typeof obj !== 'object') return Boolean(obj);
    return Object.values(obj).some(val => {
        if (val === null || val === undefined || val === '') return false;
        if (typeof val === 'object') return hasContent(val);
        return true;
    });
};

// Helper to format boolean values
const formatBoolean = (val: boolean | undefined): string => {
    if (val === undefined) return '';
    return val ? 'Yes' : 'No';
};

// Section component without dropdown - always open
function InfoSection({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <Icon className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
            </div>
            <div className="pl-8">
                {children}
            </div>
        </div>
    );
}

// Info row component
function InfoRow({ label, value }: { label: string; value: string | number | boolean | undefined }) {
    if (value === undefined || value === null || value === '') return null;

    const displayValue = typeof value === 'boolean' ? formatBoolean(value) : String(value);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <dt className="text-sm text-gray-500 dark:text-gray-400 sm:w-1/3 mb-1 sm:mb-0">{label}</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white sm:w-2/3">{displayValue}</dd>
        </div>
    );
}

// Helper to render custom fields from arrays like basicCustomFields, portsCustomFields, etc.
function renderCustomFields(customFields: { label: string; value: string }[] | undefined) {
    if (!customFields || customFields.length === 0) return null;

    return customFields
        .filter(field => field.label && field.value) // Only show fields with both label and value
        .map((field, idx) => (
            <InfoRow key={`custom-${idx}`} label={field.label} value={field.value} />
        ));
}

// Helper to get custom section title if set by admin
function getSectionTitle(productInfo: any, defaultTitle: string, sectionKey: string): string {
    const titles = productInfo?.sectionTitles || {};
    return titles[sectionKey] || defaultTitle;
}

// Helper to get custom field label if set by admin
function getFieldLabel(productInfo: any, defaultLabel: string, fieldKey: string): string {
    const labels = productInfo?.fieldLabels || {};
    return labels[fieldKey] || defaultLabel;
}

export default function ProductInfoSection({ productInfo, isAdmin = false }: ProductInfoSectionProps) {
    if (!productInfo || !hasContent(productInfo)) {
        return (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                No detailed product information available.
            </div>
        );
    }

    // Cast to any to access custom fields
    const customProductInfo = productInfo as any;

    return (
        <div className="space-y-4">
            {/* Basic Info */}
            {(productInfo.title || productInfo.series || productInfo.recommendedUsage || productInfo.idealFor?.length || (isAdmin && productInfo.partNo) || customProductInfo.basicCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Product Overview", "basic")} icon={FiPackage}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Title", "basic_title")} value={productInfo.title} />
                        {isAdmin && productInfo.partNo && (
                            <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                        )}
                        <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo.series} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "basic_recommendedUsage")} value={productInfo.recommendedUsage} />
                        {productInfo.idealFor && productInfo.idealFor.length > 0 && (
                            <InfoRow label={getFieldLabel(customProductInfo, "Ideal For", "basic_idealFor")} value={productInfo.idealFor.join(', ')} />
                        )}
                        {renderCustomFields(customProductInfo.basicCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Appearance */}
            {(hasContent(productInfo.appearance) || customProductInfo.appearanceCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Color", "appearance_color")} value={productInfo.appearance?.color} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Design", "appearance_design")} value={productInfo.appearance?.design} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Form Factor", "appearance_formFactor")} value={productInfo.appearance?.formFactor} />
                        {renderCustomFields(customProductInfo.appearanceCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Operating System */}
            {(hasContent(productInfo.operatingSystem) || customProductInfo.osCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Operating System", "os")} icon={FiSettings}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "OS", "os_os")} value={productInfo.operatingSystem?.os} />
                        {renderCustomFields(customProductInfo.osCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Processor */}
            {(hasContent(productInfo.processor) || customProductInfo.processorCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Processor", "processor")} icon={FiCpu}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Processor Name", "processor_name")} value={productInfo.processor?.name} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Brand", "processor_brand")} value={productInfo.processor?.brand} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Generation", "processor_generation")} value={productInfo.processor?.generation} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Max Clock Speed", "processor_maxClockSpeed")} value={productInfo.processor?.maxClockSpeed} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Cores", "processor_cores")} value={productInfo.processor?.cores} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Threads", "processor_threads")} value={productInfo.processor?.threads} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Cache", "processor_cache")} value={productInfo.processor?.cache} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Technology", "processor_technology")} value={productInfo.processor?.technology} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Chipset", "processor_chipset")} value={productInfo.processor?.chipset} />
                        {renderCustomFields(customProductInfo.processorCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Memory */}
            {(hasContent(productInfo.memory) || customProductInfo.memoryCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Memory (RAM)", "memory")} icon={FiHardDrive}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Capacity", "memory_capacity")} value={productInfo.memory?.capacity} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Type", "memory_type")} value={productInfo.memory?.type} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Speed", "memory_speed")} value={productInfo.memory?.speed} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Layout", "memory_layout")} value={productInfo.memory?.layout} />
                        {renderCustomFields(customProductInfo.memoryCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Storage */}
            {(hasContent(productInfo.storage) || customProductInfo.storageCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Storage", "storage")} icon={FiHardDrive}>
                    <dl>
                        {hasContent(productInfo.storage?.primaryStorage) && (
                            <>
                                <InfoRow label={getFieldLabel(customProductInfo, "Primary Storage Type", "storage_primary_type")} value={productInfo.storage?.primaryStorage?.type} />
                                <InfoRow label={getFieldLabel(customProductInfo, "Primary Storage Capacity", "storage_primary_capacity")} value={productInfo.storage?.primaryStorage?.capacity} />
                            </>
                        )}
                        {hasContent(productInfo.storage?.cloudStorage) && (
                            <>
                                <InfoRow label={getFieldLabel(customProductInfo, "Cloud Storage Service", "storage_cloud_service")} value={productInfo.storage?.cloudStorage?.service} />
                                <InfoRow label={getFieldLabel(customProductInfo, "Cloud Storage Capacity", "storage_cloud_capacity")} value={productInfo.storage?.cloudStorage?.capacity} />
                                <InfoRow label={getFieldLabel(customProductInfo, "Cloud Storage Duration", "storage_cloud_duration")} value={productInfo.storage?.cloudStorage?.duration} />
                            </>
                        )}
                        {renderCustomFields(customProductInfo.storageCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Display */}
            {(hasContent(productInfo.display) || customProductInfo.displayCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Display", "display")} icon={FiMonitor}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Size", "display_size")} value={productInfo.display?.size} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Diagonal", "display_diagonal")} value={productInfo.display?.diagonal} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Resolution", "display_resolution")} value={productInfo.display?.resolution} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Aspect Ratio", "display_aspectRatio")} value={productInfo.display?.aspectRatio} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Panel Type", "display_panel")} value={productInfo.display?.panel} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Brightness", "display_brightness")} value={productInfo.display?.brightness} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Color Gamut", "display_colorGamut")} value={productInfo.display?.colorGamut} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Anti-Glare", "display_antiGlare")} value={productInfo.display?.antiGlare} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Touchscreen", "display_touchscreen")} value={productInfo.display?.touchscreen} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Flicker-Free", "display_flickerFree")} value={productInfo.display?.flickerFree} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Screen-to-Body Ratio", "display_screenToBodyRatio")} value={productInfo.display?.screenToBodyRatio} />
                        {renderCustomFields(customProductInfo.displayCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Graphics */}
            {(hasContent(productInfo.graphics) || customProductInfo.graphicsCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Graphics", "graphics")} icon={FiMonitor}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "GPU", "graphics_gpu")} value={productInfo.graphics?.gpu} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Dedicated Graphics", "graphics_dedicated")} value={productInfo.graphics?.dedicated} />
                        {renderCustomFields(customProductInfo.graphicsCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Audio & Input */}
            {(hasContent(productInfo.audioAndInput) || customProductInfo.audioCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Audio & Input", "audio")} icon={FiSpeaker}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Speakers", "audio_speakers")} value={productInfo.audioAndInput?.speakers} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Touchpad", "audio_touchpad")} value={productInfo.audioAndInput?.touchpad} />
                        {hasContent(productInfo.audioAndInput?.keyboard) && (
                            <>
                                <InfoRow label={getFieldLabel(customProductInfo, "Keyboard Type", "audio_keyboard_type")} value={productInfo.audioAndInput?.keyboard?.type} />
                                <InfoRow label={getFieldLabel(customProductInfo, "Backlit Keyboard", "audio_keyboard_backlit")} value={productInfo.audioAndInput?.keyboard?.backlit} />
                                <InfoRow label={getFieldLabel(customProductInfo, "Keyboard Color", "audio_keyboard_color")} value={productInfo.audioAndInput?.keyboard?.color} />
                            </>
                        )}
                        {renderCustomFields(customProductInfo.audioCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Connectivity */}
            {(hasContent(productInfo.connectivity) || customProductInfo.connectivityCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Connectivity", "connectivity")} icon={FiWifi}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "WiFi", "connectivity_wifi")} value={productInfo.connectivity?.wifi} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Bluetooth", "connectivity_bluetooth")} value={productInfo.connectivity?.bluetooth} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Modern Standby", "connectivity_modernStandby")} value={productInfo.connectivity?.modernStandby} />
                        {renderCustomFields(customProductInfo.connectivityCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Ports */}
            {(hasContent(productInfo.ports) || customProductInfo.portsCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Ports & Connections", "ports")} icon={FiSettings}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "USB Type-C", "ports_usbTypeC")} value={productInfo.ports?.usbTypeC} />
                        <InfoRow label={getFieldLabel(customProductInfo, "USB Type-A", "ports_usbTypeA")} value={productInfo.ports?.usbTypeA} />
                        {hasContent(productInfo.ports?.hdmi) && (
                            <InfoRow
                                label={getFieldLabel(customProductInfo, "HDMI", "ports_hdmi")}
                                value={`${productInfo.ports?.hdmi?.count || 1}x HDMI ${productInfo.ports?.hdmi?.version || ''}`}
                            />
                        )}
                        <InfoRow label={getFieldLabel(customProductInfo, "Audio Jack", "ports_audioJack")} value={productInfo.ports?.audioJack} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Power Port", "ports_powerPort")} value={productInfo.ports?.powerPort} />
                        {renderCustomFields(customProductInfo.portsCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Camera */}
            {(hasContent(productInfo.camera) || customProductInfo.cameraCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Camera", "camera")} icon={FiCamera}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Webcam", "camera_webcam")} value={productInfo.camera?.webcam} />
                        {productInfo.camera?.features && productInfo.camera.features.length > 0 && (
                            <InfoRow label={getFieldLabel(customProductInfo, "Features", "camera_features")} value={productInfo.camera.features.join(', ')} />
                        )}
                        {renderCustomFields(customProductInfo.cameraCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Battery & Power */}
            {(hasContent(productInfo.batteryAndPower) || customProductInfo.batteryCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Battery & Power", "battery")} icon={FiBattery}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Battery Type", "battery_batteryType")} value={productInfo.batteryAndPower?.batteryType} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Capacity", "battery_capacity")} value={productInfo.batteryAndPower?.capacity} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Charger", "battery_charger")} value={productInfo.batteryAndPower?.charger} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Fast Charge", "battery_fastCharge")} value={productInfo.batteryAndPower?.fastCharge} />
                        {renderCustomFields(customProductInfo.batteryCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Security */}
            {(hasContent(productInfo.security) || customProductInfo.securityCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Security", "security")} icon={FiShield}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "TPM", "security_tpm")} value={productInfo.security?.tpm} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Mic Mute Key", "security_micMuteKey")} value={productInfo.security?.micMuteKey} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Camera Privacy Shutter", "security_cameraPrivacyShutter")} value={productInfo.security?.cameraPrivacyShutter} />
                        {renderCustomFields(customProductInfo.securityCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Software */}
            {hasContent(productInfo.software) && productInfo.software?.preInstalled && productInfo.software.preInstalled.length > 0 && (
                <InfoSection title={getSectionTitle(customProductInfo, "Pre-installed Software", "software")} icon={FiPackage}>
                    <dl>
                        {productInfo.software.preInstalled.map((sw, idx) => (
                            <InfoRow
                                key={idx}
                                label={sw.name || 'Software'}
                                value={sw.trialPeriod ? `${sw.trialPeriod} trial` : 'Included'}
                            />
                        ))}
                    </dl>
                </InfoSection>
            )}

            {/* Dimensions & Weight */}
            {(hasContent(productInfo.dimensionsAndWeight) || customProductInfo.dimensionsCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Dimensions & Weight", "dimensions")} icon={FiBox}>
                    <dl>
                        {hasContent(productInfo.dimensionsAndWeight?.dimensions) && (
                            <>
                                <InfoRow label={getFieldLabel(customProductInfo, "Front Dimensions", "dimensions_front")} value={productInfo.dimensionsAndWeight?.dimensions?.front} />
                                <InfoRow label={getFieldLabel(customProductInfo, "Rear Dimensions", "dimensions_rear")} value={productInfo.dimensionsAndWeight?.dimensions?.rear} />
                            </>
                        )}
                        <InfoRow label={getFieldLabel(customProductInfo, "Weight", "dimensions_weight")} value={productInfo.dimensionsAndWeight?.weight} />
                        {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Warranty */}
            {(hasContent(productInfo.warranty) || customProductInfo.warrantyCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Duration", "warranty_duration")} value={productInfo.warranty?.duration} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Coverage", "warranty_coverage")} value={productInfo.warranty?.coverage} />
                        <InfoRow label={getFieldLabel(customProductInfo, "On-Site Service", "warranty_onSiteService")} value={productInfo.warranty?.onSiteService} />
                        {renderCustomFields(customProductInfo.warrantyCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Certifications */}
            {(hasContent(productInfo.certifications) || customProductInfo.certificationsCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Certifications", "certifications")} icon={FiAward}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Energy Star", "certifications_energyStar")} value={productInfo.certifications?.energyStar} />
                        {renderCustomFields(customProductInfo.certificationsCustomFields)}
                    </dl>
                </InfoSection>
            )}

            {/* Environmental */}
            {(hasContent(productInfo.environmental) || customProductInfo.environmentalCustomFields?.length > 0) && (
                <InfoSection title={getSectionTitle(customProductInfo, "Environmental", "environmental")} icon={FiPackage}>
                    <dl>
                        <InfoRow label={getFieldLabel(customProductInfo, "Ocean-Bound Plastic", "environmental_oceanBoundPlastic")} value={productInfo.environmental?.oceanBoundPlastic} />
                        <InfoRow label={getFieldLabel(customProductInfo, "Recycled Keycaps", "environmental_recycledKeycaps")} value={productInfo.environmental?.recycledKeycaps} />
                        {renderCustomFields(customProductInfo.environmentalCustomFields)}
                    </dl>
                </InfoSection>
            )}
        </div>
    );
}
