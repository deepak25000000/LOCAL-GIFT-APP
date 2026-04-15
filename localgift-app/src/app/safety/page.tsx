"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, UserCheck } from "lucide-react";

export default function SafetyPage() {
    return (
        <div className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <h1 className="text-4xl font-bold tracking-tight">Safety Guidelines</h1>
                <p className="text-lg text-muted-foreground">
                    Your safety is our top priority. Please review our community guidelines before arranging a meetup or exchanging items.
                </p>

                <div className="space-y-6 pt-8">
                    <div className="flex gap-4 p-6 bg-card border rounded-2xl">
                        <div className="text-primary mt-1"><Shield size={24} /></div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Meet in Public Spaces</h3>
                            <p className="text-muted-foreground">Whenever possible, arrange pickups in well-lit, public areas during daylight hours. Many police stations offer designated "Safe Exchange Zones" in their parking lots.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-card border rounded-2xl">
                        <div className="text-primary mt-1"><UserCheck size={24} /></div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Check Profiles</h3>
                            <p className="text-muted-foreground">Review the user's profile and ratings before agreeing to a meetup. If an account is brand new with no history, exercise extra caution.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl">
                        <div className="text-red-500 mt-1"><AlertTriangle size={24} /></div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">Never Send Money</h3>
                            <p className="text-red-600/80 dark:text-red-300/80">LocalGift is entirely free. If a user asks for "shipping fees", "holding deposits", or any form of payment, report them immediately.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
