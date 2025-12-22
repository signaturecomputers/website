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
    Tag,
    Zap,
    Image as ImageIcon,
    MessageSquare,
    Eye,
    Webhook
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
    const [profileOpen, setProfileOpen] = useState(false);

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
        { name: "Quote Requests", href: "/admindashboard/quotes", icon: MessageSquare },
        { name: "Webhook Logs", href: "/admindashboard/webhook-logs", icon: Webhook },
        { name: "Hot Deals", href: "/admindashboard/hot-deals", icon: Zap },
        { name: "Categories", href: "/admindashboard/categories", icon: Tag },
        { name: "Header Images", href: "/admindashboard/header-images", icon: ImageIcon },
        { name: "Feedback", href: "/admindashboard/feedback", icon: MessageSquare },
        { name: "Display Reviews", href: "/admindashboard/display-reviews", icon: Eye },
        { name: "Legal Pages", href: "/admindashboard/legal-pages", icon: Settings },
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

                    {/* Profile Dropdown */}
                    <div className="flex items-center space-x-4 ml-auto relative">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
                            onClick={() => setProfileOpen(!profileOpen)}
                        >
                            <div className="text-sm text-right">
                                <p className="font-medium text-gray-900 dark:text-white">{adminUser.username}</p>
                                <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {adminUser.username.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {profileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 py-2 z-20">
                                    <div className="px-4 py-2 border-b dark:border-gray-700">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">{adminUser.username}</p>
                                        <p className="text-xs text-gray-500">{adminUser.role === 'admin' ? 'Administrator' : 'Staff'}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setProfileOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-900 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

