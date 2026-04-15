"use client";

import { motion } from "framer-motion";
import { ItemCard, ItemCardSkeleton } from "@/components/ItemCard";
import { Search, Map as MapIcon, Filter, Layers, MapPin, SlidersHorizontal, Package, Tag, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Item } from "@/types";
import { useRouter } from "next/navigation";


export default function Dashboard() {
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadItems() {
            try {
                const data = await api.getItems();
                setItems(data);
            } catch (err) {
                console.error("Failed to load items", err);
            } finally {
                setLoading(false);
            }
        }
        loadItems();
    }, []);

    function formatTimeAgo(isoDate: string | undefined) {
        if (!isoDate) return "Recently";
        const seconds = Math.floor((new Date().getTime() - new Date(isoDate).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    function computeDistance(lat: number, lng: number) {
        // Base center of New Delhi matching map logic
        const userLat = 28.6139;
        const userLng = 77.2090;
        const R = 3958.8; // Radius of earth in miles
        const dLat = (lat - userLat) * Math.PI / 180;
        const dLon = (lng - userLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1) + " miles away";
    }

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            {/* Activity Summary / Hero */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-10 mb-10 overflow-hidden relative"
            >
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Discover items nearby</h1>
                    <p className="text-muted-foreground text-lg mb-6">
                        There are <span className="text-foreground font-semibold">{items.length} items</span> waiting to be claimed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                placeholder="Search for furniture, books, electronics..."
                                className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>
                        <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md">
                            <Search size={18} />
                            Search
                        </button>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-20 -top-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            </motion.div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium whitespace-nowrap">
                        All Categories
                    </button>
                    <button className="px-4 py-2 bg-background border hover:bg-secondary rounded-full text-sm font-medium whitespace-nowrap transition-colors">
                        Furniture
                    </button>
                    <button className="px-4 py-2 bg-background border hover:bg-secondary rounded-full text-sm font-medium whitespace-nowrap transition-colors">
                        Electronics
                    </button>
                    <button className="px-4 py-2 bg-background border hover:bg-secondary rounded-full text-sm font-medium whitespace-nowrap transition-colors">
                        Clothing
                    </button>
                    <button className="p-2 border rounded-full hover:bg-secondary transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="flex bg-secondary p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                            viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Layers size={16} /> Grid
                    </button>
                    <button
                        onClick={() => router.push("/map")}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all text-muted-foreground hover:text-foreground"
                    >
                        <MapIcon size={16} /> Map
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === "grid" ? (
                <div>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />
                        Recently Added Near You
                    </h2>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ItemCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center text-muted-foreground">No items currently available. Try adding one!</p>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {items.map((item: any, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.03, 0.4) }}
                                >
                                    <ItemCard
                                        id={String(item.id)}
                                        title={item.title}
                                        image={item.images && item.images.length > 0 ? api.getImageUrl(item.images[0]) : `https://picsum.photos/seed/${item.id}/800/600`}
                                        condition={item.condition}
                                        distance={computeDistance(item.latitude, item.longitude)}
                                        timeAgo={formatTimeAgo(item.created_at)}
                                        owner={{ name: item.ownerName, avatar: item.ownerAvatar }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
