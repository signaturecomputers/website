"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Save, AlertTriangle, Upload, Trash2, Image as ImageIcon, FileSignature } from "lucide-react";
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

    useEffect(() => {
        // Fetch current signature
        fetchSignature();
    }, []);

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
            const docRef = doc(db, "admin_settings", "admin_access_key");
            const docSnap = await getDoc(docRef);

            const data = {
                key: newKey,
                updatedBy: adminUser.username,
                updatedAt: Timestamp.now(),
            };

            if (docSnap.exists()) {
                await updateDoc(docRef, data);
            } else {
                await setDoc(docRef, data);
            }

            setMessage({ type: "success", text: "Access Key updated successfully!" });
            setNewKey("");
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
        </div>
    );
}
