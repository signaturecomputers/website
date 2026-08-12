import Link from 'next/link';
import { Product } from '@/lib/products';
import { FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

export default function SEOProductTemplate({ product }: { product: Product }) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const getFAQs = () => {
        const isComputer = ['laptops', 'desktops', 'workstations'].includes(product.category);
        if (isComputer) {
            return [
                {
                    question: `Is the ${product.brand} ${product.name} good for professional office work?`,
                    answer: "Yes, this model is designed to handle demanding professional tasks efficiently. Its hardware configuration ensures smooth multitasking for business applications, heavy web browsing, and extensive office suite usage."
                },
                {
                    question: "Does it come with an official warranty?",
                    answer: `Yes, all our genuine ${product.brand} products include the standard manufacturer warranty. You can claim it at authorized service centers or contact our support for assistance.`
                },
                {
                    question: "Is this model upgradable in the future?",
                    answer: "Most enterprise and high-performance models allow RAM and Storage upgrades. Check the structured specifications above to see the maximum supported memory layout."
                }
            ];
        }

        return [
            {
                question: `Is the ${product.name} compatible with multiple devices?`,
                answer: "This product is designed with broad compatibility in mind, following standard industry protocols for seamless connection and usage."
            },
            {
                question: "Does it include a warranty?",
                answer: `Yes, it comes with an official ${product.brand} manufacturer warranty to ensure reliability and peace of mind.`
            },
            {
                question: "How quickly can this be delivered?",
                answer: "We offer priority dispatch for orders within Tamil Nadu and major cities across India. Standard delivery times apply for remote locations."
            }
        ];
    };

    const faqs = getFAQs();

    return (
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-12">
            
            {/* Unique Description Structure (Features, Usage, Benefits) */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Why Choose the {product.brand} {product.name}?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">Key Features & Benefits</h4>
                        <p>
                            Experience uncompromised quality with the <strong>{product.name}</strong>. Engineered by {product.brand}, 
                            this hardware is built to deliver exceptional performance, durability, and a seamless user experience. 
                            Its robust architecture ensures long-term reliability whether you're using it for daily operations, 
                            intensive workloads, or professional deployments.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2">Ideal Usage & Who Should Buy It</h4>
                        <p>
                            This product is highly recommended for users seeking a perfect balance of power 
                            and efficiency. If your daily requirements involve multitasking, secure business operations, or high-fidelity 
                            media consumption, the {product.name} provides exact specifications tailored for your demands. Upgrade your setup 
                            today for a productivity boost.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQs */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 mb-6">
                    Frequently Asked Questions about {product.name}
                </h3>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{faq.question}</span>
                                <FiChevronDown 
                                    className={`text-gray-500 transform transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} 
                                />
                            </button>
                            <div 
                                className={`px-4 text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                            >
                                <p className="pt-2 border-t border-gray-100 dark:border-gray-800">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Internal Links */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-sm text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Looking for more options? Explore related categories and find exactly what you need.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href={`/products?category=${product.category.toLowerCase()}`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        View All {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Link>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <Link href="/products" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Browse Full Catalog
                    </Link>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <Link href="/terms" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Warranty Terms
                    </Link>
                </div>
            </div>

        </div>
    );
}
