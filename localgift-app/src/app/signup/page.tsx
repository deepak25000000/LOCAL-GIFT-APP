"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Gift, Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignupPage() {
    const router = useRouter();
    const { signupWithEmail, loginWithGoogle, user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (user) {
        if (user.role === 'admin') router.push("/admin");
        else router.push("/dashboard");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const nameInput = form.querySelector('input[name="fullName"]') as HTMLInputElement;
        const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
        const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;


        try {
            await signupWithEmail(emailInput.value, passwordInput.value, nameInput.value);
            toast.success("Account created! Welcome to LocalGift!");
            // Redirect happens in useEffect
        } catch (err: any) {
            toast.error(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);

        try {
            await loginWithGoogle();
            toast.success("Welcome to LocalGift!");
            // Redirect happens in useEffect
        } catch (err: any) {
            toast.error(err.message || "Google signup failed");
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
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground text-sm mt-2">Join your local gifting community</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 px-0.5 text-muted-foreground" size={20} />
                            <input name="fullName" type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 px-0.5 text-muted-foreground" size={20} />
                            <input type="email" placeholder="name@example.com" className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 px-0.5 text-muted-foreground" size={20} />
                            <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all" required minLength={8} />
                        </div>
                        <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                    </div>



                    <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all mt-6 shadow-md disabled:opacity-50">
                        {loading ? "Creating..." : "Create account"}
                    </button>
                </form>

                <div className="relative mt-8 mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-card text-muted-foreground">Or continue with</span></div>
                </div>

                <button type="button" onClick={handleGoogleSignup} disabled={loading} className="w-full py-2.5 border-2 rounded-xl flex justify-center items-center gap-2 hover:bg-secondary font-medium transition-all disabled:opacity-50">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                        <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                        <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                        <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                        <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
                    </svg>
                    Google
                </button>

                <p className="text-center text-sm text-muted-foreground mt-8">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                </p>
                <p className="text-center text-xs text-muted-foreground mt-3">
                    <Link href="/admin-signup" className="text-indigo-500 hover:underline">Register as Admin →</Link>
                </p>
            </motion.div>
        </div>
    );
}
