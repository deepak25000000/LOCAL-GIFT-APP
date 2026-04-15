"use client";

import { motion } from "framer-motion";
import { MoreVertical, Send, Info, Phone, Video, Search, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";

function ChatPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.push("/login"); return; }

        async function loadConversations() {
            try {
                const convos = await api.getConversations(user!.id);
                setConversations(convos);

                const itemId = searchParams.get('itemId');
                const sellerId = searchParams.get('sellerId');
                const itemTitle = searchParams.get('itemTitle') || "New Item Inquiry";
                const sellerName = searchParams.get('sellerName') || sellerId || 'User';
                const sellerAvatar = searchParams.get('sellerAvatar') || "";

                if (itemId && sellerId && user) {
                    const convoId = `conv_${itemId}_${user.id}_${sellerId}`;
                    const exists = convos.find((c: any) => c.id === convoId);
                    if (exists) {
                        setActiveChat(convoId);
                    } else {
                        await api.createConversation({
                            id: convoId,
                            itemId,
                            buyerId: user.id,
                            buyerName: user.name,
                            buyerAvatar: user.avatar,
                            sellerId,
                            sellerName,
                            sellerAvatar,
                            itemTitle
                        });
                        setConversations(prev => {
                            if (prev.some(c => c.id === convoId)) return prev;
                            return [{ id: convoId, buyer_id: user.id, seller_id: sellerId, seller_name: sellerName, seller_avatar: sellerAvatar, buyer_name: user.name, buyer_avatar: user.avatar, item_title: itemTitle, last_message: "" }, ...prev];
                        });
                        setActiveChat(convoId);
                    }
                } else if (convos.length > 0) {
                    setActiveChat(convos[0].id);
                }
            } catch (err) {
                console.error("Failed to load conversations", err);
            } finally {
                setLoading(false);
            }
        }
        loadConversations();
    }, [searchParams, user, authLoading, router]);

    // Load messages
    useEffect(() => {
        if (!activeChat) return;
        api.getMessages(activeChat).then(setMessages).catch(console.error);
    }, [activeChat]);

    // WebSocket Setup
    useEffect(() => {
        if (!user) return;
        const socket = new WebSocket(api.getWebSocketUrl());

        socket.onopen = () => {
            // Register this user's connection
            socket.send(JSON.stringify({ type: 'register', userId: user.id }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'new_message') {
                    const newMsg = data.payload;
                    if (newMsg.conversationId === activeChat) {
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                    setConversations(prev => prev.map(c =>
                        c.id === newMsg.conversationId
                            ? { ...c, last_message: newMsg.text, updated_at: newMsg.timestamp }
                            : c
                    ));
                }
            } catch (err) { console.error("WS parse error", err); }
        };

        setWs(socket);
        return () => socket.close();
    }, [user, activeChat]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !ws || !activeChat || !user) return;

        ws.send(JSON.stringify({
            type: 'chat_message',
            payload: { conversationId: activeChat, senderId: user.id, text: inputText }
        }));
        setInputText("");
    };

    if (authLoading || loading) {
        return <div className="flex-1 flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
    }

    if (!user) return null;

    const activeConversationInfo = conversations.find(c => c.id === activeChat);
    const getOtherUser = (convo: any) => {
        if (!convo) return { name: "Unknown", avatar: "" };
        if (convo.buyer_id === user.id) {
            return { name: convo.seller_name, avatar: convo.seller_avatar };
        }
        return { name: convo.buyer_name, avatar: convo.buyer_avatar };
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-background h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-card hidden md:flex">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                        <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                            <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
                            <p>No active conversations.</p>
                        </div>
                    ) : conversations.map((chat) => {
                        const otherUser = getOtherUser(chat);
                        return (
                            <button key={chat.id} onClick={() => setActiveChat(chat.id)}
                                className={cn("w-full p-4 flex gap-4 text-left border-b transition-colors hover:bg-secondary/50", activeChat === chat.id ? "bg-secondary" : "")}>
                                <img src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`} alt="" className="w-12 h-12 rounded-full object-cover bg-secondary" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold text-sm truncate pr-2">{otherUser.name}</h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-primary font-medium truncate mb-0.5">{chat.item_title}</p>
                                    <p className="text-sm truncate text-muted-foreground">{chat.last_message || "Started conversation"}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-muted/20 relative">
                {activeChat && activeConversationInfo ? (
                    <>
                        <div className="px-6 py-4 border-b bg-background flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <img src={getOtherUser(activeConversationInfo).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`} alt="" className="w-10 h-10 rounded-full object-cover border" />
                                <div>
                                    <h3 className="font-bold text-foreground leading-tight">{getOtherUser(activeConversationInfo).name}</h3>
                                    <p className="text-xs text-primary font-medium tracking-wide">Re: {activeConversationInfo.item_title}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    <p>Send a message to start the conversation</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center">
                                        <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground border">Beginning of Chat</span>
                                    </div>
                                    {messages.map((msg, idx) => (
                                        <motion.div key={msg.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className={cn("flex flex-col max-w-[75%]", msg.sender_id === user.id || msg.senderId === user.id ? "ml-auto items-end" : "mr-auto items-start")}>
                                            <div className={cn("px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed break-words max-w-full",
                                                msg.sender_id === user.id || msg.senderId === user.id
                                                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-md"
                                                    : "bg-background border rounded-bl-sm shadow-sm")}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground mt-1 px-1">
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                            </span>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-background border-t">
                            <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-end gap-2 bg-secondary p-2 rounded-2xl border focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type your message..." className="flex-1 bg-transparent max-h-32 min-h-[44px] px-3 py-2.5 focus:outline-none resize-none scrollbar-hide text-[15px]"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} />
                                <button type="submit" disabled={!inputText.trim()}
                                    className="p-3 bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5">
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Select a conversation</h3>
                        <p className="text-sm">Choose a chat from the sidebar to view messages.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}>
            <ChatPageContent />
        </Suspense>
    );
}
