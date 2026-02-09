"use client"

import { useEffect, useState } from "react"
import {
    Bell,
    ShoppingCart,
    Heart,
    Package,
    MessageSquare,
    TrendingUp,
    Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import ProtectedRoute from "@/components/protected-route"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BuyerHeader from "@/components/headers/BuyerHeader"

// Remaining Static Mock Data (Wishlist & Bargains)
const wishlistItems = [
    { id: 1, name: "Organic Beans", image: "/buyer-dashboard/green-beans.jpg" },
    { id: 2, name: "Bell Peppers", image: "/buyer-dashboard/colorful-bell-peppers.png" },
]

const bargains = {
    pending: [{ id: 1, product: "Organic Beans", image: "/buyer-dashboard/green-beans.jpg", offeredPrice: "LKR 800", quantity: "8 kg", status: "pending" }],
    approved: [{ id: 2, product: "Cabbage", image: "/buyer-dashboard/fresh-cabbage.jpg", offeredPrice: "LKR 400", quantity: "5 kg", status: "approved" }],
    rejected: [{ id: 3, product: "Potatoes", image: "/buyer-dashboard/fresh-potatoes.png", offeredPrice: "LKR 300", quantity: "10 kg", status: "rejected" }],
}

export default function BuyerDashboard() {
    const [firstName, setFirstName] = useState("User")
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

        const fetchUserName = async () => {
            try {
                const response = await fetch(`${gatewayUrl}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.fullName) setFirstName(data.fullName.split(" ")[0]);
                }
            } catch (err) { console.error("Name fetch failed:", err); }
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

        // --- UPDATED: Fetch and Transform Pending Orders ---
        const fetchPendingOrders = async () => {
            try {
                const res = await fetch(`${gatewayUrl}/api/buyer/orders/${myId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const backendOrders = await res.json();
                    const pendingList: any[] = [];
                    const sellerIds = new Set<string>();

                    // 1. Filter for PENDING and Parse Items
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

                    // 2. Fetch Seller Names
                    let nameMap: Record<string, string> = {};
                    if (sellerIds.size > 0) {
                        const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${Array.from(sellerIds).join(',')}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (nameRes.ok) nameMap = await nameRes.json();
                    }

                    // 3. Map final display data
                    setPendingOrders(pendingList.map(item => ({
                        ...item,
                        sellerName: nameMap[item.sellerId] || "AgroLink Seller"
                    })));
                }
            } catch (err) {
                console.error("Orders fetch failed:", err);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        const syncDashboardData = async () => {
            try {
                const res = await fetch(`http://localhost:8083/api/chat/contacts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const ids: number[] = await res.json();
                    if (ids.length === 0) {
                        setIsLoadingChats(false);
                        return;
                    }

                    const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${ids.join(',')}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const fullNameMap = nameRes.ok ? await nameRes.json() : {};

                    const data = await Promise.all(ids.map(async (senderId) => {
                        const countRes = await fetch(`http://localhost:8083/api/chat/unread-count/${senderId}`, {
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
                        lastMessage: "Open chat to view messages",
                        unread: chat.count
                    })));
                }
            } catch (err) { console.error("Dashboard sync failed:", err); }
            finally { setIsLoadingChats(false); }
        };

        fetchUserName();
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <BuyerHeader />
                <div className="flex">
                    <DashboardNav unreadCount={navUnread} />
                    <main className="flex-1 p-6 lg:p-8">
                        <div className="relative mb-8 overflow-hidden rounded-xl bg-[#03230F] p-8 text-white">
                            <h1 className="mb-2 text-3xl font-bold">Welcome back, {firstName} 👋</h1>
                            <p className="text-lg opacity-90">Manage your orders, bargains, and requests in one place</p>
                        </div>

                        <div className="mb-8 grid gap-6 md:grid-cols-2">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">My Cart</CardTitle>
                                    <ShoppingCart className="h-5 w-5 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    {isLoadingCart ? (
                                        <div className="h-24 flex items-center justify-center animate-pulse bg-gray-50 rounded-lg">Loading cart...</div>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold text-[#2d5016] mb-4">
                                                {realCartItems.length} {realCartItems.length === 1 ? 'item' : 'items'}
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {realCartItems.slice(0, 4).map((item) => (
                                                    <div key={item.id} className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border">
                                                        <img src={item.imageUrl || "/placeholder.svg"} alt={item.productName} className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <Link href="/cart"><Button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600">View Cart</Button></Link>
                                </CardContent>
                            </Card>

                            {/* <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">Wishlist</CardTitle>
                                    <Heart className="h-5 w-5 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-[#2d5016] mb-4">{wishlistItems.length} items</div>
                                    <div className="flex gap-2">
                                        {wishlistItems.map((item) => (
                                            <div key={item.id} className="h-12 w-12 rounded-lg overflow-hidden border">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="mt-4 w-full border-yellow-500 text-yellow-500">View Wishlist</Button>
                                </CardContent>
                            </Card> */}
                        </div>

                        {/* Orders Section */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-bold">
                                    <Package className="h-5 w-5 text-yellow-500" /> My Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="pending">
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                        <TabsTrigger value="pending">Pending Orders ({pendingOrders.length})</TabsTrigger>
                                        {/* <TabsTrigger value="history">History</TabsTrigger> */}
                                    </TabsList>
                                    
                                    <TabsContent value="pending" className="space-y-4">
                                        {isLoadingOrders ? (
                                            <div className="py-10 text-center animate-pulse text-gray-400">Fetching your orders...</div>
                                        ) : pendingOrders.length > 0 ? (
                                            pendingOrders.map((order, idx) => (
                                                <div key={`${order.orderId}-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-white hover:border-yellow-200 transition-colors">
                                                    <div className="h-16 w-16 rounded-lg overflow-hidden border flex-shrink-0">
                                                        <img 
                                                            src={order.imageUrl || "/buyer-dashboard/red-tomatoes.jpg"} 
                                                            alt={order.productName} 
                                                            className="h-full w-full object-cover" 
                                                        />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-semibold text-gray-900">{order.productName}</h3>
                                                            <span className="text-xs font-mono text-gray-400">#{order.orderId.toString().padStart(5, '0')}</span>
                                                        </div>
                                                        <p className="text-xs text-primary font-medium">Seller: {order.sellerName}</p>
                                                        <div className="mt-1 flex items-center gap-3">
                                                            <p className="text-sm font-bold text-[#2d5016]">LKR {(order.pricePerKg * order.quantity).toFixed(2)}</p>
                                                            <span className="text-xs text-gray-400">{order.quantity} kg</span>
                                                        </div>
                                                    </div>
                                                    <Badge className="w-fit bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        <Clock className="mr-1 h-3 w-3" /> Pending
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-500">No pending orders found.</p>
                                                <Link href="/VegetableList"><Button variant="link" className="text-yellow-600">Start Shopping</Button></Link>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="history">
                                        <div className="py-10 text-center">
                                            <p className="text-sm text-gray-400">Visit the full history page to see completed orders.</p>
                                            <Link href="/buyer/order-history">
                                                <Button variant="outline" className="mt-4">View All History</Button>
                                            </Link>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Bargains & Chats Widget */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-500" /> Bargain Status</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {bargains.pending.map((b) => (
                                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="flex-1 text-left">
                                                <p className="font-medium">{b.product}</p>
                                                <p className="text-sm text-yellow-600 font-bold">{b.offeredPrice}</p>
                                            </div>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-200">Pending</Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-yellow-500" /> Recent Chats</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {isLoadingChats ? (
                                        <div className="py-4 text-center text-sm text-gray-400 animate-pulse">Syncing conversations...</div>
                                    ) : liveChats.length > 0 ? (
                                        liveChats.map((chat) => (
                                            <Link key={chat.id} href="/buyer/chat">
                                                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={chat.avatar} />
                                                        <AvatarFallback>{chat.farmer[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 text-left min-w-0">
                                                        <p className="font-medium truncate">{chat.farmer}</p>
                                                        <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                                                    </div>
                                                    {chat.unread > 0 && <Badge className="bg-yellow-500 text-white">{chat.unread}</Badge>}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-sm text-gray-400">No active chats found</p>
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