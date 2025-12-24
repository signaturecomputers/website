'use client';

import { useState } from 'react';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

interface CancellationModalProps {
    isOpen: boolean;
    orderId: string | null;
    userId: string | undefined;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CancellationModal({ isOpen, orderId, userId, onClose, onSuccess }: CancellationModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !orderId) return null;

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        setLoading(true);
        try {
            const response = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, customerId: userId, reason: reason.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                onSuccess();
            } else {
                alert(data.error || 'Failed to submit cancellation request');
            }
        } catch {
            alert('Error submitting request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Order</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Please provide a reason for cancellation. This helps us improve our service.
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter your reason for cancellation..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    autoFocus
                />
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason.trim() || loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
