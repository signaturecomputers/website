'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiFileText, FiShield, FiRotateCcw } from 'react-icons/fi';

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

// Simple markdown-like parser for basic formatting
function parseContent(content: string): string {
    if (!content) return '';

    return content
        // Headers
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-800 mt-8 mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-800 mt-8 mb-4">$1</h1>')
        // Bold and italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
        // Lists
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc list-inside text-gray-600 py-1">$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal list-inside text-gray-600 py-1">$1</li>')
        // Line breaks and paragraphs
        .replace(/\n\n/g, '</p><p class="text-gray-600 mb-4 leading-relaxed">')
        .replace(/\n/g, '<br />');
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
            case 'terms': return <FiFileText className="w-8 h-8" />;
            case 'privacy': return <FiShield className="w-8 h-8" />;
            case 'returns': return <FiRotateCcw className="w-8 h-8" />;
            default: return <FiFileText className="w-8 h-8" />;
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
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            {getIcon()}
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold">
                                {page?.title || defaultTitle}
                            </h1>
                            {page?.lastUpdated && (
                                <p className="text-gray-400 text-sm mt-2">
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

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
                    {page?.content ? (
                        <div
                            className="prose prose-gray max-w-none"
                            dangerouslySetInnerHTML={{
                                __html: `<p class="text-gray-600 mb-4 leading-relaxed">${parseContent(page.content)}</p>`
                            }}
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
                </div>

                {/* Navigation */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    {pageId !== 'terms' && (
                        <Link
                            href="/terms"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                        >
                            Terms & Conditions
                        </Link>
                    )}
                    {pageId !== 'privacy' && (
                        <Link
                            href="/privacy"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                        >
                            Privacy Policy
                        </Link>
                    )}
                    {pageId !== 'returns' && (
                        <Link
                            href="/returns"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                        >
                            Return & Refund Policy
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
