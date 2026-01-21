"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../../seller/dashboard/SellerSideBar"
import '../dashboard/SellerDashboard.css';

function ChatContent() {
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [stompClient, setStompClient] = useState<any>(null)

    const AUTH_SERVICE_URL = "http://localhost:8080"; 
    const CHAT_SERVICE_URL = "http://localhost:8083"; 
    
    const selectedIdRef = useRef("");
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

    useEffect(() => {
        if (selectedConversationId) {
            setConversations(prev => prev.map(conv => 
                conv.id === selectedConversationId 
                    ? { ...conv, unread: false, unreadCount: 0 } 
                    : conv
            ));
            syncReadStatus(selectedConversationId);
        }
    }, [selectedConversationId, messages.length, syncReadStatus]);

    // --- 2. FIXED: HANDLE URL PARAMETER ---
    // Changed "userId" to "receiverId" to match your ItemRequestsPage redirect
    useEffect(() => {
        const receiverIdFromUrl = searchParams.get("receiverId"); 
        
        if (receiverIdFromUrl) {
            setSelectedConversationId(receiverIdFromUrl);
            
            // Check if this contact already exists in the sidebar
            const exists = conversations.some(conv => conv.id === receiverIdFromUrl);
            
            // If they don't exist and we've finished the initial load, add them
            if (!exists && !isLoading) {
                resolveAndAddContact(receiverIdFromUrl);
            }
        }
    }, [searchParams, isLoading, conversations.length]);

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

    // --- 3. WEBSOCKET LOGIC ---
    useEffect(() => {
        const socket = new SockJS(`${CHAT_SERVICE_URL}/ws`); 
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                const myId = sessionStorage.getItem("id");
                if (myId) {
                    client.subscribe(`/user/${myId}/queue/messages`, (message) => {
                        const newMessage = JSON.parse(message.body);
                        const senderIdStr = newMessage.senderId.toString();
                        const currentActiveId = selectedIdRef.current;

                        if (senderIdStr === currentActiveId) {
                            setMessages((prev) => [...prev, { 
                                id: Date.now().toString(), senderId: newMessage.senderId,
                                content: newMessage.content, timestamp: newMessage.timestamp,
                                isCurrentUser: false, isRead: true 
                            }]);
                            syncReadStatus(senderIdStr); 
                        }

                        setConversations((prev) => {
                            const exists = prev.some(c => c.id === senderIdStr);
                            if (!exists) { resolveAndAddContact(senderIdStr); return prev; }

                            const updated = prev.map(conv => {
                                if (conv.id === senderIdStr) {
                                    const isNotOpen = currentActiveId !== senderIdStr;
                                    return { 
                                        ...conv, 
                                        lastMessage: newMessage.content, 
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
                }
            },
        });
        client.activate();
        setStompClient(client);
        return () => { void client.deactivate(); };
    }, [CHAT_SERVICE_URL, syncReadStatus]);

    // --- 4. FETCH CONTACTS & HISTORY ---
    useEffect(() => {
        const fetchContacts = async () => {
            const token = sessionStorage.getItem("token"); 
            if (!token) return;
            try {
                const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/contacts`, { headers: { "Authorization": `Bearer ${token}` } });
                if (res.ok) {
                    const ids: number[] = await res.json();
                    const nameRes = await fetch(`${AUTH_SERVICE_URL}/auth/fullnames?ids=${ids.join(',')}`, { headers: { "Authorization": `Bearer ${token}` } });
                    const nameMap = nameRes.ok ? await nameRes.json() : {};

                    const mapped: Conversation[] = await Promise.all(ids.map(async (id) => {
                        const unreadRes = await fetch(`${CHAT_SERVICE_URL}/api/chat/unread-count/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
                        const dbCount = unreadRes.ok ? await unreadRes.json() : 0;
                        return {
                            id: id.toString(), name: nameMap[id] || `User ${id}`,
                            lastMessage: "Click to chat", avatar: "/buyer-dashboard/farmer-portrait.png",
                            online: false, timestamp: new Date().toISOString(), unread: dbCount > 0, unreadCount: dbCount, starred: false
                        };
                    }));
                    setConversations(mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                }
            } finally { setIsLoading(false); }
        };
        fetchContacts();
    }, [CHAT_SERVICE_URL, AUTH_SERVICE_URL]);

    useEffect(() => {
        if (!selectedConversationId) return;
        const fetchHistory = async () => {
            const token = sessionStorage.getItem("token");
            const myId = sessionStorage.getItem("id");
            const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/history/${selectedConversationId}`, { headers: { "Authorization": `Bearer ${token}` } });
            if (res.ok) {
                const history = await res.json();
                setMessages(history.map((m: any) => ({ 
                    id: m.id.toString(), senderId: m.senderId, content: m.content,
                    timestamp: m.timestamp, isCurrentUser: m.senderId.toString() === myId, isRead: m.isRead 
                })));
            }
        };
        fetchHistory();
    }, [selectedConversationId, CHAT_SERVICE_URL]);

    // --- 5. SEND MESSAGE ---
    const handleSendMessage = (content: string) => {
        if (stompClient?.connected && selectedConversationId) {
            const myId = sessionStorage.getItem("id");
            const currentTime = new Date().toISOString();
            const chatMessage = { senderId: Number(myId), recipientId: Number(selectedConversationId), content, timestamp: currentTime, isRead: false };
            stompClient.publish({ destination: "/app/chat.send", body: JSON.stringify(chatMessage) });
            setMessages((prev) => [...prev, { ...chatMessage, id: Date.now().toString(), isCurrentUser: true }]);
            setConversations((prev) => {
                const updated = prev.map(conv => conv.id === selectedConversationId ? { ...conv, lastMessage: content, timestamp: currentTime } : conv);
                return [...updated].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            });
        }
    };

    const activeConversation = conversations.find((conv) => conv.id === selectedConversationId) || (selectedConversationId ? {
        id: selectedConversationId, name: "Loading...", avatar: "/buyer-dashboard/farmer-portrait.png",
        unreadCount: 0, lastMessage: "", timestamp: new Date().toISOString(), unread: false, online: false, starred: false
    } : null);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-1 overflow-hidden">
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center animate-pulse text-[#2d5016] font-bold uppercase tracking-widest">
                    Loading chats...
                </div>
            ) : (
                <>
                    <ConversationList conversations={conversations} selectedId={selectedConversationId} onSelect={setSelectedConversationId} onDelete={() => {}} />
                    <div className="flex-1 flex flex-col relative bg-white">
                        {activeConversation ? (
                            <div className="flex-1 flex flex-col overflow-y-auto p-4">
                                <MessageView conversation={activeConversation} messages={messages} onSendMessage={handleSendMessage} />
                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium uppercase text-xs tracking-tighter">
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
    return (
        <div className="min-h-screen bg-gray-50">
            <SellerHeader />
            <div className="flex">
                <SellerSidebar unreadCount={0} activePage="chat" />
                <Suspense fallback={<div className="p-10 font-bold">Loading interface...</div>}>
                    <ChatContent />
                </Suspense>
            </div>
        </div>
    );
}