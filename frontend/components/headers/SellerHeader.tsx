"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Bell, User, LogOut, Settings, Check, MessageSquare, ShoppingBag, CheckCircle } from "lucide-react"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import logo from "../../public/images/Group-6.png"

export default function SellerHeader() {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [unreadChatCount, setUnreadChatCount] = useState(0)
    const [orderUnread, setOrderUnread] = useState(0)
    // --- NEW: STATE FOR OFFER NOTIFICATIONS ---
    const [offerNotifications, setOfferNotifications] = useState<any[]>([])

    const dropdownRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)

    const chatBaseUrl = "http://localhost:8083"
    const orderBaseUrl = "http://localhost:8080"
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");

        if (!token || !myId) return;

        // --- NEW: FETCH OFFER ACCEPTANCE NOTIFICATIONS ---
        const fetchOfferNotifications = async () => {
            try {
                const res = await fetch(`${orderBaseUrl}/api/offers/notifications/seller/${myId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Filter for unread ones specifically if you want the badge to be accurate
                    setOfferNotifications(data.filter((n: any) => !n.isRead));
                }
            } catch (err) {
                console.error("Offer notification fetch failed:", err);
            }
        };

        const fetchOrderCount = async () => {
            try {
                const res = await fetch(`${orderBaseUrl}/api/seller/orders/${myId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const orders = await res.json();
                    const pendingOrders = orders.filter((o: any) =>
                        o.status === "PAID" || o.status === "COD_CONFIRMED" || o.status === "CREATED"
                    );
                    setOrderUnread(pendingOrders.length);
                }
            } catch (err) {
                console.error("Order notification sync failed:", err);
            }
        };

        const syncUnreadChatCount = async () => {
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

        // Initial calls
        fetchOrderCount();
        syncUnreadChatCount();
        fetchOfferNotifications();

        const interval = setInterval(() => {
            fetchOrderCount();
            fetchOfferNotifications();
        }, 30000); 

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
        return () => {
            client.deactivate();
            clearInterval(interval);
        };
    }, []);

    // --- UPDATED: TOTAL COUNT INCLUDES OFFERS ---
    const totalNotifications = unreadChatCount + orderUnread + offerNotifications.length;

    const handleLogout = () => {
        sessionStorage.clear();
        setNotification({ message: "Logged out successfully!", type: 'success' });
        setTimeout(() => router.push("/login"), 1500);
    };

    return (
        <header className="w-full bg-[#03230F] text-white shadow-md sticky top-0 z-[100]">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-5 right-5 z-[110] flex items-center p-4 rounded-lg shadow-2xl border bg-white border-green-500 text-green-900">
                    <Check className="w-5 h-5 mr-3 text-green-500" />
                    <p className="font-semibold pr-4">{notification.message}</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex-shrink-0">
                    <Link href="/seller/dashboard">
                        <Image src={logo} alt="AgroLink Logo" priority className="w-auto h-12" />
                    </Link>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 relative flex items-center justify-center">
                            <Bell className="w-6 h-6 text-white" />
                            {totalNotifications > 0 && (
                                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-[#EEC044] text-[#03230F] text-[10px] flex items-center justify-center font-bold border-2 border-[#03230F]">
                                    {totalNotifications > 99 ? "99+" : totalNotifications}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 max-h-[400px] overflow-y-auto">
                                <div className="px-4 py-2 border-b font-bold text-sm text-gray-500 uppercase">Notifications</div>

                                {/* --- NEW: OFFER ACCEPTED SECTION --- */}
                                {offerNotifications.map((notif) => (
                                    <button 
                                        key={notif.id}
                                        onClick={() => { setIsNotifOpen(false); router.push("/seller/orders"); }} 
                                        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 border-b border-gray-50"
                                    >
                                        <div className="p-2 rounded-full bg-blue-100 text-blue-600"><CheckCircle className="w-4 h-4" /></div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Offer Accepted!</p>
                                            <p className="text-xs text-gray-500">{notif.message}</p>
                                        </div>
                                    </button>
                                ))}

                                {orderUnread > 0 && (
                                    <button onClick={() => { setIsNotifOpen(false); router.push("/seller/orders"); }} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 border-b border-gray-50">
                                        <div className="p-2 rounded-full bg-green-100 text-green-600"><ShoppingBag className="w-4 h-4" /></div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">New Orders</p>
                                            <p className="text-xs text-gray-500">You have {orderUnread} orders waiting</p>
                                        </div>
                                    </button>
                                )}

                                {unreadChatCount > 0 && (
                                    <button onClick={() => { setIsNotifOpen(false); router.push("/seller/chat"); }} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 border-b border-gray-50">
                                        <div className="p-2 rounded-full bg-orange-100 text-orange-600"><MessageSquare className="w-4 h-4" /></div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Messages</p>
                                            <p className="text-xs text-gray-500">You have {unreadChatCount} unread chats</p>
                                        </div>
                                    </button>
                                )}

                                {totalNotifications === 0 && (
                                    <div className="px-4 py-8 text-center text-sm text-gray-400">No new notifications</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 pl-6 border-l border-white/20">
                            <div className="w-10 h-10 rounded-full border-2 border-[#EEC044] overflow-hidden bg-white/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-[#EEC044]" />
                            </div>
                            <p className="hidden md:block text-sm font-bold">My Account</p>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100">
                                <Link href="/seller/user-profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
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
    );
}