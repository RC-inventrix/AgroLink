"use client"

import { useEffect, useState } from "react"
import React from 'react';
import {
    ShoppingCart,
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
    CheckCircle2,
    XCircle,
    Check
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
import Footer from "@/components/footer/Footer"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

export default function BuyerDashboard() {
    const { t } = useLanguage() // Initialized the hook
    const [firstName, setFirstName] = useState("User")
    const [isBanned, setIsBanned] = useState(false)
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [showAnnouncements, setShowAnnouncements] = useState(true)

    const [navUnread, setNavUnread] = useState(0)
    const [liveChats, setLiveChats] = useState<any[]>([])
    const [isLoadingChats, setIsLoadingChats] = useState(true)
    const [realCartItems, setRealCartItems] = useState<any[]>([])
    const [isLoadingCart, setIsLoadingCart] = useState(true)

    // Updated States for Orders and Bargains
    const [ordersData, setOrdersData] = useState<any[]>([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)
    const [bargainsData, setBargainsData] = useState<any[]>([])
    const [isLoadingBargains, setIsLoadingBargains] = useState(true)

    const gatewayUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

    // --- NEW FUNCTION: DISMISS WARNING ---
    const handleDismissWarning = async (notificationId: string) => {
        try {
            const token = sessionStorage.getItem("token");
            const id = notificationId.replace("warning-", ""); // Remove UI prefix to get DB ID

            const res = await fetch(`${gatewayUrl}/api/v1/moderation/notifications/mark-read/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                // Remove from local state immediately
                setAnnouncements(prev => prev.filter(ann => ann.id !== notificationId));
            }
        } catch (err) {
            console.error("Failed to dismiss warning:", err);
        }
    };

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

                // 1. Fetch General Announcements
                const annRes = await fetch(`${gatewayUrl}/api/v1/announcements/my-announcements?role=BUYER`, { headers });
                let allItems = [];
                if (annRes.ok) {
                    allItems = await annRes.json();
                }

                // 2. Fetch Moderation Notifications (Warnings) - NEW ADDITION
                const modRes = await fetch(`${gatewayUrl}/api/v1/moderation/user/notifications/${myId}`, { headers });
                if (modRes.ok) {
                    const modData = await modRes.json();
                    const warnings = modData
                        .filter((n: any) => !n.read) // Only show unread
                        .map((n: any) => ({
                            id: `warning-${n.id}`,
                            title: n.title,
                            message: n.message,
                            type: "WARNING", // Specifically marker for red styling
                            createdAt: n.createdAt
                        }));
                    // Warnings are prioritized at the top
                    setAnnouncements([...warnings, ...allItems]);
                } else {
                    setAnnouncements(allItems);
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

        const fetchOrdersAndBargains = async () => {
            // Fetch Orders
            try {
                const res = await fetch(`${gatewayUrl}/api/buyer/orders/${myId}`, { headers });
                if (res.ok) {
                    const backendOrders = await res.json();
                    const processedList: any[] = [];
                    const sellerIds = new Set<string>();

                    backendOrders.forEach((order: any) => {
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
                            processedList.push({
                                ...item,
                                orderId: order.id,
                                orderStatus: order.status,
                                sellerId: sId,
                                totalAmount: order.amount / 100, // Amount is stored in cents
                                imageUrl: item.imageUrl || "/buyer-dashboard/vegetables.avif"
                            });
                        });
                    });

                    let nameMap: Record<string, string> = {};
                    if (sellerIds.size > 0) {
                        const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${Array.from(sellerIds).join(',')}`, { headers });
                        if (nameRes.ok) nameMap = await nameRes.json();
                    }

                    setOrdersData(processedList.map(item => ({
                        ...item,
                        sellerName: nameMap[item.sellerId] || "AgroLink Seller"
                    })));
                }
            } catch (err) { console.error("Orders fetch failed:", err); }
            finally { setIsLoadingOrders(false); }

            // Fetch Bargains
            try {
                const res = await fetch(`${gatewayUrl}/api/bargains/buyer/${myId}`, { headers });
                if (res.ok) {
                    const bData = await res.json();
                    setBargainsData(bData);
                }
            } catch (err) { console.error("Bargains fetch failed:", err); }
            finally { setIsLoadingBargains(false); }
        };

        const syncDashboardData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083"}/api/chat/contacts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const ids: number[] = await res.json();
                    if (ids.length === 0) {
                        setIsLoadingChats(false);
                        return;
                    }

                    const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${ids.join(',')}`, { headers });
                    const fullNameMap = nameRes.ok ? await nameRes.json() : {};

                    const data = await Promise.all(ids.map(async (senderId) => {
                        const countRes = await fetch(`${process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083"}/api/chat/unread-count/${senderId}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        const count = countRes.ok ? await countRes.json() : 0;
                        return { id: senderId, name: fullNameMap[senderId] || `Farmer ${senderId}`, count };
                    }));

                    setNavUnread(data.reduce((acc, curr) => acc + curr.count, 0));
                    setLiveChats(data.slice(0, 3).map(chat => ({
                        id: chat.id.toString(),
                        farmer: chat.name,
                        avatar: "/buyer-dashboard/farmer-portrait.png",
                        lastMessage: "Open chat to view messages", // Handled globally via chat UI
                        unread: chat.count
                    })));
                }
            } catch (err) { console.error("Dashboard sync failed:", err); }
            finally { setIsLoadingChats(false); }
        };

        fetchUserDataAndStatus();
        fetchCartItems();
        fetchOrdersAndBargains();
        syncDashboardData();

        const interval = setInterval(() => {
            syncDashboardData();
            fetchCartItems();
            fetchOrdersAndBargains();
        }, 60000);
        return () => clearInterval(interval);
    }, [gatewayUrl]);

    if (isBanned) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-center">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 border border-red-100">
                    <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={48} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("buyerDashBannedTitle")}</h2>
                    <p className="text-gray-600 mb-6">{t("buyerDashBannedDesc")}</p>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={16} className="text-red-500 shrink-0"/> support@agrolink.com</div>
                        <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={16} className="text-red-500 shrink-0"/> +94 11 234 5678</div>
                    </div>
                    <Button onClick={() => { sessionStorage.clear(); window.location.href = "/login"; }} className="w-full h-auto py-3 bg-[#03230F] hover:bg-black text-[#EEC044]"><LogOut className="mr-2 h-4 w-4 shrink-0"/> {t("buyerDashLogout")}</Button>
                </div>
            </div>
        );
    }

    // Filter Logic for Orders
    const pendingStatuses = ["CREATED", "PAID", "COD_CONFIRMED", "PROCESSING"];
    const pendingOrders = ordersData.filter(o => pendingStatuses.includes(o.orderStatus));
    const completedOrders = ordersData.filter(o => o.orderStatus === "COMPLETED");
    const cancelledOrders = ordersData.filter(o => o.orderStatus === "CANCELLED");

    // Filter Logic for Bargains
    const pendingBargains = bargainsData.filter(b => b.status === "PENDING");
    const acceptedBargains = bargainsData.filter(b => b.status === "ACCEPTED");
    const rejectedBargains = bargainsData.filter(b => b.status === "REJECTED");

    // Helper component to render order cards
    const renderOrderCard = (order: any, idx: number, icon: any, badgeClass: string, badgeText: string) => (
        <div key={`${order.orderId}-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="h-16 w-16 rounded-lg overflow-hidden border flex-shrink-0 bg-gray-50">
                <img src={order.imageUrl} alt={order.productName} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{order.productName}</h3>
                    <span className="text-xs text-gray-400 font-mono">#{order.orderId}</span>
                </div>
                <p className="text-xs text-primary font-medium mt-0.5">{t("buyerDashSellerLabel")} {order.sellerName}</p>
                <div className="mt-2 flex items-center gap-3">
                    <p className="text-sm font-bold text-[#2d5016]">
                        LKR {(order.pricePerKg && order.quantity) ? (order.pricePerKg * order.quantity).toFixed(2) : order.totalAmount?.toFixed(2)}
                    </p>
                    {order.quantity && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{order.quantity} {t("purchaseKgUnit")}</span>}
                </div>
            </div>
            <Badge className={`flex items-center gap-1 shrink-0 ${badgeClass}`}>{icon} {badgeText}</Badge>
        </div>
    );

    // Helper component to render bargain cards
    const renderBargainCard = (b: any, badgeProps: any) => (
        <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg overflow-hidden border flex-shrink-0 bg-gray-50">
                <img src={b.vegetableImage || "/buyer-dashboard/vegetables.avif"} alt={b.vegetableName} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-gray-900 leading-tight truncate">{b.vegetableName}</p>
                <p className="text-xs text-gray-500 mb-1 truncate">{b.quantity} {t("purchaseKgUnit")} • {t("buyerDashOrigPrice")} LKR {b.originalPricePerKg}/{t("purchaseKgUnit")}</p>
                <p className="text-sm text-yellow-600 font-bold truncate">{t("buyerDashOfferedPrice")} LKR {b.suggestedPrice?.toFixed(2)}</p>
            </div>
            <Badge {...badgeProps} className={`shrink-0 ${badgeProps.className}`} />
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background text-gray-800 flex flex-col">
                <BuyerHeader />
                <div className="flex flex-1">
                    <DashboardNav unreadCount={navUnread} />
                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                        {/* Welcome Banner */}
                        <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#03230F] p-8 text-white shadow-lg">
                            <h1 className="mb-2 text-3xl font-bold tracking-tight">{t("buyerDashWelcome").replace("{name}", firstName)} 👋</h1>
                            <p className="text-lg text-gray-300">{t("buyerDashSubtitle2")}</p>
                        </div>

                        {/* Combined Announcement & Moderation Warning Bar */}
                        {showAnnouncements && announcements.length > 0 && (
                            <div className={`mb-6 rounded-xl px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md animate-in fade-in slide-in-from-top-4 duration-500 ${
                                announcements[0].type === "WARNING" ? "bg-red-500 text-white" : "bg-[#EEC044] text-[#03230F]"
                            }`}>
                                <div className="flex items-start sm:items-center gap-3">
                                    <div className={`${announcements[0].type === "WARNING" ? "bg-white/20" : "bg-[#03230F]"} p-2 rounded-lg shrink-0`}>
                                        {announcements[0].type === "WARNING" ? (
                                            <AlertCircle size={18} className="text-white" />
                                        ) : (
                                            <Megaphone size={18} className="text-[#EEC044]" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold leading-tight truncate">{announcements[0].title}</p>
                                        <p className="text-sm opacity-90 font-medium">{announcements[0].message}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                    {/* NEW BUTTON: DISMISS WARNING AS READ */}
                                    {announcements[0].type === "WARNING" && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleDismissWarning(announcements[0].id)}
                                            className="h-8 text-[10px] font-black uppercase tracking-widest border border-white/40 hover:bg-white/20 text-white"
                                        >
                                            <Check className="mr-1 h-3 w-3" /> {t("dissmiss") || "Mark as Read"}
                                        </Button>
                                    )}

                                    <button onClick={() => setShowAnnouncements(false)} className="hover:bg-black/10 p-1.5 rounded-full transition-colors shrink-0">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-8 grid gap-6 md:grid-cols-2">
                            {/* My Cart Card */}
                            <Card className="hover:shadow-md transition-shadow border-gray-200">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-bold text-[#03230F]">{t("buyerDashMyCart")}</CardTitle>
                                    <ShoppingCart className="h-5 w-5 text-[#EEC044] shrink-0" />
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isLoadingCart ? (
                                        <div className="h-24 flex items-center justify-center animate-pulse bg-gray-50 rounded-lg text-[#03230F] font-semibold">{t("authProcessing")}</div>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-black text-[#03230F] mb-4">{realCartItems.length} <span className="text-lg text-gray-500 font-medium">{t("buyerDashItemsWord")}</span></div>
                                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                                {realCartItems.slice(0, 4).map((item) => (
                                                    <div key={item.id} className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-[#EEC044]/30 shadow-sm">
                                                        <img src={item.imageUrl || "/placeholder.svg"} className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <Link href="/cart"><Button className="mt-5 w-full bg-[#EEC044] hover:bg-[#d4a017] text-[#03230F] font-bold rounded-xl h-auto py-3">{t("buyerDashViewCartCheckout")}</Button></Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Orders Section */}
                        <Card className="mb-8 border-none shadow-sm rounded-2xl">
                            <CardHeader className="bg-gray-50/50 border-b rounded-t-2xl">
                                <CardTitle className="flex items-center gap-2 font-bold text-gray-800"><Package className="h-5 w-5 text-yellow-500 shrink-0" /> {t("buyerDashMyOrdersTitle")}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Tabs defaultValue="pending" className="w-full">
                                    <TabsList className="flex flex-wrap w-full md:grid md:grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl h-auto">
                                        <TabsTrigger value="pending" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">{t("ordersTabPending")} ({pendingOrders.length})</TabsTrigger>
                                        <TabsTrigger value="completed" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">{t("ordersTabCompleted")} ({completedOrders.length})</TabsTrigger>
                                        <TabsTrigger value="cancelled" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">{t("ordersTabCancelled")}</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="pending" className="space-y-4 outline-none">
                                        {isLoadingOrders ? (
                                            <div className="py-10 text-center animate-pulse text-gray-400">{t("buyerDashFetchingOrders")}</div>
                                        ) : pendingOrders.length > 0 ? (
                                            pendingOrders.map((order, idx) => renderOrderCard(order, idx, <Clock className="mr-1.5 h-3.5 w-3.5 shrink-0" />, "bg-blue-50 text-blue-700 border-blue-200", t("ordersTabPending")))
                                        ) : (
                                            <div className="py-12 text-center text-gray-400"><Package className="h-12 w-12 mx-auto mb-3 opacity-20 shrink-0" /><p>{t("buyerDashNoPendingOrders")}</p></div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="completed" className="space-y-4 outline-none">
                                        {completedOrders.length > 0 ? (
                                            completedOrders.map((order, idx) => renderOrderCard(order, idx, <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 shrink-0" />, "bg-green-50 text-green-700 border-green-200", t("ordersTabCompleted")))
                                        ) : (
                                            <div className="py-12 text-center text-gray-400"><CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20 shrink-0" /><p>{t("buyerDashNoCompletedOrders")}</p></div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="cancelled" className="space-y-4 outline-none">
                                        {cancelledOrders.length > 0 ? (
                                            cancelledOrders.map((order, idx) => renderOrderCard(order, idx, <XCircle className="mr-1.5 h-3.5 w-3.5 shrink-0" />, "bg-red-50 text-red-700 border-red-200", t("ordersTabCancelled")))
                                        ) : (
                                            <div className="py-12 text-center text-gray-400"><XCircle className="h-12 w-12 mx-auto mb-3 opacity-20 shrink-0" /><p>{t("buyerDashNoCancelledOrders")}</p></div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Bargains Section */}
                            <Card className="border-none shadow-sm rounded-2xl h-fit">
                                <CardHeader className="bg-gray-50/50 border-b rounded-t-2xl">
                                    <CardTitle className="flex items-center gap-2 font-bold text-gray-800"><TrendingUp className="h-5 w-5 text-orange-500 shrink-0" /> {t("buyerDashBargainStatusTitle")}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <Tabs defaultValue="pending" className="w-full">
                                        <TabsList className="flex flex-wrap w-full md:grid md:grid-cols-3 mb-6 bg-gray-100 p-1 rounded-xl h-auto">
                                            <TabsTrigger value="pending" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">{t("ordersTabPending")}</TabsTrigger>
                                            <TabsTrigger value="accepted" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">{t("bargainStatusAccepted")}</TabsTrigger>
                                            <TabsTrigger value="rejected" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">{t("bargainStatusRejected")}</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="pending" className="space-y-3 outline-none">
                                            {isLoadingBargains ? (
                                                <div className="py-6 text-center animate-pulse text-gray-400">{t("authProcessing")}</div>
                                            ) : pendingBargains.length > 0 ? (
                                                pendingBargains.map((b) => renderBargainCard(b, { variant: "outline", children: t("ordersTabPending"), className: "text-blue-600 border-blue-200 bg-blue-50" }))
                                            ) : (
                                                <div className="py-8 text-center text-gray-400 text-sm">{t("buyerDashNoPendingBargains")}</div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="accepted" className="space-y-3 outline-none">
                                            {acceptedBargains.length > 0 ? (
                                                acceptedBargains.map((b) => renderBargainCard(b, { variant: "outline", children: t("bargainStatusAccepted"), className: "text-green-600 border-green-200 bg-green-50" }))
                                            ) : (
                                                <div className="py-8 text-center text-gray-400 text-sm">{t("buyerDashNoAcceptedBargains")}</div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="rejected" className="space-y-3 outline-none">
                                            {rejectedBargains.length > 0 ? (
                                                rejectedBargains.map((b) => renderBargainCard(b, { variant: "outline", children: t("bargainStatusRejected"), className: "text-red-600 border-red-200 bg-red-50" }))
                                            ) : (
                                                <div className="py-8 text-center text-gray-400 text-sm">{t("buyerDashNoRejectedBargains")}</div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>

                            {/* Message Center */}
                            <Card className="border-none shadow-sm rounded-2xl h-fit">
                                <CardHeader className="bg-gray-50/50 border-b rounded-t-2xl">
                                    <CardTitle className="flex items-center gap-2 font-bold text-gray-800"><MessageSquare className="h-5 w-5 text-yellow-500 shrink-0" /> {t("buyerDashRecentChatsTitle")}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-3">
                                    {isLoadingChats ? (
                                        <div className="py-4 text-center text-sm text-gray-400 animate-pulse">{t("buyerDashSyncingChats")}</div>
                                    ) : liveChats.length > 0 ? (
                                        liveChats.map((chat) => (
                                            <Link key={chat.id} href="/buyer/chat">
                                                <div className="flex items-center gap-4 p-3.5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                    <Avatar className="h-11 w-11 border-2 border-gray-100 shrink-0"><AvatarImage src={chat.avatar} /><AvatarFallback className="bg-[#2d5016] text-white">{chat.farmer[0]}</AvatarFallback></Avatar>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{chat.farmer}</p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage}</p>
                                                    </div>
                                                    {chat.unread > 0 && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm h-auto py-0.5">{chat.unread}</Badge>}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-sm text-gray-400 font-medium">{t("buyerDashNoChats")}</p>
                                    )}
                                    <Link href="/buyer/chat">
                                        <Button variant="ghost" className="w-full text-xs text-[#03230F] hover:text-[#EEC044] hover:bg-[#03230F] transition-colors mt-2 font-bold uppercase tracking-widest h-auto py-3">
                                            {t("buyerDashOpenChat")}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
                
                <Footer />
            </div>
        </ProtectedRoute>
    )
}