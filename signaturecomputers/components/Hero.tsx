import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';

export default function Hero() {
    return (
        <div className="relative bg-white overflow-hidden">
            {/* ALIGNMENT: Full width to match Navbar */}
            <div className="w-full">

                {/* GAP CONTROL: pt-20 push down */}
                <div className="relative z-10 bg-white pb-8 lg:pb-16 pt-16 lg:pt-24">

                    {/* Main Layout */}
                    <main className="mt-0 w-full px-4 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-0">

                        {/* 
               LEFT: Text Content
               - lg:w-[58%]: End point aligns with Search Bar end
               - Alignment: Matches Logo (pl-6 effect)
            */}
                        <div className="flex-1 lg:flex-none lg:w-[58%] sm:text-center lg:text-left z-20 pl-0 lg:pl-6 self-center pr-8">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-blue-700 bg-blue-100 mb-4 uppercase">
                                HP Direct Dealer & Distributor
                            </span>
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                                Your Complete <br className="hidden lg:block" />
                                <span className="text-blue-600">Computer Solutions</span>
                            </h1>
                            <p className="mt-2 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-2xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 mb-8 font-light leading-relaxed">
                                From laptops to workstations, printers to CCTV systems – we provide premium technology solutions for homes and businesses.
                            </p>

                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                <div className="rounded-md shadow">
                                    <Link href="/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all hover:shadow-lg">
                                        <FiShoppingCart className="mr-2" /> Shop Now
                                    </Link>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-3">
                                    <Link href="/contact" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                                        Get Quote
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* 
               RIGHT: Image Content 
               - lg:w-[42%]: Starts exactly where Text ends
               - justify-start: Image strictly left-aligned in this col
            */}
                        <div className="flex-1 lg:flex-none lg:w-[42%] w-full relative flex items-start justify-start mt-6 lg:mt-0">
                            <div className="relative w-full max-w-lg lg:max-w-none h-auto">
                                {/* High Clarity Image Settings */}
                                <Image
                                    src="/hero-image-new.png"
                                    alt="Signature Computers Hero - PCs and Laptops"
                                    width={800}
                                    height={600}
                                    priority
                                    quality={100}
                                    unoptimized
                                    className="w-full h-auto object-contain object-left"
                                />
                            </div>
                        </div>

                    </main>
                </div>
            </div>
        </div>
    );
}
