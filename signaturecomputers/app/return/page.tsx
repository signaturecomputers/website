"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface OrderStatus {
    order_id: string;
    order_status: "PAID" | "ACTIVE" | "EXPIRED" | "TERMINATED";
    order_amount: number;
}

function PaymentReturnContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const orderId = searchParams.get("order_id");

    const [status, setStatus] = useState<
        "loading" | "success" | "failed" | "pending"
    >("loading");
    const [orderData, setOrderData] = useState<OrderStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const verifyPayment = useCallback(async (orderIdToVerify: string) => {
        try {
            const response = await fetch("/api/cashfree/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: orderIdToVerify }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to verify payment");
            }

            setOrderData(data);

            switch (data.order_status) {
                case "PAID":
                    setStatus("success");
                    // Update order status in Firestore (backup for webhook)
                    try {
                        await fetch("/api/cashfree/update-order-status", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ order_id: orderIdToVerify }),
                        });
                    } catch (updateError) {
                        console.error("Failed to update order status:", updateError);
                    }
                    // Clear cart on successful payment
                    clearCart();
                    // Clear pending order from session storage
                    sessionStorage.removeItem("pendingCfOrder");
                    break;
                case "ACTIVE":
                    setStatus("pending");
                    break;
                default:
                    setStatus("failed");
            }
        } catch (err) {
            console.error("Payment verification error:", err);
            setStatus("failed");
            setError(
                err instanceof Error ? err.message : "Failed to verify payment"
            );
        }
    }, [clearCart]);

    useEffect(() => {
        if (!orderId) {
            setStatus("failed");
            setError("No order ID provided");
            return;
        }

        verifyPayment(orderId);
    }, [orderId, verifyPayment]);

    // Auto-retry for pending payments
    useEffect(() => {
        if (status === "pending" && retryCount < 3) {
            const timer = setTimeout(() => {
                setRetryCount((prev) => prev + 1);
                if (orderId) verifyPayment(orderId);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status, retryCount, orderId, verifyPayment]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-gray-700/50 shadow-2xl">
                {status === "loading" && (
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Verifying Payment
                        </h2>
                        <p className="text-gray-400">
                            Please wait while we confirm your payment...
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce-slow">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Payment Successful!
                        </h2>
                        <p className="text-gray-400 mb-4">
                            Thank you for shopping with Signature Computers
                        </p>
                        {orderData && (
                            <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-400 text-sm">Order ID</span>
                                    <span className="text-white font-mono text-sm bg-gray-600/50 px-2 py-1 rounded">
                                        {orderData.order_id}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Amount Paid</span>
                                    <span className="text-green-400 font-bold text-lg">
                                        ₹{orderData.order_amount?.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <Link
                                href="/profile"
                                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-center"
                            >
                                View My Orders
                            </Link>
                            <Link
                                href="/"
                                className="block w-full bg-gray-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200 text-center"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Confirmation Email Notice */}
                        <p className="mt-6 text-xs text-gray-500">
                            A confirmation email has been sent to your registered email
                            address.
                        </p>
                    </div>
                )}

                {status === "failed" && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                            <svg
                                className="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Payment Failed
                        </h2>
                        <p className="text-gray-400 mb-2">
                            {error || "Something went wrong with your payment"}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Don&apos;t worry, no amount has been deducted from your account.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push("/checkout")}
                                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                            >
                                Try Again
                            </button>
                            <Link
                                href="/cart"
                                className="block w-full bg-gray-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200 text-center"
                            >
                                Back to Cart
                            </Link>
                        </div>

                        {/* Support Notice */}
                        <p className="mt-6 text-xs text-gray-500">
                            Need help? Contact us at{" "}
                            <a
                                href="mailto:support@signaturecomputers.in"
                                className="text-blue-400 hover:underline"
                            >
                                support@signaturecomputers.in
                            </a>
                        </p>
                    </div>
                )}

                {status === "pending" && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
                            <svg
                                className="w-10 h-10 text-white animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Payment Processing
                        </h2>
                        <p className="text-gray-400 mb-2">
                            Your payment is being processed. This may take a few moments.
                        </p>
                        <p className="text-sm text-yellow-400 mb-6">
                            Please do not refresh or close this page.
                        </p>
                        {orderData && (
                            <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Order ID</span>
                                    <span className="text-white font-mono text-sm">
                                        {orderData.order_id}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <button
                                onClick={() => orderId && verifyPayment(orderId)}
                                disabled={retryCount < 3}
                                className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50"
                            >
                                {retryCount < 3
                                    ? `Checking... (${retryCount + 1}/3)`
                                    : "Check Status"}
                            </button>
                            <Link
                                href="/"
                                className="block w-full bg-gray-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200 text-center"
                            >
                                Go Home
                            </Link>
                        </div>

                        {/* Auto-refresh notice */}
                        <p className="mt-6 text-xs text-gray-500">
                            This page will automatically refresh to check payment status.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentReturnPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="w-16 h-16 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                </div>
            }
        >
            <PaymentReturnContent />
        </Suspense>
    );
}
