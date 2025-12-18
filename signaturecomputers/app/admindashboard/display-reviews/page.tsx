'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiStar, FiTrash2, FiEdit2, FiX, FiPlus, FiEye, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';

interface DisplayReview {
    id: string;
    name: string;
    role: string;
    product: string;
    image: string;
    rating: number;
    text: string;
    order: number;
}

interface Feedback {
    id: string;
    userName: string;
    userEmail: string;
    rating: number;
    productName: string | null;
    review: string;
    createdAt: any;
}

const DEFAULT_REVIEWS: Omit<DisplayReview, 'id'>[] = [
    { name: "Arjun Verma", role: "IT Manager", product: "HP EliteBook 840 G8", image: "/hero-image-v2.png", rating: 5, text: "We procured 50 units for our sales team. The battery life is phenomenal, and the performance handling heavy CRM software is smooth. Signature Computers delivered on time with excellent packaging.", order: 0 },
    { name: "Sneha Reddy", role: "Graphic Designer", product: "HP ZBook Firefly", image: "/hero-image-v2.png", rating: 5, text: "Finally found a workstation that handles 4K rendering without heating up. The color accuracy on the display is exactly what I needed for my design work. Highly recommended!", order: 1 },
    { name: "Rajesh Kumar", role: "Small Business Owner", product: "HP ProDesk 400", image: "/hero-image-v2.png", rating: 4, text: "Great value for money for office desktops. Compact form factor saved us a lot of desk space. One unit had a minor scratch, but support replaced it immediately.", order: 2 },
    { name: "Meera Iyer", role: "Freelancer", product: "HP Envy 13", image: "/hero-image-v2.png", rating: 5, text: "Sleek, lightweight, and powerful. I travel a lot, and this laptop is perfect. The keyboard travel is just right for long typing sessions. Love the premium build quality.", order: 3 },
    { name: "Vikram Singh", role: "CTO", product: "HPE ProLiant Server", image: "/hero-image-v2.png", rating: 5, text: "Setting up our local server with Signature Computers was a breeze. They guided us on the exact specs needed for our workload. The server has been running 24/7 with zero downtime.", order: 4 },
    { name: "Ananya Gupta", role: "Student", product: "HP Pavilion 15", image: "/hero-image-v2.png", rating: 4, text: "Perfect for college assignments and light gaming. The screen is bright and clear. Delivery was super fast, got it the very next day!", order: 5 },
    { name: "Karthik Nair", role: "Software Engineer", product: "HP Omen 16", image: "/hero-image-v2.png", rating: 5, text: "Beast of a machine! Compiles my code in seconds and handles AAA games easily. The cooling system is impressive. Best purchase I've made this year.", order: 6 },
    { name: "Priya Sharma", role: "Architect", product: "HP DesignJet Plotter", image: "/hero-image-v2.png", rating: 5, text: "Crucial for our architectural prints. The line precision is unmatched. Signature Computers handled the installation and provided a great demo for our team.", order: 7 },
];

export default function DisplayReviewsPage() {
    const [reviews, setReviews] = useState<DisplayReview[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState<DisplayReview | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state for editing
    const [formName, setFormName] = useState('');
    const [formRole, setFormRole] = useState('');
    const [formProduct, setFormProduct] = useState('');
    const [formRating, setFormRating] = useState(5);
    const [formText, setFormText] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch display reviews
            const reviewsQuery = query(
                collection(db, 'display_reviews'),
                orderBy('order', 'asc')
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);

            if (reviewsSnapshot.empty) {
                // Seed default reviews
                for (const review of DEFAULT_REVIEWS) {
                    await addDoc(collection(db, 'display_reviews'), review);
                }
                // Fetch again
                const newSnapshot = await getDocs(reviewsQuery);
                const reviewList = newSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as DisplayReview[];
                setReviews(reviewList);
            } else {
                const reviewList = reviewsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as DisplayReview[];
                setReviews(reviewList);
            }

            // Fetch feedbacks
            const feedbacksQuery = query(
                collection(db, 'feedbacks'),
                orderBy('createdAt', 'desc')
            );
            const feedbacksSnapshot = await getDocs(feedbacksQuery);
            const feedbackList = feedbacksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Feedback[];
            setFeedbacks(feedbackList);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await deleteDoc(doc(db, 'display_reviews', id));
            setReviews(reviews.filter(r => r.id !== id));
            toast.success('Review deleted');
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const handleEdit = (review: DisplayReview) => {
        setEditingReview(review);
        setFormName(review.name);
        setFormRole(review.role);
        setFormProduct(review.product);
        setFormRating(review.rating);
        setFormText(review.text);
    };

    const handleSaveEdit = async () => {
        if (!editingReview) return;

        try {
            await updateDoc(doc(db, 'display_reviews', editingReview.id), {
                name: formName.trim(),
                role: formRole.trim(),
                product: formProduct.trim(),
                rating: formRating,
                text: formText.trim(),
            });

            setReviews(reviews.map(r =>
                r.id === editingReview.id
                    ? { ...r, name: formName.trim(), role: formRole.trim(), product: formProduct.trim(), rating: formRating, text: formText.trim() }
                    : r
            ));

            setEditingReview(null);
            resetForm();
            toast.success('Review updated');
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review');
        }
    };

    const handleAddFromFeedback = async (feedback: Feedback) => {
        try {
            const newReview = {
                name: feedback.userName,
                role: 'Customer',
                product: feedback.productName || 'General',
                image: '/hero-image-v2.png',
                rating: feedback.rating,
                text: feedback.review,
                order: reviews.length,
            };

            const docRef = await addDoc(collection(db, 'display_reviews'), newReview);
            setReviews([...reviews, { id: docRef.id, ...newReview }]);
            setShowAddModal(false);
            toast.success('Feedback added to Display Reviews!');
        } catch (error) {
            console.error('Error adding feedback:', error);
            toast.error('Failed to add feedback');
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormRole('');
        setFormProduct('');
        setFormRating(5);
        setFormText('');
    };

    const moveReview = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= reviews.length) return;

        const updatedReviews = [...reviews];
        [updatedReviews[index], updatedReviews[newIndex]] = [updatedReviews[newIndex], updatedReviews[index]];

        // Update order values
        try {
            for (let i = 0; i < updatedReviews.length; i++) {
                await updateDoc(doc(db, 'display_reviews', updatedReviews[i].id), { order: i });
                updatedReviews[i].order = i;
            }
            setReviews(updatedReviews);
        } catch (error) {
            console.error('Error reordering:', error);
            toast.error('Failed to reorder');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <FiEye className="text-blue-600" />
                        Display Reviews
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage reviews shown in "What Our Customers Say" section</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiPlus className="mr-2" />
                    Add Review
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FiEye className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">No display reviews yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review, index) => (
                        <div
                            key={review.id}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            {/* Reorder */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => moveReview(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => moveReview(index, 'down')}
                                    disabled={index === reviews.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    ▼
                                </button>
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                {review.name.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{review.name}</p>
                                    <span className="text-xs text-gray-500">• {review.role}</span>
                                </div>
                                <div className="flex gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FiStar
                                            key={star}
                                            size={12}
                                            className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{review.text}</p>
                                <p className="text-xs text-blue-600 mt-1">Product: {review.product}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(review)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal - Show Feedbacks List */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">
                                Select Feedback to Add
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">Click on a feedback to add it to Display Reviews</p>

                        <div className="flex-1 overflow-y-auto space-y-3">
                            {feedbacks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No feedbacks available. Customers need to submit feedback first.
                                </div>
                            ) : (
                                feedbacks.map((feedback) => (
                                    <div
                                        key={feedback.id}
                                        onClick={() => handleAddFromFeedback(feedback)}
                                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                                            {feedback.userName.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{feedback.userName}</p>
                                                <span className="text-xs text-gray-500">{feedback.userEmail}</span>
                                            </div>
                                            <div className="flex gap-0.5 mb-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FiStar
                                                        key={star}
                                                        size={12}
                                                        className={star <= feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{feedback.review}</p>
                                            {feedback.productName && (
                                                <p className="text-xs text-blue-600 mt-1">Product: {feedback.productName}</p>
                                            )}
                                        </div>

                                        {/* Add Icon */}
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <FiPlus size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold dark:text-white">Edit Review</h3>
                            <button
                                onClick={() => { setEditingReview(null); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role/Title</label>
                                <input
                                    type="text"
                                    value={formRole}
                                    onChange={(e) => setFormRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. IT Manager, Business Owner"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Purchased</label>
                                <input
                                    type="text"
                                    value={formProduct}
                                    onChange={(e) => setFormProduct(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="e.g. HP EliteBook 840"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <FiStar
                                                size={24}
                                                className={star <= formRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Text *</label>
                                <textarea
                                    value={formText}
                                    onChange={(e) => setFormText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                                    placeholder="Customer's review..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setEditingReview(null); resetForm(); }}
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
