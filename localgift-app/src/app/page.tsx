"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Gift, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 sm:p-20 bg-gradient-to-b from-background to-secondary/20">
      <main className="max-w-4xl text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Join the LocalGift community today
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            Share local. <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Impact global.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            People have quality items they want to give away but find large marketplaces too overwhelming or impersonal. We re making local item gifting easy, safe, and truly community-friendly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/25"
          >
            Explore Items
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-primary/20 hover:border-primary/50 text-foreground font-semibold transition-all flex items-center justify-center"
          >
            Create Account
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 border-t"
        >
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50">
            <div className="p-3 bg-secondary rounded-xl mb-4">
              <MapPin className="text-primary" size={28} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Location Based</h3>
            <p className="text-sm text-muted-foreground">Find or give items within your immediate neighborhood securely.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50">
            <div className="p-3 bg-secondary rounded-xl mb-4">
              <Users className="text-primary" size={28} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Community First</h3>
            <p className="text-sm text-muted-foreground">Connect with real people nearby. Build a trusting local network.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50">
            <div className="p-3 bg-secondary rounded-xl mb-4">
              <Gift className="text-primary" size={28} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Zero Waste</h3>
            <p className="text-sm text-muted-foreground">Keep perfectly good items out of landfills and in the community.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
