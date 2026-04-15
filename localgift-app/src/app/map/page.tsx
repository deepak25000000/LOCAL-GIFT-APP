"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Item } from "@/types";
import dynamic from "next/dynamic";

const MapContent = dynamic(() => import("./MapContent"), {
    ssr: false,
    loading: () => <p className="p-4 flex h-full items-center justify-center text-muted-foreground">Loading Map...</p>,
});

export default function MapPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItems() {
            try {
                const data = await api.getItems();
                setItems(data);
            } catch (error) {
                console.error("Failed to fetch items:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, []);

    return (
        <div className="flex flex-col flex-1 h-[calc(100vh-64px)] overflow-hidden">
            <div className="flex-1 relative flex flex-col md:flex-row">
                {/* Left Sidebar - Item List */}
                <div className="w-full md:w-96 bg-card border-r shadow-xl z-20 flex flex-col h-1/2 md:h-full overflow-hidden">
                    <div className="p-4 border-b">
                        <h1 className="text-2xl font-bold">Local Map</h1>
                        <p className="text-sm text-muted-foreground mt-1">Discover items being given away around you in real-time.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 z-20 relative">
                        {loading && <p className="text-sm text-muted-foreground">Loading items...</p>}
                        {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">No items found.</p>}
                        {!loading && items.length > 0 && (
                            <p className="text-xs text-muted-foreground mb-2">{items.length} items found nearby</p>
                        )}
                        {items.map(item => (
                            <a key={item.id} href={`/item/${item.id}`} className="block p-4 border rounded-xl hover:border-primary transition-colors cursor-pointer bg-background">
                                <div className="flex gap-3">
                                    {item.images && item.images.length > 0 && (
                                        <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                                            <img src={api.getImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-base mb-1 truncate">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground">{item.condition} • by {item.ownerName}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right Area - CesiumJS 3D Globe */}
                <div className="flex-1 relative h-1/2 md:h-full bg-muted z-0">
                    <MapContent items={items} />
                </div>
            </div>
        </div>
    );
}
