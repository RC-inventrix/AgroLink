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


  const handleDeleteConversation = async (contactId: string) => {
  const token = sessionStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${baseUrl}/api/chat/conversation/${contactId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      // 1. Remove from the left sidebar list
      setConversations((prev) => prev.filter((conv) => conv.id !== contactId));

      // 2. If the deleted chat was currently open, clear the message window
      if (selectedConversationId === contactId) {
        setSelectedConversationId("");
        setMessages([]);
      }
    }
  } catch (err) {
    console.error("Failed to delete conversation:", err);
  }
};


  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [stompClient, setStompClient] = useState<any>(null)

  const baseUrl = "http://localhost:8083"
  const selectedIdRef = useRef(selectedConversationId);
  
  // Ref for Auto-Scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to move the view to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages update or a new chat is selected
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversationId]);

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

  // 3. WebSocket Setup with Real-Time Sorting
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

            // Update data and Sort: Move active chat to the top
            setConversations((prev) => {
              const updated = prev.map(conv => {
                if (conv.id.toString() === newMessage.senderId.toString()) {
                  const isChatNotOpen = currentActiveId !== newMessage.senderId.toString();
                  return { 
                    ...conv, 
                    lastMessage: newMessage.content, 
                    timestamp: newMessage.timestamp,
                    unread: isChatNotOpen,
                    unreadCount: isChatNotOpen ? (conv.unreadCount || 0) + 1 : 0,
                    online: true 
                  };
                }
                return conv;
              });
              
              // Sorting logic: descending by timestamp
              return [...updated].sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
            });
          });
        }
      },
    });

    client.activate();
    setStompClient(client);
    return () => { void client.deactivate(); };
  }, [baseUrl]);

  // 4. Fetch Contacts
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
          const nameRes = await fetch(`http://localhost:8081/auth/fullnames?ids=${ids.join(',')}`, {
            method: "GET", headers: { "Authorization": `Bearer ${token}` }
          });
          const fullNameMap = nameRes.ok ? await nameRes.json() : {};

          const mapped: Conversation[] = await Promise.all(ids.map(async (id) => {
            const unreadRes = await fetch(`${baseUrl}/api/chat/unread-count/${id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const dbCount = unreadRes.ok ? await unreadRes.json() : 0;

            const statusRes = await fetch(`${baseUrl}/api/chat/status/${id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const statusData = statusRes.ok ? await statusRes.json() : { online: false, lastSeen: null };

            return {
              id: id.toString(),
              name: fullNameMap[id] || `User ${id}`, 
              lastMessage: "Click to start chatting", 
              avatar: "/buyer-dashboard/farmer-portrait.png",
              online: statusData.online,
              timestamp: statusData.lastSeen || new Date().toISOString(), 
              unread: dbCount > 0,
              unreadCount: dbCount,
              starred: false,
            };
          }));

          // Sort the initial list by most recent
          setConversations(mapped.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ));
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

  // 6. Handle Sending with Sorting
  const handleSendMessage = (content: string) => {
    if (stompClient?.connected && selectedConversationId) {
      const myId = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("token");
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
      
      // Update local state and move this chat to the top
      setConversations((prev) => {
        const updated = prev.map(conv => conv.id === selectedConversationId 
          ? { ...conv, lastMessage: content, timestamp: currentTime } 
          : conv
        );
        return [...updated].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    }
  };

  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

  return (
    <>
      <DashboardHeader />
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
                onDelete={handleDeleteConversation}
              />
              <div className="flex-1 flex flex-col relative bg-white">
                {selectedConversation ? (
                  <div className="flex-1 flex flex-col overflow-y-auto p-4">
                    <MessageView 
                      conversation={selectedConversation} 
                      messages={messages} 
                      onSendMessage={handleSendMessage} 
                    />
                    {/* Empty div acting as the scroll target */}
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