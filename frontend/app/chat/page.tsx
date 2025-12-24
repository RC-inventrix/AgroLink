"use client"

import { useEffect, useState } from "react"
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

  const baseUrl = "http://localhost:8083"

  // 1. Fetch Contact List on Mount
  useEffect(() => {
    const fetchContacts = async () => {
      // Retrieve the token from LocalStorage
      const token = localStorage.getItem("token"); 
      
      if (!token) {
        console.error("No token found in local storage");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${baseUrl}/api/chat/contacts`, {
          method: "GET",
          headers: {
            // Manually attach the token to the Authorization header
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const ids: string[] = await res.json();
          // Map backend String IDs (emails) to the frontend Conversation interface
          const mapped: Conversation[] = ids.map((email) => ({
            id: email,
            name: email.split("@")[0], // Simple display name from email
            lastMessage: "Click to start chatting",
            avatar: "/buyer-dashboard/farmer-portrait.png",
            online: true,
            // Provide sensible defaults for required Conversation fields
            timestamp: new Date().toISOString(),
            unread: false,
            starred: false,
          }));
          setConversations(mapped);
        } else {
          console.error("Failed to fetch contacts: ", res.status);
        }
      } catch (err) {
        console.error("Network error fetching contacts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [baseUrl]);

  // 2. Fetch History when a conversation is selected
  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchHistory = async () => {
      const token = localStorage.getItem("token"); // Retrieve token
      
      try {
        const res = await fetch(`${baseUrl}/api/chat/history/${selectedConversationId}`, {
          method: "GET",
          headers: {
            // Include Authorization header for history requests
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const rawMessages = await res.json();
          // Map backend ChatMessage to frontend Message interface
          const mappedMessages = rawMessages.map((m: any) => ({
            id: m.id.toString(),
            senderId: m.senderId,
            content: m.content,
            timestamp: m.timestamp,
            // recipientId logic determines if message is from the current user
            isCurrentUser: m.recipientId === selectedConversationId,
          }));
          setMessages(mappedMessages);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };

    fetchHistory();
  }, [selectedConversationId, baseUrl]);

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
                <MessageView conversation={selectedConversation} messages={messages} />
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