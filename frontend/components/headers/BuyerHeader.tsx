"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"  
import { useRouter } from "next/navigation"
import { Bell, ShoppingCart, User, Menu, LogOut, Settings, X, Check, MessageSquare, AlertCircle } from "lucide-react"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface CancelledNotification {
    id: number;
    orderId: number;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function DashboardHeader() {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [unreadChatCount, setUnreadChatCount] = useState(0)
    const [cancelledNotifs, setCancelledNotifs] = useState<CancelledNotification[]>([])
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    const chatBaseUrl = "http://localhost:8083"
    const orderBaseUrl = "http://localhost:8080" 
    const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

    // --- NEW: Handle Notification Click ---
    const handleNotifClick = async (notif: CancelledNotification) => {
        const token = sessionStorage.getItem("token");
        
        try {
            // 1. Mark as read in Backend if it's currently unread
            if (!notif.read) {
                await fetch(`${orderBaseUrl}/api/buyer/orders/notifications/${notif.id}/read`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                // Update local state to remove the red dot immediately
                setCancelledNotifs(prev => 
                    prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                );
            }

            // 2. Close the notification dropdown
            setIsNotifOpen(false);

            // 3. Redirect to order history with the 'cancelled' tab active
            router.push("/buyer/order-history?tab=cancelled");

        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            // Fallback: still redirect even if API fails
            router.push("/buyer/order-history?tab=cancelled");
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId) return;

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
                    setUnreadChatCount(unreadCounts.reduce((acc, count) => acc + count, 0));
                }
            } catch (err) { console.error("Chat sync failed:", err); }
        };

        const fetchCancelledNotifs = async () => {
            try {
                const res = await fetch(`${orderBaseUrl}/api/buyer/orders/notifications/${myId}`, {
                    method: "GET",
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCancelledNotifs(data);
                }
            } catch (err) { console.error("Notif fetch failed:", err); }
        };

        syncUnreadCount();
        fetchCancelledNotifs();

        const socket = new SockJS(`${chatBaseUrl}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/user/${myId}/queue/messages`, () => {
                    setUnreadChatCount((prev) => prev + 1);
                });
            },
        });
        client.activate();
        return () => { void client.deactivate(); };
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsMenuOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalUnread = unreadChatCount + cancelledNotifs.filter(n => !n.read).length;

    const handleLogout = () => {
        sessionStorage.clear();
        setNotification({ message: "Logged out successfully!", type: 'success' });
        setTimeout(() => router.push("/login"), 1500);
    };

    return (
        <header className="w-full flex justify-around bg-[#03230F] text-white shadow-md sticky top-0 z-100">
            {notification && (
                <div className="fixed top-5 right-5 z-[110] flex items-center p-4 rounded-lg shadow-2xl border bg-white border-green-500 text-green-900 animate-in slide-in-from-right-10 duration-500">
                    <Check className="w-5 h-5 mr-3 text-green-500" />
                    <p className="font-semibold pr-4">{notification.message}</p>
                </div>
            )}

            <div className="container px-4 h-20 flex items-center justify-between">
                <div className="flex-shrink-0">
                    <Link href="/buyer/dashboard">
                        <Image src="/images/Group-6.png" alt="AgroLink Logo" width={150} height={50} className="object-contain cursor-pointer" priority />
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-6">
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5 text-white" />
                            {totalUnread > 0 && (
                                <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#EEC044] text-[#03230F] text-[10px] flex items-center justify-center font-bold border-2 border-[#03230F]">
                                    {totalUnread > 99 ? "99+" : totalUnread}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                <div className="px-4 py-2 border-b font-bold text-xs text-gray-400 uppercase">Notifications</div>
                                
                                <div className="max-h-[400px] overflow-y-auto">
                                    {/* --- UPDATED: Item Clickable with logic --- */}
                                    {cancelledNotifs.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => handleNotifClick(notif)}
                                            className={`px-4 py-3 border-b border-gray-50 flex gap-3 items-start transition-colors cursor-pointer ${!notif.read ? 'bg-red-50/50 hover:bg-red-100/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="mt-1 p-1.5 bg-red-100 text-red-600 rounded-full">
                                                <AlertCircle size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-gray-900">Order Cancelled</p>
                                                <p className="text-[11px] text-gray-600 leading-tight mt-0.5">{notif.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {!notif.read && <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />}
                                        </div>
                                    ))}

                                    {unreadChatCount > 0 && (
                                        <button onClick={() => { setIsNotifOpen(false); router.push("/buyer/chat"); }} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                                            <div className="p-2 rounded-full bg-orange-100 text-orange-600"><MessageSquare className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900">New Messages</p>
                                                <p className="text-xs text-gray-500">You have {unreadChatCount} unread messages</p>
                                            </div>
                                        </button>
                                    )}

                                    {totalUnread === 0 && (
                                        <div className="px-4 py-8 text-center text-sm text-gray-400">All caught up!</div>
                                    )}
                                </div>
                                
                                <button onClick={() => { setIsNotifOpen(false); router.push("/buyer/order-history"); }} className="w-full py-2.5 text-center text-[11px] font-bold text-[#03230F] hover:bg-gray-50 border-t uppercase tracking-wider">
                                    View All Orders
                                </button>
                            </div>
                        )}
                    </div>

                    <button>
                        <Link href="/cart">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </Link>
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 pl-4 border-l border-white/20 hover:opacity-80 transition-opacity focus:outline-none">
                            <div className="w-10 h-10 rounded-full border-2 border-[#EEC044] overflow-hidden bg-white/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-[#EEC044]" />
                            </div>
                            <p className="hidden sm:block text-sm font-bold">My Account</p>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                <Link href="/buyer/user-profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                                    <Settings className="w-4 h-4 text-gray-400" /> Profile
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 font-bold border-t">
                                    <LogOut className="w-4 h-4" /> Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}