'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { createFirestoreUser } from '@/lib/auth-helpers';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { checkCustomerRateLimit, recordCustomerLoginAttempt } from '@/lib/admin-actions';

function LoginContent() {
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    // Handle redirect after login (e.g. from protected route)
    const redirectUrl = searchParams.get('redirect') || '/';

    useEffect(() => {
        if (!authLoading && user) {
            router.push(redirectUrl === '/login' ? '/' : redirectUrl);
        }
    }, [user, authLoading, router, redirectUrl]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let emailToLogin = identifier;

            // 1. Detect if input is phone number (digits only or starts with +)
            const isPhone = /^[+\d]/.test(identifier) && !identifier.includes('@');

            if (isPhone) {
                // 2. Lookup email from Firestore
                const q = query(collection(db, 'users'), where('phoneNumber', '==', identifier));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error("No account found with this phone number.");
                }

                // Assume first match is the user
                const userDoc = querySnapshot.docs[0].data();
                if (!userDoc.email) {
                    throw new Error("This account does not have a linked email for password login.");
                }
                emailToLogin = userDoc.email;
            }

            // 2.5 Check customer rate limit before calling signInWithEmailAndPassword
            const rateLimit = await checkCustomerRateLimit(emailToLogin);
            if (rateLimit.blocked) {
                setError(`Too many failed login attempts. Try again in ${Math.ceil((rateLimit.timeLeft || 0) / 60)} minutes.`);
                setLoading(false);
                return;
            }

            // 3. Login with Email/Password
            await signInWithEmailAndPassword(auth, emailToLogin, password);

            // Record success to clear failed attempts
            await recordCustomerLoginAttempt(emailToLogin, true);

            // Router will redirect via useEffect
        } catch (err: any) {
            console.error("Login Error:", err);

            // Resolve email for recording failed attempt if it was a phone number
            let emailToRecord = identifier;
            if (/^[+\d]/.test(identifier) && !identifier.includes('@')) {
                try {
                    const q = query(collection(db, 'users'), where('phoneNumber', '==', identifier));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        emailToRecord = querySnapshot.docs[0].data().email || identifier;
                    }
                } catch (lookupErr) {
                    console.error("Failed to resolve email for rate limit record:", lookupErr);
                }
            }

            // Record failed attempt
            await recordCustomerLoginAttempt(emailToRecord, false);

            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email/phone or password.');
            } else {
                setError(err.message || 'Failed to login.');
            }
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            await createFirestoreUser(result.user, 'google');
        } catch (err: any) {
            console.error("Google Login Error:", err);
            if (err.code === 'auth/popup-closed-by-user') return;
            setError('Failed to login with Google.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        New here?{' '}
                        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Create an account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && <div className="p-3 bg-red-50 text-red-500 text-sm text-center font-medium rounded-lg">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Email ID / Phone Number"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm`}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Informational Policy Consent */}
                        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                            By logging in, you agree to our{' '}
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline">
                                Terms & Conditions
                            </a>
                            ,{' '}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline">
                                Privacy Policy
                            </a>
                            , and{' '}
                            <a href="/returns" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline">
                                Refund & Cancellation Policy
                            </a>
                            .
                        </p>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FcGoogle className="h-5 w-5 mr-2" />
                            Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Wrap in Suspense for useSearchParams
export default function Login() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
