'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCpu, FiMonitor, FiHardDrive, FiWifi, FiBattery, FiShield, FiPackage, FiAward, FiBox, FiCamera, FiSpeaker, FiSettings } from 'react-icons/fi';
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

// Collapsible section component
function InfoSection({
    title,
    icon: Icon,
    children,
    defaultOpen = false
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
                </div>
                {isOpen ? <FiChevronUp className="w-5 h-5 text-gray-500" /> : <FiChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-900">
                    {children}
                </div>
            )}
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

export default function ProductInfoSection({ productInfo, isAdmin = false }: ProductInfoSectionProps) {
    if (!productInfo || !hasContent(productInfo)) {
        return (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                No detailed product information available.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Basic Info */}
            {(productInfo.title || productInfo.series || productInfo.recommendedUsage || productInfo.idealFor?.length || (isAdmin && productInfo.partNo)) && (
                <InfoSection title="Product Overview" icon={FiPackage} defaultOpen={true}>
                    <dl>
                        <InfoRow label="Title" value={productInfo.title} />
                        {isAdmin && productInfo.partNo && (
                            <InfoRow label="Part Number" value={productInfo.partNo} />
                        )}
                        <InfoRow label="Series" value={productInfo.series} />
                        <InfoRow label="Recommended Usage" value={productInfo.recommendedUsage} />
                        {productInfo.idealFor && productInfo.idealFor.length > 0 && (
                            <InfoRow label="Ideal For" value={productInfo.idealFor.join(', ')} />
                        )}
                    </dl>
                </InfoSection>
            )}

            {/* Appearance */}
            {hasContent(productInfo.appearance) && (
                <InfoSection title="Appearance" icon={FiBox}>
                    <dl>
                        <InfoRow label="Color" value={productInfo.appearance?.color} />
                        <InfoRow label="Design" value={productInfo.appearance?.design} />
                        <InfoRow label="Form Factor" value={productInfo.appearance?.formFactor} />
                    </dl>
                </InfoSection>
            )}

            {/* Operating System */}
            {hasContent(productInfo.operatingSystem) && (
                <InfoSection title="Operating System" icon={FiSettings}>
                    <dl>
                        <InfoRow label="OS" value={productInfo.operatingSystem?.os} />
                    </dl>
                </InfoSection>
            )}

            {/* Processor */}
            {hasContent(productInfo.processor) && (
                <InfoSection title="Processor" icon={FiCpu} defaultOpen={true}>
                    <dl>
                        <InfoRow label="Processor Name" value={productInfo.processor?.name} />
                        <InfoRow label="Brand" value={productInfo.processor?.brand} />
                        <InfoRow label="Generation" value={productInfo.processor?.generation} />
                        <InfoRow label="Max Clock Speed" value={productInfo.processor?.maxClockSpeed} />
                        <InfoRow label="Cores" value={productInfo.processor?.cores} />
                        <InfoRow label="Threads" value={productInfo.processor?.threads} />
                        <InfoRow label="Cache" value={productInfo.processor?.cache} />
                        <InfoRow label="Technology" value={productInfo.processor?.technology} />
                        <InfoRow label="Chipset" value={productInfo.processor?.chipset} />
                    </dl>
                </InfoSection>
            )}

            {/* Memory */}
            {hasContent(productInfo.memory) && (
                <InfoSection title="Memory (RAM)" icon={FiHardDrive}>
                    <dl>
                        <InfoRow label="Capacity" value={productInfo.memory?.capacity} />
                        <InfoRow label="Type" value={productInfo.memory?.type} />
                        <InfoRow label="Speed" value={productInfo.memory?.speed} />
                        <InfoRow label="Layout" value={productInfo.memory?.layout} />
                    </dl>
                </InfoSection>
            )}

            {/* Storage */}
            {hasContent(productInfo.storage) && (
                <InfoSection title="Storage" icon={FiHardDrive}>
                    <dl>
                        {hasContent(productInfo.storage?.primaryStorage) && (
                            <>
                                <InfoRow label="Primary Storage Type" value={productInfo.storage?.primaryStorage?.type} />
                                <InfoRow label="Primary Storage Capacity" value={productInfo.storage?.primaryStorage?.capacity} />
                            </>
                        )}
                        {hasContent(productInfo.storage?.cloudStorage) && (
                            <>
                                <InfoRow label="Cloud Storage Service" value={productInfo.storage?.cloudStorage?.service} />
                                <InfoRow label="Cloud Storage Capacity" value={productInfo.storage?.cloudStorage?.capacity} />
                                <InfoRow label="Cloud Storage Duration" value={productInfo.storage?.cloudStorage?.duration} />
                            </>
                        )}
                    </dl>
                </InfoSection>
            )}

            {/* Display */}
            {hasContent(productInfo.display) && (
                <InfoSection title="Display" icon={FiMonitor} defaultOpen={true}>
                    <dl>
                        <InfoRow label="Size" value={productInfo.display?.size} />
                        <InfoRow label="Diagonal" value={productInfo.display?.diagonal} />
                        <InfoRow label="Resolution" value={productInfo.display?.resolution} />
                        <InfoRow label="Aspect Ratio" value={productInfo.display?.aspectRatio} />
                        <InfoRow label="Panel Type" value={productInfo.display?.panel} />
                        <InfoRow label="Brightness" value={productInfo.display?.brightness} />
                        <InfoRow label="Color Gamut" value={productInfo.display?.colorGamut} />
                        <InfoRow label="Anti-Glare" value={productInfo.display?.antiGlare} />
                        <InfoRow label="Touchscreen" value={productInfo.display?.touchscreen} />
                        <InfoRow label="Flicker-Free" value={productInfo.display?.flickerFree} />
                        <InfoRow label="Screen-to-Body Ratio" value={productInfo.display?.screenToBodyRatio} />
                    </dl>
                </InfoSection>
            )}

            {/* Graphics */}
            {hasContent(productInfo.graphics) && (
                <InfoSection title="Graphics" icon={FiMonitor}>
                    <dl>
                        <InfoRow label="GPU" value={productInfo.graphics?.gpu} />
                        <InfoRow label="Dedicated Graphics" value={productInfo.graphics?.dedicated} />
                    </dl>
                </InfoSection>
            )}

            {/* Audio & Input */}
            {hasContent(productInfo.audioAndInput) && (
                <InfoSection title="Audio & Input" icon={FiSpeaker}>
                    <dl>
                        <InfoRow label="Speakers" value={productInfo.audioAndInput?.speakers} />
                        <InfoRow label="Touchpad" value={productInfo.audioAndInput?.touchpad} />
                        {hasContent(productInfo.audioAndInput?.keyboard) && (
                            <>
                                <InfoRow label="Keyboard Type" value={productInfo.audioAndInput?.keyboard?.type} />
                                <InfoRow label="Backlit Keyboard" value={productInfo.audioAndInput?.keyboard?.backlit} />
                                <InfoRow label="Keyboard Color" value={productInfo.audioAndInput?.keyboard?.color} />
                            </>
                        )}
                    </dl>
                </InfoSection>
            )}

            {/* Connectivity */}
            {hasContent(productInfo.connectivity) && (
                <InfoSection title="Connectivity" icon={FiWifi}>
                    <dl>
                        <InfoRow label="WiFi" value={productInfo.connectivity?.wifi} />
                        <InfoRow label="Bluetooth" value={productInfo.connectivity?.bluetooth} />
                        <InfoRow label="Modern Standby" value={productInfo.connectivity?.modernStandby} />
                    </dl>
                </InfoSection>
            )}

            {/* Ports */}
            {hasContent(productInfo.ports) && (
                <InfoSection title="Ports & Connections" icon={FiSettings}>
                    <dl>
                        <InfoRow label="USB Type-C" value={productInfo.ports?.usbTypeC} />
                        <InfoRow label="USB Type-A" value={productInfo.ports?.usbTypeA} />
                        {hasContent(productInfo.ports?.hdmi) && (
                            <InfoRow
                                label="HDMI"
                                value={`${productInfo.ports?.hdmi?.count || 1}x HDMI ${productInfo.ports?.hdmi?.version || ''}`}
                            />
                        )}
                        <InfoRow label="Audio Jack" value={productInfo.ports?.audioJack} />
                        <InfoRow label="Power Port" value={productInfo.ports?.powerPort} />
                    </dl>
                </InfoSection>
            )}

            {/* Camera */}
            {hasContent(productInfo.camera) && (
                <InfoSection title="Camera" icon={FiCamera}>
                    <dl>
                        <InfoRow label="Webcam" value={productInfo.camera?.webcam} />
                        {productInfo.camera?.features && productInfo.camera.features.length > 0 && (
                            <InfoRow label="Features" value={productInfo.camera.features.join(', ')} />
                        )}
                    </dl>
                </InfoSection>
            )}

            {/* Battery & Power */}
            {hasContent(productInfo.batteryAndPower) && (
                <InfoSection title="Battery & Power" icon={FiBattery}>
                    <dl>
                        <InfoRow label="Battery Type" value={productInfo.batteryAndPower?.batteryType} />
                        <InfoRow label="Capacity" value={productInfo.batteryAndPower?.capacity} />
                        <InfoRow label="Charger" value={productInfo.batteryAndPower?.charger} />
                        <InfoRow label="Fast Charge" value={productInfo.batteryAndPower?.fastCharge} />
                    </dl>
                </InfoSection>
            )}

            {/* Security */}
            {hasContent(productInfo.security) && (
                <InfoSection title="Security" icon={FiShield}>
                    <dl>
                        <InfoRow label="TPM" value={productInfo.security?.tpm} />
                        <InfoRow label="Mic Mute Key" value={productInfo.security?.micMuteKey} />
                        <InfoRow label="Camera Privacy Shutter" value={productInfo.security?.cameraPrivacyShutter} />
                    </dl>
                </InfoSection>
            )}

            {/* Software */}
            {hasContent(productInfo.software) && productInfo.software?.preInstalled && productInfo.software.preInstalled.length > 0 && (
                <InfoSection title="Pre-installed Software" icon={FiPackage}>
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
            {hasContent(productInfo.dimensionsAndWeight) && (
                <InfoSection title="Dimensions & Weight" icon={FiBox}>
                    <dl>
                        {hasContent(productInfo.dimensionsAndWeight?.dimensions) && (
                            <>
                                <InfoRow label="Front Dimensions" value={productInfo.dimensionsAndWeight?.dimensions?.front} />
                                <InfoRow label="Rear Dimensions" value={productInfo.dimensionsAndWeight?.dimensions?.rear} />
                            </>
                        )}
                        <InfoRow label="Weight" value={productInfo.dimensionsAndWeight?.weight} />
                    </dl>
                </InfoSection>
            )}

            {/* Warranty */}
            {hasContent(productInfo.warranty) && (
                <InfoSection title="Warranty" icon={FiAward}>
                    <dl>
                        <InfoRow label="Duration" value={productInfo.warranty?.duration} />
                        <InfoRow label="Coverage" value={productInfo.warranty?.coverage} />
                        <InfoRow label="On-Site Service" value={productInfo.warranty?.onSiteService} />
                    </dl>
                </InfoSection>
            )}

            {/* Certifications */}
            {hasContent(productInfo.certifications) && (
                <InfoSection title="Certifications" icon={FiAward}>
                    <dl>
                        <InfoRow label="Energy Star" value={productInfo.certifications?.energyStar} />
                    </dl>
                </InfoSection>
            )}

            {/* Environmental */}
            {hasContent(productInfo.environmental) && (
                <InfoSection title="Environmental" icon={FiPackage}>
                    <dl>
                        <InfoRow label="Ocean-Bound Plastic" value={productInfo.environmental?.oceanBoundPlastic} />
                        <InfoRow label="Recycled Keycaps" value={productInfo.environmental?.recycledKeycaps} />
                    </dl>
                </InfoSection>
            )}
        </div>
    );
}
