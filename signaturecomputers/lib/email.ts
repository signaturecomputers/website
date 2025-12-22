/**
 * Email Service for Signature Computers
 * Uses Resend for transactional emails
 */

import { Resend } from 'resend';

// Lazy Resend initialization to prevent build-time errors
let resendClient: Resend | null = null;

function getResendClient(): Resend {
    if (!resendClient) {
        if (!process.env.RESEND_API_KEY) {
            console.warn('Warning: RESEND_API_KEY not configured, emails will not be sent');
        }
        resendClient = new Resend(process.env.RESEND_API_KEY || '');
    }
    return resendClient;
}

// From email address (must be verified in Resend)
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@signaturecomputers.in';
const COMPANY_NAME = 'Signature Computers';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'saravanan@signaturecomputers.in';

export interface OrderDetails {
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    shippingAddress: string;
    paymentMethod: string;
    invoiceNumber?: string;
}

export interface StatusChangeDetails extends OrderDetails {
    oldStatus: string;
    newStatus: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
}

export interface RefundDetails {
    orderId: string;
    customerName: string;
    customerEmail: string;
    refundAmount: number;
    refundStatus: 'initiated' | 'processing' | 'completed';
    refundId?: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(order: OrderDetails): Promise<boolean> {
    try {
        const { data, error } = await getResendClient().emails.send({
            from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
            to: order.customerEmail,
            subject: `Order Confirmed - ${order.orderId} | Signature Computers`,
            html: getOrderConfirmationTemplate(order),
        });

        if (error) {
            console.error('Order confirmation email error:', error);
            return false;
        }

        console.log('Order confirmation email sent:', data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send order confirmation:', error);
        return false;
    }
}

/**
 * Send new order notification to admin
 */
export async function sendAdminNewOrderNotification(order: OrderDetails): Promise<boolean> {
    try {
        const { data, error } = await getResendClient().emails.send({
            from: `${COMPANY_NAME} Orders <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            subject: `🛒 New Order - ${order.orderId} - ₹${order.totalAmount.toLocaleString('en-IN')}`,
            html: getAdminNewOrderTemplate(order),
        });

        if (error) {
            console.error('Admin notification email error:', error);
            return false;
        }

        console.log('Admin notification email sent:', data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send admin notification:', error);
        return false;
    }
}

/**
 * Send order status change email to customer
 */
export async function sendOrderStatusChange(details: StatusChangeDetails): Promise<boolean> {
    try {
        const statusSubjects: Record<string, string> = {
            'processing': `Your order is being processed - ${details.orderId}`,
            'shipped': `Your order has been shipped! - ${details.orderId}`,
            'out_for_delivery': `Out for Delivery - ${details.orderId}`,
            'delivered': `Order Delivered - ${details.orderId}`,
            'cancelled': `Order Cancelled - ${details.orderId}`,
        };

        const { data, error } = await getResendClient().emails.send({
            from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
            to: details.customerEmail,
            subject: statusSubjects[details.newStatus] || `Order Update - ${details.orderId}`,
            html: getStatusChangeTemplate(details),
        });

        if (error) {
            console.error('Status change email error:', error);
            return false;
        }

        console.log('Status change email sent:', data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send status change email:', error);
        return false;
    }
}

/**
 * Send refund notification email
 */
export async function sendRefundNotification(details: RefundDetails): Promise<boolean> {
    try {
        const statusSubjects: Record<string, string> = {
            'initiated': `Refund Initiated - ${details.orderId}`,
            'processing': `Refund Processing - ${details.orderId}`,
            'completed': `Refund Completed - ${details.orderId}`,
        };

        const { data, error } = await getResendClient().emails.send({
            from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
            to: details.customerEmail,
            subject: statusSubjects[details.refundStatus],
            html: getRefundTemplate(details),
        });

        if (error) {
            console.error('Refund notification email error:', error);
            return false;
        }

        console.log('Refund notification email sent:', data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send refund notification:', error);
        return false;
    }
}

/**
 * Send cancellation request notification to admin
 */
export async function sendCancellationRequestToAdmin(order: OrderDetails, reason: string): Promise<boolean> {
    try {
        const { data, error } = await getResendClient().emails.send({
            from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            subject: `⚠️ Cancellation Request - ${order.orderId}`,
            html: getCancellationRequestTemplate(order, reason),
        });

        if (error) {
            console.error('Cancellation request email error:', error);
            return false;
        }

        console.log('Cancellation request email sent:', data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send cancellation request:', error);
        return false;
    }
}

/**
 * Send return request notification to admin
 */
export async function sendReturnRequestToAdmin(order: OrderDetails, reason: string): Promise<boolean> {
    try {
        const { data, error } = await getResendClient().emails.send({
            from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
            to: ADMIN_EMAIL,
            subject: `🔄 Return Request - ${order.orderId}`,
            html: getReturnRequestTemplate(order, reason),
        });

        if (error) {
            console.error('Return request email error:', error);
            return false;
        }

        console.log('Return request email sent:', data?.id);
        return true;
    } catch (error) {
        console.error('Failed to send return request:', error);
        return false;
    }
}

// ========================================
// Email Templates
// ========================================

function getOrderConfirmationTemplate(order: OrderDetails): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Signature Computers</h1>
                <p style="color: #93c5fd; margin: 10px 0 0 0;">Order Confirmation</p>
            </div>

            <!-- Order Success -->
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 30px;">✓</span>
                </div>
                <h2 style="color: #1f2937; margin: 0 0 10px 0;">Thank You for Your Order!</h2>
                <p style="color: #6b7280; margin: 0;">Hi ${order.customerName}, your order has been confirmed.</p>
            </div>

            <!-- Order Details -->
            <div style="padding: 30px;">
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Order ID</td>
                            <td style="padding: 8px 0; color: #1f2937; text-align: right; font-weight: bold;">${order.orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Product</td>
                            <td style="padding: 8px 0; color: #1f2937; text-align: right;">${order.productName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Quantity</td>
                            <td style="padding: 8px 0; color: #1f2937; text-align: right;">${order.quantity}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Payment Method</td>
                            <td style="padding: 8px 0; color: #1f2937; text-align: right;">${order.paymentMethod}</td>
                        </tr>
                        <tr style="border-top: 2px solid #e5e7eb;">
                            <td style="padding: 15px 0 0 0; color: #1f2937; font-weight: bold;">Total Amount</td>
                            <td style="padding: 15px 0 0 0; color: #10b981; text-align: right; font-weight: bold; font-size: 18px;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>

                <!-- Shipping Address -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">📍 Shipping Address</h3>
                    <p style="color: #6b7280; margin: 0; line-height: 1.6;">${order.shippingAddress}</p>
                </div>

                ${order.invoiceNumber ? `
                <!-- Invoice Link -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://signaturecomputers.in/invoice?invoice=${order.invoiceNumber}" 
                       style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        View Invoice
                    </a>
                </div>
                ` : ''}

                <!-- Track Order -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://signaturecomputers.in/orders" 
                       style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Track Your Order
                    </a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #1f2937; padding: 30px; text-align: center;">
                <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
                    Need help? Contact us at<br>
                    <a href="mailto:saravanan@signaturecomputers.in" style="color: #60a5fa;">saravanan@signaturecomputers.in</a>
                </p>
                <p style="color: #6b7280; margin: 0; font-size: 12px;">
                    Signature Computers<br>
                    No - 52, Ground Floor, Sri Kalyan Square, Pantheon Road, Egmore, Chennai - 600 008
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function getAdminNewOrderTemplate(order: OrderDetails): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #10b981; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">🛒 New Order Received!</h1>
            </div>

            <div style="padding: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Order ID</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.orderId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Customer</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Email</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.customerEmail}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Phone</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.customerPhone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Product</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.productName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Quantity</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.quantity}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Amount</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #10b981; font-weight: bold; font-size: 18px;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Payment</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.paymentMethod}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; color: #6b7280;"><strong>Shipping Address</strong></td>
                        <td style="padding: 10px; color: #1f2937;">${order.shippingAddress}</td>
                    </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://signaturecomputers.in/admindashboard/orders" 
                       style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        View in Admin Panel
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

function getStatusChangeTemplate(details: StatusChangeDetails): string {
    const statusConfig: Record<string, { icon: string; color: string; message: string }> = {
        'processing': {
            icon: '⚙️',
            color: '#3b82f6',
            message: 'Your order is being prepared for shipment.'
        },
        'shipped': {
            icon: '🚚',
            color: '#8b5cf6',
            message: `Your order has been shipped! ${details.trackingNumber ? `Tracking Number: ${details.trackingNumber}` : ''}`
        },
        'out_for_delivery': {
            icon: '📦',
            color: '#f59e0b',
            message: 'Your order is out for delivery and will reach you today!'
        },
        'delivered': {
            icon: '✅',
            color: '#10b981',
            message: 'Your order has been delivered. Thank you for shopping with us!'
        },
        'cancelled': {
            icon: '❌',
            color: '#ef4444',
            message: 'Your order has been cancelled. Any payment will be refunded within 5-7 business days.'
        }
    };

    const config = statusConfig[details.newStatus] || { icon: '📋', color: '#6b7280', message: 'Your order status has been updated.' };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Signature Computers</h1>
            </div>

            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">${config.icon}</div>
                <h2 style="color: ${config.color}; margin: 0 0 10px 0; text-transform: capitalize;">${details.newStatus.replace('_', ' ')}</h2>
                <p style="color: #6b7280; margin: 0;">${config.message}</p>
            </div>

            <div style="padding: 0 30px 30px;">
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="color: #6b7280; padding: 5px 0;">Order ID:</td>
                            <td style="color: #1f2937; text-align: right; font-weight: bold;">${details.orderId}</td>
                        </tr>
                        <tr>
                            <td style="color: #6b7280; padding: 5px 0;">Product:</td>
                            <td style="color: #1f2937; text-align: right;">${details.productName}</td>
                        </tr>
                        ${details.estimatedDelivery ? `
                        <tr>
                            <td style="color: #6b7280; padding: 5px 0;">Est. Delivery:</td>
                            <td style="color: #1f2937; text-align: right;">${details.estimatedDelivery}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://signaturecomputers.in/orders" 
                       style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Track Order
                    </a>
                </div>
            </div>

            <div style="background-color: #1f2937; padding: 20px; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Signature Computers | Chennai - 600 008 | signaturecomputers.in
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function getRefundTemplate(details: RefundDetails): string {
    const statusConfig: Record<string, { message: string; icon: string }> = {
        'initiated': {
            icon: '🔄',
            message: 'Your refund has been initiated and is being processed.'
        },
        'processing': {
            icon: '⏳',
            message: 'Your refund is being processed by our payment partner.'
        },
        'completed': {
            icon: '✅',
            message: 'Your refund has been completed! The amount should reflect in your account within 5-7 business days.'
        }
    };

    const config = statusConfig[details.refundStatus];

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Signature Computers</h1>
                <p style="color: #93c5fd; margin: 10px 0 0 0;">Refund Update</p>
            </div>

            <div style="padding: 40px; text-align: center;">
                <div style="font-size: 60px; margin-bottom: 20px;">${config.icon}</div>
                <h2 style="color: #1f2937; margin: 0 0 10px 0;">Refund ${details.refundStatus.charAt(0).toUpperCase() + details.refundStatus.slice(1)}</h2>
                <p style="color: #6b7280; margin: 0;">${config.message}</p>
            </div>

            <div style="padding: 0 30px 30px;">
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="color: #6b7280; padding: 5px 0;">Order ID:</td>
                            <td style="color: #1f2937; text-align: right;">${details.orderId}</td>
                        </tr>
                        ${details.refundId ? `
                        <tr>
                            <td style="color: #6b7280; padding: 5px 0;">Refund ID:</td>
                            <td style="color: #1f2937; text-align: right;">${details.refundId}</td>
                        </tr>
                        ` : ''}
                        <tr>
                            <td style="color: #6b7280; padding: 5px 0;">Refund Amount:</td>
                            <td style="color: #10b981; text-align: right; font-weight: bold; font-size: 18px;">₹${details.refundAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="background-color: #1f2937; padding: 20px; text-align: center;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Need help? Contact us at saravanan@signaturecomputers.in
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function getCancellationRequestTemplate(order: OrderDetails, reason: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">⚠️ Cancellation Request</h1>
            </div>

            <div style="padding: 30px;">
                <p style="color: #6b7280; margin: 0 0 20px 0;">A customer has requested to cancel their order.</p>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Order ID</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.orderId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Customer</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Product</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.productName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Amount</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; color: #6b7280;"><strong>Reason</strong></td>
                        <td style="padding: 10px; color: #1f2937;">${reason}</td>
                    </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://signaturecomputers.in/admindashboard/orders" 
                       style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Review in Admin Panel
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

function getReturnRequestTemplate(order: OrderDetails, reason: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #8b5cf6; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">🔄 Return Request</h1>
            </div>

            <div style="padding: 30px;">
                <p style="color: #6b7280; margin: 0 0 20px 0;">A customer has requested to return their order.</p>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Order ID</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.orderId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Customer</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Phone</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.customerPhone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Product</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${order.productName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Return Reason</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${reason}</td>
                    </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://signaturecomputers.in/admindashboard/refunds" 
                       style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                        Review Return Request
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}
