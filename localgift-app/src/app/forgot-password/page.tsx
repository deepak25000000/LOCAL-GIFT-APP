"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-12 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border shadow-lg rounded-2xl p-8"
            >
                <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to login
                </Link>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {!submitted ? (
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
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

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all pt-2 shadow-md mt-4 flex items-center justify-center"
                        >
                            Send static link
                        </button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-6 bg-secondary/50 rounded-xl"
                    >
                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We've sent a password reset link to your email address. It may take a few minutes to arrive.
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
