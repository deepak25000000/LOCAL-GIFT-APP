"use client";

import { motion } from "framer-motion";
import { Bell, MessageCircle, Calendar, Package, MoreHorizontal, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
    const notifications = [
        {
            id: "n1",
            icon: MessageCircle,
            color: "bg-blue-500",
            title: "New message from Sarah M.",
            description: "Re: Vintage Leather Sofa. \"Yes, tomorrow at 5 PM works perfectly...\"",
            time: "2 hours ago",
            unread: true
        },
        {
            id: "n2",
            icon: Calendar,
            color: "bg-emerald-500",
            title: "Pickup Reminder",
            description: "You have a pickup scheduled for Wooden Dining Table tomorrow at 5:00 PM.",
            time: "4 hours ago",
            unread: true
        },
        {
            id: "n3",
            icon: CheckCircle,
            color: "bg-primary",
            title: "Request Approved",
            description: "Your request for \"Box of Children's Books\" has been approved by Emily R.",
            time: "Yesterday",
            unread: false
        },
        {
            id: "n4",
            icon: Package,
            color: "bg-orange-500",
            title: "Your listing is active",
            description: "\"Set of Ceramic Plates\" is now live and visible to nearby users.",
            time: "2 days ago",
            unread: false
        }
    ];

    return (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
                    <p className="text-muted-foreground">Stay updated on your requests and messages.</p>
                </div>
                <button className="text-sm font-medium text-primary hover:underline">
                    Mark all as read
                </button>
            </div>

            <div className="bg-card border rounded-3xl shadow-sm overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                        {notifications.map((notif, idx) => {
                            const Icon = notif.icon;
                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-4 sm:p-6 flex gap-4 hover:bg-secondary/50 transition-colors cursor-pointer ${notif.unread ? "bg-primary/5" : ""}`}
                                >
                                    <div className={`mt-1 flex-shrink-0 w-10 h-10 ${notif.color} text-white rounded-full flex items-center justify-center shadow-md`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-sm sm:text-base ${notif.unread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                                                {notif.title}
                                            </h3>
                                            <button className="text-muted-foreground hover:bg-secondary p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>

                                        <p className={`text-sm mb-2 line-clamp-2 ${notif.unread ? "text-foreground" : "text-muted-foreground"}`}>
                                            {notif.description}
                                        </p>

                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {notif.time}
                                        </span>
                                    </div>

                                    {notif.unread && (
                                        <div className="flex-shrink-0 flex items-center justify-center">
                                            <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">You're all caught up!</h3>
                        <p className="text-muted-foreground max-w-sm">
                            We'll let you know when there's an update on your listings or requests.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
