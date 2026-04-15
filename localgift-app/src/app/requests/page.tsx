"use client";

import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, MapPin, MessageCircle, XCircle, Inbox, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RequestManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
    const [incoming, setIncoming] = useState<any[]>([]);
    const [outgoing, setOutgoing] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push("/login"); return; }

        Promise.all([
            api.getIncomingRequests().catch(() => []),
            api.getOutgoingRequests().catch(() => []),
        ]).then(([inc, out]) => {
            setIncoming(inc);
            setOutgoing(out);
            setLoading(false);
        });
    }, [user, authLoading, router]);

    const handleAccept = async (requestId: number) => {
        try {
            await api.acceptRequest(requestId);
            toast.success("Request accepted! The requester has been notified.");
            setIncoming(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r.item_id === incoming.find(ir => ir.id === requestId)?.item_id && r.id !== requestId ? { ...r, status: 'declined' } : r));
        } catch (err: any) {
            toast.error(err.message || "Failed to accept");
        }
    };

    const handleDecline = async (requestId: number) => {
        try {
            await api.declineRequest(requestId);
            toast.success("Request declined.");
            setIncoming(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r));
        } catch (err: any) {
            toast.error(err.message || "Failed to decline");
        }
    };

    if (authLoading || loading) {
        return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const pendingIncoming = incoming.filter(r => r.status === 'pending');
    const acceptedIncoming = incoming.filter(r => r.status === 'accepted');

    return (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Item Requests</h1>
                <p className="text-muted-foreground">Manage requests — first come, first served.</p>
            </div>

            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab("incoming")}
                    className={`px-6 py-3 font-semibold transition-colors relative flex items-center gap-2 ${activeTab === "incoming" ? "text-primary" : "text-muted-foreground"}`}>
                    <Inbox size={18} /> Incoming ({incoming.length})
                    {activeTab === "incoming" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button onClick={() => setActiveTab("outgoing")}
                    className={`px-6 py-3 font-semibold transition-colors relative flex items-center gap-2 ${activeTab === "outgoing" ? "text-primary" : "text-muted-foreground"}`}>
                    <Send size={18} /> My Requests ({outgoing.length})
                    {activeTab === "outgoing" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            {activeTab === "incoming" && (
                <div className="space-y-4">
                    {pendingIncoming.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending ({pendingIncoming.length})</h3>
                            <div className="space-y-4">
                                {pendingIncoming.map((req, idx) => (
                                    <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                        className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg">{req.items?.title || 'Item'}</h4>
                                                <p className="text-sm text-muted-foreground">Requested by <span className="text-foreground font-medium">{req.requester_name}</span> ({req.requester_email})</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full font-medium">
                                                <Clock size={14} /> #{idx + 1} in queue
                                            </div>
                                        </div>
                                        {req.message && (
                                            <div className="bg-secondary/50 p-3 rounded-xl text-sm italic mb-3 border">&ldquo;{req.message}&rdquo;</div>
                                        )}
                                        {req.scheduled_time && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                <Calendar size={16} /> Preferred time: <span className="font-medium text-foreground">{req.scheduled_time}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-3 border-t pt-3">
                                            <button onClick={() => handleDecline(req.id)} className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center gap-2 font-medium hover:bg-destructive/20 transition-colors">
                                                <XCircle size={18} /> Decline
                                            </button>
                                            <button onClick={() => handleAccept(req.id)} className="flex-[2] py-2 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 font-medium hover:bg-primary/90 shadow-md transition-colors">
                                                <CheckCircle size={18} /> Accept (FCFS #{idx + 1})
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                    {acceptedIncoming.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accepted ({acceptedIncoming.length})</h3>
                            <div className="space-y-4">
                                {acceptedIncoming.map(req => (
                                    <div key={req.id} className="bg-card border border-emerald-200 rounded-2xl p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold">{req.items?.title || 'Item'}</h4>
                                            <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle size={14} /> Accepted</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">Given to <span className="text-foreground font-medium">{req.requester_name}</span></p>
                                        <Link href="/chat" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"><MessageCircle size={16} /> Chat with requester</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {incoming.length === 0 && (
                        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                            <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
                            <p className="text-muted-foreground">When someone requests your items, they will appear here.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "outgoing" && (
                <div className="space-y-4">
                    {outgoing.map((req, idx) => (
                        <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="bg-card border rounded-2xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold">{req.items?.title || 'Item'}</h4>
                                    <p className="text-sm text-muted-foreground">Requested {req.created_at ? new Date(req.created_at).toLocaleDateString() : ''}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${req.status === 'pending' ? 'text-amber-600 bg-amber-500/10' :
                                        req.status === 'accepted' ? 'text-emerald-600 bg-emerald-500/10' :
                                            'text-red-600 bg-red-500/10'
                                    }`}>
                                    {req.status === 'pending' ? '⏳ Pending' : req.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                                </span>
                            </div>
                            {req.scheduled_time && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <Calendar size={16} /> Scheduled: {req.scheduled_time}
                                </div>
                            )}
                            {req.status === 'accepted' && (
                                <div className="mt-3">
                                    <Link href="/chat" className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                                        <MessageCircle size={16} /> Chat with owner
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    ))}
                    {outgoing.length === 0 && (
                        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                            <Send size={48} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
                            <p className="text-muted-foreground">Browse items and request ones you&apos;re interested in!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
