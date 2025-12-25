'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    FiSearch, FiPrinter, FiCheck, FiX, FiCalendar,
    FiChevronLeft, FiChevronRight, FiChevronDown,
    FiMapPin, FiPhone, FiMail, FiPackage, FiCreditCard,
    FiTruck, FiClock, FiUser, FiRefreshCw, FiDollarSign, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'sonner';
import {
    OrderStatus, RefundStatus, PaymentStatus,
    getDisplayStatus, orderStatusColors, refundStatusColors
} from '@/types/order';

// Order interface using proper types
interface Order {
    id: string;
    orderId: string;
    cfOrderId?: string;
    partNumber: string;
    productName: string;
    productCategory?: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    phone?: string;
    address: string;
    shippingAddress?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    // Status fields
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string | object;
    cfPaymentId?: string;
    refundStatus: RefundStatus;
    refundAmount?: number;
    refundId?: string;
    cfRefundId?: string;
    refundArn?: string;
    refundInitiatedAt?: any;
    refundCompletedAt?: any;
    // Invoice fields
    invoiceNumber?: string;
    invoiceGenerated?: boolean;
    // Cancellation request fields
    cancellationRequested?: boolean;
    cancellationRequestedAt?: any;
    cancellationReason?: string;
    cancelledBy?: string;
    // Legacy status field for migration
    status?: string;
    // Timeline
    timeline?: Array<{
        timestamp: any;
        event: string;
        description: string;
        actor?: string;
    }>;
    // Timestamps
    createdAt?: any;
    updatedAt?: any;
    [key: string]: any;
}

// Order status options for dropdown
const allOrderStatusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'placed', label: 'Placed' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

// Get status options for dropdown - Admin can change to any status
const getValidNextStatuses = (currentStatus: OrderStatus, paymentStatus?: string) => {
    // If payment failed, can only show cancelled (order is already cancelled)
    if (paymentStatus === 'failed') {
        return [{ value: 'cancelled' as OrderStatus, label: 'Cancelled' }];
    }

    // If order is delivered, no changes allowed
    if (currentStatus === 'delivered') {
        return [{ value: 'delivered' as OrderStatus, label: 'Delivered' }];
    }

    // Admin can change to any status
    return allOrderStatusOptions;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    // Date filtering
    const [dateFilterType, setDateFilterType] = useState<'all' | 'month' | 'year' | 'date'>('all');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(ordersQuery);

            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();

                // Migrate legacy status field to new orderStatus/refundStatus
                // Migrate legacy status field to new orderStatus/refundStatus
                let orderStatus: OrderStatus = data.orderStatus || 'placed';
                let refundStatus: RefundStatus = data.refundStatus || 'none';
                // Check for cancellation request - either boolean or legacy status
                let cancellationRequested = data.cancellationRequested || false;

                // Handle legacy status values
                if (data.status && !data.orderStatus) {
                    const legacyStatus = data.status.toLowerCase();
                    if (legacyStatus === 'pending') orderStatus = 'placed';
                    else if (legacyStatus === 'placed') orderStatus = 'placed';
                    else if (legacyStatus === 'placed') orderStatus = 'placed';
                    else if (legacyStatus === 'confirmed') orderStatus = 'confirmed';
                    else if (legacyStatus === 'shipped') orderStatus = 'shipped';
                    else if (legacyStatus === 'delivered') orderStatus = 'delivered';
                    else if (legacyStatus === 'cancellation_requested') {
                        // Customer requested cancellation - order NOT cancelled yet!
                        orderStatus = data.previousStatus || 'placed'; // Keep previous status
                        cancellationRequested = true;
                    }
                    else if (legacyStatus === 'cancelled') orderStatus = 'cancelled';
                    else if (legacyStatus === 'refund_initiated') {
                        orderStatus = 'cancelled';
                        refundStatus = 'initiated';
                    }
                    else if (legacyStatus === 'refunded') {
                        orderStatus = 'cancelled';
                        refundStatus = 'completed';
                    }
                }

                // If legacy status is cancellation_requested, set the flag
                if (data.status === 'cancellation_requested') {
                    cancellationRequested = true;
                }

                return {
                    id: doc.id,
                    orderId: data.orderId || doc.id,
                    cfOrderId: data.cfOrderId,
                    partNumber: data.partNumber || '',
                    productName: data.productName || '',
                    productCategory: data.productCategory,
                    productImage: data.productImage,
                    quantity: data.quantity || 1,
                    unitPrice: data.unitPrice || 0,
                    totalAmount: data.totalAmount || data.unitPrice * (data.quantity || 1),
                    customerId: data.customerId,
                    customerName: data.customerName || '',
                    customerEmail: data.customerEmail,
                    phone: data.phone,
                    address: data.address || '',
                    shippingAddress: data.shippingAddress,
                    orderStatus,
                    paymentStatus: data.paymentStatus || 'pending',
                    paymentMethod: data.paymentMethod,
                    cfPaymentId: data.cfPaymentId,
                    refundStatus,
                    refundAmount: data.refundAmount,
                    refundId: data.refundId,
                    cfRefundId: data.cfRefundId,
                    refundArn: data.refundArn,
                    invoiceNumber: data.invoiceNumber,
                    invoiceGenerated: data.invoiceGenerated || false,
                    cancellationRequested,  // Use our computed value
                    cancellationRequestedAt: data.cancellationRequestedAt,
                    cancellationReason: data.cancellationReason,
                    cancelledBy: data.cancelledBy,
                    timeline: data.timeline || [],
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    ...data,
                } as Order;
            });

            setOrders(ordersData);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Filter orders based on active tab
    const getFilteredOrders = () => {
        let filtered = orders;

        // Tab filtering
        switch (activeTab) {
            case 'active':
                filtered = orders.filter(o => ['placed', 'confirmed', 'shipped'].includes(o.orderStatus));
                break;
            case 'delivered':
                filtered = orders.filter(o => o.orderStatus === 'delivered');
                break;
            case 'cancellation_requests':
                filtered = orders.filter(o => o.cancellationRequested && o.orderStatus !== 'cancelled');
                break;
            case 'cancelled':
                filtered = orders.filter(o => o.orderStatus === 'cancelled');
                break;
            case 'refunds':
                filtered = orders.filter(o => o.refundStatus !== 'none');
                break;
            case 'failed_refunds':
                // Show only orders where payment was successful but refund failed
                filtered = orders.filter(o =>
                    o.orderStatus === 'cancelled' &&
                    o.refundStatus === 'failed' &&
                    o.paymentStatus === 'paid'
                );
                break;
        }

        // Search filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(o =>
                o.orderId?.toLowerCase().includes(query) ||
                o.customerName?.toLowerCase().includes(query) ||
                o.customerEmail?.toLowerCase().includes(query) ||
                o.phone?.includes(query) ||
                o.productName?.toLowerCase().includes(query)
            );
        }

        // Date filtering
        if (dateFilterType !== 'all') {
            filtered = filtered.filter(o => {
                if (!o.createdAt) return false;
                const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);

                if (dateFilterType === 'month') {
                    return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
                } else if (dateFilterType === 'year') {
                    return orderDate.getFullYear() === selectedYear;
                } else if (dateFilterType === 'date') {
                    return orderDate.toISOString().split('T')[0] === selectedDate;
                }
                return true;
            });
        }

        return filtered;
    };

    const filteredOrders = getFilteredOrders();
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    // Update order status with timeline tracking
    // When confirming an order, invoice is generated and email is sent
    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus | string) => {
        setUpdatingStatus(orderId);
        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            // Only restriction: Don't allow status change for delivered orders
            if (order.orderStatus === 'delivered' && newStatus !== 'delivered') {
                toast.error('Cannot change status of delivered orders');
                setUpdatingStatus(null);
                return;
            }

            // Don't allow shipped/delivered orders to be cancelled
            if (newStatus === 'cancelled' && ['shipped', 'delivered'].includes(order.orderStatus)) {
                toast.error('Cannot cancel shipped or delivered orders');
                setUpdatingStatus(null);
                return;
            }

            const timelineEvent = {
                timestamp: new Date(),
                event: `Status changed to ${newStatus}`,
                description: `Order status updated from ${order.orderStatus} to ${newStatus}`,
                actor: 'admin'
            };

            // Update order in Firestore
            await updateDoc(doc(db, 'orders', orderId), {
                orderStatus: newStatus,
                status: newStatus, // Keep legacy field for compatibility
                updatedAt: new Date(),
                timeline: arrayUnion(timelineEvent)
            });

            // If confirming order, generate invoice and send email
            if (newStatus === 'confirmed' && order.orderStatus !== 'confirmed') {
                toast.info('Generating invoice...');
                try {
                    // Generate invoice
                    const invoiceResponse = await fetch('/api/invoice/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId }),
                    });

                    const invoiceData = await invoiceResponse.json();

                    if (invoiceResponse.ok) {
                        toast.success(`Invoice ${invoiceData.invoiceNumber} generated!`);

                        // Send confirmation email
                        await fetch('/api/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                type: 'order_confirmation',
                                data: {
                                    orderId: order.orderId,
                                    customerName: order.customerName,
                                    customerEmail: order.customerEmail,
                                    customerPhone: order.phone || '',
                                    productName: order.productName,
                                    quantity: order.quantity || 1,
                                    totalAmount: order.totalAmount,
                                    shippingAddress: order.address || '',
                                    paymentMethod: 'Online Payment',
                                    invoiceNumber: invoiceData.invoiceNumber,
                                },
                            }),
                        });
                    } else {
                        console.error('Invoice generation failed:', invoiceData);
                        toast.error('Invoice generation failed');
                    }
                } catch (invoiceError) {
                    console.error('Error generating invoice:', invoiceError);
                    toast.error('Failed to generate invoice');
                }
            }

            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, orderStatus: newStatus as OrderStatus, timeline: [...(o.timeline || []), timelineEvent] } : o
            ));

            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Cancel order and initiate refund (also handles refund retry)
    const handleCancelOrder = async (order: Order, reason: string) => {
        setUpdatingStatus(order.id);
        try {
            // Check if this is a retry of a failed refund (order already cancelled)
            const isRefundRetry = order.orderStatus === 'cancelled' && order.refundStatus === 'failed';

            const cancelEvent = {
                timestamp: new Date(),
                event: isRefundRetry ? 'Refund Retry' : 'Order Cancelled',
                description: isRefundRetry ? 'Retrying refund after previous failure' : (reason || 'Order cancelled by admin'),
                actor: 'admin'
            };

            // Update order status to cancelled (skip if already cancelled for retry)
            const updateData: any = isRefundRetry ? {
                updatedAt: new Date(),
                timeline: arrayUnion(cancelEvent)
            } : {
                orderStatus: 'cancelled',
                status: 'cancelled',
                cancellationReason: reason,
                cancelledAt: new Date(),
                cancelledBy: 'admin',
                updatedAt: new Date(),
                timeline: arrayUnion(cancelEvent)
            };

            // If order was paid, initiate refund
            if (order.paymentStatus === 'paid' && order.cfOrderId) {
                toast.info(isRefundRetry ? 'Retrying refund via Cashfree...' : 'Initiating refund via Cashfree...');

                const refundResponse = await fetch('/api/cashfree/refund', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: order.id,
                        cfOrderId: order.cfOrderId,
                        refundAmount: order.totalAmount,
                        refundType: 'full',
                        reason: reason || 'Order cancelled',
                        initiatedBy: 'admin',
                    }),
                });

                const refundData = await refundResponse.json();

                if (refundResponse.ok) {
                    updateData.refundStatus = 'initiated';
                    updateData.refundId = refundData.refundId;
                    updateData.cfRefundId = refundData.cfRefundId;
                    updateData.refundAmount = order.totalAmount;
                    updateData.refundInitiatedAt = new Date();
                    updateData.timeline = arrayUnion({
                        timestamp: new Date(),
                        event: 'Refund Initiated',
                        description: `Refund of ₹${order.totalAmount.toLocaleString('en-IN')} initiated`,
                        actor: 'system'
                    });

                    // Send email notification
                    await fetch('/api/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'refund',
                            data: {
                                orderId: order.orderId,
                                customerName: order.customerName,
                                customerEmail: order.customerEmail,
                                refundAmount: order.totalAmount,
                                refundStatus: 'initiated',
                            },
                        }),
                    });

                    toast.success(order.refundStatus === 'failed' ? 'Refund retry initiated!' : 'Order cancelled & refund initiated!');
                } else {
                    updateData.refundStatus = 'failed';
                    // Extract detailed error message - prioritize API's message field
                    let errorMsg = refundData.message || 'Unknown error';
                    if (!refundData.message && refundData.details) {
                        // Fallback to Cashfree API error format
                        errorMsg = refundData.details.message ||
                            refundData.details.error_description ||
                            refundData.details.code ||
                            (Object.keys(refundData.details).length > 0 ? JSON.stringify(refundData.details) : 'Empty response from payment gateway');
                    }

                    // Show sandbox warning if applicable - use warn instead of error for sandbox
                    if (refundData.isSandbox) {
                        console.warn('Refund failed (Sandbox Mode):', JSON.stringify(refundData, null, 2));
                        toast.warning(`Order cancelled! Refund failed in Sandbox mode - this is expected. In production, refund will be processed automatically.`);
                    } else {
                        console.error('Refund failed:', JSON.stringify(refundData, null, 2));
                        toast.error(`Order cancelled but refund failed: ${errorMsg}. Please process refund manually.`);
                    }
                }
            } else {
                // COD or unpaid order - no refund needed
                updateData.refundStatus = 'none';
                toast.success('Order cancelled! (No refund needed)');
            }

            await updateDoc(doc(db, 'orders', order.id), updateData);

            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === order.id ? { ...o, ...updateData } : o
            ));

        } catch (error) {
            console.error('Failed to cancel order:', error);
            toast.error('Failed to cancel order');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Reject cancellation request - order continues processing
    const rejectCancellationRequest = async (order: Order) => {
        setUpdatingStatus(order.id);
        try {
            const timelineEvent = {
                timestamp: new Date(),
                event: 'Cancellation Rejected',
                description: 'Cancellation request was rejected by admin. Order will continue processing.',
                actor: 'admin'
            };

            await updateDoc(doc(db, 'orders', order.id), {
                cancellationRequested: false,
                cancellationReason: null,
                updatedAt: new Date(),
                timeline: arrayUnion(timelineEvent)
            });

            setOrders(prev => prev.map(o =>
                o.id === order.id ? {
                    ...o,
                    cancellationRequested: false,
                    timeline: [...(o.timeline || []), timelineEvent]
                } : o
            ));

            toast.success('Cancellation rejected. Order will continue processing.');
        } catch (error) {
            console.error('Failed to reject cancellation:', error);
            toast.error('Failed to reject cancellation');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Check refund status from Cashfree
    const checkRefundStatus = async (order: Order) => {
        if (!order.cfOrderId) {
            toast.error('No Cashfree order ID found');
            return;
        }

        setUpdatingStatus(order.id);
        try {
            const response = await fetch('/api/cashfree/check-refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cfOrderId: order.cfOrderId,
                    refundId: order.refundId,
                }),
            });

            const data = await response.json();

            if (response.ok && data.refund) {
                const refund = data.refund;
                let newRefundStatus: RefundStatus = order.refundStatus;

                if (refund.status === 'SUCCESS') newRefundStatus = 'completed';
                else if (refund.status === 'PENDING' || refund.status === 'ONHOLD') newRefundStatus = 'processing';
                else if (refund.status === 'CANCELLED') newRefundStatus = 'failed';

                const timelineEvent = {
                    timestamp: new Date(),
                    event: `Refund ${refund.status}`,
                    description: `Refund status updated to ${refund.status}${refund.arn ? ` (ARN: ${refund.arn})` : ''}`,
                    actor: 'system'
                };

                await updateDoc(doc(db, 'orders', order.id), {
                    refundStatus: newRefundStatus,
                    cfRefundId: refund.cfRefundId || order.cfRefundId,
                    refundArn: refund.arn || null,
                    refundCompletedAt: newRefundStatus === 'completed' ? new Date() : null,
                    updatedAt: new Date(),
                    timeline: arrayUnion(timelineEvent)
                });

                setOrders(prev => prev.map(o =>
                    o.id === order.id ? {
                        ...o,
                        refundStatus: newRefundStatus,
                        cfRefundId: refund.cfRefundId,
                        refundArn: refund.arn,
                        timeline: [...(o.timeline || []), timelineEvent]
                    } : o
                ));

                if (newRefundStatus === 'completed') {
                    toast.success(`Refund completed! ARN: ${refund.arn || 'N/A'}`);
                } else if (newRefundStatus === 'processing') {
                    toast.info('Refund is still processing');
                } else if (newRefundStatus === 'failed') {
                    toast.error('Refund failed');
                }
            } else {
                toast.error(data.error || 'Failed to check refund status');
            }
        } catch (error) {
            console.error('Error checking refund:', error);
            toast.error('Failed to check refund status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Mark refund as manually completed (for refunds processed outside the system)
    const markRefundComplete = async (order: Order) => {
        const refundArn = prompt('Enter the Refund ARN/Reference Number (optional, for records):');

        // User cancelled the prompt
        if (refundArn === null) return;

        const confirmed = confirm(
            `Are you sure you want to mark this refund as COMPLETE?\n\n` +
            `Order: ${order.orderId}\n` +
            `Amount: ₹${order.totalAmount?.toLocaleString('en-IN') || order.refundAmount?.toLocaleString('en-IN')}\n\n` +
            `⚠️ Only do this if you have already processed the refund manually (via Cashfree dashboard, bank transfer, etc.)`
        );

        if (!confirmed) return;

        setUpdatingStatus(order.id);
        try {
            const timelineEvent = {
                timestamp: new Date(),
                event: 'Refund Marked Complete',
                description: `Refund manually marked as complete by admin${refundArn ? ` (ARN: ${refundArn})` : ''}`,
                actor: 'admin'
            };

            await updateDoc(doc(db, 'orders', order.id), {
                refundStatus: 'completed',
                refundArn: refundArn || order.refundArn || 'Manual',
                refundCompletedAt: new Date(),
                updatedAt: new Date(),
                timeline: arrayUnion(timelineEvent)
            });

            setOrders(prev => prev.map(o =>
                o.id === order.id ? {
                    ...o,
                    refundStatus: 'completed' as RefundStatus,
                    refundArn: refundArn || order.refundArn || 'Manual',
                    refundCompletedAt: new Date(),
                    timeline: [...(o.timeline || []), timelineEvent]
                } : o
            ));

            // Send refund completion email to customer
            try {
                await fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'refund',
                        data: {
                            orderId: order.orderId,
                            customerName: order.customerName,
                            customerEmail: order.customerEmail,
                            refundAmount: order.totalAmount || order.refundAmount,
                            refundStatus: 'completed',
                        },
                    }),
                });
            } catch (emailError) {
                console.error('Failed to send refund email:', emailError);
            }

            toast.success('Refund marked as complete! Customer has been notified.');
        } catch (error) {
            console.error('Failed to mark refund complete:', error);
            toast.error('Failed to update refund status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Print invoice handler - directly opens print dialog for admin
    const handlePrintInvoice = async (order: Order) => {
        // Admin can view cancelled order invoices, but not placed orders
        // Invoice is available for: confirmed, shipped, delivered, AND cancelled (for admin)
        const allowedStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(order.orderStatus)) {
            toast.error('Invoice is only available for confirmed orders');
            return;
        }

        // Check if invoice has been generated
        if (order.invoiceNumber) {
            // Open the invoice page with print=true to directly trigger print dialog
            const invoiceUrl = `/invoice?invoice=${encodeURIComponent(order.invoiceNumber)}&admin=true&print=true`;
            window.open(invoiceUrl, '_blank');
        } else {
            // For cancelled orders without invoice, can't generate new one
            if (order.orderStatus === 'cancelled') {
                toast.error('No invoice available for this cancelled order');
                return;
            }

            // Generate invoice first and then open it
            toast.info('Generating invoice...');
            try {
                const response = await fetch('/api/invoice/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: order.id }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Update local state with invoice number
                    setOrders(prev => prev.map(o =>
                        o.id === order.id ? { ...o, invoiceNumber: data.invoiceNumber, invoiceGenerated: true } : o
                    ));

                    // Open the invoice page with print=true to directly trigger print dialog
                    const invoiceUrl = `/invoice?invoice=${encodeURIComponent(data.invoiceNumber)}&admin=true&print=true`;
                    window.open(invoiceUrl, '_blank');
                    toast.success(`Invoice ${data.invoiceNumber} generated!`);
                } else {
                    toast.error(data.error || 'Failed to generate invoice');
                }
            } catch (error) {
                console.error('Error generating invoice:', error);
                toast.error('Failed to generate invoice');
            }
        }
    };

    // Format helpers
    const formatCurrency = (amount: number) => `₹${(amount || 0).toLocaleString('en-IN')}`;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentMethodDisplay = (method: string | object | undefined) => {
        if (!method) return 'N/A';
        if (typeof method === 'object') return Object.keys(method)[0] || 'Online';
        return method === 'COD' ? 'Cash on Delivery' : method;
    };

    const toggleExpand = (orderId: string) => {
        setExpandedOrders(prev => {
            const next = new Set(prev);
            if (next.has(orderId)) next.delete(orderId);
            else next.add(orderId);
            return next;
        });
    };

    // Calculate tab counts
    const tabCounts = {
        all: orders.length,
        active: orders.filter(o => ['placed', 'confirmed', 'shipped'].includes(o.orderStatus)).length,
        delivered: orders.filter(o => o.orderStatus === 'delivered').length,
        cancellation_requests: orders.filter(o => o.cancellationRequested && o.orderStatus !== 'cancelled').length,
        cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
        refunds: orders.filter(o => o.refundStatus !== 'none').length,
        failed_refunds: orders.filter(o =>
            o.orderStatus === 'cancelled' &&
            o.refundStatus === 'failed' &&
            o.paymentStatus === 'paid'
        ).length,
    };

    // Calculate revenue
    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {orders.length} total orders • {tabCounts.active} active • {formatCurrency(totalRevenue)} revenue
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, order ID, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                    <select
                        value={activeTab}
                        onChange={(e) => { setActiveTab(e.target.value); setCurrentPage(1); }}
                        className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 min-w-[220px]"
                    >
                        <option value="all">All Orders ({tabCounts.all})</option>
                        <option value="active">Active ({tabCounts.active})</option>
                        <option value="delivered">Delivered ({tabCounts.delivered})</option>
                        <option value="cancellation_requests">⚠️ Cancel Requests ({tabCounts.cancellation_requests})</option>
                        <option value="cancelled">Cancelled ({tabCounts.cancelled})</option>
                        <option value="refunds">Refunds ({tabCounts.refunds})</option>
                        <option value="failed_refunds">❌ Failed Refunds ({tabCounts.failed_refunds})</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-1">
                    <FiCalendar className="ml-2 text-gray-500" />
                    {['all', 'month', 'year', 'date'].map(type => (
                        <button
                            key={type}
                            onClick={() => setDateFilterType(type as any)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${dateFilterType === type
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {type === 'all' ? 'All Time' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : paginatedOrders.map(order => {
                                const isExpanded = expandedOrders.has(order.id);
                                const orderColors = orderStatusColors[order.orderStatus];
                                const refundColors = refundStatusColors[order.refundStatus];

                                return (
                                    <React.Fragment key={order.id}>
                                        <tr
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                            onClick={() => toggleExpand(order.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <FiChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    <div>
                                                        <span className="font-mono text-sm font-medium">{order.orderId}</span>
                                                        {order.invoiceNumber && (
                                                            <div className="text-xs text-gray-500">{order.invoiceNumber}</div>
                                                        )}
                                                    </div>
                                                    {order.cancellationRequested && order.orderStatus !== 'cancelled' && (
                                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded" title="Customer requested cancellation">
                                                            Cancel Request
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium">{order.customerName}</div>
                                                <div className="text-xs text-gray-500">{order.phone}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm max-w-[200px] truncate">{order.productName}</div>
                                                <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.paymentStatus === 'paid' ? 'Success' :
                                                        order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={order.orderStatus}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                    disabled={updatingStatus === order.id || order.orderStatus === 'cancelled'}
                                                    className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${orderColors.bg} ${orderColors.text}`}
                                                >
                                                    {getValidNextStatuses(order.orderStatus).map((opt: { value: OrderStatus; label: string }) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.refundStatus !== 'none' ? (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${refundColors.bg} ${refundColors.text}`}>
                                                        {order.refundStatus}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Approve/Reject buttons - ONLY when customer requested cancellation */}
                                                    {order.cancellationRequested && order.orderStatus !== 'cancelled' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Approve cancellation?${order.paymentStatus === 'paid' ? '\n\nRefund will be initiated automatically.' : ''}`)) {
                                                                        handleCancelOrder(order, order.cancellationReason || 'Customer requested');
                                                                    }
                                                                }}
                                                                disabled={updatingStatus === order.id}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50"
                                                                title="Approve Cancellation"
                                                            >
                                                                <FiCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => rejectCancellationRequest(order)}
                                                                disabled={updatingStatus === order.id}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                                                                title="Reject Cancellation"
                                                            >
                                                                <FiX />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Check refund status */}
                                                    {(order.refundStatus === 'initiated' || order.refundStatus === 'processing') && (
                                                        <button
                                                            onClick={() => checkRefundStatus(order)}
                                                            disabled={updatingStatus === order.id}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg disabled:opacity-50"
                                                            title="Check Refund Status"
                                                        >
                                                            <FiRefreshCw className={updatingStatus === order.id ? 'animate-spin' : ''} />
                                                        </button>
                                                    )}

                                                    {/* Retry Refund button - Only for failed refunds where payment was successful */}
                                                    {order.orderStatus === 'cancelled' &&
                                                        order.refundStatus === 'failed' &&
                                                        order.paymentStatus === 'paid' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Retry refund of ₹${order.totalAmount?.toLocaleString('en-IN')}?`)) {
                                                                        handleCancelOrder(order, 'Refund retry by admin');
                                                                    }
                                                                }}
                                                                disabled={updatingStatus === order.id}
                                                                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg disabled:opacity-50"
                                                                title="Retry Refund"
                                                            >
                                                                <FiRefreshCw className={updatingStatus === order.id ? 'animate-spin' : ''} />
                                                            </button>
                                                        )}

                                                    <button
                                                        onClick={() => handlePrintInvoice(order)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                        title={order.invoiceNumber ? `Print Invoice ${order.invoiceNumber}` : 'Print Invoice'}
                                                    >
                                                        <FiPrinter />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Row */}
                                        {isExpanded && (
                                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                <td colSpan={9} className="px-6 py-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                        {/* Customer Details */}
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                <FiUser className="text-blue-600" /> Customer
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div><span className="text-gray-500">Name:</span> {order.customerName}</div>
                                                                <div><span className="text-gray-500">Phone:</span> {order.phone}</div>
                                                                <div><span className="text-gray-500">Email:</span> {order.customerEmail}</div>
                                                                <div className="pt-2 border-t dark:border-gray-700">
                                                                    <span className="text-gray-500">Address:</span>
                                                                    <p className="mt-1">{order.shippingAddress?.addressLine1 || order.address}</p>
                                                                    {order.shippingAddress && (
                                                                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                <FiPackage className="text-blue-600" /> Product
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="font-medium">{order.productName}</div>
                                                                <div><span className="text-gray-500">Part No:</span> {order.partNumber}</div>
                                                                <div><span className="text-gray-500">Category:</span> {order.productCategory}</div>
                                                                <div><span className="text-gray-500">Qty:</span> {order.quantity}</div>
                                                                <div><span className="text-gray-500">Unit Price:</span> {formatCurrency(order.unitPrice)}</div>
                                                                <div className="pt-2 border-t dark:border-gray-700 font-bold text-green-600">
                                                                    Total: {formatCurrency(order.totalAmount)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Payment & Refund Details */}
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                <FiCreditCard className="text-blue-600" /> Payment
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div><span className="text-gray-500">Method:</span> {getPaymentMethodDisplay(order.paymentMethod)}</div>
                                                                <div>
                                                                    <span className="text-gray-500">Status:</span>{' '}
                                                                    <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' :
                                                                        order.paymentStatus === 'failed' ? 'text-red-600' :
                                                                            'text-yellow-600'
                                                                        }`}>
                                                                        {order.paymentStatus === 'paid' ? 'Success' :
                                                                            order.paymentStatus === 'failed' ? 'Failed' :
                                                                                'Pending'}
                                                                    </span>
                                                                </div>
                                                                {order.cfPaymentId && (
                                                                    <div><span className="text-gray-500">Transaction ID:</span> <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{order.cfPaymentId}</span></div>
                                                                )}
                                                                {order.cfOrderId && (
                                                                    <div><span className="text-gray-500">CF Order ID:</span> <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{order.cfOrderId}</span></div>
                                                                )}
                                                                {order.invoiceNumber && (
                                                                    <div className="pt-2 border-t dark:border-gray-700">
                                                                        <span className="text-gray-500">Invoice:</span> <span className="font-medium text-blue-600">{order.invoiceNumber}</span>
                                                                    </div>
                                                                )}

                                                                {order.refundStatus !== 'none' && (
                                                                    <div className="pt-3 mt-3 border-t border-dashed dark:border-gray-700">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center gap-2 text-purple-600 font-medium">
                                                                                <FiDollarSign /> Refund
                                                                            </div>
                                                                            {/* Check Status Button for initiated/processing refunds */}
                                                                            {['initiated', 'processing'].includes(order.refundStatus) && order.cfOrderId && (
                                                                                <button
                                                                                    onClick={() => checkRefundStatus(order)}
                                                                                    disabled={updatingStatus === order.id}
                                                                                    className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 flex items-center gap-1"
                                                                                >
                                                                                    <FiRefreshCw className={updatingStatus === order.id ? 'animate-spin' : ''} size={12} />
                                                                                    Check Status
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Status with color-coded badge */}
                                                                        <div className="mb-2">
                                                                            <span className="text-gray-500">Status: </span>
                                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.refundStatus === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                                                order.refundStatus === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                                    order.refundStatus === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                                                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                                                }`}>
                                                                                {order.refundStatus === 'completed' ? '✓ Completed - Credited to Customer' :
                                                                                    order.refundStatus === 'failed' ? '✗ Failed' :
                                                                                        order.refundStatus === 'processing' ? '⏳ Processing' :
                                                                                            '⏳ Initiated'}
                                                                            </span>
                                                                        </div>

                                                                        {order.refundAmount && <div><span className="text-gray-500">Amount:</span> {formatCurrency(order.refundAmount)}</div>}
                                                                        {order.cfRefundId && <div><span className="text-gray-500">Refund ID:</span> <span className="font-mono text-xs">{order.cfRefundId}</span></div>}
                                                                        {order.refundArn && <div><span className="text-gray-500">ARN:</span> <span className="font-mono text-xs">{order.refundArn}</span></div>}

                                                                        {/* Timestamps */}
                                                                        {order.refundInitiatedAt && (
                                                                            <div className="text-xs text-gray-500 mt-2">
                                                                                Initiated: {formatDate(order.refundInitiatedAt)}
                                                                            </div>
                                                                        )}
                                                                        {order.refundCompletedAt && order.refundStatus === 'completed' && (
                                                                            <div className="text-xs text-green-600 dark:text-green-400">
                                                                                ✓ Credited on: {formatDate(order.refundCompletedAt)}
                                                                            </div>
                                                                        )}

                                                                        {/* Processing info message */}
                                                                        {['initiated', 'processing'].includes(order.refundStatus) && (
                                                                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
                                                                                ℹ️ Refund is being processed by the payment gateway. Typically takes 5-7 business days to reflect in customer's account. Click "Check Status" to get latest update.
                                                                            </div>
                                                                        )}

                                                                        {order.refundStatus === 'failed' && (
                                                                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                                                                                ⚠️ Refund failed. This may be due to Sandbox mode limitations. Use the "Retry Refund" button or process manually.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Cancellation Request Details */}
                                                        {(order.cancellationRequested || order.status === 'cancellation_requested' || order.cancellationReason) && (
                                                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                                                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                                                                    <FiAlertCircle className="text-red-600" /> Cancellation Request
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    {order.cancellationReason && (
                                                                        <div>
                                                                            <span className="text-gray-600 dark:text-gray-400 block mb-1">Customer's Reason:</span>
                                                                            <p className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-700 text-gray-800 dark:text-gray-200 italic">
                                                                                "{order.cancellationReason}"
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    {order.cancellationRequestedAt && (
                                                                        <div className="text-xs text-gray-500 mt-2">
                                                                            Requested on: {formatDate(order.cancellationRequestedAt)}
                                                                        </div>
                                                                    )}
                                                                    {order.cancelledBy && (
                                                                        <div className="text-xs text-gray-500">
                                                                            Requested by: {order.cancelledBy}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Timeline */}
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                <FiClock className="text-blue-600" /> Timeline
                                                            </h4>
                                                            <div className="space-y-3 text-sm max-h-48 overflow-y-auto">
                                                                {(order.timeline && order.timeline.length > 0) ? (
                                                                    order.timeline.slice().reverse().map((event, idx) => (
                                                                        <div key={idx} className="flex gap-3">
                                                                            <div className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                                                                            <div>
                                                                                <div className="font-medium">{event.event}</div>
                                                                                <div className="text-xs text-gray-500">{formatDate(event.timestamp)}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <>
                                                                        <div className="flex gap-3">
                                                                            <div className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full"></div>
                                                                            <div>
                                                                                <div className="font-medium">Order Placed</div>
                                                                                <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                                                                            </div>
                                                                        </div>
                                                                        {order.orderStatus !== 'placed' && (
                                                                            <div className="flex gap-3">
                                                                                <div className="w-2 h-2 mt-1.5 bg-green-600 rounded-full"></div>
                                                                                <div>
                                                                                    <div className="font-medium">Status: {order.orderStatus}</div>
                                                                                    <div className="text-xs text-gray-500">{formatDate(order.updatedAt)}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="mt-4 pt-4 border-t dark:border-gray-700 flex gap-3">
                                                        {/* Initiate Refund - for cancelled orders with no refund initiated */}
                                                        {order.orderStatus === 'cancelled' && order.refundStatus === 'none' && order.paymentStatus === 'paid' && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order, 'Refund initiated by admin')}
                                                                disabled={updatingStatus === order.id}
                                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                <FiDollarSign /> Initiate Refund
                                                            </button>
                                                        )}
                                                        {/* Retry Refund - for cancelled orders with failed refund */}
                                                        {order.orderStatus === 'cancelled' && order.refundStatus === 'failed' && order.paymentStatus === 'paid' && order.cfOrderId && (
                                                            <button
                                                                onClick={() => handleCancelOrder(order, 'Refund retry by admin')}
                                                                disabled={updatingStatus === order.id}
                                                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                <FiRefreshCw className={updatingStatus === order.id ? 'animate-spin' : ''} /> Retry Refund
                                                            </button>
                                                        )}
                                                        {(order.refundStatus === 'initiated' || order.refundStatus === 'processing') && (
                                                            <button
                                                                onClick={() => checkRefundStatus(order)}
                                                                disabled={updatingStatus === order.id}
                                                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                <FiRefreshCw className={updatingStatus === order.id ? 'animate-spin' : ''} />
                                                                Check Refund Status
                                                            </button>
                                                        )}
                                                        {/* Mark Refund Complete - for refunds processed manually outside the system */}
                                                        {order.orderStatus === 'cancelled' && ['failed', 'initiated', 'processing'].includes(order.refundStatus) && order.paymentStatus === 'paid' && (
                                                            <button
                                                                onClick={() => markRefundComplete(order)}
                                                                disabled={updatingStatus === order.id}
                                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                <FiCheck /> Mark Refund Complete
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handlePrintInvoice(order)}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                                        >
                                                            <FiPrinter /> {order.invoiceNumber ? `Print ${order.invoiceNumber}` : 'Print Invoice'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
                        <div className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * ordersPerPage + 1} - {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border dark:border-gray-700 disabled:opacity-50"
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg">{currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border dark:border-gray-700 disabled:opacity-50"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
