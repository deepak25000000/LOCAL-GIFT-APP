"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const { loginWithEmail, loginWithGoogle, user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    if (user) {
        if (user.role === 'admin') {
            router.push("/admin");
        } else {
            router.push("/dashboard");
        }
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
        const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
        const email = emailInput?.value;
        const password = passwordInput?.value;

        if (!email || !password) { setLoading(false); return; }

        try {
            await loginWithEmail(email, password);
            toast.success("Welcome back!");
            // Redirect is handled by useEffect
        } catch (err: any) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            toast.success("Welcome to LocalGift!");
            // Redirect is handled by useEffect
        } catch (err: any) {
            toast.error(err.message || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border shadow-lg rounded-2xl p-8"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex bg-primary text-primary-foreground p-3 rounded-2xl mb-4 shadow-md">
                        <Gift size={28} className="stroke-[2.5]" />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-sm mt-2">Sign in to your LocalGift account</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 px-0.5 text-muted-foreground" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Password</label>
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 px-0.5 text-muted-foreground" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>



                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all mt-6 shadow-md disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="relative mt-8 mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 border-2 rounded-xl flex justify-center items-center gap-2 hover:bg-secondary font-medium transition-all disabled:opacity-50"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                        <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                        <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                        <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                        <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                    </svg>
                    Google
                </button>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                </p>
                <p className="text-center text-xs text-muted-foreground mt-3">
                    <Link href="/admin-login" className="text-indigo-500 hover:underline">Admin Portal →</Link>
                </p>
            </motion.div>
        </div>
    );
}
