"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Menu, Moon, Sun, User, Bell, Shield, LogIn, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading } = useAuth();

    useEffect(() => { setMounted(true); }, []);

    const navLinks = [
        { name: "Explore", path: "/dashboard" },
        { name: "Give Item", path: "/create-listing" },
        { name: "Messages", path: "/chat" },
        { name: "Requests", path: "/requests" },
        { name: "Map", path: "/map" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
                        <Gift size={24} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden sm:block">LocalGift</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link key={link.path} href={link.path}
                            className={cn("text-sm font-medium transition-colors hover:text-primary relative py-1",
                                pathname === link.path
                                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-primary after:rounded-full"
                                    : "text-muted-foreground"
                            )}>
                            {link.name}
                        </Link>
                    ))}
                    {user?.role === 'admin' && (
                        <Link href="/admin" className={cn("text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                            pathname === "/admin" ? "text-primary" : "text-muted-foreground")}>
                            <Shield size={14} /> Admin
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Toggle Theme">
                        {mounted && theme === "dark" ? <Sun size={20} className="text-muted-foreground" /> : <Moon size={20} className="text-muted-foreground" />}
                    </button>

                    {user ? (
                        <Link href="/profile" className="p-1 rounded-full hover:bg-secondary transition-colors hidden sm:block hover:opacity-80">
                            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover bg-secondary" />
                        </Link>
                    ) : (
                        <Link href="/login" className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                            <LogIn size={16} /> Sign In
                        </Link>
                    )}

                    <button className="p-2 md:hidden rounded-full hover:bg-secondary transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} className="text-foreground" />}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-background p-4 absolute w-full shadow-lg">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link key={link.path} href={link.path}
                                className={cn("text-lg font-medium", pathname === link.path ? "text-primary" : "text-muted-foreground")}
                                onClick={() => setMobileMenuOpen(false)}>
                                {link.name}
                            </Link>
                        ))}
                        {user?.role === 'admin' && (
                            <Link href="/admin" className="text-lg font-medium text-muted-foreground flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                <Shield size={18} /> Admin
                            </Link>
                        )}
                        <div className="border-t pt-4">
                            {user ? (
                                <Link href="/profile" className="flex items-center gap-2 text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>
                                    <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" /> {user.name}
                                </Link>
                            ) : (
                                <Link href="/login" className="flex items-center gap-2 text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                                    <LogIn size={18} /> Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
