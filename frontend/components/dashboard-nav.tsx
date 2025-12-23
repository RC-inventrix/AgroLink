"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Package,
  TrendingUp,
  FileText,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buyer/browse", label: "Browse Products", icon: ShoppingBag },
  { href: "/buyer/cart", label: "Cart", icon: ShoppingCart },
  { href: "/buyer/wishlist", label: "Wishlist", icon: Heart },
  { href: "/buyer/orders", label: "My Orders", icon: Package },
  { href: "/buyer/bargains", label: "Bargains", icon: TrendingUp },
  { href: "/buyer/requests", label: "Item Requests", icon: FileText },
  { href: "/chat", label: "Chat", icon: MessageSquare },
]

export function DashboardNav() {
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
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
