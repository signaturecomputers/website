import Link from 'next/link';
import Image from 'next/image';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#0f172a] text-gray-300 border-t-0 mt-0 mb-0 pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-0">

                {/* GRID LAYOUT: 4 Columns on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* COLUMN 1: Brand Info & QR Code */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Signature Computers</h3>
                            <p className="text-sm leading-relaxed text-gray-400 mb-4">
                                Your trusted partner for genuine HP products and enterprise IT solutions.
                            </p>
                            <p className="text-sm font-semibold text-white/90">
                                Authorized HP Distributor & Business Partner
                            </p>
                        </div>

                        {/* WhatsApp QR */}
                        <div className="pt-2">
                            <div className="bg-white p-2 rounded-lg w-fit mb-2 shadow-lg">
                                <Image
                                    src="/images/whatsapp-qr.png"
                                    alt="WhatsApp QR Code"
                                    width={100}
                                    height={100}
                                    className="w-24 h-24 object-contain"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Scan to chat with us on WhatsApp</p>
                        </div>
                    </div>

                    {/* COLUMN 2: Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 border-b border-gray-700/50 pb-2 inline-block">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-white hover:pl-1 transition-all">About Us</Link></li>
                            <li><Link href="/products" className="hover:text-white hover:pl-1 transition-all">Products</Link></li>
                            <li><Link href="/contact" className="hover:text-white hover:pl-1 transition-all">Contact Us</Link></li>
                            <li><Link href="/hot-deals" className="hover:text-white hover:pl-1 transition-all">Hot Deals</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3: Policies */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 border-b border-gray-700/50 pb-2 inline-block">Policies</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/terms" className="hover:text-white hover:pl-1 transition-all">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-white hover:pl-1 transition-all">Privacy Policy</Link></li>
                            <li><Link href="/returns" className="hover:text-white hover:pl-1 transition-all">Return & Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 4: Contact & Social */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-6 border-b border-gray-700/50 pb-2 inline-block">Contact Details</h4>
                        <ul className="space-y-4 text-sm mb-8">
                            <li className="flex items-start gap-3">
                                <span className="font-semibold text-white w-20 shrink-0">Address:</span>
                                <span className="text-gray-400">
                                    Ground Floor, Sri Kalyan Square, 83/52 Pantheon Rd, Egmore, Chennai, Tamil Nadu 600008
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="font-semibold text-white w-20 shrink-0">Phone:</span>
                                <span className="text-gray-400">+91 98842 85858</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="font-semibold text-white w-20 shrink-0">Email:</span>
                                <span className="text-gray-400">sales@signaturecomputers.com</span>
                            </li>
                        </ul>

                        {/* Social Icons */}
                        <div className="flex space-x-5">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                                <FiInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                                <FiFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                                <FiLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-gray-700/50 mt-8 pt-4 pb-6 text-center text-sm text-gray-500">
                    <p>&copy; {currentYear} Signature Computers. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
}
