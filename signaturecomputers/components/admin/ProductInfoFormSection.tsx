'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { ProductInfo } from '@/lib/products';

interface ProductInfoFormSectionProps {
    productInfo: ProductInfo;
    setProductInfo: (info: ProductInfo) => void;
    category?: string; // Current product category (e.g., 'laptops', 'monitors')
}

// Custom field type for dynamic sections
interface CustomField {
    label: string;
    value: string;
    type?: 'text' | 'checkbox';
}

// Collapsible section for form groups with editable title and delete option
function FormSection({
    title,
    children,
    defaultOpen = false,
    onAddSpec,
    onTitleChange,
    onDelete,
    isDeleted = false
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    onAddSpec?: () => void;
    onTitleChange?: (newTitle: string) => void;
    onDelete?: () => void;
    isDeleted?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);

    // Sync edited title with title prop
    useEffect(() => {
        setEditedTitle(title);
    }, [title]);

    const handleTitleSave = () => {
        if (onTitleChange && editedTitle.trim()) {
            onTitleChange(editedTitle.trim());
        }
        setIsEditingTitle(false);
    };

    // Don't render if section is deleted
    if (isDeleted) return null;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-2 flex-1">
                    {isEditingTitle && onTitleChange ? (
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            className="font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-blue-500 rounded px-2 py-1 focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex-1 text-left"
                        >
                            <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                        </button>
                    )}
                    {onTitleChange && !isEditingTitle && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditedTitle(title);
                                setIsEditingTitle(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Edit section name"
                        >
                            <FiEdit2 size={14} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Hide this section? You can restore it later.')) {
                                    onDelete();
                                }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Hide section"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1"
                >
                    {isOpen ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                </button>
            </div>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
                    {children}
                    {onAddSpec && (
                        <button
                            type="button"
                            onClick={onAddSpec}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
                        >
                            <FiPlus size={14} /> Add Spec
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Editable Text input component with label editing
function EditableFormInput({
    label,
    value,
    onChange,
    onLabelChange,
    placeholder,
    type = 'text',
    onTypeChange,
    onDelete
}: {
    label: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    onLabelChange?: (newLabel: string) => void;
    placeholder?: string;
    type?: 'text' | 'number' | 'checkbox';
    onTypeChange?: (newType: 'text' | 'checkbox') => void;
    onDelete?: () => void;
}) {
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(label);

    // Sync edited label when label prop changes
    useEffect(() => {
        setEditedLabel(label);
    }, [label]);

    const handleLabelSave = () => {
        if (onLabelChange && editedLabel.trim()) {
            onLabelChange(editedLabel.trim());
        }
        setIsEditingLabel(false);
    };

    return (
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 space-y-2">
            <div className="flex items-center gap-2">
                {isEditingLabel && onLabelChange ? (
                    <input
                        type="text"
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-0.5 focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                )}
                {onLabelChange && !isEditingLabel && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditedLabel(label);
                            setIsEditingLabel(true);
                        }}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit field name"
                    >
                        <FiEdit2 size={12} />
                    </button>
                )}

                {/* Type selector */}
                {onTypeChange && (
                    <select
                        value={type === 'checkbox' ? 'checkbox' : 'text'}
                        onChange={(e) => onTypeChange(e.target.value as 'text' | 'checkbox')}
                        className="ml-auto text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 px-1 py-0.5 text-gray-600 dark:text-gray-400"
                    >
                        <option value="text">Text</option>
                        <option value="checkbox">Checkbox</option>
                    </select>
                )}

                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className={`${onTypeChange ? 'ml-1' : 'ml-auto'} text-gray-400 hover:text-red-500 transition-colors`}
                        title="Delete field"
                    >
                        <FiTrash2 size={12} />
                    </button>
                )}
            </div>

            {type === 'checkbox' ? (
                <div className="flex items-center space-x-2 py-1">
                    <input
                        type="checkbox"
                        checked={value === 'true'}
                        onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {value === 'true' ? 'Enabled (Yes)' : 'Disabled (No)'}
                    </span>
                </div>
            ) : (
                <input
                    type={type === 'number' ? 'number' : 'text'}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
            )}
        </div>
    );
}

// Checkbox component with editable label
function EditableFormCheckbox({
    label,
    checked,
    onChange,
    onLabelChange
}: {
    label: string;
    checked: boolean | undefined;
    onChange: (checked: boolean) => void;
    onLabelChange?: (newLabel: string) => void;
}) {
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(label);

    useEffect(() => {
        setEditedLabel(label);
    }, [label]);

    const handleLabelSave = () => {
        if (onLabelChange && editedLabel.trim()) {
            onLabelChange(editedLabel.trim());
        }
        setIsEditingLabel(false);
    };

    return (
        <div className="flex items-center space-x-3">
            <input
                type="checkbox"
                checked={checked ?? false}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            {isEditingLabel && onLabelChange ? (
                <input
                    type="text"
                    value={editedLabel}
                    onChange={(e) => setEditedLabel(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                    className="text-sm text-gray-700 dark:text-gray-300 bg-transparent border-b border-blue-500 focus:outline-none"
                    autoFocus
                />
            ) : (
                <span className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => onChange(!checked)}>{label}</span>
            )}
            {onLabelChange && !isEditingLabel && (
                <button
                    type="button"
                    onClick={() => {
                        setEditedLabel(label);
                        setIsEditingLabel(true);
                    }}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit field name"
                >
                    <FiEdit2 size={12} />
                </button>
            )}
        </div>
    );
}

export default function ProductInfoFormSection({ productInfo, setProductInfo, category }: ProductInfoFormSectionProps) {
    const activeCategory = category === 'dvd-writers'
        ? (productInfo.othersType === 'webcam' ? 'others-webcam' : 'others-dvd')
        : (category === 'webcams' ? 'others-webcam' : category);

    // Helper to update nested object
    const updateField = <K extends keyof ProductInfo>(
        key: K,
        value: ProductInfo[K]
    ) => {
        setProductInfo({ ...productInfo, [key]: value });
    };

    // Helper to update deeply nested fields
    const updateNestedField = <K extends keyof ProductInfo>(
        key: K,
        field: string,
        value: any
    ) => {
        const current = productInfo[key] as Record<string, any> || {};
        setProductInfo({
            ...productInfo,
            [key]: { ...current, [field]: value }
        });
    };

    // Custom labels for default fields (stored in productInfo.fieldLabels)
    const getFieldLabel = (defaultLabel: string, fieldKey: string): string => {
        const category = activeCategory;
        const labels = (productInfo as any).fieldLabels || {};
        if (labels[fieldKey]) return labels[fieldKey];
        if (activeCategory === 'desktops') {
            if (fieldKey === 'battery_batteryType') return 'Power Supply Type';
            if (fieldKey === 'battery_capacity') return 'Wattage';
            if (fieldKey === 'battery_charger') return 'Efficiency';
            if (fieldKey === 'battery_fastCharge') return 'Fast Charge';
            if (fieldKey === 'dimensions_front') return 'Dimensions (W × D × H)';
            if (fieldKey === 'dimensions_rear') return 'Dimension Note (Metric)';
            if (fieldKey === 'dimensions_weight') return 'Weight';
            if (fieldKey === 'dimensions_weight_note') return 'Weight Note (Metric)';
        }
        if (category === 'workstations') {
            if (fieldKey === 'basic_title') return 'Title';
            if (fieldKey === 'basic_partNo') return 'Part Number';
            if (fieldKey === 'basic_productType') return 'Product Type';
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'basic_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'appearance_formFactor') return 'Form Factor';
            if (fieldKey === 'os_os') return 'Operating System';
            if (fieldKey === 'processor_generation') return 'Processor Generation';
            if (fieldKey === 'processor_name') return 'Processor Name';
            if (fieldKey === 'processor_frequencyTechnology') return 'Processor Frequency Technology';
            if (fieldKey === 'processor_chipset') return 'Chipset';
            if (fieldKey === 'processor_footnote') return 'Processor Footnote';
            if (fieldKey === 'memory_slots') return 'Memory Slots';
            if (fieldKey === 'memory_standardMemoryNote') return 'Standard Memory Note';
            if (fieldKey === 'memory_layout') return 'Memory Layout';
            if (fieldKey === 'storage_hardDriveDescription') return 'Hard Drive Description';
            if (fieldKey === 'storage_hardDrive2nd') return 'Hard Drive (2nd)';
            if (fieldKey === 'storage_internalDriveBays') return 'Internal Drive Bays';
            if (fieldKey === 'graphics_gpu') return 'Graphics';
            if (fieldKey === 'graphics_footnote') return 'Graphic Card Footnote';
            if (fieldKey === 'display_size') return 'Screen Size';
            if (fieldKey === 'audio_audioFeatures') return 'Audio Features';
            if (fieldKey === 'audio_pointingDevice') return 'Pointing Device';
            if (fieldKey === 'audio_keyboard_type') return 'Keyboard';
            if (fieldKey === 'connectivity_ioPortLocationFront') return 'I/O Port Location (Front)';
            if (fieldKey === 'connectivity_frontPorts') return 'Front Ports';
            if (fieldKey === 'connectivity_ioPortLocationRear') return 'I/O Port Location (Rear)';
            if (fieldKey === 'connectivity_rearPorts') return 'Rear Ports';
            if (fieldKey === 'connectivity_expansionSlots') return 'Expansion Slots';
            if (fieldKey === 'connectivity_expansionSlotsNote') return 'Expansion Slots Note';
            if (fieldKey === 'battery_power') return 'Power';
            if (fieldKey === 'security_securityManagement') return 'Security Management';
            if (fieldKey === 'security_securityManagementFootnote') return 'Security Management Footnote';
            if (fieldKey === 'software_softwareIncluded') return 'Software';
            if (fieldKey === 'software_managementFeatures') return 'Management Features';
            if (fieldKey === 'software_manageabilityFeaturesFootnote') return 'Manageability Features Footnote';
            if (fieldKey === 'software_footnote') return 'Software Footnote';
            if (fieldKey === 'dimensions_front') return 'Dimensions (W × D × H)';
            if (fieldKey === 'dimensions_rear') return 'Dimension Note (Metric)';
            if (fieldKey === 'dimensions_weight') return 'Weight';
            if (fieldKey === 'dimensions_weight_note') return 'Weight Note (Metric)';
            if (fieldKey === 'warranty_warrantyText') return 'Warranty';
            if (fieldKey === 'warranty_footnote') return 'Warranty Footnote';
            if (fieldKey === 'environmental_footnote') return 'Environmental Specification';
        }
        if (category === 'monitors') {
            if (fieldKey === 'basic_title') return 'Title';
            if (fieldKey === 'basic_partNo') return 'Partnumber';
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'basic_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'appearance_color') return 'Product color';
            if (fieldKey === 'display_panel') return 'Display type';
            if (fieldKey === 'display_displayAreaMetric') return 'Display area (metric)';
            if (fieldKey === 'display_aspectRatio') return 'Aspect ratio';
            if (fieldKey === 'display_resolutionMaximum') return 'Resolution (maximum)';
            if (fieldKey === 'display_flickerFree') return 'Flicker-free';
            if (fieldKey === 'display_lowBlueLight') return 'Low blue light';
            if (fieldKey === 'display_resolutionNative') return 'Resolution (native)';
            if (fieldKey === 'display_resolutionSupported') return 'Resolutions supported';
            if (fieldKey === 'display_pixelPitch') return 'Pixel pitch';
            if (fieldKey === 'display_brightness') return 'Brightness';
            if (fieldKey === 'display_contrastRatio') return 'Contrast ratio';
            if (fieldKey === 'display_responseTime') return 'Response time';
            if (fieldKey === 'display_scanFrequencyHorizontal') return 'Display scan frequency (horizontal)';
            if (fieldKey === 'display_scanFrequencyVertical') return 'Display scan frequency (vertical)';
            if (fieldKey === 'display_displayColors') return 'Display colors';
            if (fieldKey === 'display_onscreenControls') return 'Onscreen controls';
            if (fieldKey === 'display_features') return 'Display features';
            if (fieldKey === 'display_viewAngle') return 'View angle';
            if (fieldKey === 'display_tiltAndSwivel') return 'Tilt and swivel angle';
            if (fieldKey === 'display_vesaMount') return 'VESA mount';
            if (fieldKey === 'display_tilt') return 'Tilt';
            if (fieldKey === 'display_swivel') return 'Swivel';
            if (fieldKey === 'display_inputType') return 'Display Input Type';
            if (fieldKey === 'battery_power') return 'Power';
            if (fieldKey === 'battery_powerConsumption') return 'Power Consumption';
            if (fieldKey === 'environmental_operatingTemperature') return 'Operating temperature range';
            if (fieldKey === 'dimensions_front') return 'Dimensions (W x D x H)';
            if (fieldKey === 'dimensions_rear') return 'Dimensions with stand (W x D x H)';
            if (fieldKey === 'dimensions_weight') return 'Weight';
            if (fieldKey === 'security_physicalSecurity') return 'Physical security';
            if (fieldKey === 'basic_whatsInTheBox') return "What's in the box";
            if (fieldKey === 'environmental_energyCompliance') return 'Energy Efficiency Compliance';
            if (fieldKey === 'environmental_general') return 'Environmental';
            if (fieldKey === 'environmental_footnote') return 'Environmental specification footnote number';
            if (fieldKey === 'environmental_certifications') return 'Certifications and compliances';
            if (fieldKey === 'security_securityManagement') return 'Security Management';
            if (fieldKey === 'basic_legalDisclaimer') return 'Legal Disclaimer';
        }
        if (category === 'keyboard-mouse-combo') {
            if (fieldKey === 'combo_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'combo_connectivity') return 'Connectivity';
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'combo_connectionType') return 'Connection type';
            if (fieldKey === 'appearance_color') return 'Product Color';
        }
        if (category === 'mouse') {
            if (fieldKey === 'appearance_sizeFit') return 'Size & Fit';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'mouse_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'mouse_connectivity') return 'Connectivity';
            if (fieldKey === 'basic_series') return 'Series';
        }
        if (category === 'keyboards') {
            if (fieldKey === 'keyboard_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'keyboard_connectivity') return 'Connectivity';
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'keyboard_minSystemReqs') return 'Minimum System Requirements';
            if (fieldKey === 'keyboard_connectionType') return 'Connection type';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'keyboard_cableLength') return 'Cable length';
            if (fieldKey === 'keyboard_whatsInBox') return 'What\'s in the box';
            if (fieldKey === 'keyboard_dimensions') return 'Dimensions (W x D x H)';
            if (fieldKey === 'keyboard_weight') return 'Weight';
        }
        if (category === 'power-adapters') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'adapter_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'adapter_specialFeatures') return 'Special features';
            if (fieldKey === 'adapter_whatsInBox') return 'What\'s in the box';
            if (fieldKey === 'adapter_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
        }
        if (category === 'bags') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'bag_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'bag_specialFeatures') return 'Special features';
            if (fieldKey === 'bag_whatsInBox') return 'What\'s in the box';
            if (fieldKey === 'bag_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
        }
        if (category === 'cables') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'cable_cableType') return 'Cable Type';
            if (fieldKey === 'cable_connector1') return 'Connector 1';
            if (fieldKey === 'cable_connector2') return 'Connector 2';
            if (fieldKey === 'cable_cableLength') return 'Cable Length';
            if (fieldKey === 'cable_supportedStandard') return 'Supported Standard (HDMI 2.1 / DP 1.4)';
            if (fieldKey === 'cable_maxResolution') return 'Maximum Resolution';
            if (fieldKey === 'cable_refreshRateSupport') return 'Refresh Rate Support';
            if (fieldKey === 'cable_compatibleDevices') return 'Compatible Devices';
            if (fieldKey === 'cable_compatiblePorts') return 'Compatible Ports';
            if (fieldKey === 'cable_specialFeatures') return 'Special Features';
            if (fieldKey === 'cable_whatsInBox') return 'What\'s in the Box';
            if (fieldKey === 'cable_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'cable_inputVoltage') return 'Input Voltage';
            if (fieldKey === 'cable_currentRating') return 'Current Rating';
            if (fieldKey === 'cable_connectorType') return 'Connector Type';
        }
        if (category === 'headphones') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'headphone_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'headphone_connectivity') return 'Connectivity';
            if (fieldKey === 'headphone_micSensitivity') return 'Sensitivity (microphone)';
            if (fieldKey === 'headphone_micType') return 'Microphone Type';
            if (fieldKey === 'headphone_speakerSensitivity') return 'Sensitivity (speaker)';
            if (fieldKey === 'headphone_speakerSize') return 'Speaker size';
            if (fieldKey === 'headphone_impedance') return 'Impedance';
            if (fieldKey === 'headphone_frequencyMhz') return 'Frequency (MHz)';
            if (fieldKey === 'headphone_minDimensions') return 'Minimum dimensions (W x D x H)';
            if (fieldKey === 'headphone_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
        }
        if (category === 'docks') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'dock_recommendedUsage') return 'Recommended Usage';
            if (fieldKey === 'dock_connectivity') return 'Connectivity';
            if (fieldKey === 'dock_connectionType') return 'Connection type';
            if (fieldKey === 'dock_powerButton') return 'Power Button';
            if (fieldKey === 'connectivity_ioPortLocationFront') return 'I/O Port location';
            if (fieldKey === 'connectivity_ioPortLocationRear') return 'I/O Port location';
            if (fieldKey === 'connectivity_frontPorts') return 'Ports';
            if (fieldKey === 'connectivity_rearPorts') return 'Ports';
            if (fieldKey === 'connectivity_externalPortsLocation04') return 'External Ports Location 04';
            if (fieldKey === 'connectivity_externalPorts04') return 'External Ports 04';
            if (fieldKey === 'dock_compatibleOS') return 'Compatible Operating Systems';
            if (fieldKey === 'dock_minSystemReqs') return 'Minimum System Requirements';
            if (fieldKey === 'dock_minDimensions') return 'Minimum dimensions (W x D x H)';
            if (fieldKey === 'dock_dimensions') return 'Dimensions (W x D x H)';
            if (fieldKey === 'dock_weight') return 'Weight';
            if (fieldKey === 'dock_warranty') return 'Warranty';
            if (fieldKey === 'dock_compatibility') return 'Hardware compatibility';
            if (fieldKey === 'dock_whatsInBox') return 'What\'s in the box';
            if (fieldKey === 'battery_power') return 'Power';
            if (fieldKey === 'dock_powerToHost') return 'Power to Host';
            if (fieldKey === 'dock_powerDelivery') return 'Power Delivery';
            if (fieldKey === 'appearance_color') return 'Product Color';
        }
        if (category === 'hubs') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'hub_hostInterface') return 'Host Interface';
            if (fieldKey === 'hub_numberOfPorts') return 'Number of Ports';
            if (fieldKey === 'hub_usbPortConfiguration') return 'USB Port Configuration';
            if (fieldKey === 'hub_hdmiPort') return 'HDMI Port';
            if (fieldKey === 'hub_vgaPort') return 'VGA Port';
            if (fieldKey === 'hub_ethernetPort') return 'Ethernet Port';
            if (fieldKey === 'hub_audioPort') return 'Audio Port';
            if (fieldKey === 'hub_sdCardSlot') return 'SD Card Slot';
            if (fieldKey === 'hub_microSdCardSlot') return 'microSD Card Slot';
            if (fieldKey === 'hub_usbCPdPort') return 'USB-C PD Port';
            if (fieldKey === 'hub_dataTransferSpeed') return 'Data Transfer Speed';
            if (fieldKey === 'hub_hdmiResolution') return 'HDMI Resolution';
            if (fieldKey === 'hub_refreshRate') return 'Refresh Rate';
            if (fieldKey === 'hub_powerDelivery') return 'Power Delivery';
            if (fieldKey === 'hub_ethernetSpeed') return 'Ethernet Speed';
            if (fieldKey === 'hub_cardReaderSpeed') return 'Card Reader Speed';
            if (fieldKey === 'hub_compatibleDevices') return 'Compatible Devices';
            if (fieldKey === 'hub_compatibleOS') return 'Compatible Operating Systems';
            if (fieldKey === 'hub_plugAndPlay') return 'Plug & Play';
            if (fieldKey === 'hub_hotSwappable') return 'Hot Swappable';
            if (fieldKey === 'hub_aluminumBody') return 'Aluminum Body';
            if (fieldKey === 'hub_ledIndicator') return 'LED Indicator';
            if (fieldKey === 'hub_overcurrentProtection') return 'Overcurrent Protection';
            if (fieldKey === 'hub_overvoltageProtection') return 'Overvoltage Protection';
            if (fieldKey === 'hub_whatsInBox') return 'What\'s in the Box';
            if (fieldKey === 'hub_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'hub_material') return 'Material';
        }
        if (category === 'usb-flashdrives') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'basic_partNo') return 'Part Number';
            if (fieldKey === 'usb_capacity') return 'Capacity';
            if (fieldKey === 'usb_interface') return 'Interface';
            if (fieldKey === 'usb_readSpeed') return 'Read Speed';
            if (fieldKey === 'usb_writeSpeed') return 'Write Speed';
            if (fieldKey === 'usb_connectorType') return 'Connector Type';
            if (fieldKey === 'usb_usbStandard') return 'USB Standard';
            if (fieldKey === 'usb_compatibleDevices') return 'Compatible Devices';
            if (fieldKey === 'usb_compatibleOS') return 'Compatible Operating Systems';
            if (fieldKey === 'usb_plugAndPlay') return 'Plug & Play';
            if (fieldKey === 'usb_retractableDesign') return 'Retractable Design';
            if (fieldKey === 'usb_waterResistant') return 'Water Resistant';
            if (fieldKey === 'usb_shockResistant') return 'Shock Resistant';
            if (fieldKey === 'usb_passwordProtection') return 'Password Protection';
            if (fieldKey === 'usb_minDimensions') return 'Dimensions';
            if (fieldKey === 'usb_weight') return 'Weight';
            if (fieldKey === 'usb_whatsInBox') return 'What\'s in the Box';
            if (fieldKey === 'usb_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'usb_material') return 'Material';
        }
        if (category === 'others-dvd') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'basic_partNo') return 'Part Number';
            if (fieldKey === 'dvd_driveType') return 'Drive Type';
            if (fieldKey === 'dvd_opticalDriveType') return 'Optical Drive Type';
            if (fieldKey === 'dvd_readSpeed') return 'Read Speed';
            if (fieldKey === 'dvd_writeSpeed') return 'Write Speed';
            if (fieldKey === 'dvd_supportedDiscFormats') return 'Supported Disc Formats';
            if (fieldKey === 'dvd_interface') return 'Interface';
            if (fieldKey === 'dvd_cableType') return 'Cable Type';
            if (fieldKey === 'dvd_compatibleDevices') return 'Compatible Devices';
            if (fieldKey === 'dvd_compatibleOS') return 'Compatible Operating Systems';
            if (fieldKey === 'dvd_plugAndPlay') return 'Plug & Play';
            if (fieldKey === 'dvd_slimDesign') return 'Slim Design';
            if (fieldKey === 'dvd_busPowered') return 'Bus Powered';
            if (fieldKey === 'dvd_mDiscSupport') return 'M-DISC Support';
            if (fieldKey === 'dvd_whatsInBox') return 'What\'s in the Box';
            if (fieldKey === 'dvd_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'dvd_material') return 'Material';
        }
        if (category === 'others-webcam') {
            if (fieldKey === 'basic_series') return 'Series';
            if (fieldKey === 'basic_partNo') return 'Part Number';
            if (fieldKey === 'webcam_resolution') return 'Resolution';
            if (fieldKey === 'webcam_frameRate') return 'Frame Rate';
            if (fieldKey === 'webcam_imageSensor') return 'Image Sensor';
            if (fieldKey === 'webcam_fieldOfView') return 'Field of View (FOV)';
            if (fieldKey === 'webcam_focusType') return 'Focus Type';
            if (fieldKey === 'webcam_builtInMicrophone') return 'Built-in Microphone';
            if (fieldKey === 'webcam_microphoneType') return 'Microphone Type';
            if (fieldKey === 'webcam_interface') return 'Interface';
            if (fieldKey === 'webcam_cableLength') return 'Cable Length';
            if (fieldKey === 'webcam_compatibleDevices') return 'Compatible Devices';
            if (fieldKey === 'webcam_compatibleOS') return 'Compatible Operating Systems';
            if (fieldKey === 'webcam_plugAndPlay') return 'Plug & Play';
            if (fieldKey === 'webcam_privacyShutter') return 'Privacy Shutter';
            if (fieldKey === 'webcam_autoLightCorrection') return 'Auto Light Correction';
            if (fieldKey === 'webcam_noiseReduction') return 'Noise Reduction';
            if (fieldKey === 'webcam_tripodSupport') return 'Tripod Support';
            if (fieldKey === 'webcam_whatsInBox') return 'What\'s in the Box';
            if (fieldKey === 'webcam_warranty') return 'Warranty';
            if (fieldKey === 'appearance_color') return 'Product Color';
            if (fieldKey === 'webcam_mountType') return 'Mount Type';
        }
        return defaultLabel;
    };

    const setFieldLabel = (fieldKey: string, newLabel: string) => {
        const currentLabels = (productInfo as any).fieldLabels || {};
        setProductInfo({
            ...productInfo,
            fieldLabels: { ...currentLabels, [fieldKey]: newLabel }
        } as ProductInfo);
    };

    // Custom fields state for each section
    const [basicCustomFields, setBasicCustomFields] = useState<CustomField[]>(
        (productInfo as any).basicCustomFields || []
    );
    const [appearanceCustomFields, setAppearanceCustomFields] = useState<CustomField[]>(
        (productInfo as any).appearanceCustomFields || []
    );
    const [osCustomFields, setOsCustomFields] = useState<CustomField[]>(
        (productInfo as any).osCustomFields || []
    );
    const [processorCustomFields, setProcessorCustomFields] = useState<CustomField[]>(
        (productInfo as any).processorCustomFields || []
    );
    const [memoryCustomFields, setMemoryCustomFields] = useState<CustomField[]>(
        (productInfo as any).memoryCustomFields || []
    );
    const [storageCustomFields, setStorageCustomFields] = useState<CustomField[]>(
        (productInfo as any).storageCustomFields || []
    );
    const [displayCustomFields, setDisplayCustomFields] = useState<CustomField[]>(
        (productInfo as any).displayCustomFields || []
    );
    const [graphicsCustomFields, setGraphicsCustomFields] = useState<CustomField[]>(
        (productInfo as any).graphicsCustomFields || []
    );
    const [audioCustomFields, setAudioCustomFields] = useState<CustomField[]>(
        (productInfo as any).audioCustomFields || []
    );
    const [connectivityCustomFields, setConnectivityCustomFields] = useState<CustomField[]>(
        (productInfo as any).connectivityCustomFields || []
    );
    const [portsCustomFields, setPortsCustomFields] = useState<CustomField[]>(
        (productInfo as any).portsCustomFields || []
    );
    const [cameraCustomFields, setCameraCustomFields] = useState<CustomField[]>(
        (productInfo as any).cameraCustomFields || []
    );
    const [batteryCustomFields, setBatteryCustomFields] = useState<CustomField[]>(
        (productInfo as any).batteryCustomFields || []
    );
    const [securityCustomFields, setSecurityCustomFields] = useState<CustomField[]>(
        (productInfo as any).securityCustomFields || []
    );
    const [dimensionsCustomFields, setDimensionsCustomFields] = useState<CustomField[]>(
        (productInfo as any).dimensionsCustomFields || []
    );
    const [warrantyCustomFields, setWarrantyCustomFields] = useState<CustomField[]>(
        (productInfo as any).warrantyCustomFields || []
    );
    const [certificationsCustomFields, setCertificationsCustomFields] = useState<CustomField[]>(
        (productInfo as any).certificationsCustomFields || []
    );
    const [environmentalCustomFields, setEnvironmentalCustomFields] = useState<CustomField[]>(
        (productInfo as any).environmentalCustomFields || []
    );

    // Sync custom fields when productInfo changes (e.g., when editing existing product)
    useEffect(() => {
        setBasicCustomFields((productInfo as any).basicCustomFields || []);
        setAppearanceCustomFields((productInfo as any).appearanceCustomFields || []);
        setOsCustomFields((productInfo as any).osCustomFields || []);
        setProcessorCustomFields((productInfo as any).processorCustomFields || []);
        setMemoryCustomFields((productInfo as any).memoryCustomFields || []);
        setStorageCustomFields((productInfo as any).storageCustomFields || []);
        setDisplayCustomFields((productInfo as any).displayCustomFields || []);
        setGraphicsCustomFields((productInfo as any).graphicsCustomFields || []);
        setAudioCustomFields((productInfo as any).audioCustomFields || []);
        setConnectivityCustomFields((productInfo as any).connectivityCustomFields || []);
        setPortsCustomFields((productInfo as any).portsCustomFields || []);
        setCameraCustomFields((productInfo as any).cameraCustomFields || []);
        setBatteryCustomFields((productInfo as any).batteryCustomFields || []);
        setSecurityCustomFields((productInfo as any).securityCustomFields || []);
        setDimensionsCustomFields((productInfo as any).dimensionsCustomFields || []);
        setWarrantyCustomFields((productInfo as any).warrantyCustomFields || []);
        setCertificationsCustomFields((productInfo as any).certificationsCustomFields || []);
        setEnvironmentalCustomFields((productInfo as any).environmentalCustomFields || []);
    }, [productInfo.title]); // Use title as a trigger - changes when product data is loaded

    // Helper to add custom field to a section
    const addCustomField = (
        fields: CustomField[],
        setFields: React.Dispatch<React.SetStateAction<CustomField[]>>,
        sectionKey: string
    ) => {
        const newFields = [...fields, { label: 'New Field', value: '' }];
        setFields(newFields);
        setProductInfo({ ...productInfo, [sectionKey]: newFields });
    };

    // Helper to update custom field
    const updateCustomField = (
        fields: CustomField[],
        setFields: React.Dispatch<React.SetStateAction<CustomField[]>>,
        sectionKey: string,
        index: number,
        key: 'label' | 'value',
        value: string
    ) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
        setProductInfo({ ...productInfo, [sectionKey]: newFields });
    };

    // Helper to delete custom field
    const deleteCustomField = (
        fields: CustomField[],
        setFields: React.Dispatch<React.SetStateAction<CustomField[]>>,
        sectionKey: string,
        index: number
    ) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
        setProductInfo({ ...productInfo, [sectionKey]: newFields });
    };

    // Render custom fields for a section (with delete option)
    const renderCustomFields = (
        fields: CustomField[],
        setFields: React.Dispatch<React.SetStateAction<CustomField[]>>,
        sectionKey: string
    ) => {
        if (fields.length === 0) return null;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {fields.map((field, idx) => (
                    <EditableFormInput
                        key={idx}
                        label={field.label}
                        value={field.value}
                        type={field.type === 'checkbox' ? 'checkbox' : 'text'}
                        onChange={(v) => updateCustomField(fields, setFields, sectionKey, idx, 'value', v)}
                        onLabelChange={(newLabel) => updateCustomField(fields, setFields, sectionKey, idx, 'label', newLabel)}
                        onTypeChange={(newType) => {
                            const defaultValue = newType === 'checkbox' ? 'false' : '';
                            const newFields = [...fields];
                            newFields[idx] = { ...newFields[idx], type: newType, value: defaultValue };
                            setFields(newFields);
                            setProductInfo({ ...productInfo, [sectionKey]: newFields } as any);
                        }}
                        placeholder="Enter value"
                        onDelete={() => deleteCustomField(fields, setFields, sectionKey, idx)}
                    />
                ))}
            </div>
        );
    };

    // Section configuration - custom section titles
    const getSectionTitle = (defaultTitle: string, sectionKey: string): string => {
        const category = activeCategory;
        const titles = (productInfo as any).sectionTitles || {};
        if (titles[sectionKey]) return titles[sectionKey];
        if (activeCategory === 'desktops') {
            if (sectionKey === 'battery') return 'Battery and Power';
            if (sectionKey === 'security') return 'Security Management';
            if (sectionKey === 'warranty') return 'Warranty and Services';
        }
        if (category === 'workstations') {
            if (sectionKey === 'os') return 'Supported Operating Systems';
            if (sectionKey === 'memory') return 'Memory';
            if (sectionKey === 'graphics') return 'Display and Graphics';
            if (sectionKey === 'audio') return 'Multimedia and Input Devices';
            if (sectionKey === 'connectivityComms') return 'Connectivity and Communications';
            if (sectionKey === 'battery') return 'Battery and Power';
            if (sectionKey === 'security') return 'Security Management';
            if (sectionKey === 'software') return 'Software';
            if (sectionKey === 'dimensions') return 'Dimensions and Weight';
            if (sectionKey === 'warranty') return 'Warranty and Services';
            if (sectionKey === 'environmental') return 'Environmental';
        }
        if (category === 'monitors') {
            if (sectionKey === 'basic') return 'Basic Product Info';
            if (sectionKey === 'appearance') return 'Appearance';
            if (sectionKey === 'display') return 'Display Specifications';
            if (sectionKey === 'battery') return 'Power';
            if (sectionKey === 'environmental') return 'Environmental';
            if (sectionKey === 'security') return 'Security';
            if (sectionKey === 'whatsInTheBox') return "What's in the Box";
            if (sectionKey === 'dimensions') return 'Dimensions and Weight';
            if (sectionKey === 'legalDisclaimer') return 'Legal Disclaimer';
        }
        if (category === 'keyboard-mouse-combo') {
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'connection') return 'Connection and Communication';
            if (sectionKey === 'categoryInfo') return 'Category';
            if (sectionKey === 'multimedia') return 'Multimedia and Input Devices';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'mouse') {
            if (sectionKey === 'appearance') return 'Appearance';
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'connection') return 'Connection and Communication';
            if (sectionKey === 'categoryInfo') return 'Category';
        }
        if (category === 'keyboards') {
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'connection') return 'Connection and Communication';
            if (sectionKey === 'categoryInfo') return 'Category';
            if (sectionKey === 'systemRequirements') return 'System Requirements';
            if (sectionKey === 'multimedia') return 'Multimedia and Input Devices';
            if (sectionKey === 'appearance') return 'Appearance';
            if (sectionKey === 'connectivityComms') return 'Connectivity and Communications';
            if (sectionKey === 'boxContents') return 'Box contents';
            if (sectionKey === 'dimensions') return 'Dimensions';
            if (sectionKey === 'weights') return 'Weights';
        }
        if (category === 'power-adapters') {
            if (sectionKey === 'categoryInfo') return 'Category';
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'storageSpecs') return 'Storage Specifications';
            if (sectionKey === 'boxContents') return 'Box contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'bags') {
            if (sectionKey === 'categoryInfo') return 'Series';
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'storageSpecs') return 'Storage Specifications';
            if (sectionKey === 'boxContents') return 'Box contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'cables') {
            if (sectionKey === 'categoryInfo') return 'Series';
            if (sectionKey === 'connection') return 'Connectivity';
            if (sectionKey === 'cableSpecs') return 'Cable Specifications';
            if (sectionKey === 'compatibility') return 'Compatibility';
            if (sectionKey === 'features') return 'Features';
            if (sectionKey === 'boxContents') return 'Package Contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
            if (sectionKey === 'powerSpecs') return 'Power Specifications';
        }
        if (category === 'headphones') {
            if (sectionKey === 'categoryInfo') return 'Category';
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'connection') return 'Connection and Communication';
            if (sectionKey === 'multimedia') return 'Multimedia and Input Devices';
            if (sectionKey === 'battery') return 'Battery and Power';
            if (sectionKey === 'connectivityComms') return 'Connectivity and Communications';
            if (sectionKey === 'dimensions') return 'Dimensions';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'docks') {
            if (sectionKey === 'categoryInfo') return 'Category';
            if (sectionKey === 'usage') return 'Usage';
            if (sectionKey === 'connection') return 'Connection and Communication';
            if (sectionKey === 'multimedia') return 'Multimedia and Input Devices';
            if (sectionKey === 'connectivityComms') return 'Connectivity and Communications';
            if (sectionKey === 'supportedOS') return 'Supported Operating Systems';
            if (sectionKey === 'systemRequirements') return 'System Requirements';
            if (sectionKey === 'dimensions') return 'Dimensions';
            if (sectionKey === 'weights') return 'Weights';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'compatibility') return 'Compatibility';
            if (sectionKey === 'boxContents') return 'Box contents';
            if (sectionKey === 'battery') return 'Battery and Power';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'hubs') {
            if (sectionKey === 'categoryInfo') return 'Series';
            if (sectionKey === 'connection') return 'Connectivity';
            if (sectionKey === 'performance') return 'Performance';
            if (sectionKey === 'compatibility') return 'Compatibility';
            if (sectionKey === 'features') return 'Features';
            if (sectionKey === 'boxContents') return 'Package Contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'usb-flashdrives') {
            if (sectionKey === 'categoryInfo') return 'Series';
            if (sectionKey === 'storageSpecs') return 'Storage Specifications';
            if (sectionKey === 'connection') return 'Connectivity';
            if (sectionKey === 'compatibility') return 'Compatibility';
            if (sectionKey === 'features') return 'Features';
            if (sectionKey === 'dimensions') return 'Physical Specifications';
            if (sectionKey === 'boxContents') return 'Package Contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'others-dvd') {
            if (sectionKey === 'categoryInfo') return 'Series';
            if (sectionKey === 'driveSpecs') return 'Drive Specifications';
            if (sectionKey === 'connection') return 'Connectivity';
            if (sectionKey === 'compatibility') return 'Compatibility';
            if (sectionKey === 'features') return 'Features';
            if (sectionKey === 'boxContents') return 'Package Contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        if (category === 'others-webcam') {
            if (sectionKey === 'categoryInfo') return 'Series';
            if (sectionKey === 'cameraSpecs') return 'Camera Specifications';
            if (sectionKey === 'audio') return 'Audio';
            if (sectionKey === 'connection') return 'Connectivity';
            if (sectionKey === 'compatibility') return 'Compatibility';
            if (sectionKey === 'features') return 'Features';
            if (sectionKey === 'boxContents') return 'Package Contents';
            if (sectionKey === 'warranty') return 'Warranty';
            if (sectionKey === 'appearance') return 'Appearance';
        }
        return defaultTitle;
    };

    const setSectionTitle = (sectionKey: string, newTitle: string) => {
        const currentTitles = (productInfo as any).sectionTitles || {};
        setProductInfo({
            ...productInfo,
            sectionTitles: { ...currentTitles, [sectionKey]: newTitle }
        } as ProductInfo);
    };

    // Hidden sections management
    const hiddenSections = (productInfo as any).hiddenSections || [];

    const isSectionHidden = (sectionKey: string): boolean => {
        return hiddenSections.includes(sectionKey);
    };

    const hideSection = (sectionKey: string) => {
        const currentHidden = (productInfo as any).hiddenSections || [];
        if (!currentHidden.includes(sectionKey)) {
            setProductInfo({
                ...productInfo,
                hiddenSections: [...currentHidden, sectionKey]
            } as ProductInfo);
        }
    };

    const showSection = (sectionKey: string) => {
        const currentHidden = (productInfo as any).hiddenSections || [];
        setProductInfo({
            ...productInfo,
            hiddenSections: currentHidden.filter((s: string) => s !== sectionKey)
        } as ProductInfo);
    };

    // All section definitions for restoration
    const allSections = [
        { key: 'basic', title: 'Basic Product Info' },
        { key: 'appearance', title: 'Appearance' },
        { key: 'os', title: 'Operating System' },
        { key: 'processor', title: 'Processor' },
        { key: 'memory', title: 'Memory' },
        { key: 'storage', title: 'Storage' },
        { key: 'display', title: 'Display' },
        { key: 'graphics', title: 'Graphics' },
        { key: 'audio', title: 'Audio' },
        { key: 'connectivity', title: 'Connectivity' },
        { key: 'ports', title: 'Ports & Slots' },
        { key: 'camera', title: 'Camera' },
        { key: 'battery', title: 'Battery & Power' },
        { key: 'security', title: 'Security' },
        { key: 'dimensions', title: 'Dimensions & Weight' },
        { key: 'warranty', title: 'Warranty' },
        { key: 'certifications', title: 'Certifications' },
        { key: 'environmental', title: 'Environmental' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold dark:text-white">Extended Product Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fill in detailed product specifications. Empty fields will not be shown on the product page. Click the edit icons to rename sections or fields.
                    </p>
                </div>
            </div>

            {/* Restore Hidden Sections */}
            {hiddenSections.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Hidden Sections ({hiddenSections.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {hiddenSections.map((sectionKey: string) => {
                            const section = allSections.find(s => s.key === sectionKey);
                            return (
                                <button
                                    key={sectionKey}
                                    type="button"
                                    onClick={() => showSection(sectionKey)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded-full text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
                                >
                                    <FiPlus size={12} />
                                    Restore {section?.title || sectionKey}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Conditionally render category-specific fields */}
            {activeCategory === 'monitors' ? renderMonitorFields() :
                activeCategory === 'desktops' ? renderDesktopFields() :
                activeCategory === 'workstations' ? renderWorkstationFields() :
                activeCategory === 'keyboard-mouse-combo' ? renderKeyboardMouseComboFields() :
                    activeCategory === 'keyboards' ? renderKeyboardFields() :
                        activeCategory === 'mouse' ? renderMouseFields() :
                            activeCategory === 'power-adapters' ? renderPowerAdaptersFields() :
                                activeCategory === 'headphones' ? renderHeadphonesFields() :
                                    activeCategory === 'bags' ? renderBagsFields() :
                                        activeCategory === 'cables' ? renderCablesFields() :
                                            activeCategory === 'docks' ? renderDocksFields() :
                                            activeCategory === 'hubs' ? renderHubsFields() :
                                            activeCategory === 'usb-flashdrives' ? renderUSBFlashDrivesFields() :
                                            activeCategory === 'others-dvd' ? renderDVDFields() :
                                            activeCategory === 'others-webcam' ? renderWebcamFields() :
                                                renderDefaultFields()}
        </div>
    );

    // Monitor-specific fields rendering function
    function renderMonitorFields() {
        return (
            <>
                {/* Basic Product Info */}
                <FormSection
                    title={getSectionTitle("Basic Product Info", "basic")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("basic", newTitle)}
                    onDelete={() => hideSection("basic")}
                    isDeleted={isSectionHidden("basic")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Product Title", "basic_title")}
                                value={productInfo.title}
                                onChange={(v) => updateField('title', v)}
                                onLabelChange={(newLabel) => setFieldLabel("basic_title", newLabel)}
                                placeholder="e.g. HP M24f FHD Monitor"
                            />
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. 2D9K0AA"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. M-Series"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "basic_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_recommendedUsage", newLabel)}
                            placeholder="e.g. Home or Business"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black, Silver"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>

                {/* Display Specifications */}
                <FormSection
                    title={getSectionTitle("Display Specifications", "display")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("display", newTitle)}
                    onDelete={() => hideSection("display")}
                    isDeleted={isSectionHidden("display")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Display type", "display_panel")}
                            value={productInfo.display?.panel}
                            onChange={(v) => updateNestedField('display', 'panel', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_panel", newLabel)}
                            placeholder="e.g. IPS with LED backlight"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Display area (metric)", "display_displayAreaMetric")}
                            value={productInfo.display?.displayAreaMetric}
                            onChange={(v) => updateNestedField('display', 'displayAreaMetric', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_displayAreaMetric", newLabel)}
                            placeholder="e.g. 52.7 x 29.6 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Aspect ratio", "display_aspectRatio")}
                            value={productInfo.display?.aspectRatio}
                            onChange={(v) => updateNestedField('display', 'aspectRatio', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_aspectRatio", newLabel)}
                            placeholder="e.g. 16:9"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Resolution (maximum)", "display_resolutionMaximum")}
                            value={productInfo.display?.resolutionMaximum}
                            onChange={(v) => updateNestedField('display', 'resolutionMaximum', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_resolutionMaximum", newLabel)}
                            placeholder="e.g. 1920 x 1080 @ 75 Hz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Resolution (native)", "display_resolutionNative")}
                            value={productInfo.display?.resolutionNative}
                            onChange={(v) => updateNestedField('display', 'resolutionNative', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_resolutionNative", newLabel)}
                            placeholder="e.g. FHD (1920 x 1080)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Resolutions supported", "display_resolutionSupported")}
                            value={productInfo.display?.resolutionSupported}
                            onChange={(v) => updateNestedField('display', 'resolutionSupported', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_resolutionSupported", newLabel)}
                            placeholder="e.g. 1024 x 768; 1280 x 720; 1920 x 1080"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Pixel pitch", "display_pixelPitch")}
                            value={productInfo.display?.pixelPitch}
                            onChange={(v) => updateNestedField('display', 'pixelPitch', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_pixelPitch", newLabel)}
                            placeholder="e.g. 0.274 mm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Brightness", "display_brightness")}
                            value={productInfo.display?.brightness}
                            onChange={(v) => updateNestedField('display', 'brightness', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_brightness", newLabel)}
                            placeholder="e.g. 300 nits"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Contrast ratio", "display_contrastRatio")}
                            value={productInfo.display?.contrastRatio}
                            onChange={(v) => updateNestedField('display', 'contrastRatio', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_contrastRatio", newLabel)}
                            placeholder="e.g. 1000:1 static"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Response time", "display_responseTime")}
                            value={productInfo.display?.responseTime}
                            onChange={(v) => updateNestedField('display', 'responseTime', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_responseTime", newLabel)}
                            placeholder="e.g. 5ms GtG (with overdrive)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Display scan frequency (horizontal)", "display_scanFrequencyHorizontal")}
                            value={productInfo.display?.scanFrequencyHorizontal}
                            onChange={(v) => updateNestedField('display', 'scanFrequencyHorizontal', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_scanFrequencyHorizontal", newLabel)}
                            placeholder="e.g. 30-86 KHz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Display scan frequency (vertical)", "display_scanFrequencyVertical")}
                            value={productInfo.display?.scanFrequencyVertical}
                            onChange={(v) => updateNestedField('display', 'scanFrequencyVertical', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_scanFrequencyVertical", newLabel)}
                            placeholder="e.g. 48-75 Hz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Display colors", "display_displayColors")}
                            value={productInfo.display?.displayColors}
                            onChange={(v) => updateNestedField('display', 'displayColors', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_displayColors", newLabel)}
                            placeholder="e.g. Up to 16.7 million colors supported"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Onscreen controls", "display_onscreenControls")}
                            value={productInfo.display?.onscreenControls}
                            onChange={(v) => updateNestedField('display', 'onscreenControls', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_onscreenControls", newLabel)}
                            placeholder="e.g. Brightness; Color control; Image control"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Display features", "display_features")}
                            value={productInfo.display?.features}
                            onChange={(v) => updateNestedField('display', 'features', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_features", newLabel)}
                            placeholder="e.g. On-screen controls; AMD FreeSync; Anti-glare"
                        />
                        <EditableFormInput
                            label={getFieldLabel("View angle", "display_viewAngle")}
                            value={productInfo.display?.viewAngle}
                            onChange={(v) => updateNestedField('display', 'viewAngle', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_viewAngle", newLabel)}
                            placeholder="e.g. 178° horizontal; 178° vertical"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Tilt and swivel angle", "display_tiltAndSwivel")}
                            value={productInfo.display?.tiltAndSwivel}
                            onChange={(v) => updateNestedField('display', 'tiltAndSwivel', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_tiltAndSwivel", newLabel)}
                            placeholder="e.g. Tilt: -5 to +25°"
                        />
                        <EditableFormInput
                            label={getFieldLabel("VESA mount", "display_vesaMount")}
                            value={productInfo.display?.vesaMount}
                            onChange={(v) => updateNestedField('display', 'vesaMount', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_vesaMount", newLabel)}
                            placeholder="e.g. 100 mm x 100 mm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Tilt", "display_tilt")}
                            value={productInfo.display?.tilt}
                            onChange={(v) => updateNestedField('display', 'tilt', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_tilt", newLabel)}
                            placeholder="e.g. -5 to +25°"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Swivel", "display_swivel")}
                            value={productInfo.display?.swivel}
                            onChange={(v) => updateNestedField('display', 'swivel', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_swivel", newLabel)}
                            placeholder="e.g. ±45°"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Display Input Type", "display_inputType")}
                            value={productInfo.display?.inputType}
                            onChange={(v) => updateNestedField('display', 'inputType', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_inputType", newLabel)}
                            placeholder="e.g. 1 VGA; 1 HDMI 1.4"
                        />
                        <EditableFormCheckbox
                            label={getFieldLabel("Flicker-free", "display_flickerFree")}
                            checked={productInfo.display?.flickerFree || false}
                            onChange={(v) => updateNestedField('display', 'flickerFree', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_flickerFree", newLabel)}
                        />
                        <EditableFormCheckbox
                            label={getFieldLabel("Low blue light", "display_lowBlueLight")}
                            checked={productInfo.display?.lowBlueLight || false}
                            onChange={(v) => updateNestedField('display', 'lowBlueLight', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_lowBlueLight", newLabel)}
                        />
                    </div>
                    {renderCustomFields(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                </FormSection>

                {/* Power */}
                <FormSection
                    title={getSectionTitle("Power", "battery")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("battery", newTitle)}
                    onDelete={() => hideSection("battery")}
                    isDeleted={isSectionHidden("battery")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Power", "battery_power")}
                            value={productInfo.batteryAndPower?.power}
                            onChange={(v) => updateNestedField('batteryAndPower', 'power', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_power", newLabel)}
                            placeholder="e.g. 100 - 240 VAC 50/60 Hz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Power Consumption", "battery_powerConsumption")}
                            value={productInfo.batteryAndPower?.powerConsumption}
                            onChange={(v) => updateNestedField('batteryAndPower', 'powerConsumption', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_powerConsumption", newLabel)}
                            placeholder="e.g. 20 W (maximum), 14.3 W (typical)"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection>

                {/* Operating Conditions */}
                <FormSection
                    title={getSectionTitle("Operating Conditions", "environmental")}
                    onAddSpec={() => addCustomField(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("environmental", newTitle)}
                    onDelete={() => hideSection("environmental")}
                    isDeleted={isSectionHidden("environmental")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Operating temperature range", "environmental_operatingTemperature")}
                            value={productInfo.environmental?.operatingTemperature}
                            onChange={(v) => updateNestedField('environmental', 'operatingTemperature', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_operatingTemperature", newLabel)}
                            placeholder="e.g. 5 to 35°C"
                        />
                    </div>
                </FormSection>

                {/* Dimensions and Weight */}
                <FormSection
                    title={getSectionTitle("Dimensions and Weight", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Dimensions (W x D x H)", "dimensions_front")}
                            value={productInfo.dimensionsAndWeight?.dimensionsText}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...(productInfo.dimensionsAndWeight || {}),
                                        dimensionsText: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_front", newLabel)}
                            placeholder="e.g. 53.58 x 3.4 x 31.56 cm (without stand)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Dimensions with stand (W x D x H)", "dimensions_rear")}
                            value={productInfo.dimensionsAndWeight?.dimensionsWithStand}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...(productInfo.dimensionsAndWeight || {}),
                                        dimensionsWithStand: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_rear", newLabel)}
                            placeholder="e.g. 53.58 x 17.72 x 39.68 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight", "dimensions_weight")}
                            value={productInfo.dimensionsAndWeight?.weight}
                            onChange={(v) => updateNestedField('dimensionsAndWeight', 'weight', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_weight", newLabel)}
                            placeholder="e.g. 2.5 kg"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Physical Security */}
                <FormSection
                    title={getSectionTitle("Physical Security", "security")}
                    onAddSpec={() => addCustomField(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("security", newTitle)}
                    onDelete={() => hideSection("security")}
                    isDeleted={isSectionHidden("security")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Physical security", "security_physicalSecurity")}
                            value={productInfo.security?.physicalSecurity}
                            onChange={(v) => updateNestedField('security', 'physicalSecurity', v)}
                            onLabelChange={(newLabel) => setFieldLabel("security_physicalSecurity", newLabel)}
                            placeholder="e.g. Security lock-ready"
                        />
                    </div>
                    {renderCustomFields(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                </FormSection>

                {/* What's in the Box */}
                <FormSection
                    title={getSectionTitle("What's in the Box", "whatsInTheBox")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("whatsInTheBox", newTitle)}
                    onDelete={() => hideSection("whatsInTheBox")}
                    isDeleted={isSectionHidden("whatsInTheBox")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the box", "basic_whatsInTheBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_whatsInTheBox", newLabel)}
                            placeholder="e.g. Monitor; HDMI cable; QSP; Doc-kit; AC power cord"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Environmental & Certifications */}
                <FormSection
                    title={getSectionTitle("Environmental", "environmental")}
                    onAddSpec={() => addCustomField(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("environmental", newTitle)}
                    onDelete={() => hideSection("environmental")}
                    isDeleted={isSectionHidden("environmental")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Energy Efficiency Compliance", "environmental_energyCompliance")}
                            value={productInfo.environmental?.energyCompliance}
                            onChange={(v) => updateNestedField('environmental', 'energyCompliance', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_energyCompliance", newLabel)}
                            placeholder="e.g. ENERGY STAR certified"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Environmental", "environmental_general")}
                            value={productInfo.environmental?.general}
                            onChange={(v) => updateNestedField('environmental', 'general', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_general", newLabel)}
                            placeholder="e.g. Low halogen; Outside box packaging is 100% sustainably sourced"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Environmental specification footnote number", "environmental_footnote")}
                            value={productInfo.environmental?.footnote}
                            onChange={(v) => updateNestedField('environmental', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_footnote", newLabel)}
                            placeholder="e.g. Footnote number details..."
                        />
                        <EditableFormInput
                            label={getFieldLabel("Certifications and compliances", "environmental_certifications")}
                            value={productInfo.environmental?.certifications}
                            onChange={(v) => updateNestedField('environmental', 'certifications', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_certifications", newLabel)}
                            placeholder="e.g. CB; CE; FCC; GS; ISO 9241-307; KC/KCC; Microsoft WHQL Certification"
                        />
                    </div>
                    {renderCustomFields(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                </FormSection>

                {/* Security Management */}
                <FormSection
                    title={getSectionTitle("Security Management", "securityManagement")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("securityManagement", newTitle)}
                    onDelete={() => hideSection("securityManagement")}
                    isDeleted={isSectionHidden("securityManagement")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Legal Disclaimer", "basic_legalDisclaimer")}
                            value={productInfo.legalDisclaimer}
                            onChange={(v) => setProductInfo({ ...productInfo, legalDisclaimer: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_legalDisclaimer", newLabel)}
                            placeholder="e.g. Product image may differ from actual product"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>
            </>
        );
    }

    // Keyboard & Mouse Combo specific fields rendering function
    function renderKeyboardMouseComboFields() {
        return (
            <>
                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "combo_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("combo_recommendedUsage", newLabel)}
                            placeholder="e.g. Home, Office"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connection and Communication */}
                <FormSection
                    title={getSectionTitle("Connection and Communication", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connectivity", "combo_connectivity")}
                            value={(productInfo as any).connectivity}
                            onChange={(v) => setProductInfo({ ...productInfo, connectivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("combo_connectivity", newLabel)}
                            placeholder="e.g. Wireless 2.4 GHz"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Category */}
                <FormSection
                    title={getSectionTitle("Category", "categoryInfo")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. MK270"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. MK Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "multimedia")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("multimedia", newTitle)}
                    onDelete={() => hideSection("multimedia")}
                    isDeleted={isSectionHidden("multimedia")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connection Type", "combo_connectionType")}
                            value={(productInfo as any).connectionType}
                            onChange={(v) => setProductInfo({ ...productInfo, connectionType: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("combo_connectionType", newLabel)}
                            placeholder="e.g. USB Receiver"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty Duration", "warranty_duration")}
                            value={productInfo.warranty?.duration}
                            onChange={(v) => updateNestedField('warranty', 'duration', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_duration", newLabel)}
                            placeholder="e.g. 1 year"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Coverage", "warranty_coverage")}
                            value={productInfo.warranty?.coverage}
                            onChange={(v) => updateNestedField('warranty', 'coverage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_coverage", newLabel)}
                            placeholder="e.g. Manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>
            </>
        );
    }

    // Keyboard specific fields rendering function
    function renderKeyboardFields() {
        return (
            <>
                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "keyboard_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_recommendedUsage", newLabel)}
                            placeholder="e.g. Home, Office"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connection and Communication */}
                <FormSection
                    title={getSectionTitle("Connection and Communication", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connectivity", "keyboard_connectivity")}
                            value={(productInfo as any).connectivity}
                            onChange={(v) => setProductInfo({ ...productInfo, connectivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_connectivity", newLabel)}
                            placeholder="e.g. Wireless 2.4 GHz"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Category */}
                <FormSection
                    title={getSectionTitle("Category", "categoryInfo")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. K120"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. K Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* System Requirements */}
                <FormSection
                    title={getSectionTitle("System Requirements", "systemRequirements")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("systemRequirements", newTitle)}
                    onDelete={() => hideSection("systemRequirements")}
                    isDeleted={isSectionHidden("systemRequirements")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Minimum System Requirements", "keyboard_minSystemReqs")}
                            value={productInfo.minimumSystemRequirements}
                            onChange={(v) => setProductInfo({ ...productInfo, minimumSystemRequirements: v })}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_minSystemReqs", newLabel)}
                            placeholder="e.g. Windows 10, 11; USB Port"
                        />
                    </div>
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "multimedia")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("multimedia", newTitle)}
                    onDelete={() => hideSection("multimedia")}
                    isDeleted={isSectionHidden("multimedia")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connection type", "keyboard_connectionType")}
                            value={(productInfo as any).connectionType}
                            onChange={(v) => setProductInfo({ ...productInfo, connectionType: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_connectionType", newLabel)}
                            placeholder="e.g. USB Receiver"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>

                {/* Connectivity and Communications */}
                <FormSection
                    title={getSectionTitle("Connectivity and Communications", "connectivityComms")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivityComms", newTitle)}
                    onDelete={() => hideSection("connectivityComms")}
                    isDeleted={isSectionHidden("connectivityComms")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Cable length", "keyboard_cableLength")}
                            value={productInfo.cableLength}
                            onChange={(v) => setProductInfo({ ...productInfo, cableLength: v })}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_cableLength", newLabel)}
                            placeholder="e.g. 1.5 m"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Box contents */}
                <FormSection
                    title={getSectionTitle("Box contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the box", "keyboard_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_whatsInBox", newLabel)}
                            placeholder="e.g. Keyboard; User Guide"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Dimensions */}
                <FormSection
                    title={getSectionTitle("Dimensions", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Dimensions (W x D x H)", "keyboard_dimensions")}
                            value={(productInfo as any).dimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, dimensions: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_dimensions", newLabel)}
                            placeholder="e.g. 450 x 150 x 30 mm"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Weights */}
                <FormSection
                    title={getSectionTitle("Weights", "weights")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("weights", newTitle)}
                    onDelete={() => hideSection("weights")}
                    isDeleted={isSectionHidden("weights")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Weight", "keyboard_weight")}
                            value={(productInfo as any).weight}
                            onChange={(v) => setProductInfo({ ...productInfo, weight: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("keyboard_weight", newLabel)}
                            placeholder="e.g. 500g"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty Duration", "warranty_duration")}
                            value={productInfo.warranty?.duration}
                            onChange={(v) => updateNestedField('warranty', 'duration', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_duration", newLabel)}
                            placeholder="e.g. 1 year"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Coverage", "warranty_coverage")}
                            value={productInfo.warranty?.coverage}
                            onChange={(v) => updateNestedField('warranty', 'coverage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_coverage", newLabel)}
                            placeholder="e.g. Manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>
            </>
        );
    }

    // Mouse specific fields rendering function
    function renderMouseFields() {
        return (
            <>
                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "mouse_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("mouse_recommendedUsage", newLabel)}
                            placeholder="e.g. Home, Office"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connection and Communication */}
                <FormSection
                    title={getSectionTitle("Connection and Communication", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connectivity", "mouse_connectivity")}
                            value={(productInfo as any).connectivity}
                            onChange={(v) => setProductInfo({ ...productInfo, connectivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("mouse_connectivity", newLabel)}
                            placeholder="e.g. Wireless 2.4 GHz"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Category */}
                <FormSection
                    title={getSectionTitle("Category", "categoryInfo")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. M185"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. M Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "multimedia")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("multimedia", newTitle)}
                    onDelete={() => hideSection("multimedia")}
                    isDeleted={isSectionHidden("multimedia")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connection Type", "mouse_connectionType")}
                            value={(productInfo as any).connectionType}
                            onChange={(v) => setProductInfo({ ...productInfo, connectionType: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("mouse_connectionType", newLabel)}
                            placeholder="e.g. USB Receiver"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Size & Fit", "appearance_sizeFit")}
                            value={productInfo.appearance?.sizeFit}
                            onChange={(v) => updateNestedField('appearance', 'sizeFit', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_sizeFit", newLabel)}
                            placeholder="e.g. Standard"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty Duration", "warranty_duration")}
                            value={productInfo.warranty?.duration}
                            onChange={(v) => updateNestedField('warranty', 'duration', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_duration", newLabel)}
                            placeholder="e.g. 1 year"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Coverage", "warranty_coverage")}
                            value={productInfo.warranty?.coverage}
                            onChange={(v) => updateNestedField('warranty', 'coverage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_coverage", newLabel)}
                            placeholder="e.g. Manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>
            </>
        );
    }

    // Power Adapters specific fields rendering function
    function renderPowerAdaptersFields() {
        return (
            <>
                {/* Category */}
                <FormSection
                    title={getSectionTitle("Category", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. PA-1650-78"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. AC Adapter Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "adapter_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("adapter_recommendedUsage", newLabel)}
                            placeholder="e.g. Laptop, Mobile"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Storage Specifications */}
                <FormSection
                    title={getSectionTitle("Storage Specifications", "storageSpecs")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("storageSpecs", newTitle)}
                    onDelete={() => hideSection("storageSpecs")}
                    isDeleted={isSectionHidden("storageSpecs")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Special Features", "adapter_specialFeatures")}
                            value={(productInfo as any).specialFeatures}
                            onChange={(v) => setProductInfo({ ...productInfo, specialFeatures: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("adapter_specialFeatures", newLabel)}
                            placeholder="e.g. Overcurrent protection, Short circuit protection"
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Box Contents */}
                <FormSection
                    title={getSectionTitle("Box Contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the Box", "adapter_whatsInBox")}
                            value={(productInfo as any).whatsInBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInBox: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("adapter_whatsInBox", newLabel)}
                            placeholder="e.g. 1 x Power Adapter, 1 x Power Cable"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "adapter_warranty")}
                            value={(productInfo as any).warranty}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("adapter_warranty", newLabel)}
                            placeholder="e.g. 6 months manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    // Headphones specific fields rendering function
    function renderHeadphonesFields() {
        return (
            <>
                {/* Category */}
                <FormSection
                    title={getSectionTitle("Category", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. H340"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. H Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "headphone_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_recommendedUsage", newLabel)}
                            placeholder="e.g. Gaming, Music, Office"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connection and Communication */}
                <FormSection
                    title={getSectionTitle("Connection and Communication", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connectivity", "headphone_connectivity")}
                            value={(productInfo as any).connectivity}
                            onChange={(v) => setProductInfo({ ...productInfo, connectivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_connectivity", newLabel)}
                            placeholder="e.g. Wireless, Wired"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "multimedia")}
                    onAddSpec={() => addCustomField(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("multimedia", newTitle)}
                    onDelete={() => hideSection("multimedia")}
                    isDeleted={isSectionHidden("multimedia")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Sensitivity (microphone)", "headphone_micSensitivity")}
                            value={productInfo.micSensitivity}
                            onChange={(v) => setProductInfo({ ...productInfo, micSensitivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_micSensitivity", newLabel)}
                            placeholder="e.g. -42 dB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Microphone Type", "headphone_micType")}
                            value={productInfo.micType}
                            onChange={(v) => setProductInfo({ ...productInfo, micType: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_micType", newLabel)}
                            placeholder="e.g. Boom, Built-in"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Sensitivity (speaker)", "headphone_speakerSensitivity")}
                            value={productInfo.speakerSensitivity}
                            onChange={(v) => setProductInfo({ ...productInfo, speakerSensitivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_speakerSensitivity", newLabel)}
                            placeholder="e.g. 100 dB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Speaker size", "headphone_speakerSize")}
                            value={productInfo.speakerSize}
                            onChange={(v) => setProductInfo({ ...productInfo, speakerSize: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_speakerSize", newLabel)}
                            placeholder="e.g. 40 mm"
                        />
                    </div>
                    {renderCustomFields(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                </FormSection>

                {/* Battery and Power */}
                <FormSection
                    title={getSectionTitle("Battery and Power", "battery")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("battery", newTitle)}
                    onDelete={() => hideSection("battery")}
                    isDeleted={isSectionHidden("battery")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Impedance", "headphone_impedance")}
                            value={productInfo.impedance}
                            onChange={(v) => setProductInfo({ ...productInfo, impedance: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_impedance", newLabel)}
                            placeholder="e.g. 32 Ohms"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection>

                {/* Connectivity and Communications */}
                <FormSection
                    title={getSectionTitle("Connectivity and Communications", "connectivityComms")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivityComms", newTitle)}
                    onDelete={() => hideSection("connectivityComms")}
                    isDeleted={isSectionHidden("connectivityComms")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Frequency (MHz)", "headphone_frequencyMhz")}
                            value={productInfo.frequencyMhz}
                            onChange={(v) => setProductInfo({ ...productInfo, frequencyMhz: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_frequencyMhz", newLabel)}
                            placeholder="e.g. 2.4 GHz"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Dimensions */}
                <FormSection
                    title={getSectionTitle("Dimensions", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Minimum dimensions (W x D x H)", "headphone_minDimensions")}
                            value={productInfo.minDimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, minDimensions: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_minDimensions", newLabel)}
                            placeholder="e.g. 175 x 80 x 185 mm"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "headphone_warranty")}
                            value={(productInfo as any).warranty}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_warranty", newLabel)}
                            placeholder="e.g. 1 year manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }


    // Bags specific fields rendering function
    function renderBagsFields() {
        return (
            <>
                {/* Category */}
                <FormSection
                    title={getSectionTitle("Series", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. BP100"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. Essential Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "bag_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("bag_recommendedUsage", newLabel)}
                            placeholder="e.g. Laptop, Travel, Business"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Storage Specifications */}
                <FormSection
                    title={getSectionTitle("Storage Specifications", "storageSpecs")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("storageSpecs", newTitle)}
                    onDelete={() => hideSection("storageSpecs")}
                    isDeleted={isSectionHidden("storageSpecs")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Special features", "bag_specialFeatures")}
                            value={productInfo.specialFeatures}
                            onChange={(v) => setProductInfo({ ...productInfo, specialFeatures: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("bag_specialFeatures", newLabel)}
                            placeholder="e.g. Water resistant, padded pockets"
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Box contents */}
                <FormSection
                    title={getSectionTitle("Box contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the box", "bag_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("bag_whatsInBox", newLabel)}
                            placeholder="e.g. Laptop Bag; Shoulder Strap"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "bag_warranty")}
                            value={(productInfo as any).warranty}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("bag_warranty", newLabel)}
                            placeholder="e.g. 6 months manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    // Docks specific fields rendering function
    function renderDocksFields() {
        return (
            <>
                {/* Category */}
                <FormSection
                    title={getSectionTitle("Category", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. USB-C-DOCK-001"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. USB-C Dock Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Usage */}
                <FormSection
                    title={getSectionTitle("Usage", "usage")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("usage", newTitle)}
                    onDelete={() => hideSection("usage")}
                    isDeleted={isSectionHidden("usage")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "dock_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_recommendedUsage", newLabel)}
                            placeholder="e.g. Laptop, Workstation"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connection and Communication */}
                <FormSection
                    title={getSectionTitle("Connection and Communication", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connectivity", "dock_connectivity")}
                            value={(productInfo as any).connectivity}
                            onChange={(v) => setProductInfo({ ...productInfo, connectivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_connectivity", newLabel)}
                            placeholder="e.g. USB-C, Thunderbolt"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "multimedia")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("multimedia", newTitle)}
                    onDelete={() => hideSection("multimedia")}
                    isDeleted={isSectionHidden("multimedia")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connection type", "dock_connectionType")}
                            value={(productInfo as any).connectionType}
                            onChange={(v) => setProductInfo({ ...productInfo, connectionType: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_connectionType", newLabel)}
                            placeholder="e.g. USB Type-C host connection"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Power Button", "dock_powerButton")}
                            value={productInfo.powerButton}
                            onChange={(v) => setProductInfo({ ...productInfo, powerButton: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_powerButton", newLabel)}
                            placeholder="e.g. Yes, to power or wake host system"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Connectivity and Communications */}
                <FormSection
                    title={getSectionTitle("Connectivity and Communications", "connectivityComms")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivityComms", newTitle)}
                    onDelete={() => hideSection("connectivityComms")}
                    isDeleted={isSectionHidden("connectivityComms")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("I/O Port location", "connectivity_ioPortLocationFront")}
                            value={productInfo.connectivityAndComms?.ioPortLocationFront}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    connectivityAndComms: {
                                        ...(productInfo.connectivityAndComms || {}),
                                        ioPortLocationFront: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_ioPortLocationFront", newLabel)}
                            placeholder="e.g. Front, Left Side"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Ports", "connectivity_frontPorts")}
                            value={productInfo.connectivityAndComms?.frontPorts}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    connectivityAndComms: {
                                        ...(productInfo.connectivityAndComms || {}),
                                        frontPorts: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_frontPorts", newLabel)}
                            placeholder="e.g. 1 USB-C port with data and power out"
                        />
                        <EditableFormInput
                            label={getFieldLabel("I/O Port location", "connectivity_ioPortLocationRear")}
                            value={productInfo.connectivityAndComms?.ioPortLocationRear}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    connectivityAndComms: {
                                        ...(productInfo.connectivityAndComms || {}),
                                        ioPortLocationRear: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_ioPortLocationRear", newLabel)}
                            placeholder="e.g. Rear, Back Side"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Ports", "connectivity_rearPorts")}
                            value={productInfo.connectivityAndComms?.rearPorts}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    connectivityAndComms: {
                                        ...(productInfo.connectivityAndComms || {}),
                                        rearPorts: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_rearPorts", newLabel)}
                            placeholder="e.g. 2 USB-A 3.0 ports, 1 HDMI 2.0 port"
                        />
                        <EditableFormInput
                            label={getFieldLabel("External Ports Location 04", "connectivity_externalPortsLocation04")}
                            value={productInfo.externalPortsLocation04}
                            onChange={(v) => setProductInfo({ ...productInfo, externalPortsLocation04: v })}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_externalPortsLocation04", newLabel)}
                            placeholder="e.g. Side"
                        />
                        <EditableFormInput
                            label={getFieldLabel("External Ports 04", "connectivity_externalPorts04")}
                            value={productInfo.externalPorts04}
                            onChange={(v) => setProductInfo({ ...productInfo, externalPorts04: v })}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_externalPorts04", newLabel)}
                            placeholder="e.g. 1 Kensington standard lock slot"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Supported Operating Systems */}
                <FormSection
                    title={getSectionTitle("Supported Operating Systems", "supportedOS")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("supportedOS", newTitle)}
                    onDelete={() => hideSection("supportedOS")}
                    isDeleted={isSectionHidden("supportedOS")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Compatible Operating Systems", "dock_compatibleOS")}
                            value={productInfo.compatibleOS}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleOS: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_compatibleOS", newLabel)}
                            placeholder="e.g. Windows 11; Windows 10; macOS; ChromeOS"
                        />
                    </div>
                </FormSection>

                {/* System Requirements */}
                <FormSection
                    title={getSectionTitle("System Requirements", "systemRequirements")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("systemRequirements", newTitle)}
                    onDelete={() => hideSection("systemRequirements")}
                    isDeleted={isSectionHidden("systemRequirements")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Minimum System Requirements", "dock_minSystemReqs")}
                            value={productInfo.minimumSystemRequirements}
                            onChange={(v) => setProductInfo({ ...productInfo, minimumSystemRequirements: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_minSystemReqs", newLabel)}
                            placeholder="e.g. USB Type-C (USB Power Delivery, Alt Mode DisplayPort)"
                        />
                    </div>
                </FormSection>

                {/* Dimensions */}
                <FormSection
                    title={getSectionTitle("Dimensions", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Minimum dimensions (W x D x H)", "dock_minDimensions")}
                            value={productInfo.minDimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, minDimensions: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_minDimensions", newLabel)}
                            placeholder="e.g. 12.2 x 12.2 x 4.5 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Dimensions (W x D x H)", "dock_dimensions")}
                            value={(productInfo as any).dimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, dimensions: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_dimensions", newLabel)}
                            placeholder="e.g. 122 x 122 x 45 mm"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Weights */}
                <FormSection
                    title={getSectionTitle("Weights", "weights")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("weights", newTitle)}
                    onDelete={() => hideSection("weights")}
                    isDeleted={isSectionHidden("weights")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Weight", "dock_weight")}
                            value={(productInfo as any).weight}
                            onChange={(v) => setProductInfo({ ...productInfo, weight: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_weight", newLabel)}
                            placeholder="e.g. 0.75 kg"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "dock_warranty")}
                            value={(productInfo as any).warranty}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_warranty", newLabel)}
                            placeholder="e.g. 1 year limited warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Compatibility */}
                <FormSection
                    title={getSectionTitle("Compatibility", "compatibility")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("compatibility", newTitle)}
                    onDelete={() => hideSection("compatibility")}
                    isDeleted={isSectionHidden("compatibility")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Hardware compatibility", "dock_compatibility")}
                            value={productInfo.hardwareCompatibility}
                            onChange={(v) => setProductInfo({ ...productInfo, hardwareCompatibility: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_compatibility", newLabel)}
                            placeholder="e.g. Compatible with laptops with USB-C ports"
                        />
                    </div>
                </FormSection>

                {/* Box contents */}
                <FormSection
                    title={getSectionTitle("Box contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the box", "dock_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_whatsInBox", newLabel)}
                            placeholder="e.g. Dock; USB-C Cable; Power Adapter; Quick Start Guide"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Battery and Power */}
                <FormSection
                    title={getSectionTitle("Battery and Power", "battery")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("battery", newTitle)}
                    onDelete={() => hideSection("battery")}
                    isDeleted={isSectionHidden("battery")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Power", "battery_power")}
                            value={productInfo.batteryAndPower?.power}
                            onChange={(v) => {
                                setProductInfo({
                                    ...productInfo,
                                    batteryAndPower: {
                                        ...(productInfo.batteryAndPower || {}),
                                        power: v
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("battery_power", newLabel)}
                            placeholder="e.g. 90 W power adapter"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Power to Host", "dock_powerToHost")}
                            value={productInfo.powerToHost}
                            onChange={(v) => setProductInfo({ ...productInfo, powerToHost: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_powerToHost", newLabel)}
                            placeholder="e.g. Up to 65 W via USB-C"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Power Delivery", "dock_powerDelivery")}
                            value={productInfo.powerDelivery}
                            onChange={(v) => setProductInfo({ ...productInfo, powerDelivery: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dock_powerDelivery", newLabel)}
                            placeholder="e.g. USB PD 3.0"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    // USB Flash Drives specific fields rendering function
    function renderUSBFlashDrivesFields() {
        return (
            <>
                {/* Series */}
                <FormSection
                    title={getSectionTitle("Series", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. SDCZ430-064G"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. Ultra Fit"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Storage Specifications */}
                <FormSection
                    title={getSectionTitle("Storage Specifications", "storageSpecs")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("storageSpecs", newTitle)}
                    onDelete={() => hideSection("storageSpecs")}
                    isDeleted={isSectionHidden("storageSpecs")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Capacity", "usb_capacity")}
                            value={productInfo.capacity}
                            onChange={(v) => setProductInfo({ ...productInfo, capacity: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_capacity", newLabel)}
                            placeholder="e.g. 64 GB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Interface", "usb_interface")}
                            value={productInfo.interface}
                            onChange={(v) => setProductInfo({ ...productInfo, interface: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_interface", newLabel)}
                            placeholder="e.g. USB 3.1 Gen 1"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Read Speed", "usb_readSpeed")}
                            value={productInfo.readSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, readSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_readSpeed", newLabel)}
                            placeholder="e.g. Up to 130 MB/s"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Write Speed", "usb_writeSpeed")}
                            value={productInfo.writeSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, writeSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_writeSpeed", newLabel)}
                            placeholder="e.g. Up to 50 MB/s"
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Connectivity */}
                <FormSection
                    title={getSectionTitle("Connectivity", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Connector Type", "usb_connectorType")}
                            value={productInfo.connectorType}
                            onChange={(v) => setProductInfo({ ...productInfo, connectorType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_connectorType", newLabel)}
                            placeholder="e.g. USB Type-A"
                        />
                        <EditableFormInput
                            label={getFieldLabel("USB Standard", "usb_usbStandard")}
                            value={productInfo.usbStandard}
                            onChange={(v) => setProductInfo({ ...productInfo, usbStandard: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_usbStandard", newLabel)}
                            placeholder="e.g. USB 3.1"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Compatibility */}
                <FormSection
                    title={getSectionTitle("Compatibility", "compatibility")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("compatibility", newTitle)}
                    onDelete={() => hideSection("compatibility")}
                    isDeleted={isSectionHidden("compatibility")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Compatible Devices", "usb_compatibleDevices")}
                            value={productInfo.compatibleDevices}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleDevices: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_compatibleDevices", newLabel)}
                            placeholder="e.g. Laptops, Desktops, Smart TVs"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Compatible Operating Systems", "usb_compatibleOS")}
                            value={productInfo.compatibleOS}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleOS: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_compatibleOS", newLabel)}
                            placeholder="e.g. Windows 10/11, macOS, Linux"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Features */}
                <FormSection
                    title={getSectionTitle("Features", "features")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("features", newTitle)}
                    onDelete={() => hideSection("features")}
                    isDeleted={isSectionHidden("features")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Plug & Play", "usb_plugAndPlay")}
                            value={productInfo.plugAndPlay}
                            onChange={(v) => setProductInfo({ ...productInfo, plugAndPlay: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_plugAndPlay", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Retractable Design", "usb_retractableDesign")}
                            value={productInfo.retractableDesign}
                            onChange={(v) => setProductInfo({ ...productInfo, retractableDesign: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_retractableDesign", newLabel)}
                            placeholder="e.g. Yes / No"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Water Resistant", "usb_waterResistant")}
                            value={productInfo.waterResistant}
                            onChange={(v) => setProductInfo({ ...productInfo, waterResistant: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_waterResistant", newLabel)}
                            placeholder="e.g. Yes / No"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Shock Resistant", "usb_shockResistant")}
                            value={productInfo.shockResistant}
                            onChange={(v) => setProductInfo({ ...productInfo, shockResistant: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_shockResistant", newLabel)}
                            placeholder="e.g. Yes / No"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Password Protection", "usb_passwordProtection")}
                            value={productInfo.passwordProtection}
                            onChange={(v) => setProductInfo({ ...productInfo, passwordProtection: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_passwordProtection", newLabel)}
                            placeholder="e.g. Yes (via SecureAccess software)"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Physical Specifications */}
                <FormSection
                    title={getSectionTitle("Physical Specifications", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Dimensions", "usb_minDimensions")}
                            value={productInfo.minDimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, minDimensions: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_minDimensions", newLabel)}
                            placeholder="e.g. 19.1 x 15.9 x 8.8 mm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight", "usb_weight")}
                            value={productInfo.weight as any}
                            onChange={(v) => setProductInfo({ ...productInfo, weight: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_weight", newLabel)}
                            placeholder="e.g. 4.5 g"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Package Contents */}
                <FormSection
                    title={getSectionTitle("Package Contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the Box", "usb_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_whatsInBox", newLabel)}
                            placeholder="e.g. 1 x USB Flash Drive"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "usb_warranty")}
                            value={productInfo.warranty as any}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_warranty", newLabel)}
                            placeholder="e.g. 5-year limited warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Material", "usb_material")}
                            value={productInfo.material}
                            onChange={(v) => setProductInfo({ ...productInfo, material: v })}
                            onLabelChange={(newLabel) => setFieldLabel("usb_material", newLabel)}
                            placeholder="e.g. Plastic, Metal"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    // Default fields (for laptops and other products) rendering function
    function renderDefaultFields() {
        return (
            <>
                <FormSection
                    title={getSectionTitle("Basic Product Info", "basic")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("basic", newTitle)}
                    onDelete={() => hideSection("basic")}
                    isDeleted={isSectionHidden("basic")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Product Title", "basic_title")}
                                value={productInfo.title}
                                onChange={(v) => updateField('title', v)}
                                onLabelChange={(newLabel) => setFieldLabel("basic_title", newLabel)}
                                placeholder="e.g. HP Laptop 35.6 cm (14) 14-ep0342TU, Silver"
                            />
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. BG6D5PA"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. HP Essentials"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "basic_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_recommendedUsage", newLabel)}
                            placeholder="e.g. Everyday computing"
                        />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{getFieldLabel("Ideal For (comma-separated)", "basic_idealFor")}</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newLabel = prompt("Enter new label:", getFieldLabel("Ideal For (comma-separated)", "basic_idealFor"));
                                        if (newLabel) setFieldLabel("basic_idealFor", newLabel);
                                    }}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Edit field name"
                                >
                                    <FiEdit2 size={12} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={productInfo.idealFor?.join(', ') ?? ''}
                                onChange={(e) => updateField('idealFor', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="e.g. Students, Professionals"
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection >

                {/* Appearance */}
                < FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')
                    }
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)
                    }
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Natural Silver"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Design", "appearance_design")}
                            value={productInfo.appearance?.design}
                            onChange={(v) => updateNestedField('appearance', 'design', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_design", newLabel)}
                            placeholder="e.g. Matte finish"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Form Factor", "appearance_formFactor")}
                            value={productInfo.appearance?.formFactor}
                            onChange={(v) => updateNestedField('appearance', 'formFactor', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_formFactor", newLabel)}
                            placeholder="e.g. Standard laptop"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection >

                {/* Operating System */}
                < FormSection
                    title={getSectionTitle("Operating System", "os")}
                    onAddSpec={() => addCustomField(osCustomFields, setOsCustomFields, 'osCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("os", newTitle)}
                    onDelete={() => hideSection("os")}
                    isDeleted={isSectionHidden("os")}
                >
                    <EditableFormInput
                        label={getFieldLabel("OS", "os_os")}
                        value={productInfo.operatingSystem?.os}
                        onChange={(v) => updateNestedField('operatingSystem', 'os', v)}
                        onLabelChange={(newLabel) => setFieldLabel("os_os", newLabel)}
                        placeholder="e.g. Windows 11 Home"
                    />
                    {renderCustomFields(osCustomFields, setOsCustomFields, 'osCustomFields')}
                </FormSection >

                {/* Processor */}
                < FormSection
                    title={getSectionTitle("Processor", "processor")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(processorCustomFields, setProcessorCustomFields, 'processorCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("processor", newTitle)}
                    onDelete={() => hideSection("processor")}
                    isDeleted={isSectionHidden("processor")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Processor Name", "processor_name")}
                            value={productInfo.processor?.name}
                            onChange={(v) => updateNestedField('processor', 'name', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_name", newLabel)}
                            placeholder="e.g. Intel Core i5-1334U"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Brand", "processor_brand")}
                            value={productInfo.processor?.brand}
                            onChange={(v) => updateNestedField('processor', 'brand', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_brand", newLabel)}
                            placeholder="e.g. Intel"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Generation", "processor_generation")}
                            value={productInfo.processor?.generation}
                            onChange={(v) => updateNestedField('processor', 'generation', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_generation", newLabel)}
                            placeholder="e.g. 13th Gen"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Max Clock Speed", "processor_maxClockSpeed")}
                            value={productInfo.processor?.maxClockSpeed}
                            onChange={(v) => updateNestedField('processor', 'maxClockSpeed', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_maxClockSpeed", newLabel)}
                            placeholder="e.g. 4.6 GHz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Cores", "processor_cores")}
                            value={productInfo.processor?.cores}
                            onChange={(v) => updateNestedField('processor', 'cores', parseInt(v) || undefined)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_cores", newLabel)}
                            placeholder="e.g. 10"
                            type="number"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Threads", "processor_threads")}
                            value={productInfo.processor?.threads}
                            onChange={(v) => updateNestedField('processor', 'threads', parseInt(v) || undefined)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_threads", newLabel)}
                            placeholder="e.g. 12"
                            type="number"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Cache", "processor_cache")}
                            value={productInfo.processor?.cache}
                            onChange={(v) => updateNestedField('processor', 'cache', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_cache", newLabel)}
                            placeholder="e.g. 12 MB L3"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Technology", "processor_technology")}
                            value={productInfo.processor?.technology}
                            onChange={(v) => updateNestedField('processor', 'technology', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_technology", newLabel)}
                            placeholder="e.g. Intel Turbo Boost"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Chipset", "processor_chipset")}
                            value={productInfo.processor?.chipset}
                            onChange={(v) => updateNestedField('processor', 'chipset', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_chipset", newLabel)}
                            placeholder="e.g. Intel integrated SoC"
                        />
                    </div>
                    {renderCustomFields(processorCustomFields, setProcessorCustomFields, 'processorCustomFields')}
                </FormSection >

                {/* Memory */}
                < FormSection
                    title={getSectionTitle("Memory (RAM)", "memory")}
                    onAddSpec={() => addCustomField(memoryCustomFields, setMemoryCustomFields, 'memoryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("memory", newTitle)}
                    onDelete={() => hideSection("memory")}
                    isDeleted={isSectionHidden("memory")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Capacity", "memory_capacity")}
                            value={productInfo.memory?.capacity}
                            onChange={(v) => updateNestedField('memory', 'capacity', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_capacity", newLabel)}
                            placeholder="e.g. 16 GB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Type", "memory_type")}
                            value={productInfo.memory?.type}
                            onChange={(v) => updateNestedField('memory', 'type', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_type", newLabel)}
                            placeholder="e.g. DDR4"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Speed", "memory_speed")}
                            value={productInfo.memory?.speed}
                            onChange={(v) => updateNestedField('memory', 'speed', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_speed", newLabel)}
                            placeholder="e.g. 3200 MT/s"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Layout", "memory_layout")}
                            value={productInfo.memory?.layout}
                            onChange={(v) => updateNestedField('memory', 'layout', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_layout", newLabel)}
                            placeholder="e.g. 2 x 8 GB"
                        />
                    </div>
                    {renderCustomFields(memoryCustomFields, setMemoryCustomFields, 'memoryCustomFields')}
                </FormSection >

                {/* Storage */}
                < FormSection
                    title={getSectionTitle("Storage", "storage")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("storage", newTitle)}
                    onDelete={() => hideSection("storage")}
                    isDeleted={isSectionHidden("storage")}
                >
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Primary Storage</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Type", "storage_primary_type")}
                                value={productInfo.storage?.primaryStorage?.type}
                                onChange={(v) => {
                                    const current = productInfo.storage || {};
                                    setProductInfo({
                                        ...productInfo,
                                        storage: {
                                            ...current,
                                            primaryStorage: { ...(current.primaryStorage || {}), type: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("storage_primary_type", newLabel)}
                                placeholder="e.g. PCIe NVMe M.2 SSD"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Capacity", "storage_primary_capacity")}
                                value={productInfo.storage?.primaryStorage?.capacity}
                                onChange={(v) => {
                                    const current = productInfo.storage || {};
                                    setProductInfo({
                                        ...productInfo,
                                        storage: {
                                            ...current,
                                            primaryStorage: { ...(current.primaryStorage || {}), capacity: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("storage_primary_capacity", newLabel)}
                                placeholder="e.g. 512 GB"
                            />
                        </div>
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-4">Cloud Storage</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Service", "storage_cloud_service")}
                                value={productInfo.storage?.cloudStorage?.service}
                                onChange={(v) => {
                                    const current = productInfo.storage || {};
                                    setProductInfo({
                                        ...productInfo,
                                        storage: {
                                            ...current,
                                            cloudStorage: { ...(current.cloudStorage || {}), service: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("storage_cloud_service", newLabel)}
                                placeholder="e.g. Dropbox"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Capacity", "storage_cloud_capacity")}
                                value={productInfo.storage?.cloudStorage?.capacity}
                                onChange={(v) => {
                                    const current = productInfo.storage || {};
                                    setProductInfo({
                                        ...productInfo,
                                        storage: {
                                            ...current,
                                            cloudStorage: { ...(current.cloudStorage || {}), capacity: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("storage_cloud_capacity", newLabel)}
                                placeholder="e.g. 25 GB"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Duration", "storage_cloud_duration")}
                                value={productInfo.storage?.cloudStorage?.duration}
                                onChange={(v) => {
                                    const current = productInfo.storage || {};
                                    setProductInfo({
                                        ...productInfo,
                                        storage: {
                                            ...current,
                                            cloudStorage: { ...(current.cloudStorage || {}), duration: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("storage_cloud_duration", newLabel)}
                                placeholder="e.g. 12 months"
                            />
                        </div>
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection >

                {/* Display */}
                < FormSection
                    title={getSectionTitle("Display", "display")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("display", newTitle)}
                    onDelete={() => hideSection("display")}
                    isDeleted={isSectionHidden("display")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Size", "display_size")}
                            value={productInfo.display?.size}
                            onChange={(v) => updateNestedField('display', 'size', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_size", newLabel)}
                            placeholder="e.g. 14 inch"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Resolution", "display_resolution")}
                            value={productInfo.display?.resolution}
                            onChange={(v) => updateNestedField('display', 'resolution', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_resolution", newLabel)}
                            placeholder="e.g. FHD (1920 x 1080)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Panel Type", "display_panel")}
                            value={productInfo.display?.panel}
                            onChange={(v) => updateNestedField('display', 'panel', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_panel", newLabel)}
                            placeholder="e.g. Micro-edge"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Brightness", "display_brightness")}
                            value={productInfo.display?.brightness}
                            onChange={(v) => updateNestedField('display', 'brightness', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_brightness", newLabel)}
                            placeholder="e.g. 250 nits"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Color Gamut", "display_colorGamut")}
                            value={productInfo.display?.colorGamut}
                            onChange={(v) => updateNestedField('display', 'colorGamut', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_colorGamut", newLabel)}
                            placeholder="e.g. 62.5% sRGB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Screen-to-Body Ratio", "display_screenToBodyRatio")}
                            value={productInfo.display?.screenToBodyRatio}
                            onChange={(v) => updateNestedField('display', 'screenToBodyRatio', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_screenToBodyRatio", newLabel)}
                            placeholder="e.g. 84.01%"
                        />
                    </div>
                    <div className="flex flex-wrap gap-6 mt-4">
                        <EditableFormCheckbox
                            label={getFieldLabel("Anti-Glare", "display_antiGlare")}
                            checked={productInfo.display?.antiGlare}
                            onChange={(v) => updateNestedField('display', 'antiGlare', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_antiGlare", newLabel)}
                        />
                        <EditableFormCheckbox
                            label={getFieldLabel("Touchscreen", "display_touchscreen")}
                            checked={productInfo.display?.touchscreen}
                            onChange={(v) => updateNestedField('display', 'touchscreen', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_touchscreen", newLabel)}
                        />
                        <EditableFormCheckbox
                            label={getFieldLabel("Flicker-Free", "display_flickerFree")}
                            checked={productInfo.display?.flickerFree}
                            onChange={(v) => updateNestedField('display', 'flickerFree', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_flickerFree", newLabel)}
                        />
                    </div>
                    {renderCustomFields(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                </FormSection >

                {/* Graphics */}
                < FormSection
                    title={getSectionTitle("Graphics", "graphics")}
                    onAddSpec={() => addCustomField(graphicsCustomFields, setGraphicsCustomFields, 'graphicsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("graphics", newTitle)}
                    onDelete={() => hideSection("graphics")}
                    isDeleted={isSectionHidden("graphics")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("GPU", "graphics_gpu")}
                            value={productInfo.graphics?.gpu}
                            onChange={(v) => updateNestedField('graphics', 'gpu', v)}
                            onLabelChange={(newLabel) => setFieldLabel("graphics_gpu", newLabel)}
                            placeholder="e.g. Intel Iris Xe Graphics"
                        />
                        <div className="flex items-end">
                            <EditableFormCheckbox
                                label={getFieldLabel("Dedicated Graphics", "graphics_dedicated")}
                                checked={productInfo.graphics?.dedicated}
                                onChange={(v) => updateNestedField('graphics', 'dedicated', v)}
                                onLabelChange={(newLabel) => setFieldLabel("graphics_dedicated", newLabel)}
                            />
                        </div>
                    </div>
                    {renderCustomFields(graphicsCustomFields, setGraphicsCustomFields, 'graphicsCustomFields')}
                </FormSection >

                {/* Audio & Input */}
                < FormSection
                    title={getSectionTitle("Audio & Input", "audio")}
                    onAddSpec={() => addCustomField(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("audio", newTitle)}
                    onDelete={() => hideSection("audio")}
                    isDeleted={isSectionHidden("audio")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Speakers", "audio_speakers")}
                            value={productInfo.audioAndInput?.speakers}
                            onChange={(v) => updateNestedField('audioAndInput', 'speakers', v)}
                            onLabelChange={(newLabel) => setFieldLabel("audio_speakers", newLabel)}
                            placeholder="e.g. Dual speakers"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Touchpad", "audio_touchpad")}
                            value={productInfo.audioAndInput?.touchpad}
                            onChange={(v) => updateNestedField('audioAndInput', 'touchpad', v)}
                            onLabelChange={(newLabel) => setFieldLabel("audio_touchpad", newLabel)}
                            placeholder="e.g. HP Imagepad"
                        />
                    </div>
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Keyboard</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Type", "audio_keyboard_type")}
                                value={productInfo.audioAndInput?.keyboard?.type}
                                onChange={(v) => {
                                    const current = productInfo.audioAndInput || {};
                                    setProductInfo({
                                        ...productInfo,
                                        audioAndInput: {
                                            ...current,
                                            keyboard: { ...(current.keyboard || {}), type: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("audio_keyboard_type", newLabel)}
                                placeholder="e.g. Full-size"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Color", "audio_keyboard_color")}
                                value={productInfo.audioAndInput?.keyboard?.color}
                                onChange={(v) => {
                                    const current = productInfo.audioAndInput || {};
                                    setProductInfo({
                                        ...productInfo,
                                        audioAndInput: {
                                            ...current,
                                            keyboard: { ...(current.keyboard || {}), color: v }
                                        }
                                    });
                                }}
                                onLabelChange={(newLabel) => setFieldLabel("audio_keyboard_color", newLabel)}
                                placeholder="e.g. Soft grey"
                            />
                            <div className="flex items-end">
                                <EditableFormCheckbox
                                    label={getFieldLabel("Backlit", "audio_keyboard_backlit")}
                                    checked={productInfo.audioAndInput?.keyboard?.backlit}
                                    onChange={(v) => {
                                        const current = productInfo.audioAndInput || {};
                                        setProductInfo({
                                            ...productInfo,
                                            audioAndInput: {
                                                ...current,
                                                keyboard: { ...(current.keyboard || {}), backlit: v }
                                            }
                                        });
                                    }}
                                    onLabelChange={(newLabel) => setFieldLabel("audio_keyboard_backlit", newLabel)}
                                />
                            </div>
                        </div>
                    </div>
                    {renderCustomFields(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                </FormSection >

                {/* Connectivity */}
                < FormSection
                    title={getSectionTitle("Connectivity", "connectivity")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivity", newTitle)}
                    onDelete={() => hideSection("connectivity")}
                    isDeleted={isSectionHidden("connectivity")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("WiFi", "connectivity_wifi")}
                            value={productInfo.connectivity?.wifi}
                            onChange={(v) => updateNestedField('connectivity', 'wifi', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_wifi", newLabel)}
                            placeholder="e.g. Wi-Fi 6 (2x2)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Bluetooth", "connectivity_bluetooth")}
                            value={productInfo.connectivity?.bluetooth}
                            onChange={(v) => updateNestedField('connectivity', 'bluetooth', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_bluetooth", newLabel)}
                            placeholder="e.g. Bluetooth 5.4"
                        />
                    </div>
                    <div className="mt-4">
                        <EditableFormCheckbox
                            label={getFieldLabel("Modern Standby", "connectivity_modernStandby")}
                            checked={productInfo.connectivity?.modernStandby}
                            onChange={(v) => updateNestedField('connectivity', 'modernStandby', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_modernStandby", newLabel)}
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection >

                {/* Ports */}
                < FormSection
                    title={getSectionTitle("Ports", "ports")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("ports", newTitle)}
                    onDelete={() => hideSection("ports")}
                    isDeleted={isSectionHidden("ports")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("USB Type-C", "ports_usbTypeC")}
                            value={productInfo.ports?.usbTypeC}
                            onChange={(v) => updateNestedField('ports', 'usbTypeC', v)}
                            onLabelChange={(newLabel) => setFieldLabel("ports_usbTypeC", newLabel)}
                            placeholder="e.g. 1 x USB Type-C (5Gbps)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("USB Type-A", "ports_usbTypeA")}
                            value={productInfo.ports?.usbTypeA}
                            onChange={(v) => updateNestedField('ports', 'usbTypeA', v)}
                            onLabelChange={(newLabel) => setFieldLabel("ports_usbTypeA", newLabel)}
                            placeholder="e.g. 2 x USB Type-A (5Gbps)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("HDMI Version", "ports_hdmi_version")}
                            value={productInfo.ports?.hdmi?.version}
                            onChange={(v) => {
                                const current = productInfo.ports || {};
                                setProductInfo({
                                    ...productInfo,
                                    ports: {
                                        ...current,
                                        hdmi: { ...(current.hdmi || {}), version: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("ports_hdmi_version", newLabel)}
                            placeholder="e.g. 1.4b"
                        />
                        <EditableFormInput
                            label={getFieldLabel("HDMI Count", "ports_hdmi_count")}
                            value={productInfo.ports?.hdmi?.count}
                            onChange={(v) => {
                                const current = productInfo.ports || {};
                                setProductInfo({
                                    ...productInfo,
                                    ports: {
                                        ...current,
                                        hdmi: { ...(current.hdmi || {}), count: parseInt(v) || undefined }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("ports_hdmi_count", newLabel)}
                            placeholder="e.g. 1"
                            type="number"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Audio Jack", "ports_audioJack")}
                            value={productInfo.ports?.audioJack}
                            onChange={(v) => updateNestedField('ports', 'audioJack', v)}
                            onLabelChange={(newLabel) => setFieldLabel("ports_audioJack", newLabel)}
                            placeholder="e.g. Headphone/Mic combo"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Power Port", "ports_powerPort")}
                            value={productInfo.ports?.powerPort}
                            onChange={(v) => updateNestedField('ports', 'powerPort', v)}
                            onLabelChange={(newLabel) => setFieldLabel("ports_powerPort", newLabel)}
                            placeholder="e.g. AC Smart Pin"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection >

                {/* Camera */}
                < FormSection
                    title={getSectionTitle("Camera", "camera")}
                    onAddSpec={() => addCustomField(cameraCustomFields, setCameraCustomFields, 'cameraCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("camera", newTitle)}
                    onDelete={() => hideSection("camera")}
                    isDeleted={isSectionHidden("camera")}
                >
                    <div className="space-y-4">
                        <EditableFormInput
                            label={getFieldLabel("Webcam", "camera_webcam")}
                            value={productInfo.camera?.webcam}
                            onChange={(v) => updateNestedField('camera', 'webcam', v)}
                            onLabelChange={(newLabel) => setFieldLabel("camera_webcam", newLabel)}
                            placeholder="e.g. HP True Vision 1080p FHD"
                        />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{getFieldLabel("Features (comma-separated)", "camera_features")}</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newLabel = prompt("Enter new label:", getFieldLabel("Features (comma-separated)", "camera_features"));
                                        if (newLabel) setFieldLabel("camera_features", newLabel);
                                    }}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Edit field name"
                                >
                                    <FiEdit2 size={12} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={productInfo.camera?.features?.join(', ') ?? ''}
                                onChange={(e) => updateNestedField('camera', 'features', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="e.g. Noise Reduction, Dual-array mics"
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {renderCustomFields(cameraCustomFields, setCameraCustomFields, 'cameraCustomFields')}
                </FormSection >

                {/* Battery & Power */}
                < FormSection
                    title={getSectionTitle("Battery & Power", "battery")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("battery", newTitle)}
                    onDelete={() => hideSection("battery")}
                    isDeleted={isSectionHidden("battery")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Battery Type", "battery_batteryType")}
                            value={productInfo.batteryAndPower?.batteryType}
                            onChange={(v) => updateNestedField('batteryAndPower', 'batteryType', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_batteryType", newLabel)}
                            placeholder="e.g. 3-cell Li-ion polymer"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Capacity", "battery_capacity")}
                            value={productInfo.batteryAndPower?.capacity}
                            onChange={(v) => updateNestedField('batteryAndPower', 'capacity', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_capacity", newLabel)}
                            placeholder="e.g. 41 Wh"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Charger", "battery_charger")}
                            value={productInfo.batteryAndPower?.charger}
                            onChange={(v) => updateNestedField('batteryAndPower', 'charger', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_charger", newLabel)}
                            placeholder="e.g. 65 W AC adapter"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Fast Charge", "battery_fastCharge")}
                            value={productInfo.batteryAndPower?.fastCharge}
                            onChange={(v) => updateNestedField('batteryAndPower', 'fastCharge', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_fastCharge", newLabel)}
                            placeholder="e.g. 50% in 45 minutes"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection >

                {/* Security */}
                < FormSection
                    title={getSectionTitle("Security", "security")}
                    onAddSpec={() => addCustomField(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("security", newTitle)}
                    onDelete={() => hideSection("security")}
                    isDeleted={isSectionHidden("security")}
                >
                    <div className="space-y-4">
                        <EditableFormInput
                            label={getFieldLabel("TPM", "security_tpm")}
                            value={productInfo.security?.tpm}
                            onChange={(v) => updateNestedField('security', 'tpm', v)}
                            onLabelChange={(newLabel) => setFieldLabel("security_tpm", newLabel)}
                            placeholder="e.g. Firmware TPM"
                        />
                        <div className="flex flex-wrap gap-6">
                            <EditableFormCheckbox
                                label={getFieldLabel("Mic Mute Key", "security_micMuteKey")}
                                checked={productInfo.security?.micMuteKey}
                                onChange={(v) => updateNestedField('security', 'micMuteKey', v)}
                                onLabelChange={(newLabel) => setFieldLabel("security_micMuteKey", newLabel)}
                            />
                            <EditableFormCheckbox
                                label={getFieldLabel("Camera Privacy Shutter", "security_cameraPrivacyShutter")}
                                checked={productInfo.security?.cameraPrivacyShutter}
                                onChange={(v) => updateNestedField('security', 'cameraPrivacyShutter', v)}
                                onLabelChange={(newLabel) => setFieldLabel("security_cameraPrivacyShutter", newLabel)}
                            />
                            <EditableFormCheckbox
                                label={getFieldLabel("Fingerprint Reader", "security_fingerprint")}
                                checked={productInfo.security?.fingerprint}
                                onChange={(v) => updateNestedField('security', 'fingerprint', v)}
                                onLabelChange={(newLabel) => setFieldLabel("security_fingerprint", newLabel)}
                            />
                        </div>
                    </div>
                    {renderCustomFields(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                </FormSection >

                {/* Dimensions & Weight */}
                < FormSection
                    title={getSectionTitle("Dimensions & Weight", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Front Dimensions", "dimensions_front")}
                            value={productInfo.dimensionsAndWeight?.dimensions?.front}
                            onChange={(v) => {
                                const current = productInfo.dimensionsAndWeight || {};
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...current,
                                        dimensions: { ...(current.dimensions || {}), front: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_front", newLabel)}
                            placeholder="e.g. 32.37 x 21.5 x 1.79 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Rear Dimensions", "dimensions_rear")}
                            value={productInfo.dimensionsAndWeight?.dimensions?.rear}
                            onChange={(v) => {
                                const current = productInfo.dimensionsAndWeight || {};
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...current,
                                        dimensions: { ...(current.dimensions || {}), rear: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_rear", newLabel)}
                            placeholder="e.g. 32.37 x 21.5 x 3.25 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight", "dimensions_weight")}
                            value={productInfo.dimensionsAndWeight?.weight}
                            onChange={(v) => updateNestedField('dimensionsAndWeight', 'weight', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_weight", newLabel)}
                            placeholder="e.g. 1.41 kg"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection >

                {/* Warranty */}
                < FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Duration", "warranty_duration")}
                            value={productInfo.warranty?.duration}
                            onChange={(v) => updateNestedField('warranty', 'duration', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_duration", newLabel)}
                            placeholder="e.g. 1 year"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Coverage", "warranty_coverage")}
                            value={productInfo.warranty?.coverage}
                            onChange={(v) => updateNestedField('warranty', 'coverage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_coverage", newLabel)}
                            placeholder="e.g. Parts and labor"
                        />
                    </div>
                    <div className="mt-4">
                        <EditableFormCheckbox
                            label={getFieldLabel("On-Site Service", "warranty_onSiteService")}
                            checked={productInfo.warranty?.onSiteService}
                            onChange={(v) => updateNestedField('warranty', 'onSiteService', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_onSiteService", newLabel)}
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection >

                {/* Certifications */}
                < FormSection
                    title={getSectionTitle("Certifications", "certifications")}
                    onAddSpec={() => addCustomField(certificationsCustomFields, setCertificationsCustomFields, 'certificationsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("certifications", newTitle)}
                    onDelete={() => hideSection("certifications")}
                    isDeleted={isSectionHidden("certifications")}
                >
                    <EditableFormCheckbox
                        label={getFieldLabel("Energy Star Certified", "certifications_energyStar")}
                        checked={productInfo.certifications?.energyStar}
                        onChange={(v) => updateNestedField('certifications', 'energyStar', v)}
                        onLabelChange={(newLabel) => setFieldLabel("certifications_energyStar", newLabel)}
                    />
                    {renderCustomFields(certificationsCustomFields, setCertificationsCustomFields, 'certificationsCustomFields')}
                </FormSection >

                {/* Environmental */}
                < FormSection
                    title={getSectionTitle("Environmental", "environmental")}
                    onAddSpec={() => addCustomField(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("environmental", newTitle)}
                    onDelete={() => hideSection("environmental")}
                    isDeleted={isSectionHidden("environmental")}
                >
                    <div className="flex flex-wrap gap-6">
                        <EditableFormCheckbox
                            label={getFieldLabel("Ocean-Bound Plastic", "environmental_oceanBoundPlastic")}
                            checked={productInfo.environmental?.oceanBoundPlastic}
                            onChange={(v) => updateNestedField('environmental', 'oceanBoundPlastic', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_oceanBoundPlastic", newLabel)}
                        />
                        <EditableFormCheckbox
                            label={getFieldLabel("Recycled Keycaps", "environmental_recycledKeycaps")}
                            checked={productInfo.environmental?.recycledKeycaps}
                            onChange={(v) => updateNestedField('environmental', 'recycledKeycaps', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_recycledKeycaps", newLabel)}
                        />
                    </div>
                    {renderCustomFields(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                </FormSection>
            </>
        );
    }

    // Desktop-specific fields rendering function
    function renderDesktopFields() {
        return (
            <>
                {/* Basic Product Info */}
                <FormSection
                    title={getSectionTitle("Basic Product Info", "basic")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("basic", newTitle)}
                    onDelete={() => hideSection("basic")}
                    isDeleted={isSectionHidden("basic")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Product Title", "basic_title")}
                                value={productInfo.title}
                                onChange={(v) => updateField('title', v)}
                                onLabelChange={(newLabel) => setFieldLabel("basic_title", newLabel)}
                                placeholder="e.g. HP 280 G9 Micro Tower PC"
                            />
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. D85FHAT"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Product type", "basic_productType")}
                            value={productInfo.productType}
                            onChange={(v) => updateField('productType', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_productType", newLabel)}
                            placeholder="e.g. Desktop"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. HP 280 G9"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "basic_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_recommendedUsage", newLabel)}
                            placeholder="e.g. Business Productivity"
                        />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{getFieldLabel("Ideal For (comma-separated)", "basic_idealFor")}</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newLabel = prompt("Enter new label:", getFieldLabel("Ideal For (comma-separated)", "basic_idealFor"));
                                        if (newLabel) setFieldLabel("basic_idealFor", newLabel);
                                    }}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Edit field name"
                                >
                                    <FiEdit2 size={12} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={productInfo.idealFor?.join(', ') ?? ''}
                                onChange={(e) => updateField('idealFor', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="e.g. Business Users, Office Work, Students"
                                className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Form factor", "appearance_formFactor")}
                            value={productInfo.appearance?.formFactor}
                            onChange={(v) => updateNestedField('appearance', 'formFactor', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_formFactor", newLabel)}
                            placeholder="e.g. Micro Tower"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>

                {/* Operating System */}
                <FormSection
                    title={getSectionTitle("Supported Operating Systems", "os")}
                    onAddSpec={() => addCustomField(osCustomFields, setOsCustomFields, 'osCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("os", newTitle)}
                    onDelete={() => hideSection("os")}
                    isDeleted={isSectionHidden("os")}
                >
                    <EditableFormInput
                        label={getFieldLabel("Operating system", "os_os")}
                        value={productInfo.operatingSystem?.os}
                        onChange={(v) => updateNestedField('operatingSystem', 'os', v)}
                        onLabelChange={(newLabel) => setFieldLabel("os_os", newLabel)}
                        placeholder="e.g. Free DOS"
                    />
                    {renderCustomFields(osCustomFields, setOsCustomFields, 'osCustomFields')}
                </FormSection>

                {/* Processors */}
                <FormSection
                    title={getSectionTitle("Processors", "processor")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(processorCustomFields, setProcessorCustomFields, 'processorCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("processor", newTitle)}
                    onDelete={() => hideSection("processor")}
                    isDeleted={isSectionHidden("processor")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Processor Generation", "processor_generation")}
                            value={productInfo.processor?.generation}
                            onChange={(v) => updateNestedField('processor', 'generation', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_generation", newLabel)}
                            placeholder="e.g. 13th Generation"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Processor Name", "processor_name")}
                            value={productInfo.processor?.name}
                            onChange={(v) => updateNestedField('processor', 'name', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_name", newLabel)}
                            placeholder="e.g. Intel Core i5-13500"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Processor Frequency Technology", "processor_frequencyTechnology")}
                            value={productInfo.processor?.frequencyTechnology}
                            onChange={(v) => updateNestedField('processor', 'frequencyTechnology', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_frequencyTechnology", newLabel)}
                            placeholder="e.g. Intel Turbo Boost Technology"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Chipset", "processor_chipset")}
                            value={productInfo.processor?.chipset}
                            onChange={(v) => updateNestedField('processor', 'chipset', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_chipset", newLabel)}
                            placeholder="e.g. Intel H670 Chipset"
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Processor Footnote", "processor_footnote")}
                                value={productInfo.processor?.footnote}
                                onChange={(v) => updateNestedField('processor', 'footnote', v)}
                                onLabelChange={(newLabel) => setFieldLabel("processor_footnote", newLabel)}
                                placeholder="Processor specs footnote details..."
                            />
                        </div>
                    </div>
                    {renderCustomFields(processorCustomFields, setProcessorCustomFields, 'processorCustomFields')}
                </FormSection>

                {/* Memory */}
                <FormSection
                    title={getSectionTitle("Memory", "memory")}
                    onAddSpec={() => addCustomField(memoryCustomFields, setMemoryCustomFields, 'memoryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("memory", newTitle)}
                    onDelete={() => hideSection("memory")}
                    isDeleted={isSectionHidden("memory")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Memory Slots", "memory_slots")}
                            value={productInfo.memory?.slots}
                            onChange={(v) => updateNestedField('memory', 'slots', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_slots", newLabel)}
                            placeholder="e.g. 2 DIMM"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Memory Layout", "memory_layout")}
                            value={productInfo.memory?.layout}
                            onChange={(v) => updateNestedField('memory', 'layout', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_layout", newLabel)}
                            placeholder="e.g. 1 × 16 GB"
                        />
                    </div>
                    {renderCustomFields(memoryCustomFields, setMemoryCustomFields, 'memoryCustomFields')}
                </FormSection>

                {/* Storage */}
                <FormSection
                    title={getSectionTitle("Storage", "storage")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("storage", newTitle)}
                    onDelete={() => hideSection("storage")}
                    isDeleted={isSectionHidden("storage")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Hard Drive Description", "storage_hardDriveDescription")}
                            value={productInfo.storage?.hardDriveDescription}
                            onChange={(v) => updateNestedField('storage', 'hardDriveDescription', v)}
                            onLabelChange={(newLabel) => setFieldLabel("storage_hardDriveDescription", newLabel)}
                            placeholder="e.g. 512 GB PCIe NVMe M.2 SSD"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Internal Drive Bays", "storage_internalDriveBays")}
                            value={productInfo.storage?.internalDriveBays}
                            onChange={(v) => updateNestedField('storage', 'internalDriveBays', v)}
                            onLabelChange={(newLabel) => setFieldLabel("storage_internalDriveBays", newLabel)}
                            placeholder='e.g. One 3.5" HDD'
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Display and Graphics */}
                <FormSection
                    title={getSectionTitle("Display and Graphics", "graphics")}
                    onAddSpec={() => addCustomField(graphicsCustomFields, setGraphicsCustomFields, 'graphicsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("graphics", newTitle)}
                    onDelete={() => hideSection("graphics")}
                    isDeleted={isSectionHidden("graphics")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Graphics", "graphics_gpu")}
                            value={productInfo.graphics?.gpu}
                            onChange={(v) => updateNestedField('graphics', 'gpu', v)}
                            onLabelChange={(newLabel) => setFieldLabel("graphics_gpu", newLabel)}
                            placeholder="e.g. Intel UHD Graphics 770"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Graphic Card Footnote", "graphics_footnote")}
                            value={productInfo.graphics?.footnote}
                            onChange={(v) => updateNestedField('graphics', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("graphics_footnote", newLabel)}
                            placeholder="Graphic specs footnote details..."
                        />
                        <EditableFormInput
                            label={getFieldLabel("Screen Size", "display_size")}
                            value={productInfo.display?.size}
                            onChange={(v) => updateNestedField('display', 'size', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_size", newLabel)}
                            placeholder="e.g. 23.8 inch"
                        />
                    </div>
                    {renderCustomFields(graphicsCustomFields, setGraphicsCustomFields, 'graphicsCustomFields')}
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "audio")}
                    onAddSpec={() => addCustomField(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("audio", newTitle)}
                    onDelete={() => hideSection("audio")}
                    isDeleted={isSectionHidden("audio")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Audio Features", "audio_audioFeatures")}
                            value={productInfo.audioAndInput?.audioFeatures}
                            onChange={(v) => updateNestedField('audioAndInput', 'audioFeatures', v)}
                            onLabelChange={(newLabel) => setFieldLabel("audio_audioFeatures", newLabel)}
                            placeholder="e.g. Realtek ALC3252 codec, universal audio jack"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Pointing Device", "audio_pointingDevice")}
                            value={productInfo.audioAndInput?.pointingDevice}
                            onChange={(v) => updateNestedField('audioAndInput', 'pointingDevice', v)}
                            onLabelChange={(newLabel) => setFieldLabel("audio_pointingDevice", newLabel)}
                            placeholder="e.g. HP 125 Wired Mouse"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Keyboard", "audio_keyboard_type")}
                            value={productInfo.audioAndInput?.keyboard?.type}
                            onChange={(v) => {
                                const current = productInfo.audioAndInput || {};
                                setProductInfo({
                                    ...productInfo,
                                    audioAndInput: {
                                        ...current,
                                        keyboard: { ...(current.keyboard || {}), type: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("audio_keyboard_type", newLabel)}
                            placeholder="e.g. HP 125 Wired Keyboard"
                        />
                    </div>
                    {renderCustomFields(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                </FormSection>

                {/* Connectivity and Communications */}
                <FormSection
                    title={getSectionTitle("Connectivity and Communications", "connectivityComms")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivityComms", newTitle)}
                    onDelete={() => hideSection("connectivityComms")}
                    isDeleted={isSectionHidden("connectivityComms")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Network Interface", "connectivity_networkInterface")}
                            value={productInfo.connectivityAndComms?.networkInterface}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'networkInterface', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_networkInterface", newLabel)}
                            placeholder="e.g. Integrated 10/100/1000 GbE LAN"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Wireless", "connectivity_wireless")}
                            value={productInfo.connectivityAndComms?.wireless}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'wireless', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_wireless", newLabel)}
                            placeholder="e.g. Realtek Wi-Fi 6 (802.11ax, 2×2)"
                        />
                        <EditableFormInput
                            label={getFieldLabel("I/O Port Location (Front)", "connectivity_ioPortLocationFront")}
                            value={productInfo.connectivityAndComms?.ioPortLocationFront}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'ioPortLocationFront', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_ioPortLocationFront", newLabel)}
                            placeholder="e.g. Front"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Front Ports", "connectivity_frontPorts")}
                            value={productInfo.connectivityAndComms?.frontPorts}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'frontPorts', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_frontPorts", newLabel)}
                            placeholder="e.g. 4 USB Type-A, 1 headphone/microphone combo"
                        />
                        <EditableFormInput
                            label={getFieldLabel("I/O Port Location (Rear)", "connectivity_ioPortLocationRear")}
                            value={productInfo.connectivityAndComms?.ioPortLocationRear}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'ioPortLocationRear', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_ioPortLocationRear", newLabel)}
                            placeholder="e.g. Rear"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Rear Ports", "connectivity_rearPorts")}
                            value={productInfo.connectivityAndComms?.rearPorts}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'rearPorts', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_rearPorts", newLabel)}
                            placeholder="e.g. 4 USB 2.0 Type-A, 1 HDMI, 1 RJ-45"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Expansion Slots", "connectivity_expansionSlots")}
                            value={productInfo.connectivityAndComms?.expansionSlots}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'expansionSlots', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_expansionSlots", newLabel)}
                            placeholder="e.g. 2 M.2; 1 PCIe 3 x16; 1 PCIe 3 x1"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Video Connectors", "connectivity_videoConnectors")}
                            value={productInfo.connectivityAndComms?.videoConnectors}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'videoConnectors', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_videoConnectors", newLabel)}
                            placeholder="e.g. 1 HDMI, 1 VGA"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Battery and Power */}
                <FormSection
                    title={getSectionTitle("Battery and Power", "battery")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("battery", newTitle)}
                    onDelete={() => hideSection("battery")}
                    isDeleted={isSectionHidden("battery")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Power", "battery_power")}
                            value={productInfo.batteryAndPower?.power}
                            onChange={(v) => updateNestedField('batteryAndPower', 'power', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_power", newLabel)}
                            placeholder="e.g. 180 W external AC power adapter"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection>

                {/* Security Management */}
                <FormSection
                    title={getSectionTitle("Security Management", "security")}
                    onAddSpec={() => addCustomField(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("security", newTitle)}
                    onDelete={() => hideSection("security")}
                    isDeleted={isSectionHidden("security")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Security Management", "security_securityManagement")}
                            value={productInfo.security?.securityManagement}
                            onChange={(v) => updateNestedField('security', 'securityManagement', v)}
                            onLabelChange={(newLabel) => setFieldLabel("security_securityManagement", newLabel)}
                            placeholder="e.g. Padlock loop; Kensington lock slot"
                        />
                    </div>
                    {renderCustomFields(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                </FormSection>

                {/* Software */}
                <FormSection
                    title={getSectionTitle("Software", "software")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("software", newTitle)}
                    onDelete={() => hideSection("software")}
                    isDeleted={isSectionHidden("software")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Software Included", "software_softwareIncluded")}
                            value={productInfo.software?.softwareIncluded}
                            onChange={(v) => updateNestedField('software', 'softwareIncluded', v)}
                            onLabelChange={(newLabel) => setFieldLabel("software_softwareIncluded", newLabel)}
                            placeholder="e.g. McAfee LiveSafe"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Software Footnote", "software_footnote")}
                            value={productInfo.software?.footnote}
                            onChange={(v) => updateNestedField('software', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("software_footnote", newLabel)}
                            placeholder="Software specs footnote details..."
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Dimensions and Weight */}
                <FormSection
                    title={getSectionTitle("Dimensions and Weight", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Dimensions (W × D × H)", "dimensions_front")}
                            value={productInfo.dimensionsAndWeight?.dimensions?.front}
                            onChange={(v) => {
                                const current = productInfo.dimensionsAndWeight || {};
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...current,
                                        dimensions: { ...(current.dimensions || {}), front: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_front", newLabel)}
                            placeholder="e.g. 15.5 × 30.3 × 33.7 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Dimension Note (Metric)", "dimensions_rear")}
                            value={productInfo.dimensionsAndWeight?.dimensions?.rear}
                            onChange={(v) => {
                                const current = productInfo.dimensionsAndWeight || {};
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...current,
                                        dimensions: { ...(current.dimensions || {}), rear: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_rear", newLabel)}
                            placeholder="e.g. Standard configuration"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight", "dimensions_weight")}
                            value={productInfo.dimensionsAndWeight?.weight}
                            onChange={(v) => updateNestedField('dimensionsAndWeight', 'weight', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_weight", newLabel)}
                            placeholder="e.g. 4.7 kg"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight Note (Metric)", "dimensions_weight_note")}
                            value={productInfo.dimensionsAndWeight?.weightNote}
                            onChange={(v) => updateNestedField('dimensionsAndWeight', 'weightNote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_weight_note", newLabel)}
                            placeholder="e.g. Exact weight depends on configuration"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Warranty and Services */}
                <FormSection
                    title={getSectionTitle("Warranty and Services", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "warranty_warrantyText")}
                            value={productInfo.warranty?.warrantyText}
                            onChange={(v) => updateNestedField('warranty', 'warrantyText', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_warrantyText", newLabel)}
                            placeholder="e.g. 3 Years Parts and Labor On-Site Service"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Environmental */}
                <FormSection
                    title={getSectionTitle("Environmental", "environmental")}
                    onAddSpec={() => addCustomField(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("environmental", newTitle)}
                    onDelete={() => hideSection("environmental")}
                    isDeleted={isSectionHidden("environmental")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Environmental Specification Footnote Number", "environmental_footnote")}
                            value={productInfo.environmental?.footnote}
                            onChange={(v) => updateNestedField('environmental', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_footnote", newLabel)}
                            placeholder="Environmental footnote number details..."
                        />
                    </div>
                    {renderCustomFields(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                </FormSection>
            </>
        );
    }

    // Workstation-specific fields rendering function
    function renderWorkstationFields() {
        return (
            <>
                {/* Basic Product Info */}
                <FormSection
                    title={getSectionTitle("Basic Product Info", "basic")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("basic", newTitle)}
                    onDelete={() => hideSection("basic")}
                    isDeleted={isSectionHidden("basic")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Product Title", "basic_title")}
                                value={productInfo.title}
                                onChange={(v) => updateField('title', v)}
                                onLabelChange={(newLabel) => setFieldLabel("basic_title", newLabel)}
                                placeholder="e.g. HP Z2 G9 Workstation"
                            />
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. 5F0H4UT"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Product type", "basic_productType")}
                            value={productInfo.productType}
                            onChange={(v) => updateField('productType', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_productType", newLabel)}
                            placeholder="e.g. Workstation"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. HP Z-Series"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Recommended Usage", "basic_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_recommendedUsage", newLabel)}
                            placeholder="e.g. Professional Rendering"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Form factor", "appearance_formFactor")}
                            value={productInfo.appearance?.formFactor}
                            onChange={(v) => updateNestedField('appearance', 'formFactor', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_formFactor", newLabel)}
                            placeholder="e.g. Tower"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>

                {/* Operating System */}
                <FormSection
                    title={getSectionTitle("Supported Operating Systems", "os")}
                    onAddSpec={() => addCustomField(osCustomFields, setOsCustomFields, 'osCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("os", newTitle)}
                    onDelete={() => hideSection("os")}
                    isDeleted={isSectionHidden("os")}
                >
                    <EditableFormInput
                        label={getFieldLabel("Operating system", "os_os")}
                        value={productInfo.operatingSystem?.os}
                        onChange={(v) => updateNestedField('operatingSystem', 'os', v)}
                        onLabelChange={(newLabel) => setFieldLabel("os_os", newLabel)}
                        placeholder="e.g. Windows 11 Pro for Workstations"
                    />
                    {renderCustomFields(osCustomFields, setOsCustomFields, 'osCustomFields')}
                </FormSection>

                {/* Processors */}
                <FormSection
                    title={getSectionTitle("Processors", "processor")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(processorCustomFields, setProcessorCustomFields, 'processorCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("processor", newTitle)}
                    onDelete={() => hideSection("processor")}
                    isDeleted={isSectionHidden("processor")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Processor Generation", "processor_generation")}
                            value={productInfo.processor?.generation}
                            onChange={(v) => updateNestedField('processor', 'generation', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_generation", newLabel)}
                            placeholder="e.g. 13th Generation"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Processor Name", "processor_name")}
                            value={productInfo.processor?.name}
                            onChange={(v) => updateNestedField('processor', 'name', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_name", newLabel)}
                            placeholder="e.g. Intel Xeon W-2245"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Processor Frequency Technology", "processor_frequencyTechnology")}
                            value={productInfo.processor?.frequencyTechnology}
                            onChange={(v) => updateNestedField('processor', 'frequencyTechnology', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_frequencyTechnology", newLabel)}
                            placeholder="e.g. Intel Turbo Boost Max Technology 3.0"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Chipset", "processor_chipset")}
                            value={productInfo.processor?.chipset}
                            onChange={(v) => updateNestedField('processor', 'chipset', v)}
                            onLabelChange={(newLabel) => setFieldLabel("processor_chipset", newLabel)}
                            placeholder="e.g. Intel W680 Chipset"
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Processor Footnote", "processor_footnote")}
                                value={productInfo.processor?.footnote}
                                onChange={(v) => updateNestedField('processor', 'footnote', v)}
                                onLabelChange={(newLabel) => setFieldLabel("processor_footnote", newLabel)}
                                placeholder="Processor specs footnote details..."
                            />
                        </div>
                    </div>
                    {renderCustomFields(processorCustomFields, setProcessorCustomFields, 'processorCustomFields')}
                </FormSection>

                {/* Memory */}
                <FormSection
                    title={getSectionTitle("Memory", "memory")}
                    onAddSpec={() => addCustomField(memoryCustomFields, setMemoryCustomFields, 'memoryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("memory", newTitle)}
                    onDelete={() => hideSection("memory")}
                    isDeleted={isSectionHidden("memory")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Memory Slots", "memory_slots")}
                            value={productInfo.memory?.slots}
                            onChange={(v) => updateNestedField('memory', 'slots', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_slots", newLabel)}
                            placeholder="e.g. 4 DIMM"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Standard Memory Note", "memory_standardMemoryNote")}
                            value={productInfo.memory?.standardMemoryNote}
                            onChange={(v) => updateNestedField('memory', 'standardMemoryNote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_standardMemoryNote", newLabel)}
                            placeholder="e.g. Transfer rates up to 4800 MT/s."
                        />
                        <EditableFormInput
                            label={getFieldLabel("Memory Layout", "memory_layout")}
                            value={productInfo.memory?.layout}
                            onChange={(v) => updateNestedField('memory', 'layout', v)}
                            onLabelChange={(newLabel) => setFieldLabel("memory_layout", newLabel)}
                            placeholder="e.g. 2 x 16 GB"
                        />
                    </div>
                    {renderCustomFields(memoryCustomFields, setMemoryCustomFields, 'memoryCustomFields')}
                </FormSection>

                {/* Storage */}
                <FormSection
                    title={getSectionTitle("Storage", "storage")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("storage", newTitle)}
                    onDelete={() => hideSection("storage")}
                    isDeleted={isSectionHidden("storage")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Hard Drive Description", "storage_hardDriveDescription")}
                            value={productInfo.storage?.hardDriveDescription}
                            onChange={(v) => updateNestedField('storage', 'hardDriveDescription', v)}
                            onLabelChange={(newLabel) => setFieldLabel("storage_hardDriveDescription", newLabel)}
                            placeholder="e.g. 1 TB PCIe NVMe M.2 SSD"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Hard Drive (2nd)", "storage_hardDrive2nd")}
                            value={productInfo.storage?.hardDrive2nd}
                            onChange={(v) => updateNestedField('storage', 'hardDrive2nd', v)}
                            onLabelChange={(newLabel) => setFieldLabel("storage_hardDrive2nd", newLabel)}
                            placeholder="e.g. 2 TB 7200 rpm SATA HDD"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Internal Drive Bays", "storage_internalDriveBays")}
                            value={productInfo.storage?.internalDriveBays}
                            onChange={(v) => updateNestedField('storage', 'internalDriveBays', v)}
                            onLabelChange={(newLabel) => setFieldLabel("storage_internalDriveBays", newLabel)}
                            placeholder='e.g. Two 3.5" HDD; Two M.2 SSD'
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Display and Graphics */}
                <FormSection
                    title={getSectionTitle("Display and Graphics", "graphics")}
                    onAddSpec={() => addCustomField(graphicsCustomFields, setGraphicsCustomFields, 'graphicsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("graphics", newTitle)}
                    onDelete={() => hideSection("graphics")}
                    isDeleted={isSectionHidden("graphics")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Screen Size", "display_size")}
                            value={productInfo.display?.size}
                            onChange={(v) => updateNestedField('display', 'size', v)}
                            onLabelChange={(newLabel) => setFieldLabel("display_size", newLabel)}
                            placeholder="e.g. 27 inch"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Graphics", "graphics_gpu")}
                            value={productInfo.graphics?.gpu}
                            onChange={(v) => updateNestedField('graphics', 'gpu', v)}
                            onLabelChange={(newLabel) => setFieldLabel("graphics_gpu", newLabel)}
                            placeholder="e.g. NVIDIA RTX A4000"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Graphic Card Footnote", "graphics_footnote")}
                            value={productInfo.graphics?.footnote}
                            onChange={(v) => updateNestedField('graphics', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("graphics_footnote", newLabel)}
                            placeholder="Graphic specs footnote details..."
                        />
                    </div>
                    {renderCustomFields(graphicsCustomFields, setGraphicsCustomFields, 'graphicsCustomFields')}
                </FormSection>

                {/* Multimedia and Input Devices */}
                <FormSection
                    title={getSectionTitle("Multimedia and Input Devices", "audio")}
                    onAddSpec={() => addCustomField(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("audio", newTitle)}
                    onDelete={() => hideSection("audio")}
                    isDeleted={isSectionHidden("audio")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Audio Features", "audio_audioFeatures")}
                            value={productInfo.audioAndInput?.audioFeatures}
                            onChange={(v) => updateNestedField('audioAndInput', 'audioFeatures', v)}
                            onLabelChange={(newLabel) => setFieldLabel("audio_audioFeatures", newLabel)}
                            placeholder="e.g. Realtek ALC3205 codec, universal audio jack"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Pointing Device", "audio_pointingDevice")}
                            value={productInfo.audioAndInput?.pointingDevice}
                            onChange={(v) => updateNestedField('audioAndInput', 'pointingDevice', v)}
                            onLabelChange={(newLabel) => setFieldLabel("audio_pointingDevice", newLabel)}
                            placeholder="e.g. HP 125 Wired Mouse"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Keyboard", "audio_keyboard_type")}
                            value={productInfo.audioAndInput?.keyboard?.type}
                            onChange={(v) => {
                                const current = productInfo.audioAndInput || {};
                                setProductInfo({
                                    ...productInfo,
                                    audioAndInput: {
                                        ...current,
                                        keyboard: { ...(current.keyboard || {}), type: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("audio_keyboard_type", newLabel)}
                            placeholder="e.g. HP 125 Wired Keyboard"
                        />
                    </div>
                    {renderCustomFields(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                </FormSection>

                {/* Connectivity and Communications */}
                <FormSection
                    title={getSectionTitle("Connectivity and Communications", "connectivityComms")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivityComms", newTitle)}
                    onDelete={() => hideSection("connectivityComms")}
                    isDeleted={isSectionHidden("connectivityComms")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("I/O Port Location (Front)", "connectivity_ioPortLocationFront")}
                            value={productInfo.connectivityAndComms?.ioPortLocationFront}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'ioPortLocationFront', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_ioPortLocationFront", newLabel)}
                            placeholder="e.g. Front"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Front Ports", "connectivity_frontPorts")}
                            value={productInfo.connectivityAndComms?.frontPorts}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'frontPorts', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_frontPorts", newLabel)}
                            placeholder="e.g. 4 USB Type-A, 1 headphone/microphone combo"
                        />
                        <EditableFormInput
                            label={getFieldLabel("I/O Port Location (Rear)", "connectivity_ioPortLocationRear")}
                            value={productInfo.connectivityAndComms?.ioPortLocationRear}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'ioPortLocationRear', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_ioPortLocationRear", newLabel)}
                            placeholder="e.g. Rear"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Rear Ports", "connectivity_rearPorts")}
                            value={productInfo.connectivityAndComms?.rearPorts}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'rearPorts', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_rearPorts", newLabel)}
                            placeholder="e.g. 4 USB 2.0 Type-A, 1 HDMI, 1 RJ-45"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Expansion Slots", "connectivity_expansionSlots")}
                            value={productInfo.connectivityAndComms?.expansionSlots}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'expansionSlots', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_expansionSlots", newLabel)}
                            placeholder="e.g. 2 M.2; 1 PCIe 4 x16; 1 PCIe 3 x4"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Expansion Slots Note", "connectivity_expansionSlotsNote")}
                            value={productInfo.connectivityAndComms?.expansionSlotsNote}
                            onChange={(v) => updateNestedField('connectivityAndComms', 'expansionSlotsNote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("connectivity_expansionSlotsNote", newLabel)}
                            placeholder="e.g. Expansion slots note details..."
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Battery and Power */}
                <FormSection
                    title={getSectionTitle("Battery and Power", "battery")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("battery", newTitle)}
                    onDelete={() => hideSection("battery")}
                    isDeleted={isSectionHidden("battery")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Power", "battery_power")}
                            value={productInfo.batteryAndPower?.power}
                            onChange={(v) => updateNestedField('batteryAndPower', 'power', v)}
                            onLabelChange={(newLabel) => setFieldLabel("battery_power", newLabel)}
                            placeholder="e.g. 700 W external AC power adapter"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection>

                {/* Security Management */}
                <FormSection
                    title={getSectionTitle("Security Management", "security")}
                    onAddSpec={() => addCustomField(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("security", newTitle)}
                    onDelete={() => hideSection("security")}
                    isDeleted={isSectionHidden("security")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Security Management", "security_securityManagement")}
                            value={productInfo.security?.securityManagement}
                            onChange={(v) => updateNestedField('security', 'securityManagement', v)}
                            onLabelChange={(newLabel) => setFieldLabel("security_securityManagement", newLabel)}
                            placeholder="e.g. Padlock loop; Kensington lock slot"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Security Management Footnote", "security_securityManagementFootnote")}
                            value={productInfo.security?.securityManagementFootnote}
                            onChange={(v) => updateNestedField('security', 'securityManagementFootnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("security_securityManagementFootnote", newLabel)}
                            placeholder="Security management footnote details..."
                        />
                    </div>
                    {renderCustomFields(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
                </FormSection>

                {/* Software */}
                <FormSection
                    title={getSectionTitle("Software", "software")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("software", newTitle)}
                    onDelete={() => hideSection("software")}
                    isDeleted={isSectionHidden("software")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Software Included", "software_softwareIncluded")}
                            value={productInfo.software?.softwareIncluded}
                            onChange={(v) => updateNestedField('software', 'softwareIncluded', v)}
                            onLabelChange={(newLabel) => setFieldLabel("software_softwareIncluded", newLabel)}
                            placeholder="e.g. HP PC Hardware Diagnostics UEFI"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Management Features", "software_managementFeatures")}
                            value={productInfo.software?.managementFeatures}
                            onChange={(v) => updateNestedField('software', 'managementFeatures', v)}
                            onLabelChange={(newLabel) => setFieldLabel("software_managementFeatures", newLabel)}
                            placeholder="e.g. HP Client Management Script Library"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Manageability Features Footnote", "software_manageabilityFeaturesFootnote")}
                            value={productInfo.software?.manageabilityFeaturesFootnote}
                            onChange={(v) => updateNestedField('software', 'manageabilityFeaturesFootnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("software_manageabilityFeaturesFootnote", newLabel)}
                            placeholder="Manageability features footnote details..."
                        />
                        <EditableFormInput
                            label={getFieldLabel("Software Footnote", "software_footnote")}
                            value={productInfo.software?.footnote}
                            onChange={(v) => updateNestedField('software', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("software_footnote", newLabel)}
                            placeholder="Software specs footnote details..."
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Dimensions and Weight */}
                <FormSection
                    title={getSectionTitle("Dimensions and Weight", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Dimensions (W × D × H)", "dimensions_front")}
                            value={productInfo.dimensionsAndWeight?.dimensions?.front}
                            onChange={(v) => {
                                const current = productInfo.dimensionsAndWeight || {};
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...current,
                                        dimensions: { ...(current.dimensions || {}), front: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_front", newLabel)}
                            placeholder="e.g. 16.9 × 38.5 × 35.6 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Dimension Note (Metric)", "dimensions_rear")}
                            value={productInfo.dimensionsAndWeight?.dimensions?.rear}
                            onChange={(v) => {
                                const current = productInfo.dimensionsAndWeight || {};
                                setProductInfo({
                                    ...productInfo,
                                    dimensionsAndWeight: {
                                        ...current,
                                        dimensions: { ...(current.dimensions || {}), rear: v }
                                    }
                                });
                            }}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_rear", newLabel)}
                            placeholder="e.g. Standard tower configuration"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight", "dimensions_weight")}
                            value={productInfo.dimensionsAndWeight?.weight}
                            onChange={(v) => updateNestedField('dimensionsAndWeight', 'weight', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_weight", newLabel)}
                            placeholder="e.g. 7.2 kg"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Weight Note (Metric)", "dimensions_weight_note")}
                            value={productInfo.dimensionsAndWeight?.weightNote}
                            onChange={(v) => updateNestedField('dimensionsAndWeight', 'weightNote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("dimensions_weight_note", newLabel)}
                            placeholder="e.g. Exact weight depends on configuration"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Warranty and Services */}
                <FormSection
                    title={getSectionTitle("Warranty and Services", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "warranty_warrantyText")}
                            value={productInfo.warranty?.warrantyText}
                            onChange={(v) => updateNestedField('warranty', 'warrantyText', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_warrantyText", newLabel)}
                            placeholder="e.g. 3 Years Parts, Labor, and Onsite Service"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Warranty Footnote", "warranty_footnote")}
                            value={productInfo.warranty?.footnote}
                            onChange={(v) => updateNestedField('warranty', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_footnote", newLabel)}
                            placeholder="Warranty footnote details..."
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Environmental */}
                <FormSection
                    title={getSectionTitle("Environmental", "environmental")}
                    onAddSpec={() => addCustomField(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("environmental", newTitle)}
                    onDelete={() => hideSection("environmental")}
                    isDeleted={isSectionHidden("environmental")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Environmental Specification", "environmental_footnote")}
                            value={productInfo.environmental?.footnote}
                            onChange={(v) => updateNestedField('environmental', 'footnote', v)}
                            onLabelChange={(newLabel) => setFieldLabel("environmental_footnote", newLabel)}
                            placeholder="Environmental footnote or specs details..."
                        />
                    </div>
                    {renderCustomFields(environmentalCustomFields, setEnvironmentalCustomFields, 'environmentalCustomFields')}
                </FormSection>
            </>
        );
    }

    // Cables specific fields rendering function
    function renderCablesFields() {
        const isPowerCable = (productInfo as any).isPowerCable || false;

        return (
            <>
                {/* Category / Series */}
                <FormSection
                    title={getSectionTitle("Series", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. CAB-HDMI-10"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. Premium HDMI Series"
                        />
                    </div>
                    <div className="mt-4 flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={isPowerCable}
                            onChange={(e) => setProductInfo({ ...productInfo, isPowerCable: e.target.checked } as any)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This is a Power Cable (Laptop/Desktop)</span>
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connectivity */}
                <FormSection
                    title={getSectionTitle("Connectivity", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Cable Type", "cable_cableType")}
                            value={productInfo.cableType}
                            onChange={(v) => setProductInfo({ ...productInfo, cableType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_cableType", newLabel)}
                            placeholder="e.g. HDMI to HDMI"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Connector 1", "cable_connector1")}
                            value={productInfo.connector1}
                            onChange={(v) => setProductInfo({ ...productInfo, connector1: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_connector1", newLabel)}
                            placeholder="e.g. HDMI Male"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Connector 2", "cable_connector2")}
                            value={productInfo.connector2}
                            onChange={(v) => setProductInfo({ ...productInfo, connector2: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_connector2", newLabel)}
                            placeholder="e.g. HDMI Male"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Cable Specifications or Power Specifications */}
                {!isPowerCable ? (
                    <FormSection
                        title={getSectionTitle("Cable Specifications", "cableSpecs")}
                        defaultOpen={true}
                        onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                        onTitleChange={(newTitle) => setSectionTitle("cableSpecs", newTitle)}
                        onDelete={() => hideSection("cableSpecs")}
                        isDeleted={isSectionHidden("cableSpecs")}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Cable Length", "cable_cableLength")}
                                value={productInfo.cableLength}
                                onChange={(v) => setProductInfo({ ...productInfo, cableLength: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_cableLength", newLabel)}
                                placeholder="e.g. 1.8 m"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Supported Standard (HDMI 2.1 / DP 1.4)", "cable_supportedStandard")}
                                value={productInfo.supportedStandard}
                                onChange={(v) => setProductInfo({ ...productInfo, supportedStandard: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_supportedStandard", newLabel)}
                                placeholder="e.g. HDMI 2.1"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Maximum Resolution", "cable_maxResolution")}
                                value={productInfo.maxResolution}
                                onChange={(v) => setProductInfo({ ...productInfo, maxResolution: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_maxResolution", newLabel)}
                                placeholder="e.g. 8K @ 60Hz"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Refresh Rate Support", "cable_refreshRateSupport")}
                                value={productInfo.refreshRateSupport}
                                onChange={(v) => setProductInfo({ ...productInfo, refreshRateSupport: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_refreshRateSupport", newLabel)}
                                placeholder="e.g. 4K @ 120Hz"
                            />
                        </div>
                        {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    </FormSection>
                ) : (
                    <FormSection
                        title={getSectionTitle("Power Specifications", "powerSpecs")}
                        defaultOpen={true}
                        onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                        onTitleChange={(newTitle) => setSectionTitle("powerSpecs", newTitle)}
                        onDelete={() => hideSection("powerSpecs")}
                        isDeleted={isSectionHidden("powerSpecs")}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Cable Length", "cable_cableLength")}
                                value={productInfo.cableLength}
                                onChange={(v) => setProductInfo({ ...productInfo, cableLength: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_cableLength", newLabel)}
                                placeholder="e.g. 1.5 m"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Input Voltage", "cable_inputVoltage")}
                                value={productInfo.inputVoltage}
                                onChange={(v) => setProductInfo({ ...productInfo, inputVoltage: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_inputVoltage", newLabel)}
                                placeholder="e.g. 250V"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Current Rating", "cable_currentRating")}
                                value={productInfo.currentRating}
                                onChange={(v) => setProductInfo({ ...productInfo, currentRating: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_currentRating", newLabel)}
                                placeholder="e.g. 10A"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Connector Type", "cable_connectorType")}
                                value={productInfo.connectorType}
                                onChange={(v) => setProductInfo({ ...productInfo, connectorType: v })}
                                onLabelChange={(newLabel) => setFieldLabel("cable_connectorType", newLabel)}
                                placeholder="e.g. 3-Pin to IEC C13"
                            />
                        </div>
                        {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    </FormSection>
                )}

                {/* Compatibility */}
                <FormSection
                    title={getSectionTitle("Compatibility", "compatibility")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("compatibility", newTitle)}
                    onDelete={() => hideSection("compatibility")}
                    isDeleted={isSectionHidden("compatibility")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Compatible Devices", "cable_compatibleDevices")}
                            value={productInfo.compatibleDevices}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleDevices: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_compatibleDevices", newLabel)}
                            placeholder="e.g. Laptops, Monitors, Projectors"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Compatible Ports", "cable_compatiblePorts")}
                            value={productInfo.compatiblePorts}
                            onChange={(v) => setProductInfo({ ...productInfo, compatiblePorts: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_compatiblePorts", newLabel)}
                            placeholder="e.g. HDMI 2.0 / 2.1 Ports"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Features */}
                <FormSection
                    title={getSectionTitle("Features", "features")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("features", newTitle)}
                    onDelete={() => hideSection("features")}
                    isDeleted={isSectionHidden("features")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Special Features", "cable_specialFeatures")}
                            value={productInfo.specialFeatures}
                            onChange={(v) => setProductInfo({ ...productInfo, specialFeatures: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_specialFeatures", newLabel)}
                            placeholder="e.g. Gold-plated connectors, braided cable"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Package Contents */}
                <FormSection
                    title={getSectionTitle("Package Contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the Box", "cable_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("cable_whatsInBox", newLabel)}
                            placeholder="e.g. 1 x HDMI Cable"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "cable_warranty")}
                            value={productInfo.warranty as any}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("cable_warranty", newLabel)}
                            placeholder="e.g. 1 Year Limited Warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    // Hubs specific fields rendering function
    function renderHubsFields() {
        return (
            <>
                {/* Category / Series */}
                <FormSection
                    title={getSectionTitle("Series", "categoryInfo")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. HUB-USB3-04"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. Pro USB Hub Series"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Connectivity */}
                <FormSection
                    title={getSectionTitle("Connectivity", "connection")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Host Interface", "hub_hostInterface")}
                            value={productInfo.hostInterface}
                            onChange={(v) => setProductInfo({ ...productInfo, hostInterface: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_hostInterface", newLabel)}
                            placeholder="e.g. USB-C"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Number of Ports", "hub_numberOfPorts")}
                            value={productInfo.numberOfPorts}
                            onChange={(v) => setProductInfo({ ...productInfo, numberOfPorts: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_numberOfPorts", newLabel)}
                            placeholder="e.g. 4"
                        />
                        <EditableFormInput
                            label={getFieldLabel("USB Port Configuration", "hub_usbPortConfiguration")}
                            value={productInfo.usbPortConfiguration}
                            onChange={(v) => setProductInfo({ ...productInfo, usbPortConfiguration: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_usbPortConfiguration", newLabel)}
                            placeholder="e.g. 4 x USB 3.0"
                        />
                        <EditableFormInput
                            label={getFieldLabel("HDMI Port", "hub_hdmiPort")}
                            value={productInfo.hdmiPort}
                            onChange={(v) => setProductInfo({ ...productInfo, hdmiPort: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_hdmiPort", newLabel)}
                            placeholder="e.g. 1 x HDMI 2.0"
                        />
                        <EditableFormInput
                            label={getFieldLabel("VGA Port", "hub_vgaPort")}
                            value={productInfo.vgaPort}
                            onChange={(v) => setProductInfo({ ...productInfo, vgaPort: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_vgaPort", newLabel)}
                            placeholder="e.g. 1 x VGA"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Ethernet Port", "hub_ethernetPort")}
                            value={productInfo.ethernetPort}
                            onChange={(v) => setProductInfo({ ...productInfo, ethernetPort: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_ethernetPort", newLabel)}
                            placeholder="e.g. 1 x RJ45"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Audio Port", "hub_audioPort")}
                            value={productInfo.audioPort}
                            onChange={(v) => setProductInfo({ ...productInfo, audioPort: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_audioPort", newLabel)}
                            placeholder="e.g. 1 x 3.5mm Jack"
                        />
                        <EditableFormInput
                            label={getFieldLabel("SD Card Slot", "hub_sdCardSlot")}
                            value={productInfo.sdCardSlot}
                            onChange={(v) => setProductInfo({ ...productInfo, sdCardSlot: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_sdCardSlot", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("microSD Card Slot", "hub_microSdCardSlot")}
                            value={productInfo.microSdCardSlot}
                            onChange={(v) => setProductInfo({ ...productInfo, microSdCardSlot: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_microSdCardSlot", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("USB-C PD Port", "hub_usbCPdPort")}
                            value={productInfo.usbCPdPort}
                            onChange={(v) => setProductInfo({ ...productInfo, usbCPdPort: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_usbCPdPort", newLabel)}
                            placeholder="e.g. 1 x USB-C PD 100W"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Performance */}
                <FormSection
                    title={getSectionTitle("Performance", "performance")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("performance", newTitle)}
                    onDelete={() => hideSection("performance")}
                    isDeleted={isSectionHidden("performance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Data Transfer Speed", "hub_dataTransferSpeed")}
                            value={productInfo.dataTransferSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, dataTransferSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_dataTransferSpeed", newLabel)}
                            placeholder="e.g. Up to 5 Gbps"
                        />
                        <EditableFormInput
                            label={getFieldLabel("HDMI Resolution", "hub_hdmiResolution")}
                            value={productInfo.hdmiResolution}
                            onChange={(v) => setProductInfo({ ...productInfo, hdmiResolution: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_hdmiResolution", newLabel)}
                            placeholder="e.g. 4K @ 30Hz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Refresh Rate", "hub_refreshRate")}
                            value={productInfo.refreshRate as any}
                            onChange={(v) => setProductInfo({ ...productInfo, refreshRate: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("hub_refreshRate", newLabel)}
                            placeholder="e.g. 60Hz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Power Delivery", "hub_powerDelivery")}
                            value={productInfo.powerDelivery}
                            onChange={(v) => setProductInfo({ ...productInfo, powerDelivery: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_powerDelivery", newLabel)}
                            placeholder="e.g. Up to 100W"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Ethernet Speed", "hub_ethernetSpeed")}
                            value={productInfo.ethernetSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, ethernetSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_ethernetSpeed", newLabel)}
                            placeholder="e.g. 10/100/1000 Mbps"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Card Reader Speed", "hub_cardReaderSpeed")}
                            value={productInfo.cardReaderSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, cardReaderSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_cardReaderSpeed", newLabel)}
                            placeholder="e.g. Up to 104 MB/s"
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Compatibility */}
                <FormSection
                    title={getSectionTitle("Compatibility", "compatibility")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("compatibility", newTitle)}
                    onDelete={() => hideSection("compatibility")}
                    isDeleted={isSectionHidden("compatibility")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Compatible Devices", "hub_compatibleDevices")}
                            value={productInfo.compatibleDevices}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleDevices: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_compatibleDevices", newLabel)}
                            placeholder="e.g. Laptops, Desktops, Tablets"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Compatible Operating Systems", "hub_compatibleOS")}
                            value={productInfo.compatibleOS}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleOS: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_compatibleOS", newLabel)}
                            placeholder="e.g. Windows 10/11, macOS, Linux"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Features */}
                <FormSection
                    title={getSectionTitle("Features", "features")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("features", newTitle)}
                    onDelete={() => hideSection("features")}
                    isDeleted={isSectionHidden("features")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Plug & Play", "hub_plugAndPlay")}
                            value={productInfo.plugAndPlay}
                            onChange={(v) => setProductInfo({ ...productInfo, plugAndPlay: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_plugAndPlay", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Hot Swappable", "hub_hotSwappable")}
                            value={productInfo.hotSwappable}
                            onChange={(v) => setProductInfo({ ...productInfo, hotSwappable: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_hotSwappable", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Aluminum Body", "hub_aluminumBody")}
                            value={productInfo.aluminumBody}
                            onChange={(v) => setProductInfo({ ...productInfo, aluminumBody: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_aluminumBody", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("LED Indicator", "hub_ledIndicator")}
                            value={productInfo.ledIndicator}
                            onChange={(v) => setProductInfo({ ...productInfo, ledIndicator: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_ledIndicator", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Overcurrent Protection", "hub_overcurrentProtection")}
                            value={productInfo.overcurrentProtection}
                            onChange={(v) => setProductInfo({ ...productInfo, overcurrentProtection: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_overcurrentProtection", newLabel)}
                            placeholder="e.g. Yes"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Overvoltage Protection", "hub_overvoltageProtection")}
                            value={productInfo.overvoltageProtection}
                            onChange={(v) => setProductInfo({ ...productInfo, overvoltageProtection: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_overvoltageProtection", newLabel)}
                            placeholder="e.g. Yes"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Package Contents */}
                <FormSection
                    title={getSectionTitle("Package Contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("What's in the Box", "hub_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_whatsInBox", newLabel)}
                            placeholder="e.g. 1 x USB-C Hub, User Manual"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "hub_warranty")}
                            value={productInfo.warranty as any}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("hub_warranty", newLabel)}
                            placeholder="e.g. 1 Year Limited Warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Space Gray"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Material", "hub_material")}
                            value={productInfo.material}
                            onChange={(v) => setProductInfo({ ...productInfo, material: v })}
                            onLabelChange={(newLabel) => setFieldLabel("hub_material", newLabel)}
                            placeholder="e.g. Aluminum Alloy"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    function renderDVDFields() {
        return (
            <>
                {/* Series */}
                <FormSection
                    title={getSectionTitle("Series", "categoryInfo")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => setProductInfo({ ...productInfo, partNo: v })}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. F2B56AA"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => setProductInfo({ ...productInfo, series: v })}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. External DVD Drive"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Drive Specifications */}
                <FormSection
                    title={getSectionTitle("Drive Specifications", "driveSpecs")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("driveSpecs", newTitle)}
                    onDelete={() => hideSection("driveSpecs")}
                    isDeleted={isSectionHidden("driveSpecs")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Drive Type", "dvd_driveType")}
                            value={productInfo.driveType}
                            onChange={(v) => setProductInfo({ ...productInfo, driveType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_driveType", newLabel)}
                            placeholder="e.g. External"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Optical Drive Type", "dvd_opticalDriveType")}
                            value={productInfo.opticalDriveType}
                            onChange={(v) => setProductInfo({ ...productInfo, opticalDriveType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_opticalDriveType", newLabel)}
                            placeholder="e.g. DVD Writer"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Read Speed", "dvd_readSpeed")}
                            value={productInfo.readSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, readSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_readSpeed", newLabel)}
                            placeholder="e.g. DVD-ROM 8x, CD-ROM 24x"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Write Speed", "dvd_writeSpeed")}
                            value={productInfo.writeSpeed}
                            onChange={(v) => setProductInfo({ ...productInfo, writeSpeed: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_writeSpeed", newLabel)}
                            placeholder="e.g. DVD±R 8x, CD-R 24x"
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Supported Disc Formats", "dvd_supportedDiscFormats")}
                                value={productInfo.supportedDiscFormats}
                                onChange={(v) => setProductInfo({ ...productInfo, supportedDiscFormats: v })}
                                onLabelChange={(newLabel) => setFieldLabel("dvd_supportedDiscFormats", newLabel)}
                                placeholder="e.g. DVD-RAM, DVD+R, CD-ROM"
                            />
                        </div>
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Connectivity */}
                <FormSection
                    title={getSectionTitle("Connectivity", "connection")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Interface", "dvd_interface")}
                            value={productInfo.interface}
                            onChange={(v) => setProductInfo({ ...productInfo, interface: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_interface", newLabel)}
                            placeholder="e.g. USB 2.0 / USB 3.0"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Cable Type", "dvd_cableType")}
                            value={productInfo.cableType}
                            onChange={(v) => setProductInfo({ ...productInfo, cableType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_cableType", newLabel)}
                            placeholder="e.g. Integrated USB Cable"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Compatibility */}
                <FormSection
                    title={getSectionTitle("Compatibility", "compatibility")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("compatibility", newTitle)}
                    onDelete={() => hideSection("compatibility")}
                    isDeleted={isSectionHidden("compatibility")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Compatible Devices", "dvd_compatibleDevices")}
                            value={productInfo.compatibleDevices}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleDevices: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_compatibleDevices", newLabel)}
                            placeholder="e.g. Laptops, Desktops"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Compatible Operating Systems", "dvd_compatibleOS")}
                            value={productInfo.compatibleOS}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleOS: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_compatibleOS", newLabel)}
                            placeholder="e.g. Windows 11/10, macOS, Linux"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Features */}
                <FormSection
                    title={getSectionTitle("Features", "features")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("features", newTitle)}
                    onDelete={() => hideSection("features")}
                    isDeleted={isSectionHidden("features")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Plug & Play", "dvd_plugAndPlay")}
                            value={productInfo.plugAndPlay}
                            onChange={(v) => setProductInfo({ ...productInfo, plugAndPlay: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_plugAndPlay", newLabel)}
                            type="checkbox"
                            placeholder="Plug & Play"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Slim Design", "dvd_slimDesign")}
                            value={productInfo.slimDesign}
                            onChange={(v) => setProductInfo({ ...productInfo, slimDesign: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_slimDesign", newLabel)}
                            type="checkbox"
                            placeholder="Slim Design"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Bus Powered", "dvd_busPowered")}
                            value={productInfo.busPowered}
                            onChange={(v) => setProductInfo({ ...productInfo, busPowered: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_busPowered", newLabel)}
                            type="checkbox"
                            placeholder="Bus Powered"
                        />
                        <EditableFormInput
                            label={getFieldLabel("M-DISC Support (if available)", "dvd_mDiscSupport")}
                            value={productInfo.mDiscSupport}
                            onChange={(v) => setProductInfo({ ...productInfo, mDiscSupport: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_mDiscSupport", newLabel)}
                            type="checkbox"
                            placeholder="M-DISC Support"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Package Contents */}
                <FormSection
                    title={getSectionTitle("Package Contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1">
                        <EditableFormInput
                            label={getFieldLabel("What's in the Box", "dvd_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_whatsInBox", newLabel)}
                            placeholder="e.g. HP External DVD Drive, Documentation"
                        />
                    </div>
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "dvd_warranty")}
                            value={productInfo.warranty as any}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_warranty", newLabel)}
                            placeholder="e.g. 1 Year Limited Warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Material", "dvd_material")}
                            value={productInfo.material}
                            onChange={(v) => setProductInfo({ ...productInfo, material: v })}
                            onLabelChange={(newLabel) => setFieldLabel("dvd_material", newLabel)}
                            placeholder="e.g. Plastic"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }

    function renderWebcamFields() {
        return (
            <>
                {/* Series */}
                <FormSection
                    title={getSectionTitle("Series", "categoryInfo")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("categoryInfo", newTitle)}
                    onDelete={() => hideSection("categoryInfo")}
                    isDeleted={isSectionHidden("categoryInfo")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => setProductInfo({ ...productInfo, partNo: v })}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. 5G6K1AA"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => setProductInfo({ ...productInfo, series: v })}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. StreamCam"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Camera Specifications */}
                <FormSection
                    title={getSectionTitle("Camera Specifications", "cameraSpecs")}
                    onAddSpec={() => addCustomField(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("cameraSpecs", newTitle)}
                    onDelete={() => hideSection("cameraSpecs")}
                    isDeleted={isSectionHidden("cameraSpecs")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Resolution", "webcam_resolution")}
                            value={productInfo.resolution}
                            onChange={(v) => setProductInfo({ ...productInfo, resolution: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_resolution", newLabel)}
                            placeholder="e.g. 1080p (Full HD) / 4K"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Frame Rate", "webcam_frameRate")}
                            value={productInfo.frameRate}
                            onChange={(v) => setProductInfo({ ...productInfo, frameRate: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_frameRate", newLabel)}
                            placeholder="e.g. 60 fps / 30 fps"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Image Sensor", "webcam_imageSensor")}
                            value={productInfo.imageSensor}
                            onChange={(v) => setProductInfo({ ...productInfo, imageSensor: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_imageSensor", newLabel)}
                            placeholder="e.g. CMOS"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Field of View (FOV)", "webcam_fieldOfView")}
                            value={productInfo.fieldOfView}
                            onChange={(v) => setProductInfo({ ...productInfo, fieldOfView: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_fieldOfView", newLabel)}
                            placeholder="e.g. 90° / 78°"
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Focus Type", "webcam_focusType")}
                                value={productInfo.focusType}
                                onChange={(v) => setProductInfo({ ...productInfo, focusType: v })}
                                onLabelChange={(newLabel) => setFieldLabel("webcam_focusType", newLabel)}
                                placeholder="e.g. Autofocus / Fixed Focus"
                            />
                        </div>
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
                </FormSection>

                {/* Audio */}
                <FormSection
                    title={getSectionTitle("Audio", "audio")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("audio", newTitle)}
                    onDelete={() => hideSection("audio")}
                    isDeleted={isSectionHidden("audio")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Built-in Microphone", "webcam_builtInMicrophone")}
                            value={productInfo.builtInMicrophone}
                            onChange={(v) => setProductInfo({ ...productInfo, builtInMicrophone: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_builtInMicrophone", newLabel)}
                            type="checkbox"
                            placeholder="Built-in Microphone"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Microphone Type", "webcam_microphoneType")}
                            value={productInfo.microphoneType}
                            onChange={(v) => setProductInfo({ ...productInfo, microphoneType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_microphoneType", newLabel)}
                            placeholder="e.g. Dual Omni-directional"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Connectivity */}
                <FormSection
                    title={getSectionTitle("Connectivity", "connection")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connection", newTitle)}
                    onDelete={() => hideSection("connection")}
                    isDeleted={isSectionHidden("connection")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Interface", "webcam_interface")}
                            value={productInfo.interface}
                            onChange={(v) => setProductInfo({ ...productInfo, interface: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_interface", newLabel)}
                            placeholder="e.g. USB-C / USB 3.0"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Cable Length", "webcam_cableLength")}
                            value={productInfo.cableLength}
                            onChange={(v) => setProductInfo({ ...productInfo, cableLength: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_cableLength", newLabel)}
                            placeholder="e.g. 1.5 m"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Compatibility */}
                <FormSection
                    title={getSectionTitle("Compatibility", "compatibility")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("compatibility", newTitle)}
                    onDelete={() => hideSection("compatibility")}
                    isDeleted={isSectionHidden("compatibility")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Compatible Devices", "webcam_compatibleDevices")}
                            value={productInfo.compatibleDevices}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleDevices: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_compatibleDevices", newLabel)}
                            placeholder="e.g. Laptops, Desktops, Smart TVs"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Compatible Operating Systems", "webcam_compatibleOS")}
                            value={productInfo.compatibleOS}
                            onChange={(v) => setProductInfo({ ...productInfo, compatibleOS: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_compatibleOS", newLabel)}
                            placeholder="e.g. Windows 11/10, macOS, ChromeOS"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Features */}
                <FormSection
                    title={getSectionTitle("Features", "features")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("features", newTitle)}
                    onDelete={() => hideSection("features")}
                    isDeleted={isSectionHidden("features")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Plug & Play", "webcam_plugAndPlay")}
                            value={productInfo.plugAndPlay}
                            onChange={(v) => setProductInfo({ ...productInfo, plugAndPlay: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_plugAndPlay", newLabel)}
                            type="checkbox"
                            placeholder="Plug & Play"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Privacy Shutter", "webcam_privacyShutter")}
                            value={productInfo.privacyShutter}
                            onChange={(v) => setProductInfo({ ...productInfo, privacyShutter: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_privacyShutter", newLabel)}
                            type="checkbox"
                            placeholder="Privacy Shutter"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Auto Light Correction", "webcam_autoLightCorrection")}
                            value={productInfo.autoLightCorrection}
                            onChange={(v) => setProductInfo({ ...productInfo, autoLightCorrection: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_autoLightCorrection", newLabel)}
                            type="checkbox"
                            placeholder="Auto Light Correction"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Noise Reduction", "webcam_noiseReduction")}
                            value={productInfo.noiseReduction}
                            onChange={(v) => setProductInfo({ ...productInfo, noiseReduction: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_noiseReduction", newLabel)}
                            type="checkbox"
                            placeholder="Noise Reduction"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Tripod Support", "webcam_tripodSupport")}
                            value={productInfo.tripodSupport}
                            onChange={(v) => setProductInfo({ ...productInfo, tripodSupport: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_tripodSupport", newLabel)}
                            type="checkbox"
                            placeholder="Tripod Support"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Package Contents */}
                <FormSection
                    title={getSectionTitle("Package Contents", "boxContents")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("boxContents", newTitle)}
                    onDelete={() => hideSection("boxContents")}
                    isDeleted={isSectionHidden("boxContents")}
                >
                    <div className="grid grid-cols-1">
                        <EditableFormInput
                            label={getFieldLabel("What's in the Box", "webcam_whatsInBox")}
                            value={productInfo.whatsInTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInTheBox: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_whatsInBox", newLabel)}
                            placeholder="e.g. Webcam, Type-C cable, Documentation"
                        />
                    </div>
                </FormSection>

                {/* Warranty */}
                <FormSection
                    title={getSectionTitle("Warranty", "warranty")}
                    onAddSpec={() => addCustomField(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("warranty", newTitle)}
                    onDelete={() => hideSection("warranty")}
                    isDeleted={isSectionHidden("warranty")}
                >
                    <div className="grid grid-cols-1">
                        <EditableFormInput
                            label={getFieldLabel("Warranty", "webcam_warranty")}
                            value={productInfo.warranty as any}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as any)}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_warranty", newLabel)}
                            placeholder="e.g. 1 Year Limited Warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* Appearance */}
                <FormSection
                    title={getSectionTitle("Appearance", "appearance")}
                    onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
                    onDelete={() => hideSection("appearance")}
                    isDeleted={isSectionHidden("appearance")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Product Color", "appearance_color")}
                            value={productInfo.appearance?.color}
                            onChange={(v) => updateNestedField('appearance', 'color', v)}
                            onLabelChange={(newLabel) => setFieldLabel("appearance_color", newLabel)}
                            placeholder="e.g. Black"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Mount Type", "webcam_mountType")}
                            value={productInfo.mountType}
                            onChange={(v) => setProductInfo({ ...productInfo, mountType: v })}
                            onLabelChange={(newLabel) => setFieldLabel("webcam_mountType", newLabel)}
                            placeholder="e.g. Clip mount / Tripod thread"
                        />
                    </div>
                    {renderCustomFields(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                </FormSection>
            </>
        );
    }
}
