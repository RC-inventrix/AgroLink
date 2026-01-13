"use client"

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../dashboard/SellerSideBar"

function ChatContent() {
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConversationId, setSelectedConversationId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [stompClient, setStompClient] = useState<any>(null)

    // Ports based on your Controller files
    const AUTH_SERVICE_URL = "http://localhost:8080"; // For /auth/fullnames
    const CHAT_SERVICE_URL = "http://localhost:8083"; // For /api/chat
    
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
                        const res = await fetch(`${AUTH_SERVICE_URL}/auth/fullnames?ids=${userIdFromUrl}`, {
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

    // --- 2. FETCH CONTACTS (STOPS THE LOADING STATE) ---
    useEffect(() => {
        const fetchContacts = async () => {
            const token = sessionStorage.getItem("token"); 
            if (!token) return;
            
            try {
                // Fetch contact IDs from Chat Service (8083)
                const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/contacts`, {
                    method: "GET", headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const ids: number[] = await res.json();
                    // Fetch Full Names from Auth Service (8080)
                    const nameRes = await fetch(`${AUTH_SERVICE_URL}/auth/fullnames?ids=${ids.join(',')}`, {
                        method: "GET", headers: { "Authorization": `Bearer ${token}` }
                    });
                    const fullNameMap = nameRes.ok ? await nameRes.json() : {};

                    const mapped: Conversation[] = ids.map((id) => ({
                        id: id.toString(),
                        name: fullNameMap[id] || `User ${id}`, 
                        lastMessage: "Click to start chatting", 
                        avatar: "/buyer-dashboard/farmer-portrait.png",
                        online: false,
                        timestamp: new Date().toISOString(), 
                        unread: false,
                        unreadCount: 0,
                        starred: false,
                    }));
                    setConversations(mapped);
                }
            } catch (err) { 
                console.error("Fetch contacts error:", err); 
            } finally { 
                setIsLoading(false); // CRITICAL: This allows the UI to render
            }
        };
        fetchContacts();
    }, []);

    // --- 3. FETCH HISTORY ---
    useEffect(() => {
        if (!selectedConversationId) return;
        const fetchHistory = async () => {
            const token = sessionStorage.getItem("token");
            const myId = sessionStorage.getItem("id");
            try {
                const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/history/${selectedConversationId}`, {
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
    }, [selectedConversationId]);

    const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);
    const activeConversation = selectedConversation || (selectedConversationId ? {
        id: selectedConversationId,
        name: "Loading...",
        avatar: "/avatar.png",
        unreadCount: 0, lastMessage: "", timestamp: new Date().toISOString(), unread: false, online: false, starred: false
    } : null);

    return (
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
                                    onSendMessage={() => {}} 
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
    );
}

export default function ChatPage() {
    return (
        <>
            <SellerHeader />
            <div className="flex">
                <SellerSidebar unreadCount={0} activePage="chat" />
                <Suspense fallback={<div>Loading interface...</div>}>
                    <ChatContent />
                </Suspense>
            </div>
        </>
    );
}