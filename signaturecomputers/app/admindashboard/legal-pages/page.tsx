'use client';

import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiFileText, FiShield, FiRotateCcw } from 'react-icons/fi';
import { toast } from 'sonner';

interface LegalPage {
    id: string;
    title: string;
    content: string;
    lastUpdated?: string;
}

const defaultPages: LegalPage[] = [
    { id: 'terms', title: 'Terms & Conditions', content: '' },
    { id: 'privacy', title: 'Privacy Policy', content: '' },
    { id: 'returns', title: 'Return & Refund Policy', content: '' },
];

export default function LegalPagesAdmin() {
    const [pages, setPages] = useState<LegalPage[]>(defaultPages);
    const [activePage, setActivePage] = useState<string>('terms');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/legal-pages');
            const data = await response.json();

            if (response.ok && data.pages) {
                // Merge fetched pages with defaults
                const mergedPages = defaultPages.map(defaultPage => {
                    const fetchedPage = data.pages.find((p: LegalPage) => p.id === defaultPage.id);
                    return fetchedPage || defaultPage;
                });
                setPages(mergedPages);
            }
        } catch (error) {
            console.error('Error fetching legal pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentPage = pages.find(p => p.id === activePage);
            if (!currentPage) return;

            const response = await fetch('/api/legal-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentPage.id,
                    title: currentPage.title,
                    content: currentPage.content,
                }),
            });

            if (response.ok) {
                toast.success(`${currentPage.title} saved successfully!`);
                fetchPages();
            } else {
                toast.error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const updateContent = (content: string) => {
        setPages(prev => prev.map(p =>
            p.id === activePage ? { ...p, content } : p
        ));
    };

    const currentPage = pages.find(p => p.id === activePage);

    const getIcon = (id: string) => {
        switch (id) {
            case 'terms': return <FiFileText className="w-5 h-5" />;
            case 'privacy': return <FiShield className="w-5 h-5" />;
            case 'returns': return <FiRotateCcw className="w-5 h-5" />;
            default: return <FiFileText className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Legal Pages</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage Terms & Conditions, Privacy Policy, and Return Policy
                    </p>
                </div>
                <button
                    onClick={fetchPages}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Page Selection */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                            <h2 className="text-white font-semibold">Pages</h2>
                        </div>
                        <div className="p-2">
                            {pages.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setActivePage(page.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${activePage === page.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {getIcon(page.id)}
                                    <span className="font-medium">{page.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getIcon(activePage)}
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {currentPage?.title}
                                </h2>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <FiSave className={saving ? 'animate-pulse' : ''} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-500 mb-3">
                                Use Markdown formatting for headers, lists, and text styling.
                            </p>
                            <textarea
                                value={currentPage?.content || ''}
                                onChange={(e) => updateContent(e.target.value)}
                                className="w-full h-[500px] p-4 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                placeholder={`Enter ${currentPage?.title} content here...

Example format:
# Main Heading

## Section 1
Your content here...

## Section 2
More content...

- Bullet point 1
- Bullet point 2

**Bold text** and *italic text*`}
                            />
                            {currentPage?.lastUpdated && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Last updated: {new Date(currentPage.lastUpdated).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
