'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FiX, FiLoader, FiAlertCircle } from 'react-icons/fi';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { createFirestoreUser } from '@/lib/auth-helpers';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { isValidPhoneNumber, isValidName, isValidEmail, validatePassword } from '@/lib/form-validation';

export default function AuthModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Form States
    const [email, setEmail] = useState(''); // Used as identifier for login
    const [password, setPassword] = useState('');

    // Signup specific
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [policyAccepted, setPolicyAccepted] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        // If user is logged in, ensure modal is closed
        if (user) {
            setIsOpen(false);
            return;
        }

        // Only attempt to show if logic hasn't run successfully yet
        if (!authLoading && !user && !hasAttemptedRef.current) {
            const hasSeen = sessionStorage.getItem('hasSeenAuthModal');
            if (!hasSeen) {
                const timer = setTimeout(() => {
                    // Double check before opening
                    if (!sessionStorage.getItem('hasSeenAuthModal') && !user) {
                        setIsOpen(true);
                        hasAttemptedRef.current = true; // Mark as done only IF we open
                    }
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, authLoading]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenAuthModal', 'true');
        setError('');
        resetForm();
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setConfirmPassword('');
        setPolicyAccepted(false);
    };

    const handleGoogleLogin = async () => {
        if (mode === 'signup' && !policyAccepted) {
            setError('Please agree to the policies to create an account.');
            return;
        }
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // If signup mode or just universally ensuring firestore user
            await createFirestoreUser(result.user, 'google', undefined,
                mode === 'signup' ? { policyAcceptedAt: new Date().toISOString() } : undefined
            );

            handleClose();
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            if (err.code === 'auth/popup-closed-by-user') return;
            setError('Failed to authenticate with Google.');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let emailToLogin = email;

            // Check if input is phone number
            const isPhone = /^[+\d]/.test(email) && !email.includes('@');

            if (isPhone) {
                const q = query(collection(db, 'users'), where('phoneNumber', '==', email));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    throw new Error("No account found with this phone number.");
                }

                const userDoc = querySnapshot.docs[0].data();
                if (!userDoc.email) {
                    throw new Error("This account does not have a linked email.");
                }
                emailToLogin = userDoc.email;
            }

            await signInWithEmailAndPassword(auth, emailToLogin, password);
            handleClose();
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email/phone or password.');
            } else {
                setError(err.message || 'Failed to login.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!policyAccepted) {
            setError('Please agree to the policies to create an account.');
            return;
        }
        if (!isValidName(firstName) || !isValidName(lastName)) {
            setError('Please enter a valid name.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email.');
            return;
        }
        if (phone && !isValidPhoneNumber(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.isValid) {
            setError(passwordCheck.message);
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const displayName = `${firstName} ${lastName}`.trim();

            await updateProfile(user, { displayName });
            await createFirestoreUser(user, 'password', displayName, {
                firstName,
                lastName,
                phoneNumber: phone,
                policyAcceptedAt: new Date().toISOString(),
            });

            handleClose();
        } catch (err: any) {
            console.error("Signup Error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered. Please login.');
            } else {
                setError(err.message || 'Failed to create account.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-2 relative max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10 bg-white/50 dark:bg-black/50 rounded-full"
                >
                    <FiX size={20} />
                </button>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {mode === 'login'
                                ? 'Login to access your personalized experience'
                                : 'Join us to unlock exclusive features'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <FiAlertCircle className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        )}

                        <input
                            type="text" // text to allow phone number
                            placeholder={mode === 'login' ? "Email or Phone Number" : "Email Address"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />

                        {mode === 'signup' && (
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        )}

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />

                        {mode === 'signup' && (
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        )}

                        {mode === 'signup' && (
                            <label className="flex items-start gap-2 text-sm text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={policyAccepted}
                                    onChange={(e) => setPolicyAccepted(e.target.checked)}
                                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>
                                    I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link>, <Link href="/privacy" className="text-blue-600 hover:underline">Privacy</Link> & <Link href="/returns" className="text-blue-600 hover:underline">Refund Policy</Link>
                                </span>
                            </label>
                        )}

                        <div className="flex justify-end">
                            {mode === 'login' && (
                                <Link href="/forgot-password" onClick={handleClose} className="text-sm text-blue-600 hover:underline">
                                    Forgot Password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    Please wait...
                                </>
                            ) : (
                                mode === 'login' ? 'Login' : 'Create Account'
                            )}
                        </button>

                        {mode === 'login' && (
                            <p className="text-xs text-center text-gray-500 mt-3">
                                By logging in, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>, <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and <Link href="/returns" className="text-blue-600 hover:underline">Refund & Cancellation Policy</Link>.
                            </p>
                        )}
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium"
                    >
                        <FcGoogle size={20} />
                        Google
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError('');
                            }}
                            className="text-blue-600 font-medium hover:underline focus:outline-none"
                        >
                            {mode === 'login' ? 'Sign up' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
