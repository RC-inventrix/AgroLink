"use client"

import { useEffect, useState } from "react"
import React from 'react';
import {
    Bell,
    ShoppingCart,
    Heart,
    Package,
    MessageSquare,
    TrendingUp,
    Clock,
    AlertCircle,
    LogOut,
    Mail,
    Phone,
    Megaphone,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardNav } from "@/components/dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BuyerHeader from "@/components/headers/BuyerHeader"

// Re-added the bargains object to prevent "missing" errors
const bargains = {
    pending: [{ id: 1, product: "Organic Beans", image: "/buyer-dashboard/green-beans.jpg", offeredPrice: "LKR 800", quantity: "8 kg", status: "pending" }],
    approved: [{ id: 2, product: "Cabbage", image: "/buyer-dashboard/fresh-cabbage.jpg", offeredPrice: "LKR 400", quantity: "5 kg", status: "approved" }],
    rejected: [{ id: 3, product: "Potatoes", image: "/buyer-dashboard/fresh-potatoes.png", offeredPrice: "LKR 300", quantity: "10 kg", status: "rejected" }],
}

export default function BuyerDashboard() {
    const [firstName, setFirstName] = useState("User")
    const [isBanned, setIsBanned] = useState(false)
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [showAnnouncements, setShowAnnouncements] = useState(true)
    
    const [navUnread, setNavUnread] = useState(0)
    const [liveChats, setLiveChats] = useState<any[]>([])
    const [isLoadingChats, setIsLoadingChats] = useState(true)
    const [realCartItems, setRealCartItems] = useState<any[]>([])
    const [isLoadingCart, setIsLoadingCart] = useState(true)
    const [pendingOrders, setPendingOrders] = useState<any[]>([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)

    const gatewayUrl = "http://localhost:8080"

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id") || "1"; 
        if (!token) return;

        const headers = { "Authorization": `Bearer ${token}` };

        const fetchUserDataAndStatus = async () => {
    try {
        const response = await fetch(`${gatewayUrl}/auth/me`, { headers });
        if (response.ok) {
            const data = await response.json();
            
            // Check ban status first
            if (data.isBanned) {
                setIsBanned(true);
                return;
            }
            if (data.fullName) setFirstName(data.fullName.split(" ")[0]);
        }

        // Fetch announcements specifically for the BUYER role
        const annRes = await fetch(`${gatewayUrl}/api/v1/announcements/my-announcements?role=BUYER`, { headers });
        if (annRes.ok) {
            const annData = await annRes.json();
            setAnnouncements(annData); // Store the list in state
        }
    } catch (err) { 
        console.error("User data or announcement fetch failed:", err); 
    }
};

        const fetchCartItems = async () => {
            try {
                const res = await fetch(`${gatewayUrl}/cart/${myId}`);
                if (res.ok) {
                    const data = await res.json();
                    setRealCartItems(data);
                }
            } catch (err) { console.error("Cart fetch failed:", err); }
            finally { setIsLoadingCart(false); }
        };

        const fetchPendingOrders = async () => {
            try {
                const res = await fetch(`${gatewayUrl}/api/buyer/orders/${myId}`, { headers });
                if (res.ok) {
                    const backendOrders = await res.json();
                    const pendingList: any[] = [];
                    const sellerIds = new Set<string>();

                    backendOrders.filter((o: any) => o.status !== "COMPLETED").forEach((order: any) => {
                        let items = [];
                        try {
                            if (order.itemsJson && order.itemsJson.startsWith("[")) {
                                items = JSON.parse(order.itemsJson);
                            } else {
                                items = [{ productName: "Agro Product", quantity: 1, pricePerKg: order.amount / 100 }];
                            }
                        } catch (e) { items = []; }

                        items.forEach((item: any) => {
                            const sId = item.sellerId || order.sellerId;
                            if (sId) sellerIds.add(sId);
                            pendingList.push({ ...item, orderId: order.id, sellerId: sId, status: "pending" });
                        });
                    });

                    let nameMap: Record<string, string> = {};
                    if (sellerIds.size > 0) {
                        const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${Array.from(sellerIds).join(',')}`, { headers });
                        if (nameRes.ok) nameMap = await nameRes.json();
                    }

                    setPendingOrders(pendingList.map(item => ({
                        ...item,
                        sellerName: nameMap[item.sellerId] || "AgroLink Seller"
                    })));
                }
            } catch (err) { console.error("Orders fetch failed:", err); }
            finally { setIsLoadingOrders(false); }
        };

        const syncDashboardData = async () => {
            try {
                const res = await fetch(`http://localhost:8083/api/chat/contacts`, { headers });
                if (res.ok) {
                    const ids: number[] = await res.json();
                    if (ids.length === 0) {
                        setIsLoadingChats(false);
                        return;
                    }

                    const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${ids.join(',')}`, { headers });
                    const fullNameMap = nameRes.ok ? await nameRes.json() : {};

                    const data = await Promise.all(ids.map(async (senderId) => {
                        const countRes = await fetch(`http://localhost:8083/api/chat/unread-count/${senderId}`, { headers });
                        const count = countRes.ok ? await countRes.json() : 0;
                        return { id: senderId, name: fullNameMap[senderId] || `Farmer ${senderId}`, count };
                    }));

                    setNavUnread(data.reduce((acc, curr) => acc + curr.count, 0));
                    setLiveChats(data.slice(0, 3).map(chat => ({
                        id: chat.id.toString(),
                        farmer: chat.name,
                        avatar: "/buyer-dashboard/farmer-portrait.png",
                        lastMessage: "Open chat to view messages",
                        unread: chat.count
                    })));
                }
            } catch (err) { console.error("Dashboard sync failed:", err); }
            finally { setIsLoadingChats(false); }
        };

        fetchUserDataAndStatus();
        fetchCartItems();
        fetchPendingOrders();
        syncDashboardData();

        const interval = setInterval(() => {
            syncDashboardData();
            fetchCartItems();
            fetchPendingOrders();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isBanned) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-center">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 border border-red-100">
                    <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={48} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Restricted</h2>
                    <p className="text-gray-600 mb-6">Your account has been banned for policy violation. Please contact customer service.</p>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={16} className="text-red-500"/> support@agrolink.com</div>
                        <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={16} className="text-red-500"/> +94 11 234 5678</div>
                    </div>
                    <Button onClick={() => { sessionStorage.clear(); window.location.href = "/login"; }} className="w-full bg-gray-900 hover:bg-gray-800"><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <BuyerHeader />
                <div className="flex">
                    <DashboardNav unreadCount={navUnread} />
                    <main className="flex-1 p-6 lg:p-8">
                        {/* Welcome Banner */}
                        <div className="relative mb-6 overflow-hidden rounded-xl bg-[#03230F] p-8 text-white">
                            <h1 className="mb-2 text-3xl font-bold">Welcome back, {firstName} 👋</h1>
                            <p className="text-lg opacity-90">Manage your orders, bargains, and requests in one place</p>
                        </div>

                        {/* --- ANNOUNCEMENT BAR (Directly under Banner) --- */}
                        {showAnnouncements && announcements.length > 0 && (
                            <div className="mb-6 bg-yellow-400 rounded-xl px-6 py-4 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#03230F] p-2 rounded-lg"><Megaphone size={18} className="text-yellow-400" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-[#03230F] leading-tight">{announcements[0].title}</p>
                                        <p className="text-sm text-[#03230F]/80">{announcements[0].message}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAnnouncements(false)} className="hover:bg-black/10 p-1.5 rounded-full transition-colors">
                                    <X size={20} className="text-[#03230F]" />
                                </button>
                            </div>
                        )}

                        <div className="mb-8 grid gap-6 md:grid-cols-2">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">My Cart</CardTitle>
                                    <ShoppingCart className="h-5 w-5 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    {isLoadingCart ? (
                                        <div className="h-24 flex items-center justify-center animate-pulse bg-gray-50 rounded-lg">Loading...</div>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold text-[#2d5016] mb-4">{realCartItems.length} items</div>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {realCartItems.slice(0, 4).map((item) => (
                                                    <div key={item.id} className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border">
                                                        <img src={item.imageUrl || "/placeholder.svg"} className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <Link href="/cart"><Button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600">View Cart</Button></Link>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mb-8">
                            <CardHeader><CardTitle className="flex items-center gap-2 font-bold"><Package className="h-5 w-5 text-yellow-500" /> My Orders</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="pending">
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                        <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                                        <TabsTrigger value="history">History</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="pending" className="space-y-4">
                                        {isLoadingOrders ? (
                                            <div className="py-10 text-center animate-pulse">Fetching orders...</div>
                                        ) : pendingOrders.length > 0 ? (
                                            pendingOrders.map((order, idx) => (
                                                <div key={`${order.orderId}-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-white">
                                                    <div className="h-16 w-16 rounded-lg overflow-hidden border flex-shrink-0">
                                                        <img src={order.imageUrl || "/buyer-dashboard/red-tomatoes.jpg"} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start"><h3 className="font-semibold">{order.productName}</h3><span className="text-xs text-gray-400">#{order.orderId}</span></div>
                                                        <p className="text-xs text-primary font-medium">Seller: {order.sellerName}</p>
                                                        <div className="mt-1 flex items-center gap-3"><p className="text-sm font-bold text-[#2d5016]">LKR {(order.pricePerKg * order.quantity).toFixed(2)}</p><span className="text-xs text-gray-400">{order.quantity} kg</span></div>
                                                    </div>
                                                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-gray-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>No pending orders</p></div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-500" /> Bargain Status</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {bargains.pending.map((b) => (
                                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="flex-1 text-left"><p className="font-medium">{b.product}</p><p className="text-sm text-yellow-600 font-bold">{b.offeredPrice}</p></div>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-200">Pending</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-yellow-500" /> Recent Chats</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {isLoadingChats ? (
                                        <div className="py-4 text-center text-sm text-gray-400 animate-pulse">Syncing...</div>
                                    ) : liveChats.length > 0 ? (
                                        liveChats.map((chat) => (
                                            <Link key={chat.id} href="/buyer/chat">
                                                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <Avatar className="h-10 w-10"><AvatarImage src={chat.avatar} /><AvatarFallback>{chat.farmer[0]}</AvatarFallback></Avatar>
                                                    <div className="flex-1 text-left min-w-0"><p className="font-medium truncate">{chat.farmer}</p><p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p></div>
                                                    {chat.unread > 0 && <Badge className="bg-yellow-500 text-white">{chat.unread}</Badge>}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-sm text-gray-400">No active chats</p>
                                    )}
                                    <Link href="/buyer/chat"><Button variant="ghost" className="w-full text-xs text-[#2d5016] font-bold">Open Message Center</Button></Link>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}