"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Heart,
  Package, TrendingDown, FileText, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Browse Products", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/bargains", label: "Bargains", icon: TrendingDown },
  { href: "/requests", label: "Item Requests", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
]

export function Sidebar() {
  const [navUnread, setNavUnread] = useState(0);
  const pathname = usePathname();
  const baseUrl = "http://localhost:8083";
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const myId = sessionStorage.getItem("id");
    if (!token || !myId) return;

    // FETCH LOGIC: Using your specific /unread-count/{senderId} endpoint
    const calculateTotalUnread = async () => {
      try {
        // 1. Get the list of contacts first
        const contactsRes = await fetch(`${baseUrl}/api/chat/contacts`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (contactsRes.ok) {
          const contactIds: number[] = await contactsRes.json();
          
          // 2. Map through IDs and call your specific endpoint for each sender
          const unreadCounts = await Promise.all(contactIds.map(async (senderId) => {
            const res = await fetch(`${baseUrl}/api/chat/unread-count/${senderId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            return res.ok ? await res.json() : 0;
          }));

          // 3. Sum all individual unread counts to get the global total
          const total = unreadCounts.reduce((acc, count) => acc + count, 0);
          setNavUnread(total);
        }
      } catch (err) {
        console.error("Failed to calculate global unread count:", err);
      }
    };

    calculateTotalUnread();

    // REAL-TIME: Listen for new messages via WebSockets
    const socket = new SockJS(`${baseUrl}/ws`); 
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/user/${myId}/queue/messages`, (message) => {
          // Only increment if we aren't already looking at the chat
          if (!pathnameRef.current.includes("/chat")) {
            setNavUnread((prev) => prev + 1);
          }
        });
      },
    });

    client.activate();
    return () => { void client.deactivate(); };
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isChat = item.label === "Chat";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                isActive ? "bg-[#f4a522] text-white" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>

              {isChat && navUnread > 0 && (
                <span className={cn(
                  "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shadow-sm",
                  isActive ? "bg-white text-[#f4a522]" : "bg-red-500 text-white"
                )}>
                  {navUnread > 99 ? "99+" : navUnread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}