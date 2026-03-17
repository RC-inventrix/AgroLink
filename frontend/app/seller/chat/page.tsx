"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import { Loader2, MessageCircle } from "lucide-react"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../../seller/dashboard/SellerSideBar"
import Footer2 from "@/components/footer/Footer"

function ChatContent({ onTotalUnreadChange }: { onTotalUnreadChange: (count: number) => void }) {
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [stompClient, setStompClient] = useState<Client | null>(null)

    const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; 
    const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083"; 
    
    const selectedIdRef = useRef("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync total unread count to parent component
    useEffect(() => {
        const total = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        onTotalUnreadChange(total);
    }, [conversations, onTotalUnreadChange]);

    // Keep ref in sync for WebSocket closures
    useEffect(() => {
        selectedIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const syncReadStatus = useCallback(async (senderId: string) => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId || !senderId) return;

        try {
            await fetch(`${CHAT_SERVICE_URL}/api/chat/read/${senderId}/${myId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) { console.error("Database sync failed:", err); }
    }, [CHAT_SERVICE_URL]);


    useEffect(() => {
        if (selectedConversationId) {
            // Update UI locally
            setConversations(prev => prev.map(conv => 
                conv.id === selectedConversationId 
                    ? { ...conv, unread: false, unreadCount: 0 } 
                    : conv
            ));
            // Trigger backend sync
            syncReadStatus(selectedConversationId);
        }
    }, [selectedConversationId, messages.length, syncReadStatus]);

    // WebSocket logic
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

                    if (senderIdStr === selectedIdRef.current) {
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

                    setConversations((prev) => {
                        const updated = prev.map(conv => {
                            if (conv.id === senderIdStr) {
                                return { 
                                    ...conv, 
                                    lastMessage: newMessage.imageUrl ? "📷 Photo" : newMessage.content, 
                                    timestamp: newMessage.timestamp,
                                    unread: selectedIdRef.current !== senderIdStr,
                                    unreadCount: (selectedIdRef.current !== senderIdStr) ? (conv.unreadCount || 0) + 1 : 0
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

    // Fetch History
    useEffect(() => {
        if (!selectedConversationId) return;
        const fetchHistory = async () => {
            const token = sessionStorage.getItem("token");
            const myId = sessionStorage.getItem("id");
            const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/history/${selectedConversationId}`, { 
                headers: { "Authorization": `Bearer ${token}` } 
            });
            if (res.ok) {
                const history = await res.json();
                setMessages(history.map((m: any) => ({ 
                    ...m,
                    id: m.id.toString(), 
                    imageUrl: m.imageUrl || null,
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
            
            const chatMessage: Message = { 
                id: Date.now().toString(),
                senderId: Number(myId), 
                content, 
                imageUrl: imageUrl || null,
                timestamp: currentTime, 
                isCurrentUser: true,
                isRead: false 
            };

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

    // Load initial contacts
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
                        const unreadCount = await unreadRes.json();
                        return {
                            id: id.toString(), 
                            name: nameMap[id] || `User ${id}`,
                            lastMessage: "Click to chat", 
                            avatar: "/buyer-dashboard/farmer-portrait.png", 
                            online: false, 
                            timestamp: new Date().toISOString(), 
                            unread: unreadCount > 0, 
                            unreadCount: unreadCount, 
                            starred: false
                        };
                    }));
                    
                    // Sort descending by timestamp
                    setConversations(mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            } finally { setIsLoading(false); }
        };
        fetchContacts();
    }, [CHAT_SERVICE_URL, AUTH_SERVICE_URL]);

    return (
        <div className="flex w-full h-full divide-x divide-gray-100">
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10">
                    <Loader2 className="w-12 h-12 animate-spin text-[#EEC044] mb-4" />
                    <div className="text-[#03230F] font-bold text-lg">Loading chats...</div>
                </div>
            ) : (
                <>
                    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-gray-50/50 overflow-y-auto">
                        <ConversationList 
                            conversations={conversations} 
                            selectedId={selectedConversationId} 
                            onSelect={setSelectedConversationId} 
                            onDelete={() => {}} 
                        />
                    </div>
                    <div className="hidden md:flex flex-1 flex-col relative bg-white">
                        {selectedConversationId ? (
                            <div className="flex-1 flex flex-col h-full overflow-hidden p-0 m-0">
                                <MessageView 
                                    conversation={conversations.find(c => c.id === selectedConversationId)!} 
                                    messages={messages} 
                                    onSendMessage={handleSendMessage} 
                                />
                                <div ref={messagesEndRef} className="h-1 shrink-0" />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-200">
                                    <MessageCircle className="w-10 h-10 text-[#EEC044]" />
                                </div>
                                <p className="font-black text-xl text-[#03230F] uppercase tracking-tight mb-1">Your Messages</p>
                                <p className="text-sm font-medium text-gray-500">Select a contact from the list to start chatting.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default function ChatPage() {
    const [totalUnread, setTotalUnread] = useState(0);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <SellerHeader />
            
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <SellerSidebar unreadCount={totalUnread} activePage="chat" />
                
                {/* Main Content Area */}
                <main className="flex-1 w-full overflow-hidden flex flex-col p-4 lg:p-8">
                    
                    {/* Theme Colors Applied: Dark Green Header Box */}
                    <div className="bg-[#03230F] rounded-t-[2rem] p-6 lg:p-8 text-white shadow-md z-10 shrink-0">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black text-[#EEC044] tracking-tight mb-1">Message Center</h1>
                                <p className="text-gray-300 font-medium">Communicate directly with your buyers.</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Box Area */}
                    <div className="bg-white rounded-b-[2rem] border border-t-0 border-gray-200 shadow-md flex-1 flex overflow-hidden">
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