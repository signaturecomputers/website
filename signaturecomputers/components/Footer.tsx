'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiFacebook, FiInstagram, FiStar } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { smoothScrollTo } = useSmoothScroll();

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [productName, setProductName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [validationError, setValidationError] = useState('');

    // Check for URL params from 'Write a Review' button and clear them after reading
    // This ensures refresh shows a clean form
    useEffect(() => {
        if (typeof window !== 'undefined' && !loading) {
            // Check for URL params from Write a Review button
            const urlParams = new URLSearchParams(window.location.search);
            const feedbackParam = urlParams.get('feedback');
            const productParam = urlParams.get('product');

            if (feedbackParam === 'true' && productParam) {
                // Auto-fill product name from URL (one-time only)
                setProductName(productParam);

                // Clear URL params so refresh shows empty form
                // Use replaceState to remove params without page reload
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);

                // Scroll to feedback section after a short delay
                setTimeout(() => {
                    const feedbackSection = document.getElementById('feedback');
                    if (feedbackSection) {
                        feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
                return; // Don't restore draft if coming from orders page
            }

            // For normal visits, don't restore draft - start fresh
            // Only restore draft if user was in middle of writing and logged in
            const draft = sessionStorage.getItem('review_draft');

            if (user && draft) {
                // Restore state only if there's a pending draft (user was redirected to login)
                try {
                    const { rating: savedRating, review: savedReview, productName: savedProduct } = JSON.parse(draft);
                    if (savedRating) setRating(Number(savedRating));
                    if (savedReview) setReview(savedReview);
                    if (savedProduct) setProductName(savedProduct);
                    // Clear draft after restoring to prevent showing on next refresh
                    sessionStorage.removeItem('review_draft');
                } catch (e) {
                    console.error("Failed to parse review draft", e);
                    sessionStorage.removeItem('review_draft');
                }
            } else if (!user) {
                // Clean slate for non-logged-in user
                setRating(0);
                setReview('');
                setProductName('');
                sessionStorage.removeItem('review_draft');
            }
        }
    }, [user, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        // 1. Validation: Require at least Rating OR Review
        if (rating === 0 && !review.trim()) {
            setValidationError('Please add a rating or a short feedback to submit.');
            return;
        }

        // 2. Auth Check
        if (!user) {
            // Save draft
            sessionStorage.setItem('review_draft', JSON.stringify({ rating, review, productName }));
            // Redirect to login
            const redirectUrl = encodeURIComponent(`${pathname}#contact-footer`);
            router.push(`/login?reason=feedback&redirect=${redirectUrl}`);
            return;
        }

        // 3. Submit to Firestore
        try {
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            await addDoc(collection(db, 'feedbacks'), {
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                userEmail: user.email || '',
                rating: rating,
                productName: productName.trim() || null,
                review: review.trim(),
                createdAt: serverTimestamp(),
            });

            setIsSubmitted(true);
            sessionStorage.removeItem('review_draft'); // Clear draft on success
            // Reset form after delay
            setTimeout(() => {
                setRating(0);
                setReview('');
                setProductName('');
                setIsSubmitted(false); // Allow writing another review
            }, 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setValidationError('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <footer id="contact-footer" className="w-full bg-[#0f172a] text-gray-300 border-t-0 mt-0 mb-0 pb-0">
            <div className="w-full px-4 sm:px-8 lg:px-12 pt-10 pb-4">

                {/* LAYOUT: Grid on Mobile/Tablet, Flex on Desktop for Uniform Visual Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:items-start lg:gap-14">

                    {/* COLUMN 1: Brand Info & QR Code */}
                    <div className="space-y-6 lg:w-[22%] lg:shrink-0">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-3">Signature Computers</h3>
                            <p className="text-sm leading-relaxed text-gray-400 mb-2">
                                Your trusted partner for genuine HP products and enterprise IT solutions.
                            </p>
                            <p className="text-sm leading-relaxed text-gray-400">
                                For bulk orders, special pricing, or latest HP models, feel free to reach out to us.
                            </p>
                        </div>

                        {/* WhatsApp QR (Moved Below Text) */}
                        <div className="pt-1">
                            <div className="bg-white p-1.5 rounded-lg w-fit mb-2 shadow-lg">
                                <Image
                                    src="/images/whatsapp-qr.jpg"
                                    alt="WhatsApp QR Code"
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Scan to chat on WhatsApp</p>
                        </div>
                    </div>

                    {/* COLUMN 2: Quick Links */}
                    <div className="lg:shrink-0">
                        <h4 className="text-base font-bold text-white mb-4 border-b border-gray-700/50 pb-1 inline-block">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#about-us" onClick={(e) => smoothScrollTo(e, 'about-us')} className="hover:text-white hover:pl-1 transition-all cursor-pointer">About Us</a></li>
                            <li><Link href="/products" className="hover:text-white hover:pl-1 transition-all">Products</Link></li>
                            <li><a href="#contact-footer" onClick={(e) => smoothScrollTo(e, 'contact-footer')} className="hover:text-white hover:pl-1 transition-all cursor-pointer">Contact Us</a></li>
                            <li><Link href="/hot-deals" className="hover:text-white hover:pl-1 transition-all">Hot Deals</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3: Policies */}
                    <div className="lg:shrink-0">
                        <h4 className="text-base font-bold text-white mb-4 border-b border-gray-700/50 pb-1 inline-block">Policies</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/terms" className="hover:text-white hover:pl-1 transition-all">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-white hover:pl-1 transition-all">Privacy Policy</Link></li>
                            <li><Link href="/returns" className="hover:text-white hover:pl-1 transition-all">Refund & Cancellation Policy</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 4: Contact & Social */}
                    <div className="lg:shrink-0 lg:w-[20%]">
                        <h4 className="text-base font-bold text-white mb-4 border-b border-gray-700/50 pb-1 inline-block">Contact Details</h4>
                        <ul className="space-y-3 text-sm mb-6">
                            <li className="flex items-start gap-2">
                                <span className="font-semibold text-white w-14 shrink-0">Address:</span>
                                <a
                                    href="https://www.google.com/maps/place/Signature+Computers/@13.0710033,80.2585252,17z/data=!4m6!3m5!1s0x3a52675efd7779d9:0x420c995a1a14c9d9!8m2!3d13.0709244!4d80.2586496!16s%2Fg%2F11q581pf3v"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white hover:underline transition-colors"
                                >
                                    Ground Floor, Sri Kalyan Square, 83/52 Pantheon Rd, Egmore, Chennai, Tamil Nadu 600008
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-semibold text-white w-14 shrink-0">Phone:</span>
                                <a
                                    href="tel:+919884285858"
                                    className="text-gray-400 hover:text-white hover:underline transition-colors"
                                >
                                    +91 98842 85858
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-semibold text-white w-14 shrink-0">Email:</span>
                                <a
                                    href="mailto:sales@signaturecomputers.com"
                                    className="text-gray-400 hover:text-white hover:underline transition-colors"
                                >
                                    sales@signaturecomputers.com
                                </a>
                            </li>
                        </ul>

                        {/* Social Icons */}
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/signaturecomputers2/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                                <FiInstagram size={18} />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=100089983478161" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                                <FiFacebook size={18} />
                            </a>
                            <a href="https://wa.me/919884285858" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors transform hover:scale-110 duration-200">
                                <FaWhatsapp size={18} />
                            </a>
                        </div>
                    </div>

                    {/* COLUMN 5: Your Experience (Access Controlled) */}
                    <div id="feedback" className="lg:flex-1 lg:max-w-xs lg:ml-8">
                        <h4 className="text-base font-bold text-white mb-4 border-b border-gray-700/50 pb-1 inline-block">Your Experience</h4>

                        {isSubmitted ? (
                            <div className="text-center py-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                <div className="inline-block p-2 bg-green-500/20 rounded-full mb-2">
                                    <FiStar className="text-green-400 fill-current" size={24} />
                                </div>
                                <p className="text-base font-medium text-white">Thank you!</p>
                                <p className="text-sm text-gray-400 mt-1">Your feedback has been submitted.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Star Rating */}
                                <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="focus:outline-none transition-transform hover:scale-110"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onClick={() => setRating(star)}
                                        >
                                            <FiStar
                                                size={20}
                                                className={`${star <= (hoveredStar || rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-600'
                                                    } transition-colors`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Product Name (Optional) */}
                                <input
                                    type="text"
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                                    placeholder="Product name (optional)"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                />

                                {/* Text Area */}
                                <textarea
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-md p-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none"
                                    rows={3}
                                    placeholder="Share your experience (optional)"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                ></textarea>

                                {validationError && (
                                    <p className="text-xs text-red-400 animate-pulse">{validationError}</p>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition-colors"
                                >
                                    Submit Feedback
                                </button>
                            </form>
                        )}
                    </div>

                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-gray-700/50 mt-10 pt-6 pb-2 text-center text-xs text-gray-500">
                    <p>
                        &copy; {currentYear} Signature Computers. All rights reserved.
                        <span className="mx-2 text-gray-600">|</span>
                        Authorized HP Partner
                        <span className="mx-2 text-gray-600">|</span>
                        Genuine Products
                    </p>
                </div>

            </div>
        </footer>
    );
}
