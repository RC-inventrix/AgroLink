"use client"

import { useEffect, useState } from "react"
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

  // 1. WebSocket Setup: Connect and Subscribe to private messages
  useEffect(() => {
    // Connect to the /ws endpoint defined in your WebSocketConfig.java
    const socket = new SockJS(`${baseUrl}/ws`); 
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        const myId = localStorage.getItem("id");
        
        // Subscribe to your private queue using the numeric ID
        if (myId) {
          client.subscribe(`/user/${myId}/queue/messages`, (message) => {
            const newMessage = JSON.parse(message.body);
            
            // Real-time update: Only add if message is from the currently selected contact
            setMessages((prev) => {
              const isFromSelected = newMessage.senderId.toString() === selectedConversationId;
              if (isFromSelected) {
                return [...prev, { 
                  ...newMessage, 
                  id: Date.now(), 
                  isCurrentUser: false // Incoming is always from the other user
                }];
              }
              return prev;
            });

            // Update sidebar last message preview
            setConversations((prev) => 
              prev.map(conv => conv.id === newMessage.senderId.toString() 
                ? { ...conv, lastMessage: newMessage.content } 
                : conv
              )
            );
          });
        }
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) client.deactivate();
    };
  }, [baseUrl, selectedConversationId]);

  // 2. Fetch Contact List (REST API)
  useEffect(() => {
    const fetchContacts = async () => {
      const token = localStorage.getItem("token"); 
      if (!token) return;

      try {
        const res = await fetch(`${baseUrl}/api/chat/contacts`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const ids: number[] = await res.json();
          const mapped: Conversation[] = ids.map((id) => ({
            id: id.toString(),
            name: `User ${id}`, // Removed .split("@") because IDs are now numeric
            lastMessage: "Click to start chatting",
            avatar: "/buyer-dashboard/farmer-portrait.png",
            online: true,
            timestamp: new Date().toISOString(),
            unread: false,
            starred: false,
          }));
          setConversations(mapped);
        }
      } catch (err) {
        console.error("Network error fetching contacts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [baseUrl]);

  // 3. Fetch History when a conversation is selected (REST API)
  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      const myId = localStorage.getItem("id");
      
      try {
        const res = await fetch(`${baseUrl}/api/chat/history/${selectedConversationId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const rawMessages = await res.json();
          const mappedMessages = rawMessages.map((m: any) => ({
            id: Number(m.id),
            senderId: Number(m.senderId), // Explicitly cast to Number
            content: m.content,
            timestamp: m.timestamp,
            // Logic: Is the sender of this message ME?
            isCurrentUser: m.senderId.toString() === myId,
          }));
          setMessages(mappedMessages);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };

    fetchHistory();
  }, [selectedConversationId, baseUrl]);

  // 4. Handle Sending Messages (WebSocket Publish)
  const handleSendMessage = (content: string) => {
    if (stompClient?.connected && selectedConversationId) {
      const myId = localStorage.getItem("id");
      const chatMessage = {
        senderId: Number(myId), // Must be a number
        recipientId: Number(selectedConversationId), // Must be a number
        content: content,
        timestamp: new Date().toISOString()
      };

      // Publishes to @MessageMapping("/chat.send")
      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(chatMessage)
      });

      // Optimistically add your own message to the UI instantly
      const uiMessage: Message = { 
        id: Date.now().toString(), 
        senderId: Number(myId), 
        content, 
        timestamp: chatMessage.timestamp, 
        isCurrentUser: true 
      };
      setMessages((prev) => [...prev, uiMessage]);
    }
  };

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

  return (
    <>
      <DashboardHeader />
      <div className="flex">
        <DashboardNav />
        <div className="flex h-[calc(100vh-4rem)] flex-1">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse text-primary font-medium">Loading chats...</div>
            </div>
          ) : (
            <>
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
              />
              {selectedConversation ? (
                <MessageView 
                  conversation={selectedConversation} 
                  messages={messages} 
                  onSendMessage={handleSendMessage} // Pass down the WebSocket handler
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a contact to start messaging
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}