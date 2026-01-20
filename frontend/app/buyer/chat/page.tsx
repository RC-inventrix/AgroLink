"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import BuyerHeader from "@/components/headers/BuyerHeader"


function ChatContent() {
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [stompClient, setStompClient] = useState<any>(null)

    const baseUrl = "http://localhost:8083"
    const selectedIdRef = useRef("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedConversationId]);

    // --- 1. HANDLE URL PARAMETER & AUTO-OPEN ---
    useEffect(() => {
        const userIdFromUrl = searchParams.get("userId");
        
        if (userIdFromUrl && !isLoading) {
            setSelectedConversationId(userIdFromUrl);
            
            const exists = conversations.some(conv => conv.id === userIdFromUrl);
            if (!exists) {
                const resolveNewContact = async () => {
                    const token = sessionStorage.getItem("token");
                    try {
                        const res = await fetch(`http://localhost:8080/auth/fullnames?ids=${userIdFromUrl}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const nameMap = await res.json();
                            const newConv: Conversation = {
                                id: userIdFromUrl,
                                name: nameMap[userIdFromUrl] || "New Seller",
                                lastMessage: "Start a conversation!",
                                avatar: "/buyer-dashboard/farmer-portrait.png",
                                online: false,
                                timestamp: new Date().toISOString(),
                                unread: false,
                                unreadCount: 0,
                                starred: false,
                            };
                            setConversations(prev => [newConv, ...prev]);
                        }
                    } catch (err) {
                        console.error("Failed to resolve contact name:", err);
                    }
                };
                resolveNewContact();
            }
        }
    }, [searchParams, isLoading, conversations.length]);

    // --- 2. WEBSOCKET SETUP ---
    useEffect(() => {
        const socket = new SockJS(`${baseUrl}/ws`); 
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                const myId = sessionStorage.getItem("id");
                if (myId) {
                    client.subscribe(`/user/${myId}/queue/messages`, (message) => {
                        const newMessage = JSON.parse(message.body);
                        const currentActiveId = selectedIdRef.current;

                        if (newMessage.senderId.toString() === currentActiveId) {
                            setMessages((prev) => [...prev, { 
                                ...newMessage, 
                                id: Date.now().toString(), 
                                isCurrentUser: false,
                                isRead: true 
                            }]);
                        }

                        setConversations((prev) => {
                            const updated = prev.map(conv => {
                                if (conv.id.toString() === newMessage.senderId.toString()) {
                                    return { 
                                        ...conv, 
                                        lastMessage: newMessage.content, 
                                        timestamp: newMessage.timestamp,
                                        unread: currentActiveId !== newMessage.senderId.toString(),
                                        online: true 
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
    }, [baseUrl]);

    // --- 3. FETCH CONTACTS ---
    useEffect(() => {
        const fetchContacts = async () => {
            const token = sessionStorage.getItem("token"); 
            if (!token) return;
            
            try {
                const res = await fetch(`${baseUrl}/api/chat/contacts`, {
                    method: "GET", headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const ids: number[] = await res.json();
                    const nameRes = await fetch(`http://localhost:8080/auth/fullnames?ids=${ids.join(',')}`, {
                        method: "GET", headers: { "Authorization": `Bearer ${token}` }
                    });
                    const fullNameMap = nameRes.ok ? await nameRes.json() : {};

                    const mapped: Conversation[] = await Promise.all(ids.map(async (id) => {
                        return {
                            id: id.toString(),
                            name: fullNameMap[id] || `User ${id}`, 
                            lastMessage: "Click to start chatting", 
                            avatar: "/buyer-dashboard/farmer-portrait.png",
                            online: false,
                            timestamp: new Date().toISOString(), 
                            unread: false,
                            unreadCount: 0,
                            starred: false,
                        };
                    }));
                    setConversations(mapped);
                }
            } catch (err) { 
                console.error("Fetch error:", err); 
            } finally { 
                setIsLoading(false); // <--- THIS STOPS THE LOADING SPINNER
            }
        };
        fetchContacts();
    }, [baseUrl]);

    // --- 4. FETCH HISTORY ---
    useEffect(() => {
        if (!selectedConversationId) return;
        const fetchHistory = async () => {
            const token = sessionStorage.getItem("token");
            const myId = sessionStorage.getItem("id");
            try {
                const res = await fetch(`${baseUrl}/api/chat/history/${selectedConversationId}`, {
                    method: "GET", headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const rawMessages = await res.json();
                    setMessages(rawMessages.map((m: any) => ({
                        id: m.id.toString(), 
                        senderId: Number(m.senderId), 
                        content: m.content,
                        timestamp: m.timestamp,
                        isCurrentUser: m.senderId.toString() === myId,
                        isRead: m.isRead 
                    })));
                }
            } catch (err) { console.error("History fetch error:", err); }
        };
        fetchHistory();
    }, [selectedConversationId, baseUrl]);

    // --- 5. SEND MESSAGE ---
    const handleSendMessage = (content: string) => {
        if (stompClient?.connected && selectedConversationId) {
            const myId = sessionStorage.getItem("id");
            const currentTime = new Date().toISOString();
            const chatMessage = {
                senderId: Number(myId), 
                recipientId: Number(selectedConversationId), 
                content: content,
                timestamp: currentTime,
                isRead: false 
            };
            stompClient.publish({
                destination: "/app/chat.send",
                body: JSON.stringify(chatMessage)
            });
            setMessages((prev) => [...prev, { ...chatMessage, id: Date.now().toString(), isCurrentUser: true }]);
        }
    };

    const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);
    const activeConversation = selectedConversation || (selectedConversationId ? {
        id: selectedConversationId,
        name: "Loading Chat...",
        lastMessage: "",
        avatar: "/buyer-dashboard/farmer-portrait.png",
        online: false,
        timestamp: new Date().toISOString(),
        unread: false,
        unreadCount: 0,
        starred: false,
    } : null);

    const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    return (
        <>
            <BuyerHeader />
            <div className="flex">
                <DashboardNav unreadCount={totalUnread} />
                <div className="flex h-[calc(100vh-4rem)] flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-pulse text-[#2d5016] font-medium">Loading chats...</div>
                        </div>
                    ) : (
                        <>
                            <ConversationList 
                                conversations={conversations} 
                                selectedId={selectedConversationId} 
                                onSelect={setSelectedConversationId} 
                                onDelete={() => {}} 
                            />
                            <div className="flex-1 flex flex-col relative bg-white">
                                {activeConversation ? (
                                    <div className="flex-1 flex flex-col overflow-y-auto p-4">
                                        <MessageView 
                                            conversation={activeConversation} 
                                            messages={messages} 
                                            onSendMessage={handleSendMessage} 
                                        />
                                        <div ref={messagesEndRef} className="h-1" />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                        Select a contact to start messaging
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading interface...</div>}>
            <ChatContent />
        </Suspense>
    );
}