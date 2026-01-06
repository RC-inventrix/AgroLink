"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"  
import { useRouter } from "next/navigation"
import { Bell, ShoppingCart, User, Menu, LogOut, Settings, X, Check, MessageSquare, Search } from "lucide-react"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import logo from "../public/buyer-dashboard/agro-logo.png"
export default function DashboardHeader() {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    const chatBaseUrl = "http://localhost:8080"
    const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

    // 1. WebSocket & Initial Fetch Logic (Merged from your previous code)
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
                    setUnreadCount(unreadCounts.reduce((acc, count) => acc + count, 0));
                }
            } catch (err) {
                console.error("Header unread sync failed:", err);
            }
        };
        syncUnreadCount();

        const socket = new SockJS(`${chatBaseUrl}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/user/${myId}/queue/messages`, () => {
                    setUnreadCount((prev) => prev + 1);
                });
            },
        });

        client.activate();
        return () => { void client.deactivate(); };
    }, []);

    // Close dropdowns on outside click
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
        setNotification({ message: "Logged out successfully!", type: 'success' });
        setTimeout(() => router.push("/login"), 1500);
    };

    return (
        <header className="w-full bg-[#03230F] text-white shadow-md sticky top-0 z-[100]">
            {/* Custom Success Notification */}
            {notification && (
                <div className="fixed top-5 right-5 z-[110] flex items-center p-4 rounded-lg shadow-2xl border bg-white border-green-500 text-green-900 animate-in slide-in-from-right-10 duration-500">
                    <Check className="w-5 h-5 mr-3 text-green-500" />
                    <p className="font-semibold pr-4">{notification.message}</p>
                </div>
            )}

            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* SEARCH BAR (Matching Dashboard Style) */}
                <div className="hidden md:flex flex-1 items-center justify-center px-8">
                   <Image
                    src="/images/Group-6.png"
                    alt="AgroLink Logo"
                    width={150}
                    height={50}
                    className="object-contain"
                    style={{ width: "150px" }}
                />
                  
                    <div className="relative w-full max-w-md">
                        <nav className="space-x-6 text-sm">
                    <a href="/" className="hover:text-yellow-300 transition">Home</a>
                    <a href="#" className="hover:text-yellow-300 transition">Features</a>
                    <a href="#" className="hover:text-yellow-300 transition">About Us</a>


                </nav>
                    </div>
                </div>

                {/* ACTION ICONS */}
                <div className="flex items-center gap-2 sm:gap-6">
                    {/* CHAT/NOTIF BELL */}
                    <div className="relative" ref={notifRef}>
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                        >
                            <Bell className="w-5 h-5 text-white" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-[#EEC044] text-[#03230F] text-[10px] flex items-center justify-center font-bold border-2 border-[#03230F]">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* NOTIFICATION DROPDOWN */}
                        {isNotifOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b font-bold text-sm text-gray-500 uppercase">Notifications</div>
                                {unreadCount > 0 ? (
                                    <button 
                                        onClick={() => { setIsNotifOpen(false); router.push("/chat"); }}
                                        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                    >
                                        <div className="p-2 rounded-full bg-orange-100 text-orange-600"><MessageSquare className="w-4 h-4" /></div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">New Messages</p>
                                            <p className="text-xs text-gray-500">You have {unreadCount} unread messages</p>
                                        </div>
                                    </button>
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No new notifications</div>
                                )}
                                <button onClick={() => router.push("/chat")} className="w-full py-2 text-center text-xs font-bold text-[#03230F] hover:bg-gray-50">Go to Chat Center</button>
                            </div>
                        )}
                    </div>

                    <Link href="/cart" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ShoppingCart className="w-5 h-5" /></Link>

                    {/* ACCOUNT DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 pl-4 border-l border-white/20 hover:opacity-80 transition-opacity focus:outline-none">
                            <div className="w-10 h-10 rounded-full border-2 border-[#EEC044] overflow-hidden bg-white/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-[#EEC044]" />
                            </div>
                            <p className="hidden sm:block text-sm font-bold">My Account</p>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                <Link href="/user-profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
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