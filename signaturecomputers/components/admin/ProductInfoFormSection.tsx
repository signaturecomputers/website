'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { ProductInfo } from '@/lib/products';

interface ProductInfoFormSectionProps {
    productInfo: ProductInfo;
    setProductInfo: (info: ProductInfo) => void;
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

export default function ProductInfoFormSection({ productInfo, setProductInfo }: ProductInfoFormSectionProps) {
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

            {/* Basic Info */}
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
            </FormSection>

            {/* Appearance */}
            <FormSection
                title={getSectionTitle("Appearance", "appearance")}
                onAddSpec={() => addCustomField(appearanceCustomFields, setAppearanceCustomFields, 'appearanceCustomFields')}
                onTitleChange={(newTitle) => setSectionTitle("appearance", newTitle)}
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
            </FormSection>

            {/* Operating System */}
            <FormSection
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
            </FormSection>

            {/* Processor */}
            <FormSection
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
            </FormSection>

            {/* Memory */}
            <FormSection
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
            </FormSection>

            {/* Storage */}
            <FormSection
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
            </FormSection>

            {/* Display */}
            <FormSection
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
            </FormSection>

            {/* Graphics */}
            <FormSection
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
            </FormSection>

            {/* Audio & Input */}
            <FormSection
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
            </FormSection>

            {/* Connectivity */}
            <FormSection
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
            </FormSection>

            {/* Ports */}
            <FormSection
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
            </FormSection>

            {/* Camera */}
            <FormSection
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
            </FormSection>

            {/* Battery & Power */}
            <FormSection
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
            </FormSection>

            {/* Security */}
            <FormSection
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
            </FormSection>

            {/* Dimensions & Weight */}
            <FormSection
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
            </FormSection>

            {/* Certifications */}
            <FormSection
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
            </FormSection>

            {/* Environmental */}
            <FormSection
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
        </div>
    );
}
