import Image from 'next/image';

const BRANDS = [
    { name: 'HP Authorized Distributor', src: '/brands/hp-authorized.png' },
    { name: 'HP Amplify', src: '/brands/hp-amplify.png' },
    { name: 'Hewlett Packard Enterprise', src: '/brands/hpe.png' },
    { name: 'HP Business Partner', src: '/brands/hp-business-partner.png' },
    { name: 'Poly', src: '/brands/poly.png' },
    { name: 'Nvidia', src: '/brands/nvidia.png' },
    { name: 'Seagate', src: '/brands/seagate.png' },
    { name: 'Western Digital', src: '/brands/wd.png' },
    { name: 'AMD', src: '/brands/amd-updated.png' },
    { name: 'Intel', src: '/brands/intel-logo-final.png' },
];

export default function BrandMarquee() {
    return (
        <section className="w-full bg-white border-t border-gray-100 py-10 overflow-hidden">
            <div className="flex w-full">
                {/* 
                  Wrapper for the infinite track 
                  - animate-scroll-pause: defined in globals.css (stepped keyframes)
                  - min-w-max: ensures children define width
                */}
                <div className="flex animate-scroll-pause min-w-max items-center">
                    {/* First Set of Logos */}
                    <div className="flex items-center gap-16 mx-8">
                        {BRANDS.map((brand, idx) => (
                            <div key={`b1-${idx}`} className="relative h-16 w-32 md:w-40 flex-shrink-0 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src={brand.src}
                                    alt={brand.name}
                                    fill
                                    priority={false}
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Duplicate Set for Seamless Loop (Target -50% matches end of this set) */}
                    <div className="flex items-center gap-16 mx-8">
                        {BRANDS.map((brand, idx) => (
                            <div key={`b2-${idx}`} className="relative h-16 w-32 md:w-40 flex-shrink-0 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src={brand.src}
                                    alt={brand.name}
                                    fill
                                    priority={false}
                                    className="object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
