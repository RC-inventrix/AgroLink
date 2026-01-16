"use client"

import { useState, useEffect } from "react"
import { Search, Bell, MessageSquare, ShoppingBag } from "lucide-react"
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
import { useRouter, usePathname } from "next/navigation" 
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadChatCount, setUnreadChatCount] = useState(0); 
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);
  
  const chatBaseUrl = "http://localhost:8083";
  const orderBaseUrl = "http://localhost:8080";

  // --- 1. PERMANENT NOTIFICATION CLEARING LOGIC ---
  // This effect runs every time the URL (pathname) changes.
  useEffect(() => {
    const clearOrderNotifications = async () => {
      const myId = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("token");

      // If the user is on the order history page, mark all as seen in the DB
      if (pathname === "/buyer/order-history" && myId && token) {
        // Clear local state immediately for instant UI feedback
        setUnreadOrderCount(0); 

        try {
          // Tell the backend to update is_seen_by_buyer = true in the database
          await fetch(`${orderBaseUrl}/api/buyer/orders/mark-seen/${myId}`, {
            method: "PUT",
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
        } catch (err) {
          console.error("Failed to permanently clear order notifications:", err);
        }
      }
    };

    clearOrderNotifications();
  }, [pathname]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const myId = sessionStorage.getItem("id");
    if (!token || !myId) return;

    // --- 2. INITIAL SYNC (Filters for unseen records) ---
    const syncNotifications = async () => {
      try {
        // Chat Sync
        if (pathname !== "/buyer/chat") {
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
            setUnreadChatCount(unreadCounts.reduce((acc, count) => acc + count, 0));
          }
        }

        // Order Sync: Only fetch if the user isn't already viewing the history
        if (pathname !== "/buyer/order-history") {
          const orderRes = await fetch(`${orderBaseUrl}/api/buyer/orders/${myId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (orderRes.ok) {
            const orders = await orderRes.json();
            // CRITICAL: Only count if status is PROCESSING AND seenByBuyer is false in DB
            const unread = orders.filter((o: any) => o.status === "PROCESSING" && !o.seenByBuyer).length;
            setUnreadOrderCount(unread);
          }
        }
      } catch (err) {
        console.error("Notification sync failed:", err);
      }
    };

    syncNotifications();
    const interval = setInterval(syncNotifications, 60000);

    // --- 3. REAL-TIME WEBSOCKET UPDATES ---
    const socket = new SockJS(`${chatBaseUrl}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        // New Message Listener
        client.subscribe(`/user/${myId}/queue/messages`, () => {
          if (pathname !== "/buyer/chat") setUnreadChatCount((prev) => prev + 1);
        });

        // New Order Acceptance Listener
        client.subscribe(`/user/${myId}/queue/orders`, (message) => {
          const update = JSON.parse(message.body);
          // Only increment if status is PROCESSING and user is not on the history page
          if (update.status === "PROCESSING" && pathname !== "/buyer/order-history") {
            setUnreadOrderCount((prev) => prev + 1);
          }
        });
      },
    });

    client.activate();
    return () => { 
      client.deactivate(); 
      clearInterval(interval);
    };
  }, [pathname]);

  const totalNotifications = unreadChatCount + unreadOrderCount;

  return (
    <header className="sticky top-0 z-50 border-b bg-[#03230F] text-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Image src="/buyer-dashboard/Group-6.png" alt="Agro Logo" width={120} height={40} className="h-10 w-auto" />
        </div>

        <div className="flex flex-1 items-center justify-center px-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input type="search" placeholder="Search vegetables..." className="pl-10 bg-white text-black" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
                {totalNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-orange-500 text-[10px] flex items-center justify-center font-bold border-2 border-[#03230F]">
                    {totalNotifications > 99 ? "99+" : totalNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Order Updates */}
              {unreadOrderCount > 0 && (
                <DropdownMenuItem 
                  onClick={() => router.push("/buyer/order-history")}
                  className="flex gap-3 p-3 cursor-pointer focus:bg-gray-50 border-b border-gray-100"
                >
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Order Accepted</p>
                    <p className="text-xs text-gray-500">{unreadOrderCount} new updates ready to view</p>
                  </div>
                </DropdownMenuItem>
              )}

              {/* Chat Messages */}
              {unreadChatCount > 0 && (
                <DropdownMenuItem onClick={() => router.push("/buyer/chat")} className="flex gap-3 p-3 cursor-pointer focus:bg-gray-50">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">New Messages</p>
                    <p className="text-xs text-gray-500">You have {unreadChatCount} unread messages</p>
                  </div>
                </DropdownMenuItem>
              )}

              {totalNotifications === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">No new updates</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
              <DropdownMenuItem onClick={() => router.push("/user-profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { sessionStorage.clear(); router.push("/login"); }} className="text-red-600 font-medium">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}