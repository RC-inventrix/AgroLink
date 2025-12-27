"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import "../globals-buyer-dashboard.css"

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [stompClient, setStompClient] = useState<any>(null)

  const baseUrl = "http://localhost:8083"
  const selectedIdRef = useRef(selectedConversationId);

  // 1. SYNC FUNCTION: Updates PostgreSQL that messages are read
  const syncReadStatus = useCallback(async (senderId: string) => {
    const token = sessionStorage.getItem("token");
    const myId = sessionStorage.getItem("id");
    if (!token || !myId || !senderId) return;

    try {
      await fetch(`${baseUrl}/api/chat/read/${senderId}/${myId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Database sync failed:", err);
    }
  }, [baseUrl]);

  // 2. TRIGGER: Syncs when opening a chat OR when a new message arrives
  useEffect(() => {
    selectedIdRef.current = selectedConversationId;

    if (selectedConversationId) {
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversationId 
          ? { ...conv, unread: false, unreadCount: 0 } 
          : conv
      ));

      syncReadStatus(selectedConversationId);
    }
  }, [selectedConversationId, messages.length, syncReadStatus]);

  // 3. WebSocket Setup
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

            setMessages((prev) => {
              if (newMessage.senderId.toString() === currentActiveId) {
                return [...prev, { 
                  ...newMessage, 
                  id: Date.now().toString(), 
                  isCurrentUser: false,
                  isRead: true 
                }];
              }
              return prev;
            });

            setConversations((prev) => 
              prev.map(conv => {
                if (conv.id.toString() === newMessage.senderId.toString()) {
                  const isChatNotOpen = currentActiveId !== newMessage.senderId.toString();
                  return { 
                    ...conv, 
                    lastMessage: newMessage.content, 
                    timestamp: newMessage.timestamp,
                    unread: isChatNotOpen,
                    unreadCount: isChatNotOpen ? (conv.unreadCount || 0) + 1 : 0
                  };
                }
                return conv;
              })
            );
          });
        }
      },
    });

    client.activate();
    setStompClient(client);
    return () => { void client.deactivate(); };
  }, [baseUrl]);

  // 4. Fetch Contacts: UPDATED to fetch unread counts per user
  useEffect(() => {
    const fetchContacts = async () => {
      const token = sessionStorage.getItem("token"); 
      const myId = sessionStorage.getItem("id");
      if (!token) return;
      
      try {
        const res = await fetch(`${baseUrl}/api/chat/contacts`, {
          method: "GET", headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          const ids: number[] = await res.json();
          
          // Fetch names from Identity Service
          const nameRes = await fetch(`http://localhost:8081/auth/fullnames?ids=${ids.join(',')}`, {
            method: "GET", headers: { "Authorization": `Bearer ${token}` }
          });
          const fullNameMap = nameRes.ok ? await nameRes.json() : {};

          // NEW LOGIC: Map contacts and fetch their specific unread counts
          const mapped: Conversation[] = await Promise.all(ids.map(async (id) => {
            const unreadRes = await fetch(`${baseUrl}/api/chat/unread-count/${id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const dbCount = unreadRes.ok ? await unreadRes.json() : 0;

            return {
              id: id.toString(),
              name: fullNameMap[id] || `User ${id}`, 
              lastMessage: "Click to start chatting", 
              avatar: "/buyer-dashboard/farmer-portrait.png",
              online: !!id, 
              timestamp: new Date().toISOString(),
              unread: dbCount > 0,
              unreadCount: dbCount, // Verified from PostgreSQL
              starred: false,
            };
          }));

          setConversations(mapped);
        }
      } catch (err) { 
        console.error("Fetch contacts error:", err); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchContacts();
  }, [baseUrl]);

  // 5. Fetch History
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
      } catch (err) { console.error("Failed to fetch history:", err); }
    };

    fetchHistory();
  }, [selectedConversationId, baseUrl]);

  // 6. Handle Sending
  const handleSendMessage = (content: string) => {
    if (stompClient?.connected && selectedConversationId) {
      const myId = sessionStorage.getItem("id");
      const chatMessage = {
        senderId: Number(myId), 
        recipientId: Number(selectedConversationId), 
        content: content,
        timestamp: new Date().toISOString(),
        isRead: false 
      };

      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatMessage)
      });

      setMessages((prev) => [...prev, { ...chatMessage, id: Date.now().toString(), isCurrentUser: true }]);
      setConversations((prev) => 
        prev.map(conv => conv.id === selectedConversationId 
          ? { ...conv, lastMessage: content, timestamp: chatMessage.timestamp } 
          : conv
        )
      );
    }
  };

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

  return (
    <>
      <DashboardHeader />
      <div className="flex">
        <DashboardNav unreadCount={totalUnread} />
        <div className="flex h-[calc(100vh-4rem)] flex-1">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse text-primary font-medium">Loading chats...</div>
            </div>
          ) : (
            <>
              <ConversationList conversations={conversations} selectedId={selectedConversationId} onSelect={setSelectedConversationId} />
              {selectedConversation ? (
                <MessageView conversation={selectedConversation} messages={messages} onSendMessage={handleSendMessage} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a contact to start messaging</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}