"use client"

import { MoreVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

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
  onDelete: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect, onDelete }: ConversationListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="flex w-80 flex-col border-r bg-muted/10 h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto bg-white">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)} // Main selection logic
              className={cn(
                "group flex w-full cursor-pointer items-center gap-3 border-b px-4 py-4 text-left transition-all hover:bg-accent/50",
                selectedId === conv.id ? "bg-accent shadow-sm" : ""
              )}
            >
              {/* Avatar Section */}
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

              {/* Text and Info Section */}
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
                    "truncate text-xs flex-1",
                    conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {conv.lastMessage}
                  </p>

                  {/* 3 Dots Menu */}
                  <div className="flex items-center gap-1">
                     {conv.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()} // PREVENTS OPENING THE CHAT
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // PREVENTS OPENING THE CHAT
                            setDeleteId(conv.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your chat with this user? This will remove the history from your view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}