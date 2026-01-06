"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Heart, Package, TrendingUp, FileText, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/VegetableList", label: "Browse Products", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/buyer/wishlist", label: "Wishlist", icon: Heart },
  { href: "/buyer/order-history", label: "My Orders", icon: Package },
  { href: "/buyer/bargains", label: "Bargains", icon: TrendingUp },
  { href: "/buyer/requests", label: "Item Requests", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
]

interface DashboardNavProps {
  unreadCount?: number;
}

export function DashboardNav({ unreadCount = 0 }: DashboardNavProps) {
  const pathname = usePathname()

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
                {/* Unread badge logic */}
                {item.label === "Chat" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
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