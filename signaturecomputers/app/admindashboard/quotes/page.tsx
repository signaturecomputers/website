'use client';

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiMail, FiPhone, FiPackage, FiBriefcase, FiCalendar, FiCheck, FiX, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';

interface QuoteRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    category: string;
    productDetails: string;
    quantity: number;
    additionalInfo?: Record<string, string>;
    message?: string;
    status: 'pending' | 'contacted' | 'quoted' | 'closed';
    createdAt: string;
}

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    contacted: 'bg-blue-100 text-blue-700',
    quoted: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
};

export default function QuoteRequestsPage() {
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/quotes');
            const data = await response.json();

            if (response.ok) {
                setQuotes(data.quotes || []);
            } else {
                toast.error('Failed to fetch quotes');
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Failed to fetch quotes');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (quoteId: string, status: string) => {
        try {
            const response = await fetch('/api/quotes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: quoteId, status }),
            });

            if (response.ok) {
                setQuotes(prev => prev.map(q =>
                    q.id === quoteId ? { ...q, status: status as QuoteRequest['status'] } : q
                ));
                toast.success('Status updated');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredQuotes = statusFilter === 'all'
        ? quotes
        : quotes.filter(q => q.status === statusFilter);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quote Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {quotes.length} total requests • {quotes.filter(q => q.status === 'pending').length} pending
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button
                        onClick={fetchQuotes}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Quotes List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {filteredQuotes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiPackage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No quote requests found</p>
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {filteredQuotes.map(quote => (
                            <div key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                {/* Quote Row */}
                                <div
                                    className="p-4 cursor-pointer flex items-center justify-between gap-4"
                                    onClick={() => setExpandedQuote(expandedQuote === quote.id ? null : quote.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuote === quote.id ? 'rotate-180' : ''}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-800 dark:text-white">{quote.name}</span>
                                                {quote.companyName && (
                                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                                        <FiBriefcase className="w-3 h-3" /> {quote.companyName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {quote.category} • Qty: {quote.quantity} • {quote.productDetails.substring(0, 50)}...
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">{formatDate(quote.createdAt)}</span>
                                        <select
                                            value={quote.status}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                updateStatus(quote.id, e.target.value);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[quote.status]}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="quoted">Quoted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedQuote === quote.id && (
                                    <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Contact Info */}
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                                <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Contact Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FiMail className="w-4 h-4 text-gray-400" />
                                                        <a href={`mailto:${quote.email}`} className="text-blue-600 hover:underline">{quote.email}</a>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FiPhone className="w-4 h-4 text-gray-400" />
                                                        <a href={`tel:${quote.phone}`} className="text-blue-600 hover:underline">{quote.phone}</a>
                                                    </div>
                                                    <div className="flex gap-2 mt-3">
                                                        <a
                                                            href={`https://wa.me/${quote.phone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors"
                                                        >
                                                            <FaWhatsapp /> WhatsApp
                                                        </a>
                                                        <a
                                                            href={`mailto:${quote.email}?subject=Quote Request - ${quote.category}`}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                                                        >
                                                            <FiMail /> Email
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Details */}
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                                <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Product Requirements</h4>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="text-gray-500">Category:</span> <span className="font-medium">{quote.category}</span></p>
                                                    <p><span className="text-gray-500">Quantity:</span> <span className="font-medium">{quote.quantity}</span></p>
                                                    <p><span className="text-gray-500">Details:</span></p>
                                                    <p className="text-gray-700 dark:text-gray-300">{quote.productDetails}</p>
                                                </div>
                                            </div>

                                            {/* Additional Info */}
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                                                <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Additional Information</h4>
                                                {quote.additionalInfo && Object.keys(quote.additionalInfo).length > 0 ? (
                                                    <div className="space-y-1 text-sm">
                                                        {Object.entries(quote.additionalInfo).map(([key, value]) => (
                                                            <p key={key}>
                                                                <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                                                                <span className="font-medium">{value}</span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No additional details provided</p>
                                                )}
                                                {quote.message && (
                                                    <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                                        <p className="text-gray-500 text-xs mb-1">Message:</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{quote.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
