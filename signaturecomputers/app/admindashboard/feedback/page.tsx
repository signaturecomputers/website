'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, orderBy, query, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiStar, FiTrash2, FiEdit2, FiX, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

interface Feedback {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    productName: string | null;
    review: string;
    createdAt: any;
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
    const [editRating, setEditRating] = useState(0);
    const [editReview, setEditReview] = useState('');
    const [editProductName, setEditProductName] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const feedbacksQuery = query(
                collection(db, 'feedbacks'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(feedbacksQuery);
            const feedbackList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Feedback[];
            setFeedbacks(feedbackList);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            toast.error('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;

        try {
            await deleteDoc(doc(db, 'feedbacks', id));
            setFeedbacks(feedbacks.filter(f => f.id !== id));
            toast.success('Feedback deleted');
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast.error('Failed to delete feedback');
        }
    };

    const handleEdit = (feedback: Feedback) => {
        setEditingFeedback(feedback);
        setEditRating(feedback.rating);
        setEditReview(feedback.review);
        setEditProductName(feedback.productName || '');
    };

    const handleSaveEdit = async () => {
        if (!editingFeedback) return;

        try {
            await updateDoc(doc(db, 'feedbacks', editingFeedback.id), {
                rating: editRating,
                review: editReview.trim(),
                productName: editProductName.trim() || null,
            });

            setFeedbacks(feedbacks.map(f =>
                f.id === editingFeedback.id
                    ? { ...f, rating: editRating, review: editReview.trim(), productName: editProductName.trim() || null }
                    : f
            ));

            setEditingFeedback(null);
            toast.success('Feedback updated');
        } catch (error) {
            console.error('Error updating feedback:', error);
            toast.error('Failed to update feedback');
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddToDisplay = async (feedback: Feedback) => {
        try {
            // Get current count of display reviews
            const displayQuery = query(collection(db, 'display_reviews'));
            const displaySnapshot = await getDocs(displayQuery);
            const order = displaySnapshot.size;

            await addDoc(collection(db, 'display_reviews'), {
                name: feedback.userName,
                role: 'Customer',
                product: feedback.productName || 'General',
                image: '/hero-image-v2.png',
                rating: feedback.rating,
                text: feedback.review,
                order: order,
            });

            toast.success('Added to Display Reviews!');
        } catch (error) {
            console.error('Error adding to display:', error);
            toast.error('Failed to add to display reviews');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <FiMessageSquare className="text-blue-600" />
                    Customer Feedback
                </h1>
                <p className="text-sm text-gray-500 mt-1">View and manage customer reviews and feedback</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading feedbacks...</div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FiMessageSquare className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">No feedback received yet</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Review</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {feedbacks.map((feedback) => (
                                    <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{feedback.userName}</p>
                                                <p className="text-xs text-gray-500">{feedback.userEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FiStar
                                                        key={star}
                                                        size={14}
                                                        className={star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {feedback.productName || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 max-w-xs">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate" title={feedback.review}>
                                                {feedback.review || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(feedback.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddToDisplay(feedback)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Add to Display Reviews"
                                                >
                                                    <FiPlus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(feedback)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(feedback.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">Edit Feedback</h3>
                            <button onClick={() => setEditingFeedback(null)} className="text-gray-400 hover:text-gray-600">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Customer: <span className="font-medium text-gray-700 dark:text-gray-300">{editingFeedback.userName}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <FiStar
                                                size={24}
                                                className={star <= editRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={editProductName}
                                    onChange={(e) => setEditProductName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Product name (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review</label>
                                <textarea
                                    value={editReview}
                                    onChange={(e) => setEditReview(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                                    placeholder="Review text"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingFeedback(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
