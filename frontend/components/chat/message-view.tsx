"use client"

import { useState } from "react" // Import useState for input tracking
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreVertical, Star, Edit, Send, Paperclip, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Conversation } from "./conversation-list"

export interface Message {
  id: string
  senderId: number // Changed to number to match backend BIGINT
  content: string
  timestamp: string
  isCurrentUser: boolean
}

interface MessageViewProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void // Prop from page.tsx
}

export function MessageView({ conversation, messages, onSendMessage }: MessageViewProps) {
  // Local state to manage the text being typed
  const [inputValue, setInputValue] = useState("");

  const initials = conversation.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Logic to trigger the send action
  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue(""); // Clear the box after sending
    }
  };

  // Allow sending by pressing the 'Enter' key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-[#2d5016] text-white">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
            <p className="text-sm text-gray-500">Last seen {conversation.timestamp}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Edit className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <Star className={cn("h-5 w-5", conversation.starred ? "text-[#f4a522] fill-[#f4a522]" : "text-gray-600")} />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 py-3 bg-[#f0f7e8] border-b border-gray-200">
        <p className="text-sm text-gray-700 text-center">
          <span className="font-medium">🛡️ WE HAVE YOUR BACK</span>
          {" - "}
          For added safety and your protection, keep payments and communications within Agrolink.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.isCurrentUser && "flex-row-reverse")}>
            {!message.isCurrentUser && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#2d5016] text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
            )}

            <div className={cn("flex flex-col gap-1 max-w-[70%]", message.isCurrentUser && "items-end")}>
              <div
                className={cn(
                  "rounded-lg px-4 py-2",
                  message.isCurrentUser ? "bg-[#2d5016] text-white" : "bg-gray-100 text-gray-900",
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              <span className="text-xs text-gray-500">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#2d5016] focus-within:ring-1 focus-within:ring-[#2d5016] transition-all">
            <Input
              placeholder="Type a message..."
              value={inputValue} // Bind input to local state
              onChange={(e) => setInputValue(e.target.value)} // Update state on type
              onKeyDown={handleKeyPress} // Support 'Enter' key
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex items-center gap-2 px-3 pb-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200">
                <Smile className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-200">
                <Paperclip className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSend} // Mount the click event to trigger handleSend
            className="bg-[#f4a522] hover:bg-[#d89112] text-white h-10 px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}