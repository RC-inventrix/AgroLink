"use client"

import { useState } from "react"
import { ConversationList, type Conversation } from "@/components/chat/conversation-list"
import { MessageView, type Message } from "@/components/chat/message-view"
import '../globals-chat.css'
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import "../globals-buyer-dashboard.css"
// Mock data for conversations
const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastMessage: "Do you have fresh tomatoes available?",
    timestamp: "5 min",
    unread: true,
    starred: false,
  },
  {
    id: "2",
    name: "Priya Sharma",
    avatar: "https://i.pravatar.cc/150?img=45",
    lastMessage: "Thank you for the quick delivery!",
    timestamp: "1 hour",
    unread: true,
    starred: true,
  },
  {
    id: "3",
    name: "Amit Patel",
    avatar: "https://i.pravatar.cc/150?img=15",
    lastMessage: "Can we discuss bulk orders?",
    timestamp: "3 hours",
    unread: false,
    starred: false,
  },
  {
    id: "4",
    name: "Sneha Reddy",
    avatar: "https://i.pravatar.cc/150?img=28",
    lastMessage: "The vegetables were very fresh.",
    timestamp: "1 day",
    unread: false,
    starred: false,
  },
  {
    id: "5",
    name: "Vikram Singh",
    avatar: "https://i.pravatar.cc/150?img=52",
    lastMessage: "When will you restock carrots?",
    timestamp: "2 days",
    unread: false,
    starred: true,
  },
]

// Mock messages for selected conversation
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      senderId: "1",
      content: "Hi there! I am looking for fresh tomatoes for my restaurant.",
      timestamp: "Dec 22, 9:30 AM",
      isCurrentUser: false,
    },
    {
      id: "m2",
      senderId: "me",
      content: "Hello! Yes, we have fresh organic tomatoes just arrived this morning. How many kg do you need?",
      timestamp: "Dec 22, 9:35 AM",
      isCurrentUser: true,
    },
    {
      id: "m3",
      senderId: "1",
      content: "That sounds great! I need around 25 kg. What is your best price?",
      timestamp: "Dec 22, 9:37 AM",
      isCurrentUser: false,
    },
    {
      id: "m4",
      senderId: "me",
      content: "For 25 kg, I can offer you ₹40 per kg. This is premium quality organic tomatoes.",
      timestamp: "Dec 22, 9:40 AM",
      isCurrentUser: true,
    },
    {
      id: "m5",
      senderId: "1",
      content: "Do you have fresh tomatoes available?",
      timestamp: "Dec 22, 9:55 AM",
      isCurrentUser: false,
    },
  ],
  "2": [
    {
      id: "m1",
      senderId: "2",
      content: "I received my order today. Everything looks fresh and well-packed!",
      timestamp: "Dec 22, 8:00 AM",
      isCurrentUser: false,
    },
    {
      id: "m2",
      senderId: "me",
      content: "That is wonderful to hear! We always ensure the best quality for our customers.",
      timestamp: "Dec 22, 8:15 AM",
      isCurrentUser: true,
    },
    {
      id: "m3",
      senderId: "2",
      content: "Thank you for the quick delivery!",
      timestamp: "Dec 22, 8:20 AM",
      isCurrentUser: false,
    },
  ],
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>("1")

  const selectedConversation = mockConversations.find((conv) => conv.id === selectedConversationId)
  const messages = mockMessages[selectedConversationId] || []

  return (
    <div className="flex">
    <DashboardNav />
    <div className="flex h-[calc(100vh-4rem)]">
      
      <ConversationList
        conversations={mockConversations}
        selectedId={selectedConversationId}
        onSelect={setSelectedConversationId}
      />
      {selectedConversation && <MessageView conversation={selectedConversation} messages={messages} />}
    </div>
    </div>
  )
}
