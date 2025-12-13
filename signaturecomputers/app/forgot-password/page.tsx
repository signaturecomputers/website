'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            let emailToSend = identifier;

            // 1. Check if input is phone
            const isPhone = /^[+\d]/.test(identifier) && !identifier.includes('@');

            // 2. Lookup logic
            if (isPhone) {
                const q = query(collection(db, 'users'), where('phoneNumber', '==', identifier));
                const snap = await getDocs(q);
                if (snap.empty) {
                    throw new Error("No account found with this phone number.");
                }
                const userDoc = snap.docs[0].data();
                if (!userDoc.email) {
                    throw new Error("Account found, but no email is linked to send reset link.");
                }
                emailToSend = userDoc.email;
            } else {
                // Check if email exists in our DB first?
                // Firebase sendPasswordResetEmail doesn't throw if user doesn't exist (security).
                // But user requested "if that email id or phone number exist then only it has to go".
                const q = query(collection(db, 'users'), where('email', '==', identifier));
                const snap = await getDocs(q);
                if (snap.empty) {
                    throw new Error("No account found with this email address.");
                }
            }

            // 3. Send Reset Link
            // Note: Firebase sends a LINK, not an OTP.
            await sendPasswordResetEmail(auth, emailToSend);

            setStatus('success');
            setMessage(`Password reset link sent to ${emailToSend}. Please check your inbox.`);

        } catch (error: any) {
            console.error("Forgot Password Error:", error);
            setStatus('error');
            setMessage(error.message || 'Failed to process request.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                <div>
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                        <FiArrowLeft className="mr-2" /> Back to Login
                    </Link>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email or phone number to find your account.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-green-800 mb-2">Check your email</h3>
                        <p className="text-green-700 text-sm">{message}</p>
                        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-green-600 hover:text-green-500">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm text-center font-medium rounded-lg">{message}</div>
                        )}

                        <div>
                            <label htmlFor="identifier" className="sr-only">Email or Phone</label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Email address or Phone number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${status === 'loading' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm`}
                        >
                            {status === 'loading' ? 'Checking...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
