"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
                    <p className="text-xl text-muted-foreground">Have a question or need to report an issue? We're here to help.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Mail /></div>
                            <div>
                                <h3 className="font-semibold text-lg">Email Support</h3>
                                <p className="text-muted-foreground">support@localgift.com</p>
                                <p className="text-sm text-muted-foreground mt-1">We aim to respond within 24 hours.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><MapPin /></div>
                            <div>
                                <h3 className="font-semibold text-lg">Headquarters</h3>
                                <p className="text-muted-foreground">123 Community Lane</p>
                                <p className="text-muted-foreground">Portland, OR 97204</p>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-4 bg-card p-6 border rounded-3xl" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input type="text" className="w-full mt-1 px-4 py-2 border rounded-xl bg-background" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input type="email" className="w-full mt-1 px-4 py-2 border rounded-xl bg-background" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Message</label>
                            <textarea rows={4} className="w-full mt-1 px-4 py-2 border rounded-xl bg-background resize-none" placeholder="How can we help?" />
                        </div>
                        <button className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
