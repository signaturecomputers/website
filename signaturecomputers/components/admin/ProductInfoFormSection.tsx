'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from 'react-icons/fi';
import { ProductInfo } from '@/lib/products';

interface ProductInfoFormSectionProps {
    productInfo: ProductInfo;
    setProductInfo: (info: ProductInfo) => void;
}

// Collapsible section for form groups
function FormSection({
    title,
    children,
    defaultOpen = false
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
                <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                {isOpen ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-900 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
}

// Text input component
function FormInput({
    label,
    value,
    onChange,
    placeholder,
    type = 'text'
}: {
    label: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'number';
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
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

// Checkbox component
function FormCheckbox({
    label,
    checked,
    onChange
}: {
    label: string;
    checked: boolean | undefined;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-center space-x-3 cursor-pointer">
            <input
                type="checkbox"
                checked={checked ?? false}
                onChange={(e) => onChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </label>
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

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold dark:text-white">Extended Product Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Fill in detailed product specifications. Empty fields will not be shown on the product page.
            </p>

            {/* Basic Info */}
            <FormSection title="Basic Product Info" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <FormInput
                            label="Product Title"
                            value={productInfo.title}
                            onChange={(v) => updateField('title', v)}
                            placeholder="e.g. HP Laptop 35.6 cm (14) 14-ep0342TU, Silver"
                        />
                    </div>
                    <FormInput
                        label="Part Number"
                        value={productInfo.partNo}
                        onChange={(v) => updateField('partNo', v)}
                        placeholder="e.g. BG6D5PA"
                    />
                    <FormInput
                        label="Series"
                        value={productInfo.series}
                        onChange={(v) => updateField('series', v)}
                        placeholder="e.g. HP Essentials"
                    />
                    <FormInput
                        label="Recommended Usage"
                        value={productInfo.recommendedUsage}
                        onChange={(v) => updateField('recommendedUsage', v)}
                        placeholder="e.g. Everyday computing"
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ideal For (comma-separated)</label>
                        <input
                            type="text"
                            value={productInfo.idealFor?.join(', ') ?? ''}
                            onChange={(e) => updateField('idealFor', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="e.g. Students, Professionals"
                            className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </FormSection>

            {/* Appearance */}
            <FormSection title="Appearance">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        label="Color"
                        value={productInfo.appearance?.color}
                        onChange={(v) => updateNestedField('appearance', 'color', v)}
                        placeholder="e.g. Natural Silver"
                    />
                    <FormInput
                        label="Design"
                        value={productInfo.appearance?.design}
                        onChange={(v) => updateNestedField('appearance', 'design', v)}
                        placeholder="e.g. Matte finish"
                    />
                    <FormInput
                        label="Form Factor"
                        value={productInfo.appearance?.formFactor}
                        onChange={(v) => updateNestedField('appearance', 'formFactor', v)}
                        placeholder="e.g. Standard laptop"
                    />
                </div>
            </FormSection>

            {/* Operating System */}
            <FormSection title="Operating System">
                <FormInput
                    label="OS"
                    value={productInfo.operatingSystem?.os}
                    onChange={(v) => updateNestedField('operatingSystem', 'os', v)}
                    placeholder="e.g. Windows 11 Home"
                />
            </FormSection>

            {/* Processor */}
            <FormSection title="Processor" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Processor Name"
                        value={productInfo.processor?.name}
                        onChange={(v) => updateNestedField('processor', 'name', v)}
                        placeholder="e.g. Intel Core i5-1334U"
                    />
                    <FormInput
                        label="Brand"
                        value={productInfo.processor?.brand}
                        onChange={(v) => updateNestedField('processor', 'brand', v)}
                        placeholder="e.g. Intel"
                    />
                    <FormInput
                        label="Generation"
                        value={productInfo.processor?.generation}
                        onChange={(v) => updateNestedField('processor', 'generation', v)}
                        placeholder="e.g. 13th Gen"
                    />
                    <FormInput
                        label="Max Clock Speed"
                        value={productInfo.processor?.maxClockSpeed}
                        onChange={(v) => updateNestedField('processor', 'maxClockSpeed', v)}
                        placeholder="e.g. 4.6 GHz"
                    />
                    <FormInput
                        label="Cores"
                        value={productInfo.processor?.cores}
                        onChange={(v) => updateNestedField('processor', 'cores', parseInt(v) || undefined)}
                        placeholder="e.g. 10"
                        type="number"
                    />
                    <FormInput
                        label="Threads"
                        value={productInfo.processor?.threads}
                        onChange={(v) => updateNestedField('processor', 'threads', parseInt(v) || undefined)}
                        placeholder="e.g. 12"
                        type="number"
                    />
                    <FormInput
                        label="Cache"
                        value={productInfo.processor?.cache}
                        onChange={(v) => updateNestedField('processor', 'cache', v)}
                        placeholder="e.g. 12 MB L3"
                    />
                    <FormInput
                        label="Technology"
                        value={productInfo.processor?.technology}
                        onChange={(v) => updateNestedField('processor', 'technology', v)}
                        placeholder="e.g. Intel Turbo Boost"
                    />
                    <FormInput
                        label="Chipset"
                        value={productInfo.processor?.chipset}
                        onChange={(v) => updateNestedField('processor', 'chipset', v)}
                        placeholder="e.g. Intel integrated SoC"
                    />
                </div>
            </FormSection>

            {/* Memory */}
            <FormSection title="Memory (RAM)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Capacity"
                        value={productInfo.memory?.capacity}
                        onChange={(v) => updateNestedField('memory', 'capacity', v)}
                        placeholder="e.g. 16 GB"
                    />
                    <FormInput
                        label="Type"
                        value={productInfo.memory?.type}
                        onChange={(v) => updateNestedField('memory', 'type', v)}
                        placeholder="e.g. DDR4"
                    />
                    <FormInput
                        label="Speed"
                        value={productInfo.memory?.speed}
                        onChange={(v) => updateNestedField('memory', 'speed', v)}
                        placeholder="e.g. 3200 MT/s"
                    />
                    <FormInput
                        label="Layout"
                        value={productInfo.memory?.layout}
                        onChange={(v) => updateNestedField('memory', 'layout', v)}
                        placeholder="e.g. 2 x 8 GB"
                    />
                </div>
            </FormSection>

            {/* Storage */}
            <FormSection title="Storage">
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Primary Storage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Type"
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
                            placeholder="e.g. PCIe NVMe M.2 SSD"
                        />
                        <FormInput
                            label="Capacity"
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
                            placeholder="e.g. 512 GB"
                        />
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-4">Cloud Storage</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Service"
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
                            placeholder="e.g. Dropbox"
                        />
                        <FormInput
                            label="Capacity"
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
                            placeholder="e.g. 25 GB"
                        />
                        <FormInput
                            label="Duration"
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
                            placeholder="e.g. 12 months"
                        />
                    </div>
                </div>
            </FormSection>

            {/* Display */}
            <FormSection title="Display" defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Size"
                        value={productInfo.display?.size}
                        onChange={(v) => updateNestedField('display', 'size', v)}
                        placeholder="e.g. 14 inch"
                    />
                    <FormInput
                        label="Resolution"
                        value={productInfo.display?.resolution}
                        onChange={(v) => updateNestedField('display', 'resolution', v)}
                        placeholder="e.g. FHD (1920 x 1080)"
                    />
                    <FormInput
                        label="Panel Type"
                        value={productInfo.display?.panel}
                        onChange={(v) => updateNestedField('display', 'panel', v)}
                        placeholder="e.g. Micro-edge"
                    />
                    <FormInput
                        label="Brightness"
                        value={productInfo.display?.brightness}
                        onChange={(v) => updateNestedField('display', 'brightness', v)}
                        placeholder="e.g. 250 nits"
                    />
                    <FormInput
                        label="Color Gamut"
                        value={productInfo.display?.colorGamut}
                        onChange={(v) => updateNestedField('display', 'colorGamut', v)}
                        placeholder="e.g. 62.5% sRGB"
                    />
                    <FormInput
                        label="Screen-to-Body Ratio"
                        value={productInfo.display?.screenToBodyRatio}
                        onChange={(v) => updateNestedField('display', 'screenToBodyRatio', v)}
                        placeholder="e.g. 84.01%"
                    />
                </div>
                <div className="flex flex-wrap gap-6 mt-4">
                    <FormCheckbox
                        label="Anti-Glare"
                        checked={productInfo.display?.antiGlare}
                        onChange={(v) => updateNestedField('display', 'antiGlare', v)}
                    />
                    <FormCheckbox
                        label="Touchscreen"
                        checked={productInfo.display?.touchscreen}
                        onChange={(v) => updateNestedField('display', 'touchscreen', v)}
                    />
                    <FormCheckbox
                        label="Flicker-Free"
                        checked={productInfo.display?.flickerFree}
                        onChange={(v) => updateNestedField('display', 'flickerFree', v)}
                    />
                </div>
            </FormSection>

            {/* Graphics */}
            <FormSection title="Graphics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="GPU"
                        value={productInfo.graphics?.gpu}
                        onChange={(v) => updateNestedField('graphics', 'gpu', v)}
                        placeholder="e.g. Intel Iris Xe Graphics"
                    />
                    <div className="flex items-end">
                        <FormCheckbox
                            label="Dedicated Graphics"
                            checked={productInfo.graphics?.dedicated}
                            onChange={(v) => updateNestedField('graphics', 'dedicated', v)}
                        />
                    </div>
                </div>
            </FormSection>

            {/* Audio & Input */}
            <FormSection title="Audio & Input">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Speakers"
                        value={productInfo.audioAndInput?.speakers}
                        onChange={(v) => updateNestedField('audioAndInput', 'speakers', v)}
                        placeholder="e.g. Dual speakers"
                    />
                    <FormInput
                        label="Touchpad"
                        value={productInfo.audioAndInput?.touchpad}
                        onChange={(v) => updateNestedField('audioAndInput', 'touchpad', v)}
                        placeholder="e.g. HP Imagepad"
                    />
                </div>
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Keyboard</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Type"
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
                            placeholder="e.g. Full-size"
                        />
                        <FormInput
                            label="Color"
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
                            placeholder="e.g. Soft grey"
                        />
                        <div className="flex items-end">
                            <FormCheckbox
                                label="Backlit"
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
                            />
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* Connectivity */}
            <FormSection title="Connectivity">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="WiFi"
                        value={productInfo.connectivity?.wifi}
                        onChange={(v) => updateNestedField('connectivity', 'wifi', v)}
                        placeholder="e.g. Wi-Fi 6 (2x2)"
                    />
                    <FormInput
                        label="Bluetooth"
                        value={productInfo.connectivity?.bluetooth}
                        onChange={(v) => updateNestedField('connectivity', 'bluetooth', v)}
                        placeholder="e.g. Bluetooth 5.4"
                    />
                </div>
                <div className="mt-4">
                    <FormCheckbox
                        label="Modern Standby"
                        checked={productInfo.connectivity?.modernStandby}
                        onChange={(v) => updateNestedField('connectivity', 'modernStandby', v)}
                    />
                </div>
            </FormSection>

            {/* Ports */}
            <FormSection title="Ports">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="USB Type-C"
                        value={productInfo.ports?.usbTypeC}
                        onChange={(v) => updateNestedField('ports', 'usbTypeC', v)}
                        placeholder="e.g. 1 x USB Type-C (5Gbps)"
                    />
                    <FormInput
                        label="USB Type-A"
                        value={productInfo.ports?.usbTypeA}
                        onChange={(v) => updateNestedField('ports', 'usbTypeA', v)}
                        placeholder="e.g. 2 x USB Type-A (5Gbps)"
                    />
                    <FormInput
                        label="HDMI Version"
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
                        placeholder="e.g. 1.4b"
                    />
                    <FormInput
                        label="HDMI Count"
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
                        placeholder="e.g. 1"
                        type="number"
                    />
                    <FormInput
                        label="Audio Jack"
                        value={productInfo.ports?.audioJack}
                        onChange={(v) => updateNestedField('ports', 'audioJack', v)}
                        placeholder="e.g. Headphone/Mic combo"
                    />
                    <FormInput
                        label="Power Port"
                        value={productInfo.ports?.powerPort}
                        onChange={(v) => updateNestedField('ports', 'powerPort', v)}
                        placeholder="e.g. AC Smart Pin"
                    />
                </div>
            </FormSection>

            {/* Camera */}
            <FormSection title="Camera">
                <div className="space-y-4">
                    <FormInput
                        label="Webcam"
                        value={productInfo.camera?.webcam}
                        onChange={(v) => updateNestedField('camera', 'webcam', v)}
                        placeholder="e.g. HP True Vision 1080p FHD"
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Features (comma-separated)</label>
                        <input
                            type="text"
                            value={productInfo.camera?.features?.join(', ') ?? ''}
                            onChange={(e) => updateNestedField('camera', 'features', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            placeholder="e.g. Noise Reduction, Dual-array mics"
                            className="w-full p-2.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </FormSection>

            {/* Battery & Power */}
            <FormSection title="Battery & Power">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Battery Type"
                        value={productInfo.batteryAndPower?.batteryType}
                        onChange={(v) => updateNestedField('batteryAndPower', 'batteryType', v)}
                        placeholder="e.g. 3-cell Li-ion polymer"
                    />
                    <FormInput
                        label="Capacity"
                        value={productInfo.batteryAndPower?.capacity}
                        onChange={(v) => updateNestedField('batteryAndPower', 'capacity', v)}
                        placeholder="e.g. 41 Wh"
                    />
                    <FormInput
                        label="Charger"
                        value={productInfo.batteryAndPower?.charger}
                        onChange={(v) => updateNestedField('batteryAndPower', 'charger', v)}
                        placeholder="e.g. 65 W AC adapter"
                    />
                    <FormInput
                        label="Fast Charge"
                        value={productInfo.batteryAndPower?.fastCharge}
                        onChange={(v) => updateNestedField('batteryAndPower', 'fastCharge', v)}
                        placeholder="e.g. 50% in 45 minutes"
                    />
                </div>
            </FormSection>

            {/* Security */}
            <FormSection title="Security">
                <div className="space-y-4">
                    <FormInput
                        label="TPM"
                        value={productInfo.security?.tpm}
                        onChange={(v) => updateNestedField('security', 'tpm', v)}
                        placeholder="e.g. Firmware TPM"
                    />
                    <div className="flex flex-wrap gap-6">
                        <FormCheckbox
                            label="Mic Mute Key"
                            checked={productInfo.security?.micMuteKey}
                            onChange={(v) => updateNestedField('security', 'micMuteKey', v)}
                        />
                        <FormCheckbox
                            label="Camera Privacy Shutter"
                            checked={productInfo.security?.cameraPrivacyShutter}
                            onChange={(v) => updateNestedField('security', 'cameraPrivacyShutter', v)}
                        />
                    </div>
                </div>
            </FormSection>

            {/* Dimensions & Weight */}
            <FormSection title="Dimensions & Weight">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                        label="Front Dimensions"
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
                        placeholder="e.g. 32.37 x 21.5 x 1.79 cm"
                    />
                    <FormInput
                        label="Rear Dimensions"
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
                        placeholder="e.g. 32.37 x 21.5 x 3.25 cm"
                    />
                    <FormInput
                        label="Weight"
                        value={productInfo.dimensionsAndWeight?.weight}
                        onChange={(v) => updateNestedField('dimensionsAndWeight', 'weight', v)}
                        placeholder="e.g. 1.41 kg"
                    />
                </div>
            </FormSection>

            {/* Warranty */}
            <FormSection title="Warranty">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Duration"
                        value={productInfo.warranty?.duration}
                        onChange={(v) => updateNestedField('warranty', 'duration', v)}
                        placeholder="e.g. 1 year"
                    />
                    <FormInput
                        label="Coverage"
                        value={productInfo.warranty?.coverage}
                        onChange={(v) => updateNestedField('warranty', 'coverage', v)}
                        placeholder="e.g. Parts and labor"
                    />
                </div>
                <div className="mt-4">
                    <FormCheckbox
                        label="On-Site Service"
                        checked={productInfo.warranty?.onSiteService}
                        onChange={(v) => updateNestedField('warranty', 'onSiteService', v)}
                    />
                </div>
            </FormSection>

            {/* Certifications */}
            <FormSection title="Certifications">
                <FormCheckbox
                    label="Energy Star Certified"
                    checked={productInfo.certifications?.energyStar}
                    onChange={(v) => updateNestedField('certifications', 'energyStar', v)}
                />
            </FormSection>

            {/* Environmental */}
            <FormSection title="Environmental">
                <div className="flex flex-wrap gap-6">
                    <FormCheckbox
                        label="Ocean-Bound Plastic"
                        checked={productInfo.environmental?.oceanBoundPlastic}
                        onChange={(v) => updateNestedField('environmental', 'oceanBoundPlastic', v)}
                    />
                    <FormCheckbox
                        label="Recycled Keycaps"
                        checked={productInfo.environmental?.recycledKeycaps}
                        onChange={(v) => updateNestedField('environmental', 'recycledKeycaps', v)}
                    />
                </div>
            </FormSection>
        </div>
    );
}
