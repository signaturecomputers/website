'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFileText, FiShield, FiRotateCcw, FiCheckCircle, FiPhone, FiMail, FiTruck } from 'react-icons/fi';

interface LegalPageContentProps {
    pageId: string;
    defaultTitle: string;
}

interface LegalPage {
    id: string;
    title: string;
    content: string;
    lastUpdated?: string;
}

// Enhanced content parser - properly escapes and formats content
function parseContent(content: string): string {
    if (!content) return '';

    let parsed = content
        // Escape any existing HTML first to prevent injection
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Section headers with numbered styling (e.g., "1. Business Information")
        .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="section-header"><span class="section-number">$1</span><span class="section-title">$2</span></div>')
        // Bold text **text**
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Email in brackets [email@domain.com]
        .replace(/\[([^\]]+@[^\]]+)\]/g, '<a href="mailto:$1" class="link-style">$1</a>')
        // Phone in brackets [98842 85858]
        .replace(/\[(\d{5}\s*\d{5})\]/g, '<a href="tel:+91$1" class="link-style">$1</a>')
        // URLs
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="link-style">$1</a>')
        // Bullet points - dash or bullet
        .replace(/^[-•]\s+(.+)$/gm, '<div class="bullet-item">$1</div>')
        // Key: Value pairs
        .replace(/^([A-Za-z][^:\n]{0,40}):\s*(.+)$/gm, '<div class="key-value"><span class="key">$1:</span> <span class="value">$2</span></div>')
        // Double newlines = paragraph break
        .replace(/\n\n/g, '</p><p class="paragraph">')
        // Single newlines = line break
        .replace(/\n/g, '<br />');

    return `<p class="paragraph">${parsed}</p>`;
}

export default function LegalPageContent({ pageId, defaultTitle }: LegalPageContentProps) {
    const [page, setPage] = useState<LegalPage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContent();
    }, [pageId]);

    const fetchContent = async () => {
        try {
            const response = await fetch('/api/legal-pages');
            const data = await response.json();

            if (response.ok && data.pages) {
                const foundPage = data.pages.find((p: LegalPage) => p.id === pageId);
                setPage(foundPage || null);
            }
        } catch (error) {
            console.error('Error fetching legal page:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = () => {
        switch (pageId) {
            case 'terms': return <FiFileText className="w-7 h-7" />;
            case 'privacy': return <FiShield className="w-7 h-7" />;
            case 'returns': return <FiRotateCcw className="w-7 h-7" />;
            case 'shipping-policy': return <FiTruck className="w-7 h-7" />;
            default: return <FiFileText className="w-7 h-7" />;
        }
    };

    const getSubtitle = () => {
        switch (pageId) {
            case 'terms': return 'Please read these terms carefully before using our services.';
            case 'privacy': return 'Your privacy is important to us. Learn how we protect your data.';
            case 'returns': return 'Our refund and cancellation policy for your orders.';
            case 'shipping-policy': return 'Information about our delivery areas, timelines, and shipping process.';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white py-8 sm:py-10">
                <div className="w-full px-4 sm:px-8 lg:px-12">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                                {page?.title || defaultTitle}
                            </h1>
                            <p className="text-gray-300 text-sm">
                                {getSubtitle()}
                            </p>
                            {page?.lastUpdated && (
                                <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                                    <FiCheckCircle className="w-3 h-3" />
                                    Last updated: {new Date(page.lastUpdated).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Badges - Only 2 badges, no returns */}
            <div className="w-full px-4 sm:px-8 lg:px-12 -mt-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-lg">
                    <div className="bg-white rounded-lg shadow-md p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">100% Secure</p>
                            <p className="text-gray-500 text-xs">Verified Business</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiShield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Data Protected</p>
                            <p className="text-gray-500 text-xs">SSL Encrypted</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - No card, blends with background */}
            <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
                {/* Company Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Signature Computers</h2>
                        <p className="text-gray-500 text-sm">Your Trusted Technology Partner</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <a href="tel:+919884285858" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                            <FiPhone className="w-4 h-4" />
                            <span>98842 85858</span>
                        </a>
                        <a href="mailto:saravanan@signaturecomputers.in" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                            <FiMail className="w-4 h-4" />
                            <span className="hidden sm:inline">saravanan@signaturecomputers.in</span>
                            <span className="sm:hidden">Email Us</span>
                        </a>
                    </div>
                </div>

                {/* Policy Content */}
                {page?.content ? (
                    <div
                        className="legal-content"
                        dangerouslySetInnerHTML={{ __html: parseContent(page.content) }}
                    />
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {getIcon()}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Content Coming Soon
                        </h2>
                        <p className="text-gray-500">
                            This page is currently being updated. Please check back later.
                        </p>
                    </div>
                )}

                {/* Contact Footer */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Questions about our policies?</p>
                            <p className="text-sm text-gray-500">We're here to help. Contact us anytime.</p>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href="tel:+919884285858"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <FiPhone className="w-4 h-4" />
                                Call Now
                            </a>
                            <a
                                href="mailto:saravanan@signaturecomputers.in"
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <FiMail className="w-4 h-4" />
                                Email
                            </a>
                        </div>
                    </div>
                </div>

                {/* Navigation to Other Policies */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-center text-gray-500 text-sm mb-4">Other Important Policies</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {pageId !== 'terms' && (
                            <Link
                                href="/terms"
                                className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <FiFileText className="w-4 h-4 text-blue-600" />
                                Terms & Conditions
                            </Link>
                        )}
                        {pageId !== 'privacy' && (
                            <Link
                                href="/privacy"
                                className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <FiShield className="w-4 h-4 text-blue-600" />
                                Privacy Policy
                            </Link>
                        )}
                        {pageId !== 'returns' && (
                            <Link
                                href="/returns"
                                className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <FiRotateCcw className="w-4 h-4 text-blue-600" />
                                Refund & Cancellation Policy
                            </Link>
                        )}
                        {pageId !== 'shipping-policy' && (
                            <Link
                                href="/shipping-delivery"
                                className="px-4 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <FiTruck className="w-4 h-4 text-blue-600" />
                                Shipping & Delivery Policy
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Styles for legal content */}
            <style jsx global>{`
                .legal-content {
                    color: #374151;
                    font-size: 0.95rem;
                    line-height: 1.75;
                }
                .legal-content .paragraph {
                    margin-bottom: 1rem;
                }
                .legal-content .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .legal-content .section-number {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    border-radius: 50%;
                    font-size: 0.875rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .legal-content .section-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1f2937;
                }
                .legal-content .key-value {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f3f4f6;
                }
                .legal-content .key {
                    font-weight: 600;
                    color: #374151;
                    min-width: 160px;
                    display: inline-block;
                }
                .legal-content .value {
                    color: #6b7280;
                }
                .legal-content .bullet-item {
                    padding-left: 1.5rem;
                    position: relative;
                    margin: 0.5rem 0;
                }
                .legal-content .bullet-item::before {
                    content: '';
                    position: absolute;
                    left: 0.25rem;
                    top: 0.625rem;
                    width: 0.375rem;
                    height: 0.375rem;
                    background-color: #2563eb;
                    border-radius: 50%;
                }
                .legal-content .link-style {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .legal-content .link-style:hover {
                    color: #1d4ed8;
                }
                .legal-content strong {
                    font-weight: 600;
                    color: #1f2937;
                }
            `}</style>
        </div>
    );
}
