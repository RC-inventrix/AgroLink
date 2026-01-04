"use client"

import { Bell, Search, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  hasUnreadMessages?: boolean
  unreadCount?: number
}

export function Navbar({ hasUnreadMessages = false, unreadCount = 0 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#2d5016] shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-white flex items-center gap-1">
            <span className="text-[#f4a522]">🌾</span>
            <span>Agrolink</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search vegetables..."
              className="pl-10 bg-white border-none h-10 focus-visible:ring-[#f4a522]"
            />
            <Button className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-[#f4a522] hover:bg-[#d89112] text-white border-none">
              Search
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Message Icon with Badge */}
          <div className="relative">
            <MessageSquare className="h-5 w-5 text-white cursor-pointer hover:text-[#f4a522] transition-colors" />
            {hasUnreadMessages && unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 px-1.5 bg-red-500 text-white text-xs border-2 border-[#2d5016]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </div>

          {/* Notification Icon */}
          <div className="relative">
            <Bell className="h-5 w-5 text-white cursor-pointer hover:text-[#f4a522] transition-colors" />
            <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-[#f4a522] rounded-full border-2 border-[#2d5016]" />
          </div>

          {/* User Account */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" />
              <AvatarFallback className="bg-[#f4a522] text-white">MA</AvatarFallback>
            </Avatar>
            <span className="text-white font-medium">My Account</span>
          </div>
        </div>
      </div>
    </header>
  )
}
