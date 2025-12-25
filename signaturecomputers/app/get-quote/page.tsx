'use client';

import React, { useState } from 'react';
import { FiPackage, FiMail, FiPhone, FiBriefcase, FiCheckCircle, FiUser, FiMessageSquare, FiHash } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';

const categories = [
    { id: 'laptops', name: 'Laptops', fields: ['processor', 'ram', 'storage', 'screenSize'] },
    { id: 'desktops', name: 'Desktops', fields: ['processor', 'ram', 'storage', 'graphics'] },
    { id: 'monitors', name: 'Monitors', fields: ['screenSize', 'resolution', 'panelType'] },
    { id: 'printers', name: 'Printers', fields: ['printerType', 'printSpeed', 'connectivity'] },
    { id: 'bags', name: 'Bags & Cases', fields: ['bagType', 'laptopSize', 'material'] },
    { id: 'keyboards', name: 'Keyboards', fields: ['keyboardType', 'connectivity', 'backlight'] },
    { id: 'mice', name: 'Mouse', fields: ['mouseType', 'connectivity', 'dpi'] },
    { id: 'headphones', name: 'Headphones', fields: ['headphoneType', 'connectivity', 'microphone'] },
    { id: 'accessories', name: 'Other Accessories', fields: [] },
];

const fieldLabels: Record<string, string> = {
    processor: 'Preferred Processor',
    ram: 'RAM Requirement',
    storage: 'Storage Requirement',
    screenSize: 'Screen Size',
    graphics: 'Graphics Card',
    resolution: 'Resolution',
    panelType: 'Panel Type',
    printerType: 'Printer Type',
    printSpeed: 'Print Speed Requirement',
    connectivity: 'Connectivity',
    bagType: 'Bag Type',
    laptopSize: 'Laptop Size',
    material: 'Material Preference',
    keyboardType: 'Keyboard Type',
    backlight: 'Backlight',
    mouseType: 'Mouse Type',
    dpi: 'DPI Requirement',
    headphoneType: 'Headphone Type',
    microphone: 'Microphone',
};

const fieldOptions: Record<string, string[]> = {
    processor: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core Ultra 5', 'Intel Core Ultra 7', 'Intel Core Ultra 9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Any'],
    ram: ['8GB', '16GB', '32GB', '64GB', 'Other'],
    storage: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', 'Other'],
    screenSize: ['13"', '14"', '15.6"', '17"', '24"', '27"', '32"', 'Other'],
    graphics: ['Integrated', 'NVIDIA GeForce', 'AMD Radeon', 'Other'],
    resolution: ['Full HD (1920x1080)', '2K (2560x1440)', '4K (3840x2160)', 'Other'],
    panelType: ['IPS', 'VA', 'TN', 'OLED', 'Any'],
    printerType: ['Inkjet', 'Laser', 'All-in-One', 'Other'],
    printSpeed: ['Standard', 'High Speed', 'Professional', 'Any'],
    connectivity: ['USB', 'Wireless', 'Bluetooth', 'USB + Wireless', 'Any'],
    bagType: ['Backpack', 'Messenger', 'Sleeve', 'Briefcase', 'Other'],
    laptopSize: ['13"', '14"', '15.6"', '17"', 'Other'],
    material: ['Nylon', 'Leather', 'Polyester', 'Any'],
    keyboardType: ['Membrane', 'Mechanical', 'Scissor', 'Any'],
    backlight: ['Yes', 'No', "Doesn't Matter"],
    mouseType: ['Wired', 'Wireless', 'Gaming', 'Ergonomic', 'Any'],
    dpi: ['Standard (800-1600)', 'High (1600-4000)', 'Gaming (4000+)', "Doesn't Matter"],
    headphoneType: ['Over-Ear', 'On-Ear', 'In-Ear', 'Any'],
    microphone: ['With Microphone', 'Without Microphone', "Doesn't Matter"],
};

export default function GetQuotePage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        category: '',
        productDetails: '',
        quantity: 1,
        message: '',
        additionalInfo: {} as Record<string, string>,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedCategory = categories.find(c => c.id === formData.category);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Invalid phone number';
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.productDetails.trim()) newErrors.productDetails = 'Please describe what you need';
        if (formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to submit. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateAdditionalInfo = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            additionalInfo: { ...prev.additionalInfo, [field]: value },
        }));
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <FiCheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-3">
                        Quote Request Submitted Successfully!
                    </h1>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        Thank you for your interest! Our team has received your quotation request and will get back to you within <span className="font-semibold text-indigo-600">24 hours</span>.
                    </p>

                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4">What happens next?</h3>
                        <ul className="text-left text-sm text-gray-600 space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <span>Our team will review your requirements and prepare a customized quotation.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <span>We will contact you via <strong>WhatsApp</strong> or <strong>Email</strong> with the detailed quote.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <span>Our sales team may call you to discuss bulk pricing or special requirements.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/"
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Back to Home
                        </Link>
                        <a
                            href="https://wa.me/919884285858"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp className="w-5 h-5" />
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                        Get a Quote
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">
                        Fill in your requirements below and our team will provide you with the best pricing for your business needs.
                    </p>
                </div>

                {/* Form - no container, blends with background */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiUser className="w-5 h-5 text-indigo-600" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name <span className="text-gray-400">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                                        placeholder="Company Ltd."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="john@company.com"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Product Requirements */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiPackage className="w-5 h-5 text-indigo-600" />
                            Product Requirements
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value, additionalInfo: {} })}
                                        className={`w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm ${errors.quantity ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                    </div>
                                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                                </div>
                            </div>

                            {/* Dynamic Fields Based on Category */}
                            {selectedCategory && selectedCategory.fields.length > 0 && (
                                <div className="bg-indigo-50/70 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
                                    <h3 className="text-sm font-medium text-indigo-800 mb-3">
                                        Specifications for {selectedCategory.name}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {selectedCategory.fields.map(field => (
                                            <div key={field}>
                                                <label className="block text-xs font-medium text-indigo-700 mb-1">
                                                    {fieldLabels[field] || field}
                                                </label>
                                                <select
                                                    value={formData.additionalInfo[field] || ''}
                                                    onChange={(e) => updateAdditionalInfo(field, e.target.value)}
                                                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="">Select {fieldLabels[field]?.toLowerCase()}</option>
                                                    {fieldOptions[field]?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Textareas in 2 columns on large screens */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Describe Your Requirements <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.productDetails}
                                        onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
                                        rows={4}
                                        className={`w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-sm ${errors.productDetails ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="Please describe the specific product or model you're looking for, any brand preferences, budget range, or any other requirements..."
                                    />
                                    {errors.productDetails && <p className="text-red-500 text-xs mt-1">{errors.productDetails}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Message <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={4}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-sm"
                                            placeholder="Any additional notes or questions..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Quote Request'
                        )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        By submitting this form, you agree to be contacted by our team regarding your quote request.
                    </p>
                </form>
            </div>
        </div>
    );
}
