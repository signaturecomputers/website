"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
    Users,
    LayoutDashboard,
    Settings,
    Package,
    ShoppingCart,
    Menu,
    X,
    LogOut,
    Tag
} from "lucide-react";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { adminUser, logout, loading } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !adminUser) {
            router.push("/admin/login");
        }
    }, [adminUser, loading, router]);

    if (loading || !adminUser) {
        return null; // Or a loading spinner
    }

    const navItems = [
        { name: "Dashboard", href: "/admindashboard", icon: LayoutDashboard },
        { name: "Products", href: "/admindashboard/products", icon: Package },
        { name: "Orders", href: "/admindashboard/orders", icon: ShoppingCart },
        { name: "Categories", href: "/admindashboard/categories", icon: Tag },
        { name: "Users", href: "/admindashboard/users", icon: Users },
        { name: "Settings", href: "/admindashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile Sidebar Backoff */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b dark:border-gray-700">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AdminPanel</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-5 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-gray-700 dark:text-white"
                                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-indigo-600 dark:text-white" : "text-gray-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full border-t dark:border-gray-700 p-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors dark:bg-red-900/10 dark:text-red-400"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b bg-white dark:bg-gray-800 px-6 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center space-x-4 ml-auto">
                        <div className="text-sm text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{adminUser.username}</p>
                            <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {adminUser.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
