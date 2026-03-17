"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard, ShoppingBag, ShoppingCart, Heart, Package, TrendingUp, FileText, MessageSquare, Gavel,
    BookOpen, ShieldCheck, X
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
    const [showInstructions, setShowInstructions] = useState(false);
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
        <>
            <nav className="hidden lg:flex w-64 flex-col border-r bg-sidebar p-6 min-h-screen">
                <div className="space-y-1 flex-1">
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
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}

                    {/* NEW: Instructions Button placed immediately under "My Bids" */}
                    <button
                        onClick={() => setShowInstructions(true)}
                        className="flex items-center gap-3 w-full mt-2 px-4 py-3 rounded-lg transition-all text-sm font-bold bg-[#03230F] text-[#EEC044] hover:bg-[#03230F]/90 shadow-sm active:scale-95"
                    >
                        <BookOpen className="h-5 w-5" />
                        <span>Instructions</span>
                    </button>
                </div>
            </nav>

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-3 shrink-0">
                            <div className="p-2 bg-[#03230F]/10 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-[#03230F]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#03230F]">AgroLink Community Guidelines</h2>
                                <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">Safety & Trust Rules</p>
                            </div>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="ml-auto p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <p className="text-sm text-gray-600 mb-6 font-medium bg-blue-50 p-3 rounded-lg border border-blue-100">
                                To ensure a safe and profitable environment for everyone, please review our community rules.
                            </p>

                            <ul className="space-y-5">
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🛡️</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">1. Get Verified</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Build trust within the community by completing your profile verification. Farmers and buyers are more likely to trade with verified accounts.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🤝</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">2. Trade with Verified Users</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">For your safety, prioritize contacting and dealing with users who have the "Verified" badge.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">💬</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">3. Communicate & Request Proof</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Always use the in-app chat to communicate. Ask for real-time images and confirm product details before finalizing any orders.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">📍</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">4. Shop Local to Save</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">You and the seller/buyer are responsible for coordinating delivery. Deal locally to minimize travel time and delivery costs!</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">💵</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">5. Cash on Delivery (COD) Only</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">While we are developing a highly secure online payment gateway, <strong>all platform transactions are strictly Cash on Delivery</strong>. Do not send money online.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">⭐</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">6. Check Ratings</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Always review the ratings and feedback of a user before agreeing to a trade.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🚩</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">7. Report Suspicious Activity</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Help us keep AgroLink safe! Use the "Report" button immediately if you encounter fraud, fake items, or unfair behavior.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Modal Footer with Only Close Button */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowInstructions(false)}
                                className="px-8 py-2.5 bg-[#03230F] text-[#EEC044] font-bold rounded-xl shadow-md hover:bg-[#03230F]/90 active:scale-[0.98] transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}