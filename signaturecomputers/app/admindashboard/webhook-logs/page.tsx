'use client';

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheck, FiX, FiClock, FiDollarSign, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';

interface WebhookLog {
    id: string;
    type: string;
    data: any;
    receivedAt: string;
    processed: boolean;
    processedAt?: string;
}

export default function WebhookLogsPage() {
    const [logs, setLogs] = useState<WebhookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/webhook-logs');
            const data = await response.json();

            if (response.ok) {
                setLogs(data.logs || []);
            } else {
                console.error('Error fetching webhook logs:', data.error);
                toast.error(data.error || 'Failed to fetch webhook logs');
            }
        } catch (error) {
            console.error('Error fetching webhook logs:', error);
            toast.error('Failed to fetch webhook logs. The collection may not exist yet.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: string | null | undefined) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getTypeIcon = (type: string) => {
        if (type.includes('SUCCESS')) return <FiCheck className="text-green-500" />;
        if (type.includes('FAILED')) return <FiX className="text-red-500" />;
        if (type.includes('DROPPED')) return <FiAlertCircle className="text-yellow-500" />;
        if (type.includes('REFUND')) return <FiDollarSign className="text-purple-500" />;
        return <FiCreditCard className="text-blue-500" />;
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            'PAYMENT_SUCCESS_WEBHOOK': 'bg-green-100 text-green-700',
            'PAYMENT_FAILED_WEBHOOK': 'bg-red-100 text-red-700',
            'PAYMENT_USER_DROPPED_WEBHOOK': 'bg-yellow-100 text-yellow-700',
            'REFUND_STATUS_WEBHOOK': 'bg-purple-100 text-purple-700',
            'REFUND_PROCESSED_WEBHOOK': 'bg-teal-100 text-teal-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Webhook Logs
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View all incoming Cashfree webhook events (Orders, Payments, Refunds)
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiCreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No webhook logs found.</p>
                        <p className="text-sm mt-2">Webhook events will appear here when Cashfree sends them.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {logs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(log.type)}
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(log.type)}`}>
                                                    {log.type.replace('_WEBHOOK', '').replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono">
                                            {log.data?.order?.order_id || log.data?.refund?.order_id || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.data?.payment?.payment_status === 'SUCCESS' || log.data?.refund?.refund_status === 'SUCCESS'
                                                ? 'bg-green-100 text-green-700'
                                                : log.data?.payment?.payment_status === 'FAILED'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {log.data?.payment?.payment_status || log.data?.refund?.refund_status || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatDate(log.receivedAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.processed ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <FiCheck /> Yes
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <FiClock /> Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedLog === log.id && (
                                        <tr className="bg-gray-50 dark:bg-gray-900">
                                            <td colSpan={5} className="px-4 py-4">
                                                <div className="bg-gray-900 dark:bg-gray-950 text-green-400 p-4 rounded-lg overflow-auto max-h-96 font-mono text-xs">
                                                    <pre>{JSON.stringify(log.data, null, 2)}</pre>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    💡 Webhook Setup Guide
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                    <p><strong>To receive webhooks from Cashfree:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to your Cashfree Dashboard → Settings → Webhooks</li>
                        <li>Add webhook URL: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">{typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/cashfree/webhooks</code></li>
                        <li>Enable events: Payment Success, Payment Failed, Refund Status</li>
                        <li>For local testing, use ngrok: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">ngrok http 3000</code></li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
