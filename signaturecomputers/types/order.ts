// Order Status Enum - Primary status of the order
export type OrderStatus =
    | 'placed'           // Order placed, awaiting admin confirmation
    | 'confirmed'        // Admin confirmed, order processing
    | 'shipped'          // Order shipped
    | 'delivered'        // Order delivered
    | 'cancelled';       // Order cancelled

// Refund Status Enum - Secondary status (only when applicable)
export type RefundStatus =
    | 'none'             // No refund (default)
    | 'initiated'        // Refund initiated
    | 'processing'       // Refund being processed by payment gateway
    | 'completed'        // Refund completed
    | 'failed';          // Refund failed

// Payment Status
export type PaymentStatus =
    | 'pending'          // Awaiting payment
    | 'paid'             // Payment received
    | 'failed'           // Payment failed
    | 'refunded';        // Payment refunded

// Timeline Event Type
export interface OrderTimelineEvent {
    timestamp: Date;
    event: string;
    description: string;
    actor?: 'customer' | 'admin' | 'system';
}

// Complete Order Interface
export interface Order {
    // Core identifiers
    id: string;
    orderId: string;           // Display ID like SC-20251222-XXXX
    cfOrderId?: string;        // Cashfree order ID

    // Product details
    partNumber: string;
    productName: string;
    productCategory?: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;

    // Customer details
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    phone?: string;

    // Shipping address
    address: string;
    shippingAddress?: {
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };

    // PRIMARY: Order Status (tracks order lifecycle)
    orderStatus: OrderStatus;

    // SECONDARY: Payment Status
    paymentStatus: PaymentStatus;
    paymentMethod?: string;     // 'online' | 'COD' | etc
    cfPaymentId?: string;
    paymentTime?: Date;

    // SECONDARY: Refund Status (only when applicable)
    refundStatus: RefundStatus;
    refundAmount?: number;
    refundId?: string;          // Internal refund ID
    cfRefundId?: string;        // Cashfree refund ID
    refundArn?: string;         // Acquirer Reference Number
    refundInitiatedAt?: Date;
    refundCompletedAt?: Date;
    refundReason?: string;

    // Cancellation details
    cancellationReason?: string;
    cancelledAt?: Date;
    cancelledBy?: 'customer' | 'admin';

    // Timeline of events
    timeline?: OrderTimelineEvent[];

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Helper function to get display status combining order + refund status
export function getDisplayStatus(order: { orderStatus: OrderStatus; refundStatus: RefundStatus }): string {
    if (order.orderStatus === 'cancelled') {
        switch (order.refundStatus) {
            case 'initiated': return 'Cancelled – Refund Initiated';
            case 'processing': return 'Cancelled – Refund Processing';
            case 'completed': return 'Cancelled – Refund Completed';
            case 'failed': return 'Cancelled – Refund Failed';
            default: return 'Cancelled';
        }
    }

    switch (order.orderStatus) {
        case 'placed': return 'Order Placed'; // Legacy support
        case 'confirmed': return 'Order Confirmed';
        case 'shipped': return 'Shipped';
        case 'delivered': return 'Delivered';
        default: return order.orderStatus;
    }
}

// Customer-facing status messages
export function getCustomerStatusMessage(orderStatus: OrderStatus, paymentStatus: PaymentStatus): string {
    if (paymentStatus === 'failed') {
        return 'Order cancelled due to payment failure.';
    }

    switch (orderStatus) {
        case 'placed':
            return 'Payment successful. Your order is placed and awaiting confirmation.';
        case 'confirmed':
            return 'Your order is confirmed. Invoice is now available.';
        case 'shipped':
            return 'Your order has been shipped and is on its way.';
        case 'delivered':
            return 'Your order has been delivered.';
        case 'cancelled':
            return 'This order has been cancelled.';
        default:
            return '';
    }
}

// Check if invoice should be visible (only after confirmed)
export function isInvoiceVisible(orderStatus: OrderStatus): boolean {
    return ['confirmed', 'shipped', 'delivered'].includes(orderStatus);
}

// Check if order can be cancelled by customer
export function canCustomerCancel(orderStatus: OrderStatus): boolean {
    return ['placed', 'confirmed'].includes(orderStatus);
}

// Helper to check if order should appear in Refunds filter
export function hasActiveRefund(order: { refundStatus: RefundStatus }): boolean {
    return order.refundStatus !== 'none';
}

// Status color mappings
export const orderStatusColors: Record<OrderStatus, { bg: string; text: string }> = {
    placed: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    confirmed: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400' },
    shipped: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

export const refundStatusColors: Record<RefundStatus, { bg: string; text: string }> = {
    none: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400' },
    initiated: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400' },
    processing: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    completed: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400' },
    failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};
