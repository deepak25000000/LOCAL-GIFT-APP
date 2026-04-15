"use client";

import { motion } from "framer-motion";

export default function SimpleTextPage({ title }: { title: string }) {
    return (
        <div className="flex-1 container mx-auto px-4 py-16 max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold tracking-tight mb-4">{title}</h1>
                <p className="text-xl text-muted-foreground">This section is currently being updated. Please check back later.</p>
                <div className="mt-8 animate-pulse flex justify-center space-x-4">
                    <div className="h-3 w-1/4 bg-muted rounded"></div>
                    <div className="h-3 w-1/3 bg-muted rounded"></div>
                </div>
            </motion.div>
        </div>
    );
}
