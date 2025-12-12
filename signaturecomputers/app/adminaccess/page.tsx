"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";

function AdminGatewayContent() {
    const searchParams = useSearchParams();
    const key = searchParams.get("key");
    const router = useRouter();
    const { verifyGateway } = useAdminAuth();
    const [status, setStatus] = useState<"checking" | "denied" | "success">("checking");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const validateKey = async () => {
            if (!key) {
                setStatus("denied");
                return;
            }

            try {
                const docRef = doc(db, "admin_settings", "admin_access_key");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const storedKey = docSnap.data().key;
                    if (key === storedKey) {
                        verifyGateway();
                        setStatus("success");
                        router.push("/admin/login");
                    } else {
                        setStatus("denied");
                    }
                } else {
                    // If no key set yet, deny or handle setup? 
                    // Defaulting to "denied" for security.
                    console.error("No admin_access_key document found.");
                    setStatus("denied");
                    setErrorMsg("Configuration Error: Key not found in DB");
                }
            } catch (error) {
                console.error("Error validating key:", error);
                setStatus("denied");
                setErrorMsg("System Error");
            }
        };

        validateKey();
    }, [key, router, verifyGateway]);

    if (status === "checking") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
                <p className="animate-pulse">Verifying Access...</p>
            </div>
        );
    }

    if (status === "denied") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-red-950 text-white">
                <h1 className="text-4xl font-bold">ACCESS DENIED</h1>
                <p className="mt-4 text-red-200">Invalid or missing access key.</p>
                {errorMsg && <p className="mt-2 text-sm text-red-400">{errorMsg}</p>}
            </div>
        );
    }

    return null;
}

export default function AdminGateway() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <AdminGatewayContent />
        </Suspense>
    );
}
