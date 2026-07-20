"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface AdminUser {
    username: string;
    role: "admin" | "staff";
}

interface AdminAuthContextType {
    adminUser: AdminUser | null;
    gatewayVerified: boolean;
    login: (user: AdminUser) => void;
    logout: () => void | Promise<void>;
    verifyGateway: () => void;
    loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [gatewayVerified, setGatewayVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check session storage on mount
        const storedUser = sessionStorage.getItem("admin_user");
        const storedGateway = sessionStorage.getItem("admin_gateway_verified");

        if (storedUser) {
            setAdminUser(JSON.parse(storedUser));
        }
        if (storedGateway === "true") {
            setGatewayVerified(true);
        }
        setLoading(false);
    }, []);

    const login = (user: AdminUser) => {
        setAdminUser(user);
        sessionStorage.setItem("admin_user", JSON.stringify(user));
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Firebase signout error:", error);
        }
        setAdminUser(null);
        setGatewayVerified(false);
        sessionStorage.removeItem("admin_user");
        sessionStorage.removeItem("admin_gateway_verified");
        router.push("/");
    };

    const verifyGateway = () => {
        setGatewayVerified(true);
        sessionStorage.setItem("admin_gateway_verified", "true");
    };

    return (
        <AdminAuthContext.Provider
            value={{
                adminUser,
                gatewayVerified,
                login,
                logout,
                verifyGateway,
                loading,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }
    return context;
}
