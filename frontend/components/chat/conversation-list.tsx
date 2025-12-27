"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export interface Conversation {
  unreadCount: number
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
    <div className="flex w-80 flex-col border-r bg-muted/10">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b px-4 py-4 text-left transition-all ",
                selectedId === conv.id ? "bg-accent" : ""
              )}
            >
              {/* Avatar Section with Online Indicator */}
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 overflow-hidden rounded-full border shadow-sm">
                  <img
                    src={conv.avatar || "/buyer-dashboard/farmer-portrait.png"}
                    alt={conv.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                )}
              </div>

              {/* Text and Badge Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "truncate text-sm font-medium",
                    conv.unreadCount > 0 ? "font-bold text-foreground" : "text-foreground/80"
                  )}>
                    {conv.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(conv.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    "truncate text-xs",
                    conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage}
                  </p>

                  {/* INDIVIDUAL UNREAD BADGE: Logic matched to page.tsx state */}
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
