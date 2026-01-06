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

// Helper to render category specific fields that are not part of the standard ProductInfo interface
function renderCategorySpecificFields(productInfo: any) {
    const sections = [];

    // Helper to check if a specific field exists in productInfo
    const has = (key: string) => productInfo[key] !== undefined && productInfo[key] !== null && productInfo[key] !== '';

    // Monitors: Display specific Monitor fields
    if (has('screenSizeCm') || has('resolutionNative') || has('panelType') || has('brightnessNits') || has('displayInputs')) {
        sections.push(
            <InfoSection key="monitor-specs" title={getSectionTitle(productInfo, "Monitor Specifications", "monitorSpecs")} icon={FiMonitor}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Screen Size (cm)", "monitor_screenSize")} value={productInfo.screenSizeCm} />
                    <InfoRow label={getFieldLabel(productInfo, "Native Resolution", "monitor_resolution")} value={productInfo.resolutionNative} />
                    <InfoRow label={getFieldLabel(productInfo, "Panel Type", "monitor_panelType")} value={productInfo.panelType} />
                    <InfoRow label={getFieldLabel(productInfo, "Brightness", "monitor_brightness")} value={productInfo.brightnessNits} />
                    <InfoRow label={getFieldLabel(productInfo, "Response Time", "monitor_responseTime")} value={productInfo.responseTime} />
                    <InfoRow label={getFieldLabel(productInfo, "Refresh Rate", "monitor_refreshRate")} value={productInfo.refreshRate} />
                    <InfoRow label={getFieldLabel(productInfo, "Aspect Ratio", "monitor_aspectRatio")} value={productInfo.aspectRatio} />
                    <InfoRow label={getFieldLabel(productInfo, "Contrast Ratio", "monitor_contrastRatio")} value={productInfo.contrastRatio} />
                    <InfoRow label={getFieldLabel(productInfo, "Color Support", "monitor_colorSupport")} value={productInfo.colorSupport} />
                    <InfoRow label={getFieldLabel(productInfo, "Display Inputs", "monitor_displayInputs")} value={productInfo.displayInputs} />
                </dl>
            </InfoSection>
        );
    }

    // Monitors: Power
    if (has('inputVoltage') || has('operatingTemp') || has('powerMaximum')) {
        sections.push(
            <InfoSection key="monitor-power" title={getSectionTitle(productInfo, "Power", "power")} icon={FiBattery}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Input Voltage", "monitor_inputVoltage")} value={productInfo.inputVoltage} />
                    <InfoRow label={getFieldLabel(productInfo, "Operating Temperature", "monitor_operatingTemp")} value={productInfo.operatingTemp} />
                    <InfoRow label={getFieldLabel(productInfo, "Power Consumption (Max)", "monitor_powerMaximum")} value={productInfo.powerMaximum} />
                    <InfoRow label={getFieldLabel(productInfo, "Power Consumption (Typical)", "monitor_powerTypical")} value={productInfo.powerTypical} />
                    <InfoRow label={getFieldLabel(productInfo, "Power Consumption (Standby)", "monitor_powerStandby")} value={productInfo.powerStandby} />
                </dl>
            </InfoSection>
        );
    }

    // Monitors: Dimensions
    if (has('dimNoStandWidth') || has('dimWithStandWidth')) {
        sections.push(
            <InfoSection key="monitor-dimensions" title={getSectionTitle(productInfo, "Dimensions & Weight", "dimensions")} icon={FiBox}>
                <dl>
                    {/* Dimensions Without Stand */}
                    {(has('dimNoStandWidth') || has('dimNoStandDepth') || has('dimNoStandHeight')) && (
                        <>
                            <div className="py-2 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800">Dimensions Without Stand (cm)</div>
                            <InfoRow label={getFieldLabel(productInfo, "Width", "monitor_dimNoStandWidth")} value={productInfo.dimNoStandWidth} />
                            <InfoRow label={getFieldLabel(productInfo, "Depth", "monitor_dimNoStandDepth")} value={productInfo.dimNoStandDepth} />
                            <InfoRow label={getFieldLabel(productInfo, "Height", "monitor_dimNoStandHeight")} value={productInfo.dimNoStandHeight} />
                        </>
                    )}
                    {/* Dimensions With Stand */}
                    {(has('dimWithStandWidth') || has('dimWithStandDepth') || has('dimWithStandHeight')) && (
                        <>
                            <div className="py-2 text-sm font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 mt-2">Dimensions With Stand (cm)</div>
                            <InfoRow label={getFieldLabel(productInfo, "Width", "monitor_dimWithStandWidth")} value={productInfo.dimWithStandWidth} />
                            <InfoRow label={getFieldLabel(productInfo, "Depth", "monitor_dimWithStandDepth")} value={productInfo.dimWithStandDepth} />
                            <InfoRow label={getFieldLabel(productInfo, "Height", "monitor_dimWithStandHeight")} value={productInfo.dimWithStandHeight} />
                        </>
                    )}
                    <InfoRow label={getFieldLabel(productInfo, "Weight", "monitor_weight")} value={productInfo.weight} />
                </dl>
            </InfoSection>
        );
    }

    // Monitors: In The Box & Notes/Cables
    if (has('inTheBox') || has('includedCables')) {
        sections.push(
            <InfoSection key="monitor-box" title={getSectionTitle(productInfo, "In The Box", "inTheBox")} icon={FiPackage}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Contents", "monitor_inTheBox")} value={productInfo.inTheBox} />
                    <InfoRow label={getFieldLabel(productInfo, "Included Cables", "monitor_includedCables")} value={productInfo.includedCables} />
                </dl>
            </InfoSection>
        );
    }

    // Accessory: Category Info (used by keyboards, mouse, headphones, adapters, bags, docks, usb drives)
    // Excludes Part Number for customer view - partNo is shown only to admin
    if (has('series') && !has('screenSizeCm')) { // Exclude monitors which have their own section
        sections.push(
            <InfoSection key="accessory-category" title={getSectionTitle(productInfo, "Category", "categoryInfo")} icon={FiPackage}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Series", "basic_series")} value={productInfo.series} />
                    {renderCustomFields(productInfo.basicCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Accessory: Usage section
    if (has('recommendedUsage') && !has('screenSizeCm') && !has('processor')) { // Exclude monitors and laptops
        sections.push(
            <InfoSection key="accessory-usage" title={getSectionTitle(productInfo, "Usage", "usage")} icon={FiSettings}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Recommended Usage", "basic_recommendedUsage")} value={productInfo.recommendedUsage} />
                </dl>
            </InfoSection>
        );
    }

    // Accessory: Connection and Communication section (for keyboards, mouse, headphones, docks, usb drives)
    if (has('connectivity') && !has('processor') && !has('screenSizeCm')) { // Exclude laptops and monitors
        sections.push(
            <InfoSection key="accessory-connection" title={getSectionTitle(productInfo, "Connection and Communication", "connection")} icon={FiWifi}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Connectivity", "keyboard_connectivity")} value={productInfo.connectivity} />
                    {renderCustomFields(productInfo.connectivityCustomFields)}
                </dl>
            </InfoSection>
        );
    }


    // Input Devices (Keyboard, Mouse, Combo)
    if (has('connectionType') || has('scrolling') || has('sensorResolution') || has('numberOfButtons')) {
        sections.push(
            <InfoSection key="input-specs" title={getSectionTitle(productInfo, "Multimedia and Input Devices", "multimedia")} icon={FiSettings}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Connection Type", "keyboard_connectionType")} value={productInfo.connectionType} />
                    <InfoRow label={getFieldLabel(productInfo, "Connectivity", "keyboard_connectivity")} value={productInfo.connectivity} />
                    <InfoRow label={getFieldLabel(productInfo, "Sensor Resolution", "mouse_sensorResolution")} value={productInfo.sensorResolution} />
                    <InfoRow label={getFieldLabel(productInfo, "Number of Buttons", "mouse_numberOfButtons")} value={productInfo.numberOfButtons} />
                    <InfoRow label={getFieldLabel(productInfo, "Scrolling", "mouse_scrolling")} value={productInfo.scrolling} />
                </dl>
            </InfoSection>
        );
    }

    // Audio (Headphones) - Multimedia and Input Devices section
    if (has('micSensitivity') || has('speakerSize') || has('micType') || has('speakerSensitivity')) {
        sections.push(
            <InfoSection key="audio-specs" title={getSectionTitle(productInfo, "Multimedia and Input Devices", "multimedia")} icon={FiSpeaker}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Microphone Sensitivity", "headphone_micSensitivity")} value={productInfo.micSensitivity} />
                    <InfoRow label={getFieldLabel(productInfo, "Microphone Type", "headphone_micType")} value={productInfo.micType} />
                    <InfoRow label={getFieldLabel(productInfo, "Speaker Sensitivity", "headphone_speakerSensitivity")} value={productInfo.speakerSensitivity} />
                    <InfoRow label={getFieldLabel(productInfo, "Speaker Size", "headphone_speakerSize")} value={productInfo.speakerSize} />
                    {renderCustomFields(productInfo.audioCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Audio (Headphones) - Battery and Power section (impedance)
    if (has('impedance')) {
        sections.push(
            <InfoSection key="battery-power" title={getSectionTitle(productInfo, "Battery and Power", "batteryPower")} icon={FiBattery}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Impedance", "headphone_impedance")} value={productInfo.impedance} />
                    {renderCustomFields(productInfo.batteryCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Audio (Headphones) - Connectivity and Communications section (frequency)
    if (has('frequency')) {
        sections.push(
            <InfoSection key="connectivity-comms" title={getSectionTitle(productInfo, "Connectivity and Communications", "connectivityComms")} icon={FiWifi}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Frequency (MHz)", "headphone_frequency")} value={productInfo.frequency} />
                </dl>
            </InfoSection>
        );
    }

    // Accessory Dimensions (for headphones, etc.)
    if (has('minDimensions')) {
        sections.push(
            <InfoSection key="accessory-dimensions" title={getSectionTitle(productInfo, "Dimensions", "dimensions")} icon={FiBox}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Minimum Dimensions (W x D x H)", "headphone_dimensions")} value={productInfo.minDimensions} />
                    {renderCustomFields(productInfo.dimensionsCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Accessory Warranty (stored as string for accessories like headphones, bags)
    if (has('warranty') && typeof productInfo.warranty === 'string') {
        sections.push(
            <InfoSection key="accessory-warranty" title={getSectionTitle(productInfo, "Warranty", "warranty")} icon={FiAward}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Warranty", "headphone_warranty")} value={productInfo.warranty} />
                    {renderCustomFields(productInfo.warrantyCustomFields)}
                </dl>
            </InfoSection>
        );
    }


    // Power Adapters
    if (has('inputVoltage') || has('output') || has('connectorType')) {
        sections.push(
            <InfoSection key="adapter-specs" title={getSectionTitle(productInfo, "Storage Specifications", "storageSpecs")} icon={FiBattery}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Input Voltage", "adapter_inputVoltage")} value={productInfo.inputVoltage} />
                    <InfoRow label={getFieldLabel(productInfo, "Output", "adapter_output")} value={productInfo.output} />
                    <InfoRow label={getFieldLabel(productInfo, "Connector Type", "adapter_connectorType")} value={productInfo.connectorType} />
                    <InfoRow label={getFieldLabel(productInfo, "Special Features", "adapter_specialFeatures")} value={productInfo.specialFeatures} />
                </dl>
            </InfoSection>
        );
    }

    // Docks
    if (has('ports') && !productInfo.ports?.usbTypeC) { // Check if it's the ad-hoc 'ports' string, not the object
        sections.push(
            <InfoSection key="dock-specs" title={getSectionTitle(productInfo, "Connection and Communication", "connection")} icon={FiSettings}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Ports", "dock_ports")} value={productInfo.ports} />
                    <InfoRow label={getFieldLabel(productInfo, "Connectivity", "dock_connectivity")} value={productInfo.connectivity} />
                    <InfoRow label={getFieldLabel(productInfo, "Security Management", "dock_security")} value={productInfo.securityManagement} />
                    <InfoRow label={getFieldLabel(productInfo, "Max Displays", "dock_maxDisplays")} value={productInfo.maxDisplays} />
                </dl>
            </InfoSection>
        );
    }

    // USB Flash Drives & Storage
    if (has('capacityNative') || has('interface')) {
        sections.push(
            <InfoSection key="storage-specs" title={getSectionTitle(productInfo, "Storage Specifications", "storageSpecs")} icon={FiHardDrive}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Capacity", "usb_capacity")} value={productInfo.capacityNative} />
                    <InfoRow label={getFieldLabel(productInfo, "Interface", "usb_interface")} value={productInfo.interface} />
                    <InfoRow label={getFieldLabel(productInfo, "Connectivity", "usb_connectivity")} value={productInfo.connectivity} />
                </dl>
            </InfoSection>
        );
    }

    // Bags
    if (has('material') || has('compartments')) {
        sections.push(
            <InfoSection key="bag-specs" title={getSectionTitle(productInfo, "Appearance", "appearance")} icon={FiPackage}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Material", "bag_material")} value={productInfo.material} />
                    <InfoRow label={getFieldLabel(productInfo, "Compartments", "bag_compartments")} value={productInfo.compartments} />
                    <InfoRow label={getFieldLabel(productInfo, "Laptop Size Support", "bag_laptopSize")} value={productInfo.laptopSize} />
                </dl>
            </InfoSection>
        );
    }

    // Generic 'dimensions' string if used (some accessories use this instead of the object)
    if (has('dimensions') && typeof productInfo.dimensions === 'string') {
        sections.push(
            <InfoSection key="generic-dimensions" title={getSectionTitle(productInfo, "Dimensions", "dimensions")} icon={FiBox}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Dimensions", "generic_dimensions")} value={productInfo.dimensions} />
                    {has('minDimensions') && <InfoRow label={getFieldLabel(productInfo, "Minimum Dimensions", "generic_minDimensions")} value={productInfo.minDimensions} />}
                    {has('weight') && typeof productInfo.weight === 'string' && <InfoRow label={getFieldLabel(productInfo, "Weight", "generic_weight")} value={productInfo.weight} />}
                </dl>
            </InfoSection>
        );
    }

    // Generic 'whatsInBox' string if used
    if (has('whatsInBox')) {
        sections.push(
            <InfoSection key="generic-box" title={getSectionTitle(productInfo, "In The Box", "boxContents")} icon={FiPackage}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "What's in the box", "generic_whatsInBox")} value={productInfo.whatsInBox} />
                </dl>
            </InfoSection>
        );
    }

    return sections;
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

    // Check if this is an accessory product (has accessory-specific fields that have their own Category/Usage sections)
    const isAccessoryProduct = customProductInfo.micSensitivity || customProductInfo.connectionType ||
        customProductInfo.sensorResolution || customProductInfo.impedance || customProductInfo.capacityNative ||
        customProductInfo.material || customProductInfo.securityManagement || customProductInfo.minDimensions;

    return (
        <div className="space-y-4">
            {/* Basic Info - Only show for non-accessories (laptops, desktops, monitors, etc.) */}
            {/* Accessories have their own Category and Usage sections via renderCategorySpecificFields */}
            {!isAccessoryProduct && (productInfo.title || productInfo.series || productInfo.recommendedUsage || productInfo.idealFor?.length || (isAdmin && productInfo.partNo) || customProductInfo.basicCustomFields?.length > 0) && (
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



            {/* Category Specific Fields */}
            {renderCategorySpecificFields(customProductInfo)}

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

            {/* Connectivity - Only for laptops (object), accessories use string via category-specific rendering */}
            {(typeof productInfo.connectivity === 'object' && hasContent(productInfo.connectivity) || customProductInfo.connectivityCustomFields?.length > 0) && (
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

            {/* Warranty - Only for laptops (object), accessories use string rendered via category-specific sections */}
            {(typeof productInfo.warranty === 'object' && hasContent(productInfo.warranty) || customProductInfo.warrantyCustomFields?.length > 0) && (
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
                        {typeof customProductInfo.certifications === 'string' ? (
                            <InfoRow label={getFieldLabel(customProductInfo, "Certifications", "monitor_certifications")} value={customProductInfo.certifications} />
                        ) : (
                            <InfoRow label={getFieldLabel(customProductInfo, "Energy Star", "certifications_energyStar")} value={productInfo.certifications?.energyStar} />
                        )}
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
