"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { updateSiteTheme, updateWindowsPrice, updateAdminAccessKey } from "@/lib/admin-actions";
import { Save, AlertTriangle, Upload, Trash2, Image as ImageIcon, FileSignature, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
    const { adminUser } = useAdminAuth();
    const [currentKey, setCurrentKey] = useState("••••••••");
    const [newKey, setNewKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Signature state
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [signatureLoading, setSignatureLoading] = useState(true);
    const [uploadingSignature, setUploadingSignature] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Theme state
    const [currentTheme, setCurrentTheme] = useState("default");
    const [themeLoading, setThemeLoading] = useState(true);
    const [updatingTheme, setUpdatingTheme] = useState(false);

    // Windows Installation state
    const [windowsPrice, setWindowsPrice] = useState(5000);
    const [windowsPriceLoading, setWindowsPriceLoading] = useState(true);
    const [updatingWindowsPrice, setUpdatingWindowsPrice] = useState(false);
    const [newWindowsPrice, setNewWindowsPrice] = useState("");

    useEffect(() => {
        // Fetch current signature
        fetchSignature();
        fetchTheme();
        fetchWindowsPrice();
    }, []);

    const fetchTheme = async () => {
        try {
            const docRef = doc(db, "site_settings", "theme");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCurrentTheme(docSnap.data().currentTheme || "default");
            }
        } catch (error) {
            console.error("Error fetching theme:", error);
        } finally {
            setThemeLoading(false);
        }
    };

    const handleUpdateTheme = async (newTheme: string) => {
        if (adminUser?.role !== "admin") {
            toast.error("Only ADMIN can change the theme");
            return;
        }

        setUpdatingTheme(true);
        try {
            const result = await updateSiteTheme(newTheme, adminUser.username);
            if (result.success) {
                setCurrentTheme(newTheme);
                toast.success(`Theme updated to ${newTheme}`);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error updating theme:", error);
            toast.error("Failed to update theme");
        } finally {
            setUpdatingTheme(false);
        }
    };

    const fetchSignature = async () => {
        setSignatureLoading(true);
        try {
            const response = await fetch('/api/admin/signature');
            const data = await response.json();
            if (data.signatureUrl) {
                setSignatureUrl(data.signatureUrl);
            }
        } catch (error) {
            console.error("Error fetching signature:", error);
        } finally {
            setSignatureLoading(false);
        }
    };

    const handleUpdateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey || newKey.length < 5) {
            setMessage({ type: "error", text: "Key must be at least 5 characters." });
            return;
        }

        if (adminUser?.role !== "admin") {
            setMessage({ type: "error", text: "Only ADMIN Role can change the access key." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const result = await updateAdminAccessKey(newKey, adminUser.username);
            if (result.success) {
                setMessage({ type: "success", text: "Access Key updated successfully!" });
                setNewKey("");
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("Error updating key:", err);
            setMessage({ type: "error", text: "Failed to update key." });
        } finally {
            setLoading(false);
        }
    };

    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        if (adminUser?.role !== "admin") {
            toast.error("Only ADMIN can update the signature");
            return;
        }

        setUploadingSignature(true);
        try {
            // Upload to Firebase Storage
            const fileName = `invoice_signature_${Date.now()}.${file.name.split('.').pop()}`;
            const storageRef = ref(storage, `admin/signatures/${fileName}`);

            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            // Save URL to Firestore via API
            const response = await fetch('/api/admin/signature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signatureUrl: downloadUrl })
            });

            if (!response.ok) {
                throw new Error('Failed to save signature');
            }

            setSignatureUrl(downloadUrl);
            toast.success('Signature uploaded successfully!');
        } catch (error) {
            console.error("Error uploading signature:", error);
            toast.error('Failed to upload signature');
        } finally {
            setUploadingSignature(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveSignature = async () => {
        if (adminUser?.role !== "admin") {
            toast.error("Only ADMIN can remove the signature");
            return;
        }

        if (!confirm('Are you sure you want to remove the signature?')) return;

        setUploadingSignature(true);
        try {
            // Delete from API
            const response = await fetch('/api/admin/signature', {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove signature');
            }

            setSignatureUrl(null);
            toast.success('Signature removed successfully!');
        } catch (error) {
            console.error("Error removing signature:", error);
            toast.error('Failed to remove signature');
        } finally {
            setUploadingSignature(false);
        }
    };

    const fetchWindowsPrice = async () => {
        setWindowsPriceLoading(true);
        try {
            const docRef = doc(db, "site_settings", "windowsInstallation");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setWindowsPrice(docSnap.data().price || 5000);
            }
        } catch (error) {
            console.error("Error fetching Windows installation price:", error);
        } finally {
            setWindowsPriceLoading(false);
        }
    };

    const handleUpdateWindowsPrice = async (e: React.FormEvent) => {
        e.preventDefault();
        const priceValue = parseInt(newWindowsPrice);

        if (!newWindowsPrice || isNaN(priceValue) || priceValue < 0) {
            toast.error("Please enter a valid price");
            return;
        }

        if (adminUser?.role !== "admin") {
            toast.error("Only ADMIN can update Windows installation price");
            return;
        }

        setUpdatingWindowsPrice(true);
        try {
            const result = await updateWindowsPrice(priceValue, adminUser.username);
            if (result.success) {
                setWindowsPrice(priceValue);
                setNewWindowsPrice("");
                toast.success("Windows installation price updated successfully!");
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error updating Windows price:", error);
            toast.error("Failed to update Windows installation price");
        } finally {
            setUpdatingWindowsPrice(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Settings</h1>

            {/* Admin Access Key Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <AlertTriangle className="mr-2 text-yellow-500" size={20} />
                    Admin Access Configuration
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    This key is used to access the login gateway. Changing this will immediately revoke access for anyone using the old link.
                </p>

                {message.text && (
                    <div className={`mb-4 p-4 rounded-lg ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdateKey} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Access Key</label>
                        <input
                            type="text"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="Enter new secret key"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || adminUser?.role !== "admin"}
                        className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Updating..." : "Update Access Key"}
                    </button>

                    {adminUser?.role !== "admin" && (
                        <p className="text-xs text-red-500 mt-2">You need ADMIN privileges to perform this action.</p>
                    )}
                </form>
            </div>

            {/* Invoice Signature Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileSignature className="mr-2 text-blue-500" size={20} />
                    Invoice Signature
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Upload an authorized signature image that will appear on all invoices. This replaces the manual seal.
                </p>

                {signatureLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Current Signature Preview */}
                        {signatureUrl ? (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Signature:</p>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                                        <img
                                            src={signatureUrl}
                                            alt="Current Signature"
                                            className="h-16 object-contain"
                                        />
                                    </div>
                                    <button
                                        onClick={handleRemoveSignature}
                                        disabled={uploadingSignature || adminUser?.role !== "admin"}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No signature uploaded yet</p>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleSignatureUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingSignature || adminUser?.role !== "admin"}
                                className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="w-4 h-4" />
                                {uploadingSignature ? "Uploading..." : signatureUrl ? "Replace Signature" : "Upload Signature"}
                            </button>
                            <span className="text-xs text-gray-500">PNG or JPG, max 2MB</span>
                        </div>

                        {adminUser?.role !== "admin" && (
                            <p className="text-xs text-red-500">You need ADMIN privileges to manage the signature.</p>
                        )}

                        {/* Preview on Invoice */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview on Invoice:</p>
                            <div className="bg-white p-4 rounded shadow-sm max-w-xs">
                                <p className="text-sm mb-2">For Signature Computers</p>
                                <div className="h-12 flex items-end mb-1">
                                    {signatureUrl ? (
                                        <img src={signatureUrl} alt="Signature" className="h-10 object-contain" />
                                    ) : (
                                        <div className="w-24 border-b border-gray-400"></div>
                                    )}
                                </div>
                                <p className="text-xs font-semibold">Authorised Signatory</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Configuration Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="mr-2 text-purple-500" size={20} />
                    Festival Theme Configuration
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Select a theme to apply visual effects to the entire website for special occasions.
                </p>

                {themeLoading ? (
                    <div className="h-10 w-48 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md" />
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'default', name: 'Default (No Effect)', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                            { id: 'christmas', name: 'Christmas (Snowfall)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                            { id: 'newyear', name: 'New Year (Fireworks)', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                            { id: 'diwali', name: 'Diwali (Lights & Diyas)', color: 'bg-orange-50 text-orange-700 border-orange-200' },
                            { id: 'valentines', name: 'Valentines Day (Hearts)', color: 'bg-pink-50 text-pink-700 border-pink-200' },
                            { id: 'republic', name: 'Republic Day (Tricolor)', color: 'bg-slate-50 text-slate-700 border-slate-200' },
                            { id: 'independence', name: 'Independence Day (Tricolor)', color: 'bg-slate-50 text-slate-700 border-slate-200' },
                            { id: 'eid', name: 'Eid Ramazan (Moon/Stars)', color: 'bg-green-50 text-green-700 border-green-200' },
                            { id: 'bakrid', name: 'Bakrid (Moon/Stars)', color: 'bg-green-50 text-green-700 border-green-200' },
                        ].map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => handleUpdateTheme(theme.id)}
                                disabled={updatingTheme || adminUser?.role !== "admin"}
                                className={`
                                    relative px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2
                                    ${currentTheme === theme.id
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900'
                                        : 'border-transparent bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'
                                    }
                                    ${updatingTheme ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <span className={`w-3 h-3 rounded-full ${currentTheme === theme.id ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                                <span className="font-medium">{theme.name}</span>
                                {currentTheme === theme.id && (
                                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {adminUser?.role !== "admin" && (
                    <p className="text-xs text-red-500 mt-4">You need ADMIN privileges to change the theme.</p>
                )}
            </div>

            {/* Windows Installation Pricing Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="mr-2 text-blue-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                    </svg>
                    Windows Installation Pricing
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Configure the price for Windows 11 Pro OEM Key & Installation service for non-Windows (Free DOS, Ubuntu, Linux, etc.) products. This price will be added to the product price when customers select the Windows installation option.
                </p>

                {windowsPriceLoading ? (
                    <div className="h-10 w-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-md" />
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Current Price</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{windowsPrice.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">For Windows 11 Pro OEM Key & Installation</p>
                        </div>

                        <form onSubmit={handleUpdateWindowsPrice} className="space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Update Windows Installation Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={newWindowsPrice}
                                    onChange={(e) => setNewWindowsPrice(e.target.value)}
                                    placeholder={windowsPrice.toString()}
                                    min="0"
                                    step="100"
                                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Enter the new price for Windows installation service
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={updatingWindowsPrice || adminUser?.role !== "admin"}
                                className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {updatingWindowsPrice ? "Updating..." : "Update Price"}
                            </button>

                            {adminUser?.role !== "admin" && (
                                <p className="text-xs text-red-500">You need ADMIN privileges to update the Windows installation price.</p>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
