"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../../seller/dashboard/SellerSideBar"

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

    useEffect(() => {
        const total = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        onTotalUnreadChange(total);
    }, [conversations, onTotalUnreadChange]);

    useEffect(() => {
        selectedIdRef.current = selectedConversationId;
    }, [selectedConversationId]);

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
                                imageUrl: newMessage.imageUrl || null, // Safety for TS
                                isCurrentUser: false, 
                                isRead: true 
                            } as Message // Fixed the TS Error here
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
            
            // Create the local message object first to avoid the "null" type mismatch
            const chatMessage: Message = { 
                id: Date.now().toString(),
                senderId: Number(myId), 
                content, 
                imageUrl: imageUrl || null,
                timestamp: currentTime, 
                isCurrentUser: true,
                isRead: false 
            };

            // Publish to backend
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
                    const unreadCount = await unreadRes.json();
                    return {
                        id: id.toString(), 
                        name: nameMap[id] || `User ${id}`,
                        lastMessage: "Click to chat", 
                        // FIX: Ensure this path matches your project structure
                        avatar: "/buyer-dashboard/farmer-portrait.png", 
                        online: false, 
                        timestamp: new Date().toISOString(), 
                        unread: unreadCount > 0, 
                        unreadCount: unreadCount, 
                        starred: false
                    };
                }));
                setConversations(mapped);
            }
        } finally { setIsLoading(false); }
    };
    fetchContacts();
}, [CHAT_SERVICE_URL, AUTH_SERVICE_URL]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-1 overflow-hidden">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center animate-pulse text-[#2d5016] font-bold">
                    Loading chats...
                </div>
            ) : (
                <>
                    <ConversationList conversations={conversations} selectedId={selectedConversationId} onSelect={setSelectedConversationId} onDelete={() => {}} />
                    <div className="flex-1 flex flex-col relative bg-white">
                        {selectedConversationId ? (
                            <div className="flex-1 flex flex-col overflow-y-auto p-4">
                                <MessageView 
                                    conversation={conversations.find(c => c.id === selectedConversationId)!} 
                                    messages={messages} 
                                    onSendMessage={handleSendMessage} 
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground uppercase text-xs">
                                Select a contact to start messaging
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
        <div className="min-h-screen bg-gray-50">
            <SellerHeader />
            <div className="flex">
                <SellerSidebar unreadCount={totalUnread} activePage="chat" />
                <Suspense fallback={<div className="p-10 font-bold">Loading interface...</div>}>
                    <ChatContent onTotalUnreadChange={setTotalUnread} />
                </Suspense>
            </div>
        </div>
    );
}