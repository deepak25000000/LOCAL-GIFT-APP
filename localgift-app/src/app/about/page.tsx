"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
    return (
        <div className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <h1 className="text-4xl font-bold tracking-tight">About LocalGift</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    LocalGift is a community-driven platform designed to reduce waste and foster local connections by making it easy to give away items you no longer need.
                </p>

                <div className="grid md:grid-cols-2 gap-8 pt-8">
                    <div className="bg-card p-8 rounded-3xl border shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                        <p className="text-muted-foreground">
                            We believe that one person's clutter is another person's treasure. By creating a hyper-local network for item gifting, we aim to drastically reduce landfill waste while helping neighbors support neighbors.
                        </p>
                    </div>
                    <div className="bg-card p-8 rounded-3xl border shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4">How It Started</h2>
                        <p className="text-muted-foreground">
                            Born out of a desire to find a better home for perfectly good furniture during a move, LocalGift was built to solve the hassle of selling low-value items and the guilt of throwing them away.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
