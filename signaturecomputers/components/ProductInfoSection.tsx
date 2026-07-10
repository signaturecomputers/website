'use client';

import { FiCpu, FiMonitor, FiHardDrive, FiWifi, FiBattery, FiShield, FiPackage, FiAward, FiBox, FiCamera, FiSpeaker, FiSettings, FiList, FiMaximize, FiCheckSquare, FiGift, FiZap } from 'react-icons/fi';
import { ProductInfo } from '@/lib/products';

interface ProductInfoSectionProps {
    productInfo: ProductInfo | undefined;
    isAdmin?: boolean;
    category?: string;
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


    // Input Devices (Keyboard, Mouse, Combo) - Multimedia and Input Devices
    if (has('connectionType') || has('scrolling') || has('sensorResolution') || has('numberOfButtons')) {
        sections.push(
            <InfoSection key="input-specs" title={getSectionTitle(productInfo, "Multimedia and Input Devices", "multimedia")} icon={FiSettings}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Connection Type", "keyboard_connectionType")} value={productInfo.connectionType} />
                    <InfoRow label={getFieldLabel(productInfo, "Sensor Resolution", "mouse_sensorResolution")} value={productInfo.sensorResolution} />
                    <InfoRow label={getFieldLabel(productInfo, "Number of Buttons", "mouse_numberOfButtons")} value={productInfo.numberOfButtons} />
                    <InfoRow label={getFieldLabel(productInfo, "Scrolling", "mouse_scrolling")} value={productInfo.scrolling} />
                    {renderCustomFields(productInfo.portsCustomFields)}
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

    // Accessory Warranty (stored as string for accessories like headphones, bags, usb drives)
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


    // Power Adapters - Storage Specifications (special features, etc.)
    if (has('specialFeatures') || has('inputVoltage') || has('output') || has('connectorType')) {
        sections.push(
            <InfoSection key="adapter-specs" title={getSectionTitle(productInfo, "Storage Specifications", "storageSpecs")} icon={FiBattery}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Input Voltage", "adapter_inputVoltage")} value={productInfo.inputVoltage} />
                    <InfoRow label={getFieldLabel(productInfo, "Output", "adapter_output")} value={productInfo.output} />
                    <InfoRow label={getFieldLabel(productInfo, "Connector Type", "adapter_connectorType")} value={productInfo.connectorType} />
                    <InfoRow label={getFieldLabel(productInfo, "Special Features", "adapter_specialFeatures")} value={productInfo.specialFeatures} />
                    {renderCustomFields(productInfo.storageCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Docks - Ports and Connectivity
    if (has('ports') && typeof productInfo.ports === 'string') {
        sections.push(
            <InfoSection key="dock-ports" title={getSectionTitle(productInfo, "Ports and Slots", "ports")} icon={FiSettings}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Ports", "dock_ports")} value={productInfo.ports} />
                    <InfoRow label={getFieldLabel(productInfo, "Max Displays", "dock_maxDisplays")} value={productInfo.maxDisplays} />
                    {renderCustomFields(productInfo.portsCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Docks - Security Management section
    if (has('securityManagement')) {
        sections.push(
            <InfoSection key="dock-security" title={getSectionTitle(productInfo, "Security Management", "security")} icon={FiShield}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Security Management", "dock_security")} value={productInfo.securityManagement} />
                    {renderCustomFields(productInfo.securityCustomFields)}
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
                    {renderCustomFields(productInfo.storageCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Weights section (for USB Flash Drives and other accessories with weight as string)
    if (has('weight') && typeof productInfo.weight === 'string') {
        sections.push(
            <InfoSection key="accessory-weights" title={getSectionTitle(productInfo, "Weights", "weights")} icon={FiBox}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Weight", "usb_weight")} value={productInfo.weight} />
                    {renderCustomFields(productInfo.dimensionsCustomFields)}
                </dl>
            </InfoSection>
        );
    }

    // Bags - Material, Compartments (if these fields exist in the product)
    if (has('material') || has('compartments') || has('laptopSize')) {
        sections.push(
            <InfoSection key="bag-specs" title={getSectionTitle(productInfo, "Bag Specifications", "bagSpecs")} icon={FiPackage}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "Material", "bag_material")} value={productInfo.material} />
                    <InfoRow label={getFieldLabel(productInfo, "Compartments", "bag_compartments")} value={productInfo.compartments} />
                    <InfoRow label={getFieldLabel(productInfo, "Laptop Size Support", "bag_laptopSize")} value={productInfo.laptopSize} />
                    {renderCustomFields(productInfo.basicCustomFields)}
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

    // Box Contents - Power Adapters and other accessories
    if (has('whatsInBox')) {
        sections.push(
            <InfoSection key="box-contents" title={getSectionTitle(productInfo, "Box Contents", "boxContents")} icon={FiPackage}>
                <dl>
                    <InfoRow label={getFieldLabel(productInfo, "What's in the box", "adapter_whatsInBox")} value={productInfo.whatsInBox} />
                </dl>
            </InfoSection>
        );
    }

    // Dynamic renderer for any remaining accessory fields not covered above
    // This ensures ALL filled fields in productInfo display on customer side (except partNo)
    const renderedFields = new Set([
        // Standard ProductInfo object fields (handled by main component)
        'title', 'series', 'partNo', 'recommendedUsage', 'idealFor',
        'processor', 'memory', 'storage', 'display', 'graphics', 'audioAndInput',
        'connectivity', 'ports', 'camera', 'batteryAndPower', 'security', 'software',
        'dimensionsAndWeight', 'warranty', 'certifications', 'environmental', 'appearance', 'operatingSystem',
        // Accessory-specific fields (handled by sections above)
        'connectionType', 'sensorResolution', 'numberOfButtons', 'scrolling',
        'micSensitivity', 'micType', 'speakerSensitivity', 'speakerSize', 'impedance', 'frequency',
        'inputVoltage', 'output', 'connectorType', 'specialFeatures', 'whatsInBox',
        'securityManagement', 'maxDisplays', 'capacityNative', 'interface', 'weight', 'minDimensions',
        'material', 'compartments', 'laptopSize',
        // Monitor fields
        'screenSizeCm', 'resolutionNative', 'panelType', 'brightnessNits', 'responseTime', 'refreshRate',
        'aspectRatio', 'contrastRatio', 'colorSupport', 'displayInputs', 'operatingTemp', 'powerMaximum',
        'powerTypical', 'powerStandby', 'dimNoStandWidth', 'dimNoStandDepth', 'dimNoStandHeight',
        'dimWithStandWidth', 'dimWithStandDepth', 'dimWithStandHeight', 'inTheBox', 'includedCables',
        // Metadata fields (not for display)
        'sectionTitles', 'fieldLabels', 'hiddenSections',
        // Custom fields arrays (rendered separately)
        'basicCustomFields', 'connectivityCustomFields', 'portsCustomFields', 'audioCustomFields',
        'storageCustomFields', 'securityCustomFields', 'dimensionsCustomFields', 'warrantyCustomFields',
        'appearanceCustomFields', 'batteryCustomFields', 'osCustomFields', 'displayCustomFields',
        'graphicsCustomFields', 'cameraCustomFields', 'certificationsCustomFields', 'environmentalCustomFields'
    ]);

    // Find any additional accessory fields that aren't in the rendered set
    const additionalFields: { key: string; value: any }[] = [];
    for (const [key, value] of Object.entries(productInfo)) {
        if (!renderedFields.has(key) && value !== undefined && value !== null && value !== '') {
            // Only include simple string/number values, not objects or arrays (those are complex structures)
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                additionalFields.push({ key, value });
            }
        }
    }

    // Render any additional fields in an "Additional Information" section
    if (additionalFields.length > 0) {
        // Create readable labels from camelCase keys
        const formatLabel = (key: string) => {
            return key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
        };

        sections.push(
            <InfoSection key="additional-info" title={getSectionTitle(productInfo, "Additional Information", "additionalInfo")} icon={FiSettings}>
                <dl>
                    {additionalFields.map(({ key, value }) => (
                        <InfoRow
                            key={key}
                            label={getFieldLabel(productInfo, formatLabel(key), `additional_${key}`)}
                            value={value}
                        />
                    ))}
                </dl>
            </InfoSection>
        );
    }

    return sections;
}


export default function ProductInfoSection({ productInfo, isAdmin = false, category }: ProductInfoSectionProps) {
    if (!productInfo || !hasContent(productInfo)) {
        return (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                No detailed product information available.
            </div>
        );
    }

    // Cast to any to access custom fields
    const customProductInfo = productInfo as any;

    if (category === 'desktops') {
        return renderDesktopSpecs();
    }

    if (category === 'workstations') {
        return renderWorkstationSpecs();
    }

    if (category === 'monitors') {
        return renderMonitorSpecs();
    }

    if (category === 'keyboard-mouse-combo') {
        return renderKeyboardMouseComboSpecs();
    }

    if (category === 'mouse') {
        return renderMouseSpecs();
    }

    if (category === 'keyboards') {
        return renderKeyboardSpecs();
    }

    if (category === 'docks' || category === 'hubs') {
        return renderDocksSpecs();
    }

    if (category === 'power-adapters') {
        return renderPowerAdaptersSpecs();
    }

    if (category === 'headphones') {
        return renderHeadphonesSpecs();
    }

    if (category === 'bags') {
        return renderBagsSpecs();
    }

    function renderDesktopSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Basic Product Info */}
                {!isSectionHidden("basic") && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Basic Product Info", "basic")} icon={FiPackage}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Title", "basic_title")} value={productInfo?.title} />
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Product type", "basic_productType")} value={productInfo?.productType} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "basic_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {productInfo?.idealFor && productInfo.idealFor.length > 0 && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Ideal For", "basic_idealFor")} value={productInfo.idealFor.join(', ')} />
                            )}
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Form factor", "appearance_formFactor")} value={productInfo?.appearance?.formFactor} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Supported Operating Systems */}
                {!isSectionHidden("os") && hasContent(productInfo?.operatingSystem) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Supported Operating Systems", "os")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Operating system", "os_os")} value={productInfo?.operatingSystem?.os} />
                            {renderCustomFields(customProductInfo.osCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Processors */}
                {!isSectionHidden("processor") && hasContent(productInfo?.processor) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Processors", "processor")} icon={FiCpu}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Generation", "processor_generation")} value={productInfo?.processor?.generation} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Name", "processor_name")} value={productInfo?.processor?.name} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Frequency Technology", "processor_frequencyTechnology")} value={productInfo?.processor?.frequencyTechnology} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Chipset", "processor_chipset")} value={productInfo?.processor?.chipset} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Footnote", "processor_footnote")} value={productInfo?.processor?.footnote} />
                            {renderCustomFields(customProductInfo.processorCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Memory */}
                {!isSectionHidden("memory") && hasContent(productInfo?.memory) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Memory", "memory")} icon={FiHardDrive}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Memory Slots", "memory_slots")} value={productInfo?.memory?.slots} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Memory Layout", "memory_layout")} value={productInfo?.memory?.layout} />
                            {renderCustomFields(customProductInfo.memoryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Storage */}
                {!isSectionHidden("storage") && hasContent(productInfo?.storage) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Storage", "storage")} icon={FiHardDrive}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Hard Drive Description", "storage_hardDriveDescription")} value={productInfo?.storage?.hardDriveDescription} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Internal Drive Bays", "storage_internalDriveBays")} value={productInfo?.storage?.internalDriveBays} />
                            {renderCustomFields(customProductInfo.storageCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Display and Graphics */}
                {!isSectionHidden("graphics") && (hasContent(productInfo?.graphics) || productInfo?.display?.size) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Display and Graphics", "graphics")} icon={FiMonitor}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Graphics", "graphics_gpu")} value={productInfo?.graphics?.gpu} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Graphic Card Footnote", "graphics_footnote")} value={productInfo?.graphics?.footnote} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Screen Size", "display_size")} value={productInfo?.display?.size} />
                            {renderCustomFields(customProductInfo.graphicsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("audio") && hasContent(productInfo?.audioAndInput) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "audio")} icon={FiSpeaker}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Audio Features", "audio_audioFeatures")} value={productInfo?.audioAndInput?.audioFeatures} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Pointing Device", "audio_pointingDevice")} value={productInfo?.audioAndInput?.pointingDevice} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Keyboard", "audio_keyboard_type")} value={productInfo?.audioAndInput?.keyboard?.type} />
                            {renderCustomFields(customProductInfo.audioCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connectivity and Communications */}
                {!isSectionHidden("connectivityComms") && hasContent(productInfo?.connectivityAndComms) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connectivity and Communications", "connectivityComms")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Network Interface", "connectivity_networkInterface")} value={productInfo?.connectivityAndComms?.networkInterface} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Wireless", "connectivity_wireless")} value={productInfo?.connectivityAndComms?.wireless} />
                            <InfoRow label={getFieldLabel(customProductInfo, "I/O Port Location (Front)", "connectivity_ioPortLocationFront")} value={productInfo?.connectivityAndComms?.ioPortLocationFront} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Front Ports", "connectivity_frontPorts")} value={productInfo?.connectivityAndComms?.frontPorts} />
                            <InfoRow label={getFieldLabel(customProductInfo, "I/O Port Location (Rear)", "connectivity_ioPortLocationRear")} value={productInfo?.connectivityAndComms?.ioPortLocationRear} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Rear Ports", "connectivity_rearPorts")} value={productInfo?.connectivityAndComms?.rearPorts} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Expansion Slots", "connectivity_expansionSlots")} value={productInfo?.connectivityAndComms?.expansionSlots} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Video Connectors", "connectivity_videoConnectors")} value={productInfo?.connectivityAndComms?.videoConnectors} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Battery and Power */}
                {!isSectionHidden("battery") && hasContent(productInfo?.batteryAndPower) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Battery and Power", "battery")} icon={FiBattery}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Power", "battery_power")} value={productInfo?.batteryAndPower?.power} />
                            {renderCustomFields(customProductInfo.batteryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Security Management */}
                {!isSectionHidden("security") && hasContent(productInfo?.security) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Security Management", "security")} icon={FiShield}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Security Management", "security_securityManagement")} value={productInfo?.security?.securityManagement} />
                            {renderCustomFields(customProductInfo.securityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Software */}
                {!isSectionHidden("software") && hasContent(productInfo?.software) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Software", "software")} icon={FiPackage}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Software Included", "software_softwareIncluded")} value={productInfo?.software?.softwareIncluded} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Software Footnote", "software_footnote")} value={productInfo?.software?.footnote} />
                        </dl>
                    </InfoSection>
                )}

                {/* Dimensions and Weight */}
                {!isSectionHidden("dimensions") && hasContent(productInfo?.dimensionsAndWeight) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Dimensions and Weight", "dimensions")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimensions (W × D × H)", "dimensions_front")} value={productInfo?.dimensionsAndWeight?.dimensions?.front} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimension Note (Metric)", "dimensions_rear")} value={productInfo?.dimensionsAndWeight?.dimensions?.rear} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight", "dimensions_weight")} value={productInfo?.dimensionsAndWeight?.weight} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight Note (Metric)", "dimensions_weight_note")} value={productInfo?.dimensionsAndWeight?.weightNote} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty and Services */}
                {!isSectionHidden("warranty") && hasContent(productInfo?.warranty) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty and Services", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty", "warranty_warrantyText")} value={productInfo?.warranty?.warrantyText} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Environmental */}
                {!isSectionHidden("environmental") && hasContent(productInfo?.environmental) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Environmental", "environmental")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Environmental Specification Footnote Number", "environmental_footnote")} value={productInfo?.environmental?.footnote} />
                            {renderCustomFields(customProductInfo.environmentalCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderWorkstationSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Basic Product Info */}
                {!isSectionHidden("basic") && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Basic Product Info", "basic")} icon={FiPackage}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Title", "basic_title")} value={productInfo?.title} />
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Type", "basic_productType")} value={productInfo?.productType} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "basic_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Form Factor", "appearance_formFactor")} value={productInfo?.appearance?.formFactor} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Operating System */}
                {!isSectionHidden("os") && hasContent(productInfo?.operatingSystem) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Supported Operating Systems", "os")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Operating System", "os_os")} value={productInfo?.operatingSystem?.os} />
                            {renderCustomFields(customProductInfo.osCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Processors */}
                {!isSectionHidden("processor") && hasContent(productInfo?.processor) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Processors", "processor")} icon={FiCpu}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Generation", "processor_generation")} value={productInfo?.processor?.generation} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Name", "processor_name")} value={productInfo?.processor?.name} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Frequency Technology", "processor_frequencyTechnology")} value={productInfo?.processor?.frequencyTechnology} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Chipset", "processor_chipset")} value={productInfo?.processor?.chipset} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Processor Footnote", "processor_footnote")} value={productInfo?.processor?.footnote} />
                            {renderCustomFields(customProductInfo.processorCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Memory */}
                {!isSectionHidden("memory") && hasContent(productInfo?.memory) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Memory", "memory")} icon={FiHardDrive}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Memory Slots", "memory_slots")} value={productInfo?.memory?.slots} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Standard Memory Note", "memory_standardMemoryNote")} value={productInfo?.memory?.standardMemoryNote} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Memory Layout", "memory_layout")} value={productInfo?.memory?.layout} />
                            {renderCustomFields(customProductInfo.memoryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Storage */}
                {!isSectionHidden("storage") && hasContent(productInfo?.storage) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Storage", "storage")} icon={FiHardDrive}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Hard Drive Description", "storage_hardDriveDescription")} value={productInfo?.storage?.hardDriveDescription} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Hard Drive (2nd)", "storage_hardDrive2nd")} value={productInfo?.storage?.hardDrive2nd} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Internal Drive Bays", "storage_internalDriveBays")} value={productInfo?.storage?.internalDriveBays} />
                            {renderCustomFields(customProductInfo.storageCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Display and Graphics */}
                {!isSectionHidden("graphics") && (hasContent(productInfo?.graphics) || productInfo?.display?.size) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Display and Graphics", "graphics")} icon={FiMonitor}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Screen Size", "display_size")} value={productInfo?.display?.size} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Graphics", "graphics_gpu")} value={productInfo?.graphics?.gpu} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Graphic Card Footnote", "graphics_footnote")} value={productInfo?.graphics?.footnote} />
                            {renderCustomFields(customProductInfo.graphicsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("audio") && hasContent(productInfo?.audioAndInput) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "audio")} icon={FiSpeaker}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Audio Features", "audio_audioFeatures")} value={productInfo?.audioAndInput?.audioFeatures} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Pointing Device", "audio_pointingDevice")} value={productInfo?.audioAndInput?.pointingDevice} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Keyboard", "audio_keyboard_type")} value={productInfo?.audioAndInput?.keyboard?.type} />
                            {renderCustomFields(customProductInfo.audioCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connectivity and Communications */}
                {!isSectionHidden("connectivityComms") && hasContent(productInfo?.connectivityAndComms) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connectivity and Communications", "connectivityComms")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "I/O Port Location (Front)", "connectivity_ioPortLocationFront")} value={productInfo?.connectivityAndComms?.ioPortLocationFront} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Front Ports", "connectivity_frontPorts")} value={productInfo?.connectivityAndComms?.frontPorts} />
                            <InfoRow label={getFieldLabel(customProductInfo, "I/O Port Location (Rear)", "connectivity_ioPortLocationRear")} value={productInfo?.connectivityAndComms?.ioPortLocationRear} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Rear Ports", "connectivity_rearPorts")} value={productInfo?.connectivityAndComms?.rearPorts} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Expansion Slots", "connectivity_expansionSlots")} value={productInfo?.connectivityAndComms?.expansionSlots} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Expansion Slots Note", "connectivity_expansionSlotsNote")} value={productInfo?.connectivityAndComms?.expansionSlotsNote} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Battery and Power */}
                {!isSectionHidden("battery") && hasContent(productInfo?.batteryAndPower) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Battery and Power", "battery")} icon={FiBattery}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Power", "battery_power")} value={productInfo?.batteryAndPower?.power} />
                            {renderCustomFields(customProductInfo.batteryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Security Management */}
                {!isSectionHidden("security") && hasContent(productInfo?.security) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Security Management", "security")} icon={FiShield}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Security Management", "security_securityManagement")} value={productInfo?.security?.securityManagement} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Security Management Footnote", "security_securityManagementFootnote")} value={productInfo?.security?.securityManagementFootnote} />
                            {renderCustomFields(customProductInfo.securityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Software */}
                {!isSectionHidden("software") && hasContent(productInfo?.software) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Software", "software")} icon={FiPackage}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Software", "software_softwareIncluded")} value={productInfo?.software?.softwareIncluded} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Management Features", "software_managementFeatures")} value={productInfo?.software?.managementFeatures} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Manageability Features Footnote", "software_manageabilityFeaturesFootnote")} value={productInfo?.software?.manageabilityFeaturesFootnote} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Software Footnote", "software_footnote")} value={productInfo?.software?.footnote} />
                        </dl>
                    </InfoSection>
                )}

                {/* Dimensions and Weight */}
                {!isSectionHidden("dimensions") && hasContent(productInfo?.dimensionsAndWeight) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Dimensions and Weight", "dimensions")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimensions (W × D × H)", "dimensions_front")} value={productInfo?.dimensionsAndWeight?.dimensions?.front} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimension Note (Metric)", "dimensions_rear")} value={productInfo?.dimensionsAndWeight?.dimensions?.rear} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight", "dimensions_weight")} value={productInfo?.dimensionsAndWeight?.weight} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight Note (Metric)", "dimensions_weight_note")} value={productInfo?.dimensionsAndWeight?.weightNote} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty and Services */}
                {!isSectionHidden("warranty") && hasContent(productInfo?.warranty) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty and Services", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty", "warranty_warrantyText")} value={productInfo?.warranty?.warrantyText} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty Footnote", "warranty_footnote")} value={productInfo?.warranty?.footnote} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Environmental */}
                {!isSectionHidden("environmental") && hasContent(productInfo?.environmental) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Environmental", "environmental")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Environmental Specification", "environmental_footnote")} value={productInfo?.environmental?.footnote} />
                            {renderCustomFields(customProductInfo.environmentalCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderMonitorSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Basic Product Info */}
                {!isSectionHidden("basic") && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Basic Product Info", "basic")} icon={FiPackage}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Title", "basic_title")} value={productInfo?.title} />
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Partnumber", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "basic_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Display Specifications */}
                {!isSectionHidden("display") && hasContent(productInfo?.display) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Display Specifications", "display")} icon={FiMonitor}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Display type", "display_panel")} value={productInfo?.display?.panel} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Display area (metric)", "display_displayAreaMetric")} value={productInfo?.display?.displayAreaMetric} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Aspect ratio", "display_aspectRatio")} value={productInfo?.display?.aspectRatio} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Resolution (maximum)", "display_resolutionMaximum")} value={productInfo?.display?.resolutionMaximum} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Flicker-free", "display_flickerFree")} value={productInfo?.display?.flickerFree} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Low blue light", "display_lowBlueLight")} value={productInfo?.display?.lowBlueLight} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Resolution (native)", "display_resolutionNative")} value={productInfo?.display?.resolutionNative} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Resolutions supported", "display_resolutionSupported")} value={productInfo?.display?.resolutionSupported} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Pixel pitch", "display_pixelPitch")} value={productInfo?.display?.pixelPitch} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Brightness", "display_brightness")} value={productInfo?.display?.brightness} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Contrast ratio", "display_contrastRatio")} value={productInfo?.display?.contrastRatio} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Response time", "display_responseTime")} value={productInfo?.display?.responseTime} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Display scan frequency (horizontal)", "display_scanFrequencyHorizontal")} value={productInfo?.display?.scanFrequencyHorizontal} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Display scan frequency (vertical)", "display_scanFrequencyVertical")} value={productInfo?.display?.scanFrequencyVertical} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Display colors", "display_displayColors")} value={productInfo?.display?.displayColors} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Onscreen controls", "display_onscreenControls")} value={productInfo?.display?.onscreenControls} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Display features", "display_features")} value={productInfo?.display?.features} />
                            <InfoRow label={getFieldLabel(customProductInfo, "View angle", "display_viewAngle")} value={productInfo?.display?.viewAngle} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Tilt and swivel angle", "display_tiltAndSwivel")} value={productInfo?.display?.tiltAndSwivel} />
                            <InfoRow label={getFieldLabel(customProductInfo, "VESA mount", "display_vesaMount")} value={productInfo?.display?.vesaMount} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Tilt", "display_tilt")} value={productInfo?.display?.tilt} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Swivel", "display_swivel")} value={productInfo?.display?.swivel} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Display Input Type", "display_inputType")} value={productInfo?.display?.inputType} />
                            {renderCustomFields(customProductInfo.displayCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Power */}
                {!isSectionHidden("battery") && hasContent(productInfo?.batteryAndPower) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Power", "battery")} icon={FiBattery}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Power", "battery_power")} value={productInfo?.batteryAndPower?.power} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Power Consumption", "battery_powerConsumption")} value={productInfo?.batteryAndPower?.powerConsumption} />
                            {renderCustomFields(customProductInfo.batteryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Operating Conditions */}
                {!isSectionHidden("environmental") && hasContent(productInfo?.environmental?.operatingTemperature) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Operating Conditions", "environmental")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Operating temperature range", "environmental_operatingTemperature")} value={productInfo?.environmental?.operatingTemperature} />
                        </dl>
                    </InfoSection>
                )}

                {/* Dimensions and Weight */}
                {!isSectionHidden("dimensions") && hasContent(productInfo?.dimensionsAndWeight) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Dimensions and Weight", "dimensions")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimensions (W x D x H)", "dimensions_front")} value={productInfo?.dimensionsAndWeight?.dimensionsText} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimensions with stand (W x D x H)", "dimensions_rear")} value={productInfo?.dimensionsAndWeight?.dimensionsWithStand} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight", "dimensions_weight")} value={productInfo?.dimensionsAndWeight?.weight} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Physical Security */}
                {!isSectionHidden("security") && productInfo?.security?.physicalSecurity && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Physical Security", "security")} icon={FiShield}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Physical security", "security_physicalSecurity")} value={productInfo?.security?.physicalSecurity} />
                            {renderCustomFields(customProductInfo.securityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* What's in the Box */}
                {!isSectionHidden("whatsInTheBox") && productInfo?.whatsInTheBox && (
                    <InfoSection title={getSectionTitle(customProductInfo, "What's in the Box", "whatsInTheBox")} icon={FiPackage}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "What's in the box", "basic_whatsInTheBox")} value={productInfo?.whatsInTheBox} />
                        </dl>
                    </InfoSection>
                )}

                {/* Environmental & Certifications */}
                {!isSectionHidden("environmental") && (hasContent(productInfo?.environmental) || customProductInfo.environmentalCustomFields?.length > 0) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Environmental", "environmental")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Energy Efficiency Compliance", "environmental_energyCompliance")} value={productInfo?.environmental?.energyCompliance} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Environmental", "environmental_general")} value={productInfo?.environmental?.general} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Environmental specification footnote number", "environmental_footnote")} value={productInfo?.environmental?.footnote} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Certifications and compliances", "environmental_certifications")} value={productInfo?.environmental?.certifications} />
                            {renderCustomFields(customProductInfo.environmentalCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Security Management */}
                {!isSectionHidden("securityManagement") && productInfo?.legalDisclaimer && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Security Management", "securityManagement")} icon={FiShield}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Legal Disclaimer", "basic_legalDisclaimer")} value={productInfo?.legalDisclaimer} />
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderKeyboardMouseComboSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "combo_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connection and Communication */}
                {!isSectionHidden("connection") && customProductInfo.connectivity && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connection and Communication", "connection")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connectivity", "combo_connectivity")} value={customProductInfo.connectivity} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Category", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("multimedia") && customProductInfo.connectionType && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "multimedia")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connection type", "combo_connectionType")} value={customProductInfo.connectionType} />
                            {renderCustomFields(customProductInfo.portsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && hasContent(productInfo?.warranty) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty Duration", "warranty_duration")} value={productInfo?.warranty?.duration} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Coverage", "warranty_coverage")} value={productInfo?.warranty?.coverage} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderMouseSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Size & Fit", "appearance_sizeFit")} value={productInfo?.appearance?.sizeFit} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "mouse_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connection and Communication */}
                {!isSectionHidden("connection") && customProductInfo.connectivity && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connection and Communication", "connection")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connectivity", "mouse_connectivity")} value={customProductInfo.connectivity} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Category", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("multimedia") && customProductInfo.connectionType && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "multimedia")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connection Type", "mouse_connectionType")} value={customProductInfo.connectionType} />
                            {renderCustomFields(customProductInfo.portsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && hasContent(productInfo?.warranty) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty Duration", "warranty_duration")} value={productInfo?.warranty?.duration} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Coverage", "warranty_coverage")} value={productInfo?.warranty?.coverage} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderDocksSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Category", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "dock_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connection and Communication */}
                {!isSectionHidden("connection") && customProductInfo.connectivity && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connection and Communication", "connection")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connectivity", "dock_connectivity")} value={customProductInfo.connectivity} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("multimedia") && (customProductInfo.connectionType || productInfo?.powerButton) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "multimedia")} icon={FiCpu}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connection type", "dock_connectionType")} value={customProductInfo.connectionType} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Power Button", "dock_powerButton")} value={productInfo?.powerButton} />
                            {renderCustomFields(customProductInfo.portsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connectivity and Communications */}
                {!isSectionHidden("connectivityComms") && (
                    productInfo?.connectivityAndComms?.ioPortLocationFront ||
                    productInfo?.connectivityAndComms?.frontPorts ||
                    productInfo?.connectivityAndComms?.ioPortLocationRear ||
                    productInfo?.connectivityAndComms?.rearPorts ||
                    productInfo?.externalPortsLocation04 ||
                    productInfo?.externalPorts04
                ) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connectivity and Communications", "connectivityComms")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "I/O Port location", "connectivity_ioPortLocationFront")} value={productInfo?.connectivityAndComms?.ioPortLocationFront} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Ports", "connectivity_frontPorts")} value={productInfo?.connectivityAndComms?.frontPorts} />
                            <InfoRow label={getFieldLabel(customProductInfo, "I/O Port location", "connectivity_ioPortLocationRear")} value={productInfo?.connectivityAndComms?.ioPortLocationRear} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Ports", "connectivity_rearPorts")} value={productInfo?.connectivityAndComms?.rearPorts} />
                            <InfoRow label={getFieldLabel(customProductInfo, "External Ports Location 04", "connectivity_externalPortsLocation04")} value={productInfo?.externalPortsLocation04} />
                            <InfoRow label={getFieldLabel(customProductInfo, "External Ports 04", "connectivity_externalPorts04")} value={productInfo?.externalPorts04} />
                            {renderCustomFields(customProductInfo.portsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Supported Operating Systems */}
                {!isSectionHidden("supportedOS") && productInfo?.compatibleOS && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Supported Operating Systems", "supportedOS")} icon={FiMonitor}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Compatible Operating Systems", "dock_compatibleOS")} value={productInfo?.compatibleOS} />
                        </dl>
                    </InfoSection>
                )}

                {/* System Requirements */}
                {!isSectionHidden("systemRequirements") && productInfo?.minimumSystemRequirements && (
                    <InfoSection title={getSectionTitle(customProductInfo, "System Requirements", "systemRequirements")} icon={FiList}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Minimum System Requirements", "dock_minSystemReqs")} value={productInfo?.minimumSystemRequirements} />
                        </dl>
                    </InfoSection>
                )}

                {/* Dimensions */}
                {!isSectionHidden("dimensions") && (productInfo?.minDimensions || customProductInfo.dimensions) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Dimensions", "dimensions")} icon={FiMaximize}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Minimum dimensions (W x D x H)", "dock_minDimensions")} value={productInfo?.minDimensions} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimensions (W x D x H)", "dock_dimensions")} value={customProductInfo.dimensions} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Weights */}
                {!isSectionHidden("weights") && customProductInfo.weight && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Weights", "weights")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight", "dock_weight")} value={customProductInfo.weight} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && customProductInfo.warranty && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty", "dock_warranty")} value={customProductInfo.warranty} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Compatibility */}
                {!isSectionHidden("compatibility") && productInfo?.hardwareCompatibility && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Compatibility", "compatibility")} icon={FiCheckSquare}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Hardware compatibility", "dock_compatibility")} value={productInfo?.hardwareCompatibility} />
                        </dl>
                    </InfoSection>
                )}

                {/* Box contents */}
                {!isSectionHidden("boxContents") && productInfo?.whatsInTheBox && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Box contents", "boxContents")} icon={FiGift}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "What's in the box", "dock_whatsInBox")} value={productInfo?.whatsInTheBox} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Battery and Power */}
                {!isSectionHidden("battery") && (
                    productInfo?.batteryAndPower?.power ||
                    productInfo?.powerToHost ||
                    productInfo?.powerDelivery
                ) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Battery and Power", "battery")} icon={FiZap}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Power", "battery_power")} value={productInfo?.batteryAndPower?.power} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Power to Host", "dock_powerToHost")} value={productInfo?.powerToHost} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Power Delivery", "dock_powerDelivery")} value={productInfo?.powerDelivery} />
                            {renderCustomFields(customProductInfo.batteryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderKeyboardSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "keyboard_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connection and Communication */}
                {!isSectionHidden("connection") && customProductInfo.connectivity && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connection and Communication", "connection")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connectivity", "keyboard_connectivity")} value={customProductInfo.connectivity} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Category", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* System Requirements */}
                {!isSectionHidden("systemRequirements") && productInfo?.minimumSystemRequirements && (
                    <InfoSection title={getSectionTitle(customProductInfo, "System Requirements", "systemRequirements")} icon={FiList}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Minimum System Requirements", "keyboard_minSystemReqs")} value={productInfo?.minimumSystemRequirements} />
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("multimedia") && customProductInfo.connectionType && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "multimedia")} icon={FiCpu}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connection type", "keyboard_connectionType")} value={customProductInfo.connectionType} />
                            {renderCustomFields(customProductInfo.portsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connectivity and Communications */}
                {!isSectionHidden("connectivityComms") && productInfo?.cableLength && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connectivity and Communications", "connectivityComms")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Cable length", "keyboard_cableLength")} value={productInfo?.cableLength} />
                            {renderCustomFields(customProductInfo.portsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Box contents */}
                {!isSectionHidden("boxContents") && productInfo?.whatsInTheBox && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Box contents", "boxContents")} icon={FiGift}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "What's in the box", "keyboard_whatsInBox")} value={productInfo?.whatsInTheBox} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Dimensions */}
                {!isSectionHidden("dimensions") && customProductInfo.dimensions && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Dimensions", "dimensions")} icon={FiMaximize}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Dimensions (W x D x H)", "keyboard_dimensions")} value={customProductInfo.dimensions} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Weights */}
                {!isSectionHidden("weights") && customProductInfo.weight && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Weights", "weights")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Weight", "keyboard_weight")} value={customProductInfo.weight} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && hasContent(productInfo?.warranty) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty Duration", "warranty_duration")} value={productInfo?.warranty?.duration} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Coverage", "warranty_coverage")} value={productInfo?.warranty?.coverage} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderPowerAdaptersSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Category", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "adapter_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Storage Specifications */}
                {!isSectionHidden("storageSpecs") && productInfo?.specialFeatures && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Storage Specifications", "storageSpecs")} icon={FiHardDrive}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Special features", "adapter_specialFeatures")} value={productInfo?.specialFeatures} />
                            {renderCustomFields(customProductInfo.storageCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Box contents */}
                {!isSectionHidden("boxContents") && productInfo?.whatsInTheBox && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Box contents", "boxContents")} icon={FiGift}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "What's in the box", "adapter_whatsInBox")} value={productInfo?.whatsInTheBox} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && customProductInfo.warranty && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty", "adapter_warranty")} value={customProductInfo.warranty} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderHeadphonesSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Category", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "headphone_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connection and Communication */}
                {!isSectionHidden("connection") && customProductInfo.connectivity && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connection and Communication", "connection")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Connectivity", "headphone_connectivity")} value={customProductInfo.connectivity} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Multimedia and Input Devices */}
                {!isSectionHidden("multimedia") && (productInfo?.micSensitivity || productInfo?.micType || productInfo?.speakerSensitivity || productInfo?.speakerSize) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Multimedia and Input Devices", "multimedia")} icon={FiCpu}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Sensitivity (microphone)", "headphone_micSensitivity")} value={productInfo?.micSensitivity} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Microphone Type", "headphone_micType")} value={productInfo?.micType} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Sensitivity (speaker)", "headphone_speakerSensitivity")} value={productInfo?.speakerSensitivity} />
                            <InfoRow label={getFieldLabel(customProductInfo, "Speaker size", "headphone_speakerSize")} value={productInfo?.speakerSize} />
                            {renderCustomFields(customProductInfo.audioCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Battery and Power */}
                {!isSectionHidden("battery") && productInfo?.impedance && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Battery and Power", "battery")} icon={FiZap}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Impedance", "headphone_impedance")} value={productInfo?.impedance} />
                            {renderCustomFields(customProductInfo.batteryCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Connectivity and Communications */}
                {!isSectionHidden("connectivityComms") && productInfo?.frequencyMhz && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Connectivity and Communications", "connectivityComms")} icon={FiWifi}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Frequency (MHz)", "headphone_frequencyMhz")} value={productInfo?.frequencyMhz} />
                            {renderCustomFields(customProductInfo.connectivityCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Dimensions */}
                {!isSectionHidden("dimensions") && productInfo?.minDimensions && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Dimensions", "dimensions")} icon={FiMaximize}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Minimum dimensions (W x D x H)", "headphone_minDimensions")} value={productInfo?.minDimensions} />
                            {renderCustomFields(customProductInfo.dimensionsCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && customProductInfo.warranty && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty", "headphone_warranty")} value={customProductInfo.warranty} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

    function renderBagsSpecs() {
        const isSectionHidden = (sectionKey: string): boolean => {
            const hidden = customProductInfo.hiddenSections || [];
            return hidden.includes(sectionKey);
        };

        return (
            <div className="space-y-4">
                {/* Category */}
                {!isSectionHidden("categoryInfo") && (productInfo?.series || (isAdmin && productInfo?.partNo)) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Series", "categoryInfo")} icon={FiPackage}>
                        <dl>
                            {isAdmin && productInfo?.partNo && (
                                <InfoRow label={getFieldLabel(customProductInfo, "Part Number", "basic_partNo")} value={productInfo.partNo} />
                            )}
                            <InfoRow label={getFieldLabel(customProductInfo, "Series", "basic_series")} value={productInfo?.series} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Usage */}
                {!isSectionHidden("usage") && productInfo?.recommendedUsage && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Usage", "usage")} icon={FiSettings}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Recommended Usage", "bag_recommendedUsage")} value={productInfo?.recommendedUsage} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Storage Specifications */}
                {!isSectionHidden("storageSpecs") && productInfo?.specialFeatures && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Storage Specifications", "storageSpecs")} icon={FiHardDrive}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Special features", "bag_specialFeatures")} value={productInfo?.specialFeatures} />
                            {renderCustomFields(customProductInfo.storageCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Box contents */}
                {!isSectionHidden("boxContents") && productInfo?.whatsInTheBox && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Box contents", "boxContents")} icon={FiGift}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "What's in the box", "bag_whatsInBox")} value={productInfo?.whatsInTheBox} />
                            {renderCustomFields(customProductInfo.basicCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Warranty */}
                {!isSectionHidden("warranty") && customProductInfo.warranty && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Warranty", "warranty")} icon={FiAward}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Warranty", "bag_warranty")} value={customProductInfo.warranty} />
                            {renderCustomFields(customProductInfo.warrantyCustomFields)}
                        </dl>
                    </InfoSection>
                )}

                {/* Appearance */}
                {!isSectionHidden("appearance") && hasContent(productInfo?.appearance) && (
                    <InfoSection title={getSectionTitle(customProductInfo, "Appearance", "appearance")} icon={FiBox}>
                        <dl>
                            <InfoRow label={getFieldLabel(customProductInfo, "Product Color", "appearance_color")} value={productInfo?.appearance?.color} />
                            {renderCustomFields(customProductInfo.appearanceCustomFields)}
                        </dl>
                    </InfoSection>
                )}
            </div>
        );
    }

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
