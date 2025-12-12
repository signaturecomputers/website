"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/admindashboard");

    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <AuthProvider>
            <CartProvider>
                <ScrollToTop />
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
            </CartProvider>
        </AuthProvider>
    );
}
