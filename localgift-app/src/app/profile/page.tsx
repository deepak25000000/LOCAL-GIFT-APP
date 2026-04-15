"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Package, Clock, Edit2, Settings, LogOut, Camera, Check, X, Mail } from "lucide-react";
import { ItemCard, ItemCardSkeleton } from "@/components/ItemCard";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, logout, loading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [activeTab, setActiveTab] = useState('active');
    const [profile, setProfile] = useState<any>(null);
    const [userItems, setUserItems] = useState<any[]>([]);
    const [savedItems, setSavedItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push("/login"); return; }

        setEditName(user.name);

        Promise.all([
            api.getUserProfile(user.id).catch(() => null),
            api.getUserItems(user.id).catch(() => []),
            api.getSavedItems(user.id).catch(() => []),
        ]).then(([profileData, items, saved]) => {
            setProfile(profileData);
            const mapItem = (item: any) => ({
                id: String(item.id),
                title: item.title,
                image: item.images?.length > 0 ? api.getImageUrl(item.images[0]) : "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800",
                condition: item.condition,
                distance: "Nearby",
                timeAgo: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently",
                owner: { name: item.owner_name }
            });
            setUserItems(items.map(mapItem));
            setSavedItems(saved.map(mapItem));
            setIsLoading(false);
        });
    }, [user, authLoading, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const handleSaveProfile = async () => {
        if (!editName.trim() || !user) return;
        try {
            await api.updateUserProfile(user.id, { name: editName });
            toast.success("Profile updated!");
            setIsEditing(false);
        } catch (err) {
            toast.error("Failed to update profile");
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-card border rounded-3xl p-6 sm:p-10 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />

                <div className="relative z-10 flex-shrink-0">
                    <div className="w-32 h-32 rounded-full border-4 border-background shadow-lg overflow-hidden relative group">
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover bg-secondary" />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        {isEditing ? (
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="px-3 py-1.5 text-2xl font-bold border rounded-lg bg-background focus:ring-2 focus:ring-primary outline-none" autoFocus />
                                <button onClick={handleSaveProfile} className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Check size={18} /></button>
                                <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="p-2 border rounded-lg hover:bg-secondary"><X size={18} /></button>
                            </div>
                        ) : (
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                        )}

                        <div className="flex gap-3 justify-center md:justify-end">
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border rounded-xl hover:bg-secondary font-medium text-sm flex items-center gap-2 transition-colors">
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            )}
                            <button onClick={handleLogout} className="p-2 border border-destructive/20 text-destructive rounded-xl hover:bg-destructive/10 transition-colors" title="Sign out">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center text-primary/80 font-medium">
                            <Mail size={16} className="mr-1" />
                            {user.email}
                        </div>
                        <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                        </div>
                        {user.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">Admin</span>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t pt-6">
                        <div className="text-center md:text-left">
                            <div className="text-2xl font-bold text-foreground">{userItems.length}</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center justify-center md:justify-start gap-1">
                                <Package size={14} /> Active
                            </div>
                        </div>
                        <div className="text-center md:text-left border-l border-r px-4">
                            <div className="text-2xl font-bold text-foreground">{profile?.itemsGiven || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center justify-center md:justify-start gap-1">
                                <Package size={14} className="opacity-50" /> Given
                            </div>
                        </div>
                        <div className="text-center md:text-left pl-4">
                            <div className="text-2xl font-bold text-foreground">{savedItems.length}</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                                Saved
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Tabs & Content */}
            <div>
                <div className="flex border-b mb-6 overflow-x-auto scrollbar-hide">
                    {['active', 'saved'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors capitalize ${activeTab === tab ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
                            {tab === 'active' ? `Active Listings (${userItems.length})` : `Saved Items (${savedItems.length})`}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={`s-${i}`} />)}
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {activeTab === 'active' && userItems.map((item) => <ItemCard key={item.id} {...item} />)}
                            {activeTab === 'active' && userItems.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium text-foreground mb-1">No Active Listings</h3>
                                    <p>You haven&apos;t listed any items yet.</p>
                                </div>
                            )}
                            {activeTab === 'saved' && savedItems.map((item) => <ItemCard key={item.id} {...item} />)}
                            {activeTab === 'saved' && savedItems.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    <Star size={48} className="mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium text-foreground mb-1">No Saved Items</h3>
                                    <p>Items you save will appear here.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
