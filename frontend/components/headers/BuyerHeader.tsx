"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"  
import { useRouter } from "next/navigation"
import { Bell, ShoppingCart, User, LogOut, Settings, Check, MessageSquare, AlertCircle, CheckCircle2, Send } from "lucide-react"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface OrderNotification {
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
    const [orderNotifs, setOrderNotifs] = useState<OrderNotification[]>([])
    
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    const chatBaseUrl = "http://localhost:8083"
    const orderBaseUrl = "http://localhost:8080" 
    const [logoutSuccess, setLogoutSuccess] = useState(false);

    const handleNotifClick = async (notif: OrderNotification) => {
        const token = sessionStorage.getItem("token");
        try {
            if (!notif.read) {
                await fetch(`${orderBaseUrl}/api/buyer/orders/notifications/${notif.id}/read`, {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                setOrderNotifs(prev => 
                    prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                );
            }
            setIsNotifOpen(false);

            const msg = notif.message.toLowerCase();
            if (msg.includes("offer")) {
                router.push(`/buyer/requests`); 
            } else if (msg.includes("accepted")) {
                router.push(`/buyer/order-history?tab=processing`);
            } else {
                router.push(`/buyer/order-history?tab=cancelled`);
            }
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId) return;

        const headers = { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        const fetchAllNotifications = async () => {
            try {
                const res = await fetch(`${orderBaseUrl}/api/buyer/orders/notifications/${myId}`, {
                    method: "GET",
                    headers
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrderNotifs(data);
                }
            } catch (err) { console.error("Notif fetch failed:", err); }
        };

        const syncUnreadCount = async () => {
            try {
                const contactsRes = await fetch(`${chatBaseUrl}/api/chat/contacts`, { headers });
                if (contactsRes.ok) {
                    const ids: number[] = await contactsRes.json();
                    const unreadCounts = await Promise.all(ids.map(async (senderId) => {
                        const res = await fetch(`${chatBaseUrl}/api/chat/unread-count/${senderId}`, { headers });
                        return res.ok ? await res.json() : 0;
                    }));
                    setUnreadChatCount(unreadCounts.reduce((acc, count) => acc + count, 0));
                }
            } catch (err) { console.error("Chat sync failed:", err); }
        };

        syncUnreadCount();
        fetchAllNotifications();

        const interval = setInterval(fetchAllNotifications, 3000);

        const socket = new SockJS(`${chatBaseUrl}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { user: myId },
            onConnect: () => {
                client.subscribe(`/user/${myId}/queue/messages`, () => {
                    setUnreadChatCount((prev) => prev + 1);
                });
            },
        });
        client.activate();

        return () => { 
            clearInterval(interval);
            void client.deactivate(); 
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsMenuOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        setLogoutSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
    };

    const totalUnreadCount = unreadChatCount + orderNotifs.filter(n => !n.read).length;

    return (
        <header className="w-full flex justify-around bg-[#03230F] text-white shadow-md sticky top-0 z-[50]">
            {logoutSuccess && (
                <div className="fixed top-5 right-5 z-[110] flex items-center p-4 rounded-lg shadow-2xl border bg-white border-green-500 text-green-900 animate-in slide-in-from-right-10 duration-500">
                    <Check className="w-5 h-5 mr-3 text-green-500" />
                    <p className="font-semibold pr-4">Logged out successfully!</p>
                </div>
            )}

            <div className="container px-4 h-20 flex items-center justify-between">
                {/* Logo Section */}
                <div className="shrink-0">
                    <Link href="/buyer/dashboard">
                        <Image src="/images/Group-6.png" alt="AgroLink Logo" width={150} height={50} className="object-contain cursor-pointer" priority />
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-6">
                    {/* Notification Section */}
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5 text-white" />
                            {totalUnreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#EEC044] text-[#03230F] text-[10px] flex items-center justify-center font-bold border-2 border-[#03230F]">
                                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                <div className="px-4 py-2 border-b font-bold text-xs text-gray-400 uppercase">Notifications</div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {orderNotifs.map((notif) => {
                                        const msg = notif.message.toLowerCase();
                                        const isOffer = msg.includes("offer");
                                        const isAccepted = msg.includes("accepted");
                                        return (
                                            <div key={notif.id} onClick={() => handleNotifClick(notif)} className={`px-4 py-3 border-b border-gray-50 flex gap-3 items-start cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30 hover:bg-gray-100' : 'hover:bg-gray-50'}`}>
                                                <div className={`mt-1 p-1.5 rounded-full ${isOffer ? 'bg-blue-100 text-blue-600' : isAccepted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {isOffer ? <Send size={14} /> : isAccepted ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-900">{isOffer ? "New Offer Received" : isAccepted ? "Order Accepted" : "Order Cancelled"}</p>
                                                    <p className="text-[11px] text-gray-600 leading-tight mt-0.5">{notif.message}</p>
                                                </div>
                                                {!notif.read && <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />}
                                            </div>
                                        );
                                    })}
                                    {unreadChatCount > 0 && (
                                        <button onClick={() => { setIsNotifOpen(false); router.push("/buyer/chat"); }} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b">
                                            <div className="p-2 rounded-full bg-orange-100 text-orange-600"><MessageSquare className="w-4 h-4" /></div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900">New Messages</p>
                                                <p className="text-xs text-gray-500">You have {unreadChatCount} unread messages</p>
                                            </div>
                                        </button>
                                    )}
                                    {totalUnreadCount === 0 && <div className="px-4 py-8 text-center text-sm text-gray-400">All caught up!</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cart Icon */}
                    <Link href="/cart" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </Link>

                    {/* Profile Section */}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 pl-4 border-l border-white/20 hover:opacity-80 transition-opacity focus:outline-none">
                            <div className="w-10 h-10 rounded-full border-2 border-[#EEC044] overflow-hidden bg-white/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-[#EEC044]" />
                            </div>
                            <p className="hidden sm:block text-sm font-bold uppercase tracking-tight">My Account</p>
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