"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Package, TrendingUp, FileText, MessageSquare, Gavel,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/VegetableList", label: "Browse Products", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/buyer/order-history", label: "My Orders", icon: Package },
  { href: "/buyer/bargain-history", label: "Bargains", icon: TrendingUp },
  { href: "/buyer/requests", label: "Item Requests", icon: FileText },
  { href: "/buyer/chat", label: "Chat", icon: MessageSquare },
  { href: "/buyer/bids", label: "My Bids", icon: Gavel },
]

interface DashboardNavProps {
  unreadCount?: number;
}

export function DashboardNav({ unreadCount: initialCount = 0 }: DashboardNavProps) {
  const pathname = usePathname()
  const [liveUnreadCount, setLiveUnreadCount] = useState(initialCount)
  const CHAT_SERVICE_URL = "http://localhost:8083"

  // Polling Logic: Fetch total unread count every 3 seconds
  useEffect(() => {
    const fetchTotalUnread = async () => {
      const token = sessionStorage.getItem("token");
      const myId = sessionStorage.getItem("id");
      
      if (!token || !myId) return;

      try {
        // Calling the endpoint you have in ChatController.java
        const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/total-unread`, {
          headers: { 
            "Authorization": `Bearer ${token}` 
          }
        });

        if (res.ok) {
          const count = await res.json();
          setLiveUnreadCount(count);
        }
      } catch (err) {
        console.error("Polling failed:", err);
      }
    };

    // Initial fetch
    fetchTotalUnread();

    // Set up the interval
    const interval = setInterval(fetchTotalUnread, 3000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [pathname]); // Refresh interval if path changes

  return (
    <nav className="hidden lg:flex w-64 flex-col border-r bg-sidebar p-6">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {/* Real-time Badge via Polling */}
                {item.label === "Chat" && liveUnreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {liveUnreadCount > 9 ? "9+" : liveUnreadCount}
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}