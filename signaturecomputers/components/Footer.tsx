'use client';

import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-16">

                {/* GRID LAYOUT: 1 Col Mobile -> 2 Col Tablet -> 4 Col Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* COLUMN 1: Brand Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Signature Computers</h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Your trusted partner for genuine HP products and enterprise IT solutions. Authorized Distributor & Business Partner.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FiLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* COLUMN 2: Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Shop</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/products?category=laptops" className="hover:text-white transition-colors">Laptops</Link></li>
                            <li><Link href="/products?category=desktops" className="hover:text-white transition-colors">Desktops</Link></li>
                            <li><Link href="/products?category=workstations" className="hover:text-white transition-colors">Workstations</Link></li>
                            <li><Link href="/products?category=monitors" className="hover:text-white transition-colors">Monitors</Link></li>
                            <li><Link href="/products?category=printers" className="hover:text-white transition-colors">Printers</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3: Company */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/support" className="hover:text-white transition-colors">Support Center</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 4: Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <FiMapPin className="mt-1 flex-shrink-0" />
                                <span>
                                    123 Tech Park, IT Corridor,<br />
                                    Bangalore, India 560001
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiPhone className="flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FiMail className="flex-shrink-0" />
                                <span>sales@signaturecomputers.com</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {currentYear} Signature Computers. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Authorized HP Partner</span>
                        <span>Genuine Products</span>
                    </div>
                </div>

            </div>
        </footer>
    );
}
