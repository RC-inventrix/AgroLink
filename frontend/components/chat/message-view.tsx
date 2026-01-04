"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreVertical, Star, Edit, Send, Paperclip, Smile, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Conversation } from "./conversation-list"

export interface Message {
  id: string
  senderId: number
  content: string
  timestamp: string
  isCurrentUser: boolean
  isRead?: boolean 
}

interface MessageViewProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string) => void
}

export function MessageView({ conversation, messages, onSendMessage }: MessageViewProps) {
  const [inputValue, setInputValue] = useState("")

  const renderStatus = () => {
    if (conversation.online) return <span className="text-green-600 font-medium">Online</span>
    const timestamp = conversation.timestamp
    if (!timestamp) return "Offline"
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    return isToday ? `Last seen today at ${timeString}` : `Last seen ${date.toLocaleDateString()} at ${timeString}`
  }

  const initials = conversation.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-[#2d5016] text-white">{initials}</AvatarFallback>
            </Avatar>
            {conversation.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
            <p className="text-sm text-gray-500">{renderStatus()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Edit className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon">
            <Star className={cn("h-5 w-5", conversation.starred ? "text-[#f4a522] fill-[#f4a522]" : "text-gray-600")} />
          </Button>
          <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.isCurrentUser && "flex-row-reverse")}>
            {!message.isCurrentUser && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-[#2d5016] text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
            )}
            <div className={cn("flex flex-col gap-1 max-w-[70%]", message.isCurrentUser && "items-end")}>
              <div className={cn("rounded-lg px-4 py-2", message.isCurrentUser ? "bg-[#2d5016] text-white" : "bg-gray-100 text-gray-900")}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {/* WHATSAPP STYLE BLUE TICK LOGIC */}
                {message.isCurrentUser && (
                  <CheckCheck className={cn("h-3 w-3", message.isRead ? "text-blue-500" : "text-gray-400")} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <Input 
            placeholder="Type a message..." 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
          />
          <Button onClick={handleSend} className="bg-[#f4a522] text-white h-10 px-6"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  )
}