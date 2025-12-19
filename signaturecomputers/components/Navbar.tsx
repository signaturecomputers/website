'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import SearchDropdown from '@/components/SearchDropdown';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const router = useRouter();
    const { smoothScrollTo } = useSmoothScroll();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        setIsUserMenuOpen(false);
        router.push('/');
    };

    return (
        // NAVBAR STYLE: Sticky, Glassmorphism (transparent + blur)
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md h-20 flex flex-col justify-center">
            <div className="w-full px-4 sm:px-8 lg:px-12">
                <div className="flex items-center">

                    {/* 1. LEFT: Logo - Fixed Left with Specific Padding */}
                    <div className="flex-shrink-0 flex items-center pr-8 lg:pl-6">
                        <Link href="/" className="flex items-end group select-none">
                            {/* Stylized 'S' Image - Inline, Transparent Effect */}
                            <div className="relative w-8 h-8 -mr-1 mb-0.5 mix-blend-multiply flex-shrink-0">
                                <Image
                                    src="/logo-new-s.png"
                                    alt="S"
                                    fill
                                    className="object-contain object-bottom"
                                    priority
                                />
                            </div>
                            {/* Normal Text */}
                            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors leading-none">
                                ignature Computers
                            </span>
                        </Link>
                    </div>

                    {/* 2. CENTER SPACE: Search Bar - Between Logo and Nav */}
                    <div className="hidden lg:flex flex-1 justify-center px-4 md:px-8">
                        <form onSubmit={handleSearch} className="w-full max-w-md relative">
                            <input
                                type="text"
                                className="block w-full pl-5 pr-12 py-2.5 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all shadow-sm"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            <button type="submit" className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-blue-600 transition-colors">
                                <FiSearch className="h-5 w-5" />
                            </button>
                            <SearchDropdown
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                isOpen={isSearchFocused}
                                onClose={() => setIsSearchFocused(false)}
                            />
                        </form>
                    </div>

                    {/* 3. RIGHT: Nav Links + Icons - Pushed to the End */}
                    <div className="hidden lg:flex items-center space-x-6 ml-auto">
                        <nav className="flex space-x-6 items-center">
                            <Link href="/" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
                            <Link href="/products" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">Products</Link>
                            <a href="#about-us" onClick={(e) => smoothScrollTo(e, 'about-us')} className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">About Us</a>
                            {/* Hot Deals Color Fix: Removed red, now matches others */}
                            <Link href="/hot-deals" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">Hot Deals</Link>
                            <a href="#contact-footer" onClick={(e) => smoothScrollTo(e, 'contact-footer')} className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">Contact</a>
                        </nav>

                        <div className="flex items-center space-x-3 ml-6">
                            <div className="relative">
                                {user ? (
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 focus:outline-none transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] active:scale-95"
                                    >
                                        {user.displayName ? user.displayName[0].toUpperCase() : <FiUser className="text-lg" />}
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
                                        title="Login"
                                    >
                                        <FiUser className="text-lg" />
                                    </Link>
                                )}

                                {isUserMenuOpen && user && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform origin-top-right transition-all">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs text-gray-500">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                        </div>
                                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setIsUserMenuOpen(false)}>
                                            <FiUser className="text-gray-400" /> My Account
                                        </Link>
                                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setIsUserMenuOpen(false)}>
                                            <FiPackage className="text-gray-400" /> Orders
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1"
                                        >
                                            <FiLogOut /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/cart"
                                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
                            >
                                <FiShoppingCart className="text-lg" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm ring-2 ring-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    <div className="flex lg:hidden ml-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <FiX className="block h-6 w-6" /> : <FiMenu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 pb-4 shadow-lg absolute top-20 left-0 w-full">
                    <div className="px-4 pt-4 pb-2">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                className="block w-full pl-4 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            <SearchDropdown
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                isOpen={isSearchFocused}
                                onClose={() => { setIsSearchFocused(false); setIsOpen(false); }}
                            />
                        </form>
                    </div>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Home</Link>
                        <Link href="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Products</Link>
                        <a href="#about-us" onClick={(e) => { setIsOpen(false); smoothScrollTo(e, 'about-us'); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">About Us</a>
                        <Link href="/deals" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Hot Deals</Link>
                        <a href="#contact-footer" onClick={(e) => { setIsOpen(false); smoothScrollTo(e, 'contact-footer'); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Contact</a>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <Link href="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 flex items-center justify-between">
                                <span>Cart</span>
                                {cartCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                            </Link>
                            {user ? (
                                <>
                                    <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">My Account</Link>
                                    <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                                </>
                            ) : (
                                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
