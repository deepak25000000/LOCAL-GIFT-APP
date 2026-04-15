"use client";

import { useAuth } from "@/components/AuthContext";
import { LogOut, LayoutDashboard, ArrowLeft, ShieldCheck, Package, Users, FileText, TrendingUp, Map } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Basic Auth Check (Fallback, the page also checks rendering)
    if (!user || user.role !== "admin") {
        return (
            <div className="flex-1 flex justify-center items-center h-screen">
                <div className="text-center">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Restricted Access</h2>
                    <p className="text-muted-foreground mb-6">Redirecting to user experience...</p>
                    <Link href="/dashboard" className="text-primary hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar - Pure Admin Style */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex border-r border-slate-800 shrink-0">
                <div className="p-6 pb-2 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <ShieldCheck className="text-indigo-500" /> LG. System
                    </h1>
                </div>

                <nav className="flex-1 flex flex-col gap-1 p-4">
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 mt-4 px-3">Administration</div>
                    <Link href="/admin" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${pathname === "/admin" ? "bg-indigo-600/20 text-indigo-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                        <LayoutDashboard size={18} /> Overview
                    </Link>

                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 mt-6 px-3">Management</div>
                    <Link href="/admin?tab=items" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
                        <Package size={18} /> Items
                    </Link>
                    <Link href="/admin?tab=users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
                        <Users size={18} /> Users
                    </Link>
                    <Link href="/admin?tab=requests" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
                        <FileText size={18} /> Requests
                    </Link>

                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 mt-6 px-3">Intelligence</div>
                    <Link href="/admin?tab=analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
                        <TrendingUp size={18} /> Analytics
                    </Link>
                    <Link href="/admin?tab=map" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
                        <Map size={18} /> Map View
                    </Link>

                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 mt-8 px-3">Main Platform</div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
                        <ArrowLeft size={18} /> User Dashboard
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg"} alt="" className="w-10 h-10 rounded-full border border-slate-700" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-indigo-400">Superadmin</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Admin Content Container */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-transparent">
                {/* Mobile Header */}
                <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2 font-bold"><ShieldCheck className="text-indigo-500" /> LG Admin</div>
                    <button onClick={logout} className="text-slate-400 hover:text-white"><LogOut size={20} /></button>
                </header>

                {children}
            </main>
        </div>
    );
}
