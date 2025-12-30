"use client"

import { useState, useEffect } from "react"
import { Search, Bell, MessageSquare, Package, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter();
  
  // Mock notification data - you can later fetch this from your backend
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Message", description: "Farmer Sunil sent you a message", icon: MessageSquare, time: "2m ago", unread: true },
    { id: 2, title: "Order Shipped", description: "Your order #ORD-101 has been shipped", icon: Package, time: "1h ago", unread: true },
    { id: 3, title: "Stock Alert", description: "Fresh Carrots are back in stock!", icon: AlertCircle, time: "5h ago", unread: false },
  ]);

  const handleLogout = () => {
    sessionStorage.clear(); 
    router.push("/login"); 
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 border-b bg-[#2d5016] text-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Image src="/buyer-dashboard/agro-logo.png" alt="Agro Logo" width={120} height={40} className="h-10 w-auto" />
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search vegetables..."
              className="pl-10 bg-white text-black placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-orange-500 text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-xs font-normal text-gray-500 cursor-pointer hover:underline">Mark all as read</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex gap-3 p-3 cursor-pointer focus:bg-gray-50">
                      <div className={`p-2 rounded-full ${n.unread ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        <n.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${n.unread ? 'font-semibold' : 'font-normal'}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{n.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="h-2 w-2 rounded-full bg-orange-500 self-center" />}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs text-[#2d5016] font-semibold cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-white/10 px-2"
              >
                <Avatar className="h-8 w-8 border border-white/20">
                  <AvatarImage src="/buyer-dashboard/diverse-user-avatars.png" />
                  <AvatarFallback>BU</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">My Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem>Orders</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 focus:text-red-600 cursor-pointer font-medium"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}