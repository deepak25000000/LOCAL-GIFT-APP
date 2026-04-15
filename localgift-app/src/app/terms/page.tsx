"use client";

import { motion } from "framer-motion";

export default function LegalPages() {
    return (
        <div className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mb-8">Last Updated: October 2024</p>

                <div className="prose dark:prose-invert max-w-none text-muted-foreground space-y-4">
                    <p>Welcome to LocalGift. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>

                    <h3 className="text-foreground text-xl font-semibold mt-8">1. User Conduct</h3>
                    <p>Users must treat each other with respect. Harassment, spamming, or fraudulent listings will result in immediate account termination.</p>

                    <h3 className="text-foreground text-xl font-semibold mt-8">2. Item Listings</h3>
                    <p>All items must be offered for free. You may not list illegal items, weapons, recalled products, or live animals.</p>

                    <h3 className="text-foreground text-xl font-semibold mt-8">3. Liability</h3>
                    <p>LocalGift acts solely as an intermediary to connect givers and receivers. We are not responsible for the quality, safety, or legality of the items exchanged, nor for the conduct of users during physical meetups.</p>
                </div>
            </motion.div>
        </div>
    );
}
