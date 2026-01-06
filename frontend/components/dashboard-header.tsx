"use client"

import { useState, useEffect } from "react"
import { Search, Bell, MessageSquare } from "lucide-react"
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
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function DashboardHeader() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0); // Dynamic unread message count
  const chatBaseUrl = "http://localhost:8083";

  // 1. WebSocket & Initial Fetch Logic
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const myId = sessionStorage.getItem("id");
    if (!token || !myId) return;

    // A. Initial Sync: Calculate total unread using your specific endpoint
    const syncUnreadCount = async () => {
      try {
        const contactsRes = await fetch(`${chatBaseUrl}/api/chat/contacts`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (contactsRes.ok) {
          const ids: number[] = await contactsRes.json();
          const unreadCounts = await Promise.all(ids.map(async (senderId) => {
            const res = await fetch(`${chatBaseUrl}/api/chat/unread-count/${senderId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            return res.ok ? await res.json() : 0;
          }));
          setUnreadCount(unreadCounts.reduce((acc, count) => acc + count, 0));
        }
      } catch (err) {
        console.error("Header unread sync failed:", err);
      }
    };
    syncUnreadCount();

    // B. Real-Time Updates: WebSocket listener
    const socket = new SockJS(`${chatBaseUrl}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/user/${myId}/queue/messages`, (message) => {
          // Increment count immediately when a new message hits
          setUnreadCount((prev) => prev + 1);
        });
      },
    });

    client.activate();
    return () => { void client.deactivate(); };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear(); 
    router.push("/login"); 
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-[#03230F] text-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Image src="/buyer-dashboard/Group-6.png" alt="Agro Logo" width={120} height={40} className="h-10 w-auto" />
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
          {/* Real-time Chat Notification Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-orange-500 text-[10px] flex items-center justify-center font-bold border-2 border-[#2d5016]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {unreadCount > 0 ? (
                <DropdownMenuItem 
                  onClick={() => router.push("/chat")}
                  className="flex gap-3 p-3 cursor-pointer focus:bg-gray-50"
                >
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">New Messages</p>
                    <p className="text-xs text-gray-500">You have {unreadCount} unread messages</p>
                  </div>
                </DropdownMenuItem>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">No new messages</div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push("/chat")}
                className="justify-center text-xs text-[#2d5016] font-semibold cursor-pointer"
              >
                Go to Chat Center
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 px-2">
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
              <DropdownMenuItem onClick={() => router.push("/user-profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-medium">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}