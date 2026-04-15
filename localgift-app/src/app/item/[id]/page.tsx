"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, MessageCircle, Share2, AlertTriangle, ShieldCheck, Loader2, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useState, use, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import toast from "react-hot-toast";

type ItemDetails = {
    id: string;
    title: string;
    description: string;
    condition: string;
    category: string;
    images: string[];
    requestCount: number;
    latitude: number;
    longitude: number;
    owner_id: string;
    owner_name: string;
    owner_avatar: string;
    owner_email: string;
    created_at: string;
    status: string;
};

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [activeImage, setActiveImage] = useState(0);
    const [item, setItem] = useState<ItemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [scheduledTime, setScheduledTime] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [requesting, setRequesting] = useState(false);
    const [alreadyRequested, setAlreadyRequested] = useState(false);

    useEffect(() => {
        async function fetchItem() {
            try {
                const data = await api.getItem(id);
                setItem({
                    ...data,
                    id: data.id.toString(),
                    images: data.images?.length ? data.images.map((img: string) => api.getImageUrl(img)) : [
                        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"
                    ],
                });
            } catch (error) {
                console.error("Failed to fetch item:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchItem();
    }, [id]);

    const handleRequest = async () => {
        if (!item || !user || !scheduledTime) return;
        try {
            setRequesting(true);
            const result = await api.createRequest({
                itemId: Number(item.id),
                scheduledTime,
                message: requestMessage,
            });
            toast.success(`Request sent! You are #${result.position} in queue. Check your email for confirmation.`);
            setAlreadyRequested(true);
        } catch (err: any) {
            toast.error(err.message || "Failed to send request");
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
    }

    if (!item) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <AlertTriangle className="text-destructive w-16 h-16 mb-4 opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Item Not Found</h1>
                <Link href="/dashboard" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">Back to Listings</Link>
            </div>
        );
    }

    const isOwner = user?.id === item.owner_id;
    const timeAgo = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently";

    return (
        <div className="flex-1 container mx-auto px-4 py-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors group">
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to listings
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Images */}
                <div className="lg:col-span-3 space-y-4">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square sm:aspect-video lg:aspect-square bg-muted rounded-3xl overflow-hidden border shadow-sm">
                        <img src={item.images[activeImage]} alt={item.title} className="w-full h-full object-cover" />
                    </motion.div>
                    {item.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {item.images.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImage(idx)}
                                    className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === idx ? "border-primary shadow-md opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="lg:col-span-2">
                    <div className="sticky top-24">
                        <div className="mb-6">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold tracking-wide uppercase">{item.condition}</span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary flex items-center gap-1">
                                    <Users size={14} /> {item.requestCount} request{item.requestCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{item.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                                <div className="flex items-center"><Clock size={16} className="mr-1.5" /> Listed {timeAgo}</div>
                                <div className="px-2 py-0.5 bg-secondary rounded-md text-xs font-medium">{item.category}</div>
                            </div>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
                        </div>

                        {/* Owner Info */}
                        <div className="p-6 bg-card border rounded-2xl shadow-sm mb-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <ShieldCheck className="text-green-500" size={20} /> About the Giver
                            </h3>
                            <div className="flex items-center gap-4">
                                <img src={item.owner_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.owner_name}`} alt="" className="w-12 h-12 rounded-full ring-2 ring-primary/20 object-cover" />
                                <div>
                                    <h4 className="font-bold text-foreground">{item.owner_name}</h4>
                                    <p className="text-xs text-muted-foreground">{item.owner_email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Request Form */}
                        {!isOwner && item.status === 'available' && (
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium flex items-center gap-2"><Calendar size={16} /> Choose a time to view the item</label>
                                    <input type="datetime-local" className="w-full px-3 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Message (optional)</label>
                                    <textarea rows={2} placeholder="Hi, I'm interested in this item..." className="w-full px-3 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} />
                                </div>
                                <button onClick={handleRequest} disabled={!scheduledTime || !user || requesting || alreadyRequested}
                                    className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl shadow-lg hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                    <MessageCircle size={22} />
                                    {alreadyRequested ? "✅ Request Sent" : requesting ? "Sending..." : "Request This Item"}
                                </button>
                                {!user && <p className="text-xs text-center text-destructive">Please <Link href="/login" className="underline">log in</Link> to request items.</p>}
                                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                                    <AlertTriangle size={12} /> First come, first served. You&apos;ll get an email confirmation.
                                </p>
                            </div>
                        )}

                        {isOwner && (
                            <div className="p-4 bg-secondary/50 border rounded-xl text-sm text-muted-foreground text-center">This is your item. <Link href="/requests" className="text-primary font-medium hover:underline">View requests →</Link></div>
                        )}

                        {item.status === 'claimed' && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-700 text-center font-medium">✅ This item has been claimed.</div>
                        )}

                        {/* Chat with owner */}
                        {!isOwner && user && (
                            <Link href={`/chat?itemId=${item.id}&sellerId=${item.owner_id}&itemTitle=${encodeURIComponent(item.title)}&sellerName=${encodeURIComponent(item.owner_name)}&sellerAvatar=${encodeURIComponent(item.owner_avatar || '')}`}
                                className="w-full py-3 mt-3 border rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-secondary transition-colors">
                                <MessageCircle size={18} /> Chat with {item.owner_name}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
