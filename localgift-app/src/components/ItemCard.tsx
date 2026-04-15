"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export interface ItemCardProps {
    id: string;
    title: string;
    image: string;
    condition: string;
    distance: string;
    timeAgo: string;
    owner: {
        name: string;
        avatar?: string;
    };
}

export function ItemCardSkeleton() {
    return (
        <div className="flex flex-col bg-card rounded-2xl overflow-hidden border shadow-sm h-full animate-pulse">
            <div className="relative aspect-square overflow-hidden bg-secondary" />
            <div className="p-4 flex flex-col flex-1">
                <div className="h-6 bg-secondary rounded-md w-3/4 mb-4"></div>
                <div className="flex gap-2 mb-4">
                    <div className="h-4 bg-secondary rounded-md w-1/3"></div>
                    <div className="h-4 bg-secondary rounded-md w-1/4"></div>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary"></div>
                        <div className="h-4 bg-secondary rounded-md w-16"></div>
                    </div>
                    <div className="h-4 bg-secondary rounded-md w-16"></div>
                </div>
            </div>
        </div>
    );
}

export function ItemCard({
    id,
    title,
    image,
    condition,
    distance,
    timeAgo,
    owner,
}: ItemCardProps) {
    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the item link
        toast.success(`Saved "${title}"!`, {
            icon: '❤️',
            style: {
                borderRadius: '10px',
                background: '#var(--background)',
                color: 'var(--foreground)',
            },
        });
    };

    return (
        <Link href={`/item/${id}`}>
            <motion.div
                whileHover={{ y: -3 }}
                className="group flex flex-col bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full"
            >
                <div className="relative aspect-square overflow-hidden bg-muted">
                    {/* Using highly visual placeholder colors since exact images not available */}
                    <div
                        className="absolute inset-0 bg-secondary group-hover:scale-105 transition-transform duration-500 ease-out"
                        style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md",
                            condition === "New" ? "bg-green-500/90 text-white" :
                                condition === "Like New" ? "bg-blue-500/90 text-white" :
                                    condition === "Good" ? "bg-amber-500/90 text-white" :
                                        "bg-orange-500/90 text-white"
                        )}>
                            {condition}
                        </span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSave}
                        className="absolute top-3 right-3 p-2 rounded-full bg-background/50 backdrop-blur-md text-foreground hover:text-red-500 hover:bg-background/80 transition-colors z-10"
                    >
                        <Heart size={18} />
                    </motion.button>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center text-xs text-muted-foreground mb-4 gap-3">
                        <div className="flex items-center">
                            <MapPin size={14} className="mr-1 text-primary/70" />
                            {distance} away
                        </div>
                        <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {timeAgo}
                        </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                {owner.avatar ? (
                                    <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    owner.name.charAt(0)
                                )}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{owner.name}</span>
                        </div>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                            Request
                            <MessageCircle size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
