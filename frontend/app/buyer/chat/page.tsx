"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import { Loader2, MessageCircle } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import BuyerHeader from "@/components/headers/BuyerHeader"
import Footer2 from "@/components/footer/Footer"

function ChatContent({ onTotalUnreadChange }: { onTotalUnreadChange: (count: number) => void }) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [stompClient, setStompClient] = useState<Client | null>(null)

    const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; 
    const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083"; 
    
    const selectedIdRef = useRef("");

    // Sync total unread count to parent component
    useEffect(() => {
        const total = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        onTotalUnreadChange(total);
    }, [conversations, onTotalUnreadChange]);

    // Keep ref in sync for WebSocket closures
    useEffect(() => {
        selectedIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- 1. SYNC READ STATUS ---
    const syncReadStatus = useCallback(async (senderId: string) => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId || !senderId) return;

        try {
            await fetch(`${CHAT_SERVICE_URL}/api/chat/read/${senderId}/${myId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Database sync failed:", err);
        }
    }, [CHAT_SERVICE_URL]);

    // Handle opening a chat
    useEffect(() => {
        if (selectedConversationId) {
            setConversations(prev => prev.map(conv => 
                conv.id === selectedConversationId 
                    ? { ...conv, unread: false, unreadCount: 0 } 
                    : conv
            ));
            syncReadStatus(selectedConversationId);
        }
    }, [selectedConversationId, syncReadStatus]);

    const resolveAndAddContact = async (id: string) => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await fetch(`${AUTH_SERVICE_URL}/auth/fullnames?ids=${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const nameMap = await res.json();
                const newConv: Conversation = {
                    id: id,
                    name: nameMap[id] || "New Contact",
                    lastMessage: "Start a conversation!",
                    avatar: "/buyer-dashboard/farmer-portrait.png",
                    online: false,
                    timestamp: new Date().toISOString(),
                    unread: false, 
                    unreadCount: 0, 
                    starred: false,
                };
                setConversations(prev => prev.some(c => c.id === id) ? prev : [newConv, ...prev]);
            }
        } catch (err) { console.error("Failed to resolve contact:", err); }
    };

    // --- 2. WEBSOCKET LOGIC ---
    useEffect(() => {
        const myId = sessionStorage.getItem("id");
        if (!myId) return;

        const socket = new SockJS(`${CHAT_SERVICE_URL}/ws`); 
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { user: myId },
            onConnect: () => {
                client.subscribe(`/user/${myId}/queue/messages`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    const senderIdStr = newMessage.senderId.toString();
                    const currentActiveId = selectedIdRef.current;

                    // Update messages if chat is open
                    if (senderIdStr === currentActiveId) {
                        setMessages((prev) => [
                            ...prev, 
                            { 
                                ...newMessage,
                                id: newMessage.id?.toString() || Date.now().toString(),
                                imageUrl: newMessage.imageUrl || null,
                                isCurrentUser: false, 
                                isRead: true 
                            } as Message 
                        ]);
                        syncReadStatus(senderIdStr); 
                    }

                    // Update Sidebar
                    setConversations((prev) => {
                        const exists = prev.some(c => c.id === senderIdStr);
                        if (!exists) { resolveAndAddContact(senderIdStr); return prev; }

                        const updated = prev.map(conv => {
                            if (conv.id === senderIdStr) {
                                const isNotOpen = currentActiveId !== senderIdStr;
                                return { 
                                    ...conv, 
                                    lastMessage: newMessage.imageUrl ? "📷 Photo" : newMessage.content, 
                                    timestamp: newMessage.timestamp,
                                    unread: isNotOpen,
                                    unreadCount: isNotOpen ? (conv.unreadCount || 0) + 1 : 0
                                };
                            }
                            return conv;
                        });
                        return [...updated].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    });
                });
            },
        });

        client.activate();
        setStompClient(client);
        return () => { void client.deactivate(); };
    }, [CHAT_SERVICE_URL, syncReadStatus]);

    // --- 3. FETCH INITIAL DATA ---
    useEffect(() => {
        const fetchContacts = async () => {
            const token = sessionStorage.getItem("token"); 
            if (!token) return;
            try {
                const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/contacts`, { headers: { "Authorization": `Bearer ${token}` } });
                if (res.ok) {
                    const ids: number[] = await res.json();
                    if (ids.length === 0) { setIsLoading(false); return; }

                    const nameRes = await fetch(`${AUTH_SERVICE_URL}/auth/fullnames?ids=${ids.join(',')}`, { headers: { "Authorization": `Bearer ${token}` } });
                    const nameMap = nameRes.ok ? await nameRes.json() : {};

                    const mapped: Conversation[] = await Promise.all(ids.map(async (id) => {
                        const unreadRes = await fetch(`${CHAT_SERVICE_URL}/api/chat/unread-count/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
                        const dbCount = unreadRes.ok ? await unreadRes.json() : 0;
                        return {
                            id: id.toString(), name: nameMap[id] || `User ${id}`,
                            lastMessage: "Click to chat", avatar: "/buyer-dashboard/farmer-portrait.png",
                            online: false, timestamp: new Date().toISOString(), 
                            unread: dbCount > 0, unreadCount: dbCount, starred: false
                        };
                    }));
                    setConversations(mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            } finally { setIsLoading(false); }
        };
        fetchContacts();
    }, [CHAT_SERVICE_URL, AUTH_SERVICE_URL]);

    // Fetch History when conversation changes
    useEffect(() => {
        if (!selectedConversationId) return;
        const fetchHistory = async () => {
            const token = sessionStorage.getItem("token");
            const myId = sessionStorage.getItem("id");
            const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/history/${selectedConversationId}`, { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) {
                const history = await res.json();
                setMessages(history.map((m: any) => ({ 
                    ...m,
                    id: m.id.toString(), 
                    imageUrl: m.imageUrl || null, // Map null correctly
                    isCurrentUser: m.senderId.toString() === myId 
                } as Message)));
            }
        };
        fetchHistory();
    }, [selectedConversationId, CHAT_SERVICE_URL]);

    const handleSendMessage = (content: string, imageUrl?: string) => {
        if (stompClient?.connected && selectedConversationId) {
            const myId = sessionStorage.getItem("id");
            const currentTime = new Date().toISOString();
            
            // 1. Create formatted message object for the UI state
            const chatMessage: Message = { 
                id: Date.now().toString(),
                senderId: Number(myId), 
                content, 
                imageUrl: imageUrl || null,
                timestamp: currentTime, 
                isCurrentUser: true,
                isRead: false 
            };

            // 2. Extract only what the backend needs for the STOMP publish
            const payload = {
                senderId: chatMessage.senderId,
                recipientId: Number(selectedConversationId),
                content: chatMessage.content,
                imageUrl: chatMessage.imageUrl,
                timestamp: chatMessage.timestamp,
                isRead: false
            };

            stompClient.publish({ destination: "/app/chat.send", body: JSON.stringify(payload) });
            
            setMessages((prev) => [...prev, chatMessage]);
            setConversations((prev) => {
                const updated = prev.map(conv => 
                    conv.id === selectedConversationId 
                        ? { ...conv, lastMessage: imageUrl ? "📷 Photo" : content, timestamp: currentTime } 
                        : conv
                );
                return [...updated].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            });
        }
    };

    const activeConversation = conversations.find((conv) => conv.id === selectedConversationId) || (selectedConversationId ? {
        id: selectedConversationId, name: "Loading...", avatar: "/buyer-dashboard/farmer-portrait.png",
        unreadCount: 0, lastMessage: "", timestamp: new Date().toISOString(), unread: false, online: false, starred: false
    } : null);

    return (
        <>
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10">
                    <Loader2 className="w-12 h-12 animate-spin text-[#EEC044] mb-4" />
                    <div className="text-[#03230F] font-bold text-lg">Loading chats...</div>
                </div>
            ) : (
                <div className="flex w-full h-full divide-x divide-gray-100">
                    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-gray-50/50 overflow-y-auto">
                        <ConversationList 
                            conversations={conversations} 
                            selectedId={selectedConversationId} 
                            onSelect={setSelectedConversationId} 
                            onDelete={() => {}} 
                        />
                    </div>
                    <div className="hidden md:flex flex-1 flex-col relative bg-white">
                        {activeConversation ? (
                            <div className="flex-1 flex flex-col h-full overflow-hidden p-0 m-0">
                                <MessageView 
                                    conversation={activeConversation} 
                                    messages={messages} 
                                    onSendMessage={handleSendMessage} 
                                />
                                <div ref={messagesEndRef} className="h-1 shrink-0" />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                    <MessageCircle className="w-10 h-10 text-[#EEC044]" />
                                </div>
                                <p className="font-black text-xl text-[#03230F] uppercase tracking-tight mb-1">Your Messages</p>
                                <p className="text-sm font-medium text-gray-500">Select a contact from the list to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function BuyerChatPage() {
    const [totalUnread, setTotalUnread] = useState(0);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <BuyerHeader />
            
            <div className="flex flex-1 overflow-hidden">
                <DashboardNav unreadCount={totalUnread} />
                
                <main className="flex-1 w-full overflow-hidden flex flex-col p-4 lg:p-8">
                
                    <div className="bg-[#03230F] rounded-t-2xl p-6 lg:p-8 text-white shadow-md z-10 shrink-0">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-[#EEC044] tracking-tight mb-1">Message Center</h1>
                                <p className="text-gray-300 font-medium text-sm lg:text-base">Communicate directly with your sellers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 shadow-md flex-1 flex overflow-hidden">
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <Loader2 className="w-12 h-12 animate-spin text-[#EEC044] mb-4" />
                                <div className="text-[#03230F] font-bold text-lg">Loading interface...</div>
                            </div>
                        }>
                            <ChatContent onTotalUnreadChange={setTotalUnread} />
                        </Suspense>
                    </div>
                </main>
            </div>
            
            
            <Footer2 />
        </div>
    );
}