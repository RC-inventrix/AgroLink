"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unread: boolean
  starred: boolean
  online: boolean
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">All messages</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search conversations..." className="pl-9 bg-gray-50 border-gray-200" />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const isSelected = selectedId === conversation.id
          const initials = conversation.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100",
                isSelected && "bg-gray-100",
              )}
            >
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-[#2d5016] text-white">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-start justify-between mb-1">
                  <h3
                    className={cn(
                      "font-medium text-sm truncate",
                      conversation.unread ? "text-gray-900" : "text-gray-700",
                    )}
                  >
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 shrink-0">{conversation.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "text-sm truncate",
                      conversation.unread ? "text-gray-900 font-medium" : "text-gray-500",
                    )}
                  >
                    {conversation.lastMessage}
                  </p>
                  {conversation.starred && <Star className="h-4 w-4 text-[#f4a522] fill-[#f4a522] ml-2 shrink-0" />}
                </div>
              </div>

              {conversation.unread && <div className="h-2 w-2 rounded-full bg-[#2d5016] shrink-0 mt-2" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
