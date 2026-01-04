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

// ... (Keep your Static Mock Data: cartItems, wishlistItems, orders, bargains, itemRequests, notifications as they were) ...
// (I am omitting the mock data here to save space, keep it exactly as you had it)

const cartItems = [
    { id: 1, name: "Fresh Tomatoes", image: "/buyer-dashboard/red-tomatoes.jpg", quantity: 5 },
    { id: 2, name: "Carrots", image: "/buyer-dashboard/orange-carrots.jpg", quantity: 3 },
    { id: 3, name: "Leafy Greens", image: "/buyer-dashboard/fresh-lettuce.png", quantity: 2 },
]

const wishlistItems = [
    { id: 1, name: "Organic Beans", image: "/buyer-dashboard/green-beans.jpg" },
    { id: 2, name: "Bell Peppers", image: "/buyer-dashboard/colorful-bell-peppers.png" },
]

const orders = {
    pending: [
        { id: 1, product: "Fresh Tomatoes", image: "/buyer-dashboard/red-tomatoes.jpg", farmer: "John Farmer", quantity: "10 kg", price: "LKR 1,500", status: "pending" },
        { id: 2, product: "Carrots", image: "/buyer-dashboard/orange-carrots.jpg", farmer: "Sarah Agriculture", quantity: "5 kg", price: "LKR 750", status: "pending" },
    ],
    completed: [
        { id: 3, product: "Leafy Greens", image: "/buyer-dashboard/fresh-lettuce.png", farmer: "Mike Produce", quantity: "3 kg", price: "LKR 450", status: "completed" },
    ],
    cancelled: [
        { id: 4, product: "Bell Peppers", image: "/buyer-dashboard/colorful-bell-peppers.png", farmer: "Lisa Farms", quantity: "2 kg", price: "LKR 600", status: "cancelled" },
    ],
}

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

    // --- FIX: Point EVERYTHING to the API Gateway (Port 8080) ---
    const authBaseUrl = "http://localhost:8080"
    const chatBaseUrl = "http://localhost:8080"
    // ------------------------------------------------------------

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token) return;

        // 1. Fetch User Name
        const fetchUserName = async () => {
            try {
                // Gateway forwards "/auth/me" -> Identity Service
                const response = await fetch(`${authBaseUrl}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.fullName) setFirstName(data.fullName.split(" ")[0]);
                }
            } catch (err) { console.error("Name fetch failed:", err); }
        };

        // 2. Fetch Unread Count & Recent Chats
        const syncDashboardData = async () => {
            try {
                // Gateway forwards "/api/chat/..." -> Chat Service
                const res = await fetch(`${chatBaseUrl}/api/chat/contacts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const ids: number[] = await res.json();
                    if (ids.length === 0) {
                        setIsLoadingChats(false);
                        return;
                    }

                    // Get names from Identity Service
                    const nameRes = await fetch(`${authBaseUrl}/auth/fullnames?ids=${ids.join(',')}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const fullNameMap = nameRes.ok ? await nameRes.json() : {};

                    // Get counts per sender
                    const data = await Promise.all(ids.map(async (senderId) => {
                        const countRes = await fetch(`${chatBaseUrl}/api/chat/unread-count/${senderId}`, {
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
        syncDashboardData();
        const interval = setInterval(syncDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                <DashboardHeader />
                <div className="flex">
                    <DashboardNav unreadCount={navUnread} />
                    <main className="flex-1 p-6 lg:p-8">
                        {/* Welcome Banner */}
                        <div className="relative mb-8 overflow-hidden rounded-xl bg-[#2d5016] p-8 text-white">
                            <h1 className="mb-2 text-3xl font-bold">Welcome back, {firstName} 👋</h1>
                            <p className="text-lg opacity-90">Manage your orders, bargains, and requests in one place</p>
                        </div>

                        {/* Top Stats: Cart & Wishlist */}
                        <div className="mb-8 grid gap-6 md:grid-cols-2">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">My Cart</CardTitle>
                                    <ShoppingCart className="h-5 w-5 text-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-[#2d5016] mb-4">{cartItems.length} items</div>
                                    <div className="flex gap-2">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="h-12 w-12 rounded-lg overflow-hidden border">
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <Link href="/cart"><Button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600">View Cart</Button></Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
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
                                    <Button variant="outline" className="mt-4 w-full border-yellow-500 text-yellow-500 hover:bg-yellow-50">View Wishlist</Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Orders Section */}
                        <Card className="mb-8">
                            <CardHeader><CardTitle className="flex items-center gap-2 font-bold"><Package className="h-5 w-5 text-yellow-500" /> My Orders</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="pending">
                                    <TabsList className="grid w-full grid-cols-3 mb-6">
                                        <TabsTrigger value="pending">Pending</TabsTrigger>
                                        <TabsTrigger value="completed">Completed</TabsTrigger>
                                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="pending" className="space-y-4">
                                        {orders.pending.map((order) => (
                                            <div key={order.id} className="flex items-center gap-4 p-4 rounded-lg border bg-white">
                                                <img src={order.image} alt={order.product} className="h-16 w-16 rounded-lg object-cover" />
                                                <div className="flex-1 text-left">
                                                    <h3 className="font-semibold">{order.product}</h3>
                                                    <p className="text-xs text-gray-500">{order.farmer}</p>
                                                    <p className="text-sm font-bold text-[#2d5016]">{order.price}</p>
                                                </div>
                                                <Badge className="bg-yellow-100 text-yellow-600 border-none"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
                                            </div>
                                        ))}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Bargain Status */}
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

                            {/* Recent Chats Live Widget */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-yellow-500" /> Recent Chats</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {isLoadingChats ? (
                                        <div className="py-4 text-center text-sm text-gray-400 animate-pulse">Syncing conversations...</div>
                                    ) : liveChats.length > 0 ? (
                                        liveChats.map((chat) => (
                                            <Link key={chat.id} href="/chat">
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
                                    <Link href="/chat"><Button variant="ghost" className="w-full text-xs text-[#2d5016] font-bold">Open Message Center</Button></Link>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}