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
    onDelete
}: {
    label: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    onLabelChange?: (newLabel: string) => void;
    placeholder?: string;
    type?: 'text' | 'number';
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
        <div>
            <div className="flex items-center gap-2 mb-1">
                {isEditingLabel && onLabelChange ? (
                    <input
                        type="text"
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border-b border-blue-500 focus:outline-none"
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
                {onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                        title="Delete field"
                    >
                        <FiTrash2 size={12} />
                    </button>
                )}
            </div>
            <input
                type={type}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
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
        const labels = (productInfo as any).fieldLabels || {};
        return labels[fieldKey] || defaultLabel;
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
                        onChange={(v) => updateCustomField(fields, setFields, sectionKey, idx, 'value', v)}
                        onLabelChange={(newLabel) => updateCustomField(fields, setFields, sectionKey, idx, 'label', newLabel)}
                        placeholder="Enter value"
                        onDelete={() => deleteCustomField(fields, setFields, sectionKey, idx)}
                    />
                ))}
            </div>
        );
    };

    // Section configuration - custom section titles
    const getSectionTitle = (defaultTitle: string, sectionKey: string): string => {
        const titles = (productInfo as any).sectionTitles || {};
        return titles[sectionKey] || defaultTitle;
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
            {category === 'monitors' ? renderMonitorFields() :
                category === 'keyboard-mouse-combo' ? renderKeyboardMouseComboFields() :
                    category === 'keyboards' ? renderKeyboardFields() :
                        category === 'mouse' ? renderMouseFields() :
                            category === 'power-adapters' ? renderPowerAdaptersFields() :
                                category === 'headphones' ? renderHeadphonesFields() :
                                    category === 'bags' ? renderBagsFields() :
                                        category === 'docks' ? renderDocksFields() :
                                            category === 'usb-flashdrives' ? renderUSBFlashDrivesFields() :
                                                renderDefaultFields()}
        </div>
    );

    // Monitor-specific fields rendering function
    function renderMonitorFields() {
        return (
            <>
                {/* Basic Info for Monitors */}
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
                                placeholder="e.g. HP 24 inch Full HD Monitor"
                            />
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Model", "monitor_model")}
                            value={(productInfo as any).model}
                            onChange={(v) => setProductInfo({ ...productInfo, model: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_model", newLabel)}
                            placeholder="e.g. M24f"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Screen Size (CM)", "monitor_screenSizeCm")}
                            value={(productInfo as any).screenSizeCm}
                            onChange={(v) => setProductInfo({ ...productInfo, screenSizeCm: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_screenSizeCm", newLabel)}
                            placeholder="e.g. 60.96 cm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Screen Size (Inch)", "monitor_screenSizeInch")}
                            value={(productInfo as any).screenSizeInch}
                            onChange={(v) => setProductInfo({ ...productInfo, screenSizeInch: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_screenSizeInch", newLabel)}
                            placeholder="e.g. 24 inch"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Part Number", "basic_partNo")}
                            value={productInfo.partNo}
                            onChange={(v) => updateField('partNo', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_partNo", newLabel)}
                            placeholder="e.g. 6D0K7AA"
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
                            placeholder="e.g. Home, Office"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Perfect For", "monitor_perfectFor")}
                            value={(productInfo as any).perfectFor}
                            onChange={(v) => setProductInfo({ ...productInfo, perfectFor: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_perfectFor", newLabel)}
                            placeholder="e.g. Work from Home"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Aspect Ratio & Resolution */}
                <FormSection
                    title={getSectionTitle("Aspect Ratio & Resolution", "aspectRatio")}
                    onAddSpec={() => addCustomField(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("aspectRatio", newTitle)}
                    onDelete={() => hideSection("aspectRatio")}
                    isDeleted={isSectionHidden("aspectRatio")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Resolution</h4>
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Native Resolution", "monitor_resolutionNative")}
                            value={(productInfo as any).resolutionNative}
                            onChange={(v) => setProductInfo({ ...productInfo, resolutionNative: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_resolutionNative", newLabel)}
                            placeholder="e.g. 1920 x 1080"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Maximum Resolution", "monitor_resolutionMaximum")}
                            value={(productInfo as any).resolutionMaximum}
                            onChange={(v) => setProductInfo({ ...productInfo, resolutionMaximum: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_resolutionMaximum", newLabel)}
                            placeholder="e.g. 1920 x 1080 @ 75 Hz"
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Supported Resolutions", "monitor_resolutionSupported")}
                                value={(productInfo as any).resolutionSupported}
                                onChange={(v) => setProductInfo({ ...productInfo, resolutionSupported: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_resolutionSupported", newLabel)}
                                placeholder="e.g. Multiple resolutions supported"
                            />
                        </div>
                    </div>
                    {renderCustomFields(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                </FormSection>

                {/* Display Details */}
                <FormSection
                    title={getSectionTitle("Display Details", "displayDetails")}
                    defaultOpen={true}
                    onAddSpec={() => addCustomField(displayCustomFields, setDisplayCustomFields, 'displayCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("displayDetails", newTitle)}
                    onDelete={() => hideSection("displayDetails")}
                    isDeleted={isSectionHidden("displayDetails")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Pixel Pitch (mm)", "monitor_pixelPitch")}
                            value={(productInfo as any).pixelPitch}
                            onChange={(v) => setProductInfo({ ...productInfo, pixelPitch: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_pixelPitch", newLabel)}
                            placeholder="e.g. 0.2745 mm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Brightness (nits)", "monitor_brightnessNits")}
                            value={(productInfo as any).brightnessNits}
                            onChange={(v) => setProductInfo({ ...productInfo, brightnessNits: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_brightnessNits", newLabel)}
                            placeholder="e.g. 250 nits"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Contrast Ratio", "monitor_contrastRatio")}
                            value={(productInfo as any).contrastRatio}
                            onChange={(v) => setProductInfo({ ...productInfo, contrastRatio: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_contrastRatio", newLabel)}
                            placeholder="e.g. 1000:1"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Response Time", "monitor_responseTime")}
                            value={(productInfo as any).responseTime}
                            onChange={(v) => setProductInfo({ ...productInfo, responseTime: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_responseTime", newLabel)}
                            placeholder="e.g. 5ms (GtG)"
                        />
                        <EditableFormCheckbox
                            label={getFieldLabel("Flicker Free", "monitor_flickerFree")}
                            checked={(productInfo as any).flickerFree}
                            onChange={(v) => setProductInfo({ ...productInfo, flickerFree: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_flickerFree", newLabel)}
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Display Features", "monitor_displayFeatures")}
                                value={(productInfo as any).displayFeatures}
                                onChange={(v) => setProductInfo({ ...productInfo, displayFeatures: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_displayFeatures", newLabel)}
                                placeholder="e.g. Anti-glare, Low Blue Light"
                            />
                        </div>
                    </div>
                </FormSection>

                {/* Scan Frequency */}
                <FormSection
                    title={getSectionTitle("Scan Frequency", "scanFrequency")}
                    onAddSpec={() => addCustomField(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("scanFrequency", newTitle)}
                    onDelete={() => hideSection("scanFrequency")}
                    isDeleted={isSectionHidden("scanFrequency")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Horizontal (kHz)", "monitor_horizontalKhz")}
                            value={(productInfo as any).horizontalKhz}
                            onChange={(v) => setProductInfo({ ...productInfo, horizontalKhz: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_horizontalKhz", newLabel)}
                            placeholder="e.g. 30-83 kHz"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Vertical (Hz)", "monitor_verticalHz")}
                            value={(productInfo as any).verticalHz}
                            onChange={(v) => setProductInfo({ ...productInfo, verticalHz: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_verticalHz", newLabel)}
                            placeholder="e.g. 48-75 Hz"
                        />
                        <div className="md:col-span-2">
                            <EditableFormInput
                                label={getFieldLabel("Onscreen Controls", "monitor_onscreenControls")}
                                value={(productInfo as any).onscreenControls}
                                onChange={(v) => setProductInfo({ ...productInfo, onscreenControls: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_onscreenControls", newLabel)}
                                placeholder="e.g. Menu buttons, OSD controls"
                            />
                        </div>
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
                </FormSection>

                {/* Stand and Mount */}
                <FormSection
                    title={getSectionTitle("Stand and Mount", "standMount")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("standMount", newTitle)}
                    onDelete={() => hideSection("standMount")}
                    isDeleted={isSectionHidden("standMount")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("VESA Mount (mm)", "monitor_vesaMount")}
                            value={(productInfo as any).vesaMount}
                            onChange={(v) => setProductInfo({ ...productInfo, vesaMount: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_vesaMount", newLabel)}
                            placeholder="e.g. 100 x 100 mm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Tilt Range", "monitor_tiltRange")}
                            value={(productInfo as any).tiltRange}
                            onChange={(v) => setProductInfo({ ...productInfo, tiltRange: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_tiltRange", newLabel)}
                            placeholder="e.g. -5° to +20°"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Connectivity for Monitors */}
                <FormSection
                    title={getSectionTitle("Connectivity", "connectivity")}
                    onAddSpec={() => addCustomField(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("connectivity", newTitle)}
                    onDelete={() => hideSection("connectivity")}
                    isDeleted={isSectionHidden("connectivity")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Display Inputs", "monitor_displayInputs")}
                            value={(productInfo as any).displayInputs}
                            onChange={(v) => setProductInfo({ ...productInfo, displayInputs: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_displayInputs", newLabel)}
                            placeholder="e.g. 1 x HDMI, 1 x VGA"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
                </FormSection>

                {/* Power */}
                <FormSection
                    title={getSectionTitle("Power", "power")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("power", newTitle)}
                    onDelete={() => hideSection("power")}
                    isDeleted={isSectionHidden("power")}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Input Voltage", "monitor_inputVoltage")}
                            value={(productInfo as any).inputVoltage}
                            onChange={(v) => setProductInfo({ ...productInfo, inputVoltage: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_inputVoltage", newLabel)}
                            placeholder="e.g. 100-240V AC"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Operating Temperature (°C)", "monitor_operatingTemp")}
                            value={(productInfo as any).operatingTemp}
                            onChange={(v) => setProductInfo({ ...productInfo, operatingTemp: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_operatingTemp", newLabel)}
                            placeholder="e.g. 5°C to 35°C"
                        />
                        <div className="md:col-span-2">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Power Consumption</h4>
                        </div>
                        <EditableFormInput
                            label={getFieldLabel("Maximum (W)", "monitor_powerMaximum")}
                            value={(productInfo as any).powerMaximum}
                            onChange={(v) => setProductInfo({ ...productInfo, powerMaximum: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_powerMaximum", newLabel)}
                            placeholder="e.g. 25W"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Typical (W)", "monitor_powerTypical")}
                            value={(productInfo as any).powerTypical}
                            onChange={(v) => setProductInfo({ ...productInfo, powerTypical: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_powerTypical", newLabel)}
                            placeholder="e.g. 18W"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Standby (W)", "monitor_powerStandby")}
                            value={(productInfo as any).powerStandby}
                            onChange={(v) => setProductInfo({ ...productInfo, powerStandby: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_powerStandby", newLabel)}
                            placeholder="e.g. 0.5W"
                        />
                    </div>
                    {renderCustomFields(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                </FormSection>

                {/* Dimensions and Weight for Monitors */}
                <FormSection
                    title={getSectionTitle("Dimensions and Weight", "dimensions")}
                    onAddSpec={() => addCustomField(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("dimensions", newTitle)}
                    onDelete={() => hideSection("dimensions")}
                    isDeleted={isSectionHidden("dimensions")}
                >
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Dimensions Without Stand (cm)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Width", "monitor_dimNoStandWidth")}
                                value={(productInfo as any).dimNoStandWidth}
                                onChange={(v) => setProductInfo({ ...productInfo, dimNoStandWidth: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_dimNoStandWidth", newLabel)}
                                placeholder="e.g. 53.84 cm"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Depth", "monitor_dimNoStandDepth")}
                                value={(productInfo as any).dimNoStandDepth}
                                onChange={(v) => setProductInfo({ ...productInfo, dimNoStandDepth: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_dimNoStandDepth", newLabel)}
                                placeholder="e.g. 4.61 cm"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Height", "monitor_dimNoStandHeight")}
                                value={(productInfo as any).dimNoStandHeight}
                                onChange={(v) => setProductInfo({ ...productInfo, dimNoStandHeight: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_dimNoStandHeight", newLabel)}
                                placeholder="e.g. 32.05 cm"
                            />
                        </div>

                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-4">Dimensions With Stand (cm)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableFormInput
                                label={getFieldLabel("Width", "monitor_dimWithStandWidth")}
                                value={(productInfo as any).dimWithStandWidth}
                                onChange={(v) => setProductInfo({ ...productInfo, dimWithStandWidth: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_dimWithStandWidth", newLabel)}
                                placeholder="e.g. 53.84 cm"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Depth", "monitor_dimWithStandDepth")}
                                value={(productInfo as any).dimWithStandDepth}
                                onChange={(v) => setProductInfo({ ...productInfo, dimWithStandDepth: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_dimWithStandDepth", newLabel)}
                                placeholder="e.g. 17.5 cm"
                            />
                            <EditableFormInput
                                label={getFieldLabel("Height", "monitor_dimWithStandHeight")}
                                value={(productInfo as any).dimWithStandHeight}
                                onChange={(v) => setProductInfo({ ...productInfo, dimWithStandHeight: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_dimWithStandHeight", newLabel)}
                                placeholder="e.g. 40.79 cm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <EditableFormInput
                                label={getFieldLabel("Weight (kg)", "monitor_weight")}
                                value={(productInfo as any).weight}
                                onChange={(v) => setProductInfo({ ...productInfo, weight: v } as ProductInfo)}
                                onLabelChange={(newLabel) => setFieldLabel("monitor_weight", newLabel)}
                                placeholder="e.g. 2.9 kg"
                            />
                        </div>
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
                </FormSection>

                {/* Warranty and Security */}
                <FormSection
                    title={getSectionTitle("Warranty and Security", "warranty")}
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
                            placeholder="e.g. 3 years"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Coverage", "warranty_coverage")}
                            value={productInfo.warranty?.coverage}
                            onChange={(v) => updateNestedField('warranty', 'coverage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("warranty_coverage", newLabel)}
                            placeholder="e.g. Onsite warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
                </FormSection>

                {/* In the Box */}
                <FormSection
                    title={getSectionTitle("In the Box", "inTheBox")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("inTheBox", newTitle)}
                    onDelete={() => hideSection("inTheBox")}
                    isDeleted={isSectionHidden("inTheBox")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Contents", "monitor_inTheBox")}
                            value={(productInfo as any).inTheBox}
                            onChange={(v) => setProductInfo({ ...productInfo, inTheBox: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_inTheBox", newLabel)}
                            placeholder="e.g. Monitor, Power Cable, HDMI Cable, User Manual"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>

                {/* Certifications */}
                <FormSection
                    title={getSectionTitle("Certifications", "certifications")}
                    onAddSpec={() => addCustomField(certificationsCustomFields, setCertificationsCustomFields, 'certificationsCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("certifications", newTitle)}
                    onDelete={() => hideSection("certifications")}
                    isDeleted={isSectionHidden("certifications")}
                >
                    <EditableFormInput
                        label={getFieldLabel("Certifications", "monitor_certifications")}
                        value={(productInfo as any).certifications}
                        onChange={(v) => setProductInfo({ ...productInfo, certifications: v } as ProductInfo)}
                        onLabelChange={(newLabel) => setFieldLabel("monitor_certifications", newLabel)}
                        placeholder="e.g. Energy Star, EPEAT, RoHS"
                    />
                    {renderCustomFields(certificationsCustomFields, setCertificationsCustomFields, 'certificationsCustomFields')}
                </FormSection>

                {/* Notes */}
                <FormSection
                    title={getSectionTitle("Notes", "notes")}
                    onAddSpec={() => addCustomField(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("notes", newTitle)}
                    onDelete={() => hideSection("notes")}
                    isDeleted={isSectionHidden("notes")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Included Cables", "monitor_includedCables")}
                            value={(productInfo as any).includedCables}
                            onChange={(v) => setProductInfo({ ...productInfo, includedCables: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("monitor_includedCables", newLabel)}
                            placeholder="e.g. HDMI Cable, Power Cable"
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
                            label={getFieldLabel("Connection Type", "keyboard_connectionType")}
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
                            value={(productInfo as any).micSensitivity}
                            onChange={(v) => setProductInfo({ ...productInfo, micSensitivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_micSensitivity", newLabel)}
                            placeholder="e.g. -42 dB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Microphone Type", "headphone_micType")}
                            value={(productInfo as any).micType}
                            onChange={(v) => setProductInfo({ ...productInfo, micType: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_micType", newLabel)}
                            placeholder="e.g. Boom, Built-in"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Sensitivity (speaker)", "headphone_speakerSensitivity")}
                            value={(productInfo as any).speakerSensitivity}
                            onChange={(v) => setProductInfo({ ...productInfo, speakerSensitivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_speakerSensitivity", newLabel)}
                            placeholder="e.g. 100 dB"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Speaker size", "headphone_speakerSize")}
                            value={(productInfo as any).speakerSize}
                            onChange={(v) => setProductInfo({ ...productInfo, speakerSize: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_speakerSize", newLabel)}
                            placeholder="e.g. 40 mm"
                        />
                    </div>
                    {renderCustomFields(audioCustomFields, setAudioCustomFields, 'audioCustomFields')}
                </FormSection>

                {/* Battery and Power */}
                <FormSection
                    title={getSectionTitle("Battery and Power", "batteryPower")}
                    onAddSpec={() => addCustomField(batteryCustomFields, setBatteryCustomFields, 'batteryCustomFields')}
                    onTitleChange={(newTitle) => setSectionTitle("batteryPower", newTitle)}
                    onDelete={() => hideSection("batteryPower")}
                    isDeleted={isSectionHidden("batteryPower")}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <EditableFormInput
                            label={getFieldLabel("Impedance", "headphone_impedance")}
                            value={(productInfo as any).impedance}
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
                            label={getFieldLabel("Frequency (MHz)", "headphone_frequency")}
                            value={(productInfo as any).frequency}
                            onChange={(v) => setProductInfo({ ...productInfo, frequency: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_frequency", newLabel)}
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
                            label={getFieldLabel("Minimum dimensions (W x D x H)", "headphone_dimensions")}
                            value={(productInfo as any).minDimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, minDimensions: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("headphone_dimensions", newLabel)}
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
                            label={getFieldLabel("Security management", "dock_security")}
                            value={(productInfo as any).securityManagement}
                            onChange={(v) => setProductInfo({ ...productInfo, securityManagement: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_security", newLabel)}
                            placeholder="e.g. Kensington lock slot"
                        />
                    </div>
                    {renderCustomFields(securityCustomFields, setSecurityCustomFields, 'securityCustomFields')}
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
                            value={(productInfo as any).minDimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, minDimensions: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_minDimensions", newLabel)}
                            placeholder="e.g. 200 x 100 x 30 mm"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Dimensions (W x D x H)", "dock_dimensions")}
                            value={(productInfo as any).dimensions}
                            onChange={(v) => setProductInfo({ ...productInfo, dimensions: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_dimensions", newLabel)}
                            placeholder="e.g. 205 x 105 x 35 mm"
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
                            placeholder="e.g. 250g"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
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
                            label={getFieldLabel("Ports", "dock_ports")}
                            value={(productInfo as any).ports}
                            onChange={(v) => setProductInfo({ ...productInfo, ports: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_ports", newLabel)}
                            placeholder="e.g. 3x USB-A, 2x USB-C, HDMI, Ethernet"
                        />
                    </div>
                    {renderCustomFields(portsCustomFields, setPortsCustomFields, 'portsCustomFields')}
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
                            placeholder="e.g. 1 year manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
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
                            value={(productInfo as any).whatsInBox}
                            onChange={(v) => setProductInfo({ ...productInfo, whatsInBox: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("dock_whatsInBox", newLabel)}
                            placeholder="e.g. 1x Dock, 1x Power Adapter, 1x USB-C Cable"
                        />
                    </div>
                    {renderCustomFields(basicCustomFields, setBasicCustomFields, 'basicCustomFields')}
                </FormSection>
            </>
        );
    }

    // USB Flash Drives specific fields rendering function
    function renderUSBFlashDrivesFields() {
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
                            placeholder="e.g. SDCZ430-064G"
                        />
                        <EditableFormInput
                            label={getFieldLabel("Series", "basic_series")}
                            value={productInfo.series}
                            onChange={(v) => updateField('series', v)}
                            onLabelChange={(newLabel) => setFieldLabel("basic_series", newLabel)}
                            placeholder="e.g. Ultra Series"
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
                            label={getFieldLabel("Recommended Usage", "usb_recommendedUsage")}
                            value={productInfo.recommendedUsage}
                            onChange={(v) => updateField('recommendedUsage', v)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_recommendedUsage", newLabel)}
                            placeholder="e.g. Data Storage, File Transfer"
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
                            label={getFieldLabel("Connectivity", "usb_connectivity")}
                            value={(productInfo as any).connectivity}
                            onChange={(v) => setProductInfo({ ...productInfo, connectivity: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_connectivity", newLabel)}
                            placeholder="e.g. USB 3.0, USB-C"
                        />
                    </div>
                    {renderCustomFields(connectivityCustomFields, setConnectivityCustomFields, 'connectivityCustomFields')}
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
                            label={getFieldLabel("Capacity native", "usb_capacity")}
                            value={(productInfo as any).capacityNative}
                            onChange={(v) => setProductInfo({ ...productInfo, capacityNative: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_capacity", newLabel)}
                            placeholder="e.g. 32GB, 64GB, 128GB"
                        />
                    </div>
                    {renderCustomFields(storageCustomFields, setStorageCustomFields, 'storageCustomFields')}
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
                            value={(productInfo as any).warranty}
                            onChange={(v) => setProductInfo({ ...productInfo, warranty: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_warranty", newLabel)}
                            placeholder="e.g. 5 years manufacturer warranty"
                        />
                    </div>
                    {renderCustomFields(warrantyCustomFields, setWarrantyCustomFields, 'warrantyCustomFields')}
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
                            label={getFieldLabel("Weight", "usb_weight")}
                            value={(productInfo as any).weight}
                            onChange={(v) => setProductInfo({ ...productInfo, weight: v } as ProductInfo)}
                            onLabelChange={(newLabel) => setFieldLabel("usb_weight", newLabel)}
                            placeholder="e.g. 10g"
                        />
                    </div>
                    {renderCustomFields(dimensionsCustomFields, setDimensionsCustomFields, 'dimensionsCustomFields')}
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
}
