"use client"

import { useEffect, useState } from "react" // Added React hooks
import "../../globals-buyer-dashboard.css"
import {
    Bell,
    ShoppingCart,
    Heart,
    Package,
    MessageSquare,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Leaf,
    Facebook,
    Instagram,
    Twitter,
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
        {
            id: 1,
            product: "Fresh Tomatoes",
            image: "/buyer-dashboard/red-tomatoes.jpg",
            farmer: "John Farmer",
            quantity: "10 kg",
            price: "LKR 1,500",
            status: "pending",
        },
        {
            id: 2,
            product: "Carrots",
            image: "/buyer-dashboard/orange-carrots.jpg",
            farmer: "Sarah Agriculture",
            quantity: "5 kg",
            price: "LKR 750",
            status: "pending",
        },
    ],
    completed: [
        {
            id: 3,
            product: "Leafy Greens",
            image: "/buyer-dashboard/fresh-lettuce.png",
            farmer: "Mike Produce",
            quantity: "3 kg",
            price: "LKR 450",
            status: "completed",
        },
    ],
    cancelled: [
        {
            id: 4,
            product: "Bell Peppers",
            image: "/buyer-dashboard/colorful-bell-peppers.png",
            farmer: "Lisa Farms",
            quantity: "2 kg",
            price: "LKR 600",
            status: "cancelled",
        },
    ],
}

const bargains = {
    pending: [
        {
            id: 1,
            product: "Organic Beans",
            image: "/buyer-dashboard/green-beans.jpg",
            offeredPrice: "LKR 800",
            quantity: "8 kg",
            status: "pending",
        },
    ],
    approved: [
        {
            id: 2,
            product: "Cabbage",
            image: "/buyer-dashboard/fresh-cabbage.jpg",
            offeredPrice: "LKR 400",
            quantity: "5 kg",
            status: "approved",
        },
    ],
    rejected: [
        {
            id: 3,
            product: "Potatoes",
            image: "/buyer-dashboard/fresh-potatoes.png",
            offeredPrice: "LKR 300",
            quantity: "10 kg",
            status: "rejected",
        },
    ],
}

const itemRequests = [
    {
        id: 1,
        farmer: "Emma Organics",
        farmerAvatar: "/buyer-dashboard/farmer-portrait.png",
        product: "Organic Spinach",
        productImage: "/buyer-dashboard/fresh-spinach.png",
    },
    {
        id: 2,
        farmer: "David Fresh",
        farmerAvatar: "/buyer-dashboard/farmer-portrait-male.jpg",
        product: "Cherry Tomatoes",
        productImage: "/buyer-dashboard/cherry-tomatoes.jpg",
    },
]

const recentChats = [
    {
        id: 1,
        farmer: "John Farmer",
        avatar: "/buyer-dashboard/farmer-portrait.png",
        lastMessage: "Your order is ready for pickup",
        unread: 2,
    },
    {
        id: 2,
        farmer: "Sarah Agriculture",
        avatar: "/buyer-dashboard/farmer-portrait-female.jpg",
        lastMessage: "Thank you for your purchase!",
        unread: 0,
    },
]

const notifications = [
    { id: 1, type: "success", message: "Your bargain for Cabbage was approved!" },
    { id: 2, type: "info", message: "Emma Organics responded to your item request" },
    { id: 3, type: "warning", message: "Your order #1234 is pending payment" },
]


export default function BuyerDashboard() {
    const [firstName, setFirstName] = useState("User")

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                // 1. Retrieve the token from sessionStorage
                const token = sessionStorage.getItem("token");

                if (!token) {
                    console.error("No authentication token found");
                    return;
                }

                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

                // 2. Updated fetch with Authorization Header
                const response = await fetch(`${baseUrl}/auth/me`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`, // Send the JWT
                        "Content-Type": "application/json"
                    }
                    // Note: credentials: "include" is removed as we aren't using cookies
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.fullName) {
                        const nameParts = data.fullName.split(" ")
                        setFirstName(nameParts[0])
                    }
                } else if (response.status === 401) {
                    console.error("Session expired or invalid token");
                }
            } catch (err) {
                console.error("Failed to fetch user name:", err)
            }
        }

        fetchUserName()
    }, [])

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {/* ... (Rest of your component remains exactly the same) ... */}
                <DashboardHeader />
                <div className="flex">
                    <DashboardNav />
                    <main className="flex-1 p-6 lg:p-8">
                        <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground">
                            <div className="relative z-10">
                                <h1 className="mb-2 text-3xl font-bold text-balance">
                                    Welcome back {firstName}👋
                                </h1>
                                <p className="text-lg text-primary-foreground/90 text-pretty">
                                    Manage your orders, bargains, and requests in one place
                                </p>
                                {/* ... rest of JSX */}
                            </div>
                        </div>
                        <div className="mb-8 grid gap-6 md:grid-cols-2">
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">My Cart</CardTitle>
                                    <ShoppingCart className="h-5 w-5 text-accent" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-primary mb-4">{cartItems.length} items</div>
                                    <div className="flex gap-2">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-accent/20"
                                            >
                                                <img
                                                    src={item.image || "/buyer-dashboard/placeholder.svg"}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Link href="/cart">
                                        <Button className="mt-4 w-full bg-accent hover:bg-accent/90 text-accent-foreground">View Cart</Button>
                                    </Link>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-semibold">Wishlist</CardTitle>
                                    <Heart className="h-5 w-5 text-accent" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-primary mb-4">{wishlistItems.length} items</div>
                                    <div className="flex gap-2">
                                        {wishlistItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-accent/20"
                                            >
                                                <img
                                                    src={item.image || "/buyer-dashboard/placeholder.svg"}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="mt-4 w-full border-accent text-accent hover:bg-accent/10 bg-transparent"
                                    >
                                        View Wishlist
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Orders Section */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-accent" />
                                My Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="pending">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                                </TabsList>

                                <TabsContent value="pending" className="space-y-4">
                                    {orders.pending.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <img
                                                src={order.image || "/buyer-dashboard/placeholder.svg"}
                                                alt={order.product}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-card-foreground">{order.product}</h3>
                                                <p className="text-sm text-muted-foreground">{order.farmer}</p>
                                                <div className="mt-1 flex items-center gap-3 text-sm">
                                                    <span className="text-muted-foreground">Qty: {order.quantity}</span>
                                                    <span className="font-semibold text-primary">{order.price}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-pending/10 text-pending border-pending/20">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Pending
                                            </Badge>
                                        </div>
                                    ))}
                                </TabsContent>

                                <TabsContent value="completed" className="space-y-4">
                                    {orders.completed.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <img
                                                src={order.image || "/buyer-dashboard/placeholder.svg"}
                                                alt={order.product}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-card-foreground">{order.product}</h3>
                                                <p className="text-sm text-muted-foreground">{order.farmer}</p>
                                                <div className="mt-1 flex items-center gap-3 text-sm">
                                                    <span className="text-muted-foreground">Qty: {order.quantity}</span>
                                                    <span className="font-semibold text-primary">{order.price}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-success/10 text-success border-success/20">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Completed
                                            </Badge>
                                        </div>
                                    ))}
                                </TabsContent>

                                <TabsContent value="cancelled" className="space-y-4">
                                    {orders.cancelled.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <img
                                                src={order.image || "/placeholder.svg"}
                                                alt={order.product}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-card-foreground">{order.product}</h3>
                                                <p className="text-sm text-muted-foreground">{order.farmer}</p>
                                                <div className="mt-1 flex items-center gap-3 text-sm">
                                                    <span className="text-muted-foreground">Qty: {order.quantity}</span>
                                                    <span className="font-semibold text-primary">{order.price}</span>
                                                </div>
                                            </div>
                                            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                                                <XCircle className="mr-1 h-3 w-3" />
                                                Cancelled
                                            </Badge>
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Bargain Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-accent" />
                                    Bargain Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">Pending</h3>
                                    <div className="space-y-3">
                                        {bargains.pending.map((bargain) => (
                                            <div key={bargain.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                                <img
                                                    src={bargain.image || "/buyer-dashboard/placeholder.svg"}
                                                    alt={bargain.product}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-card-foreground">{bargain.product}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {bargain.quantity}</p>
                                                    <p className="text-sm font-semibold text-accent">{bargain.offeredPrice}</p>
                                                </div>
                                                <Badge variant="outline" className="border-pending text-pending">
                                                    Pending
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">Approved</h3>
                                    <div className="space-y-3">
                                        {bargains.approved.map((bargain) => (
                                            <div key={bargain.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                                <img
                                                    src={bargain.image || "/buyer-dashboard/placeholder.svg"}
                                                    alt={bargain.product}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-card-foreground">{bargain.product}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {bargain.quantity}</p>
                                                    <p className="text-sm font-semibold text-accent">{bargain.offeredPrice}</p>
                                                </div>
                                                <Badge variant="outline" className="border-success text-success">
                                                    Approved
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">Rejected</h3>
                                    <div className="space-y-3">
                                        {bargains.rejected.map((bargain) => (
                                            <div key={bargain.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                                <img
                                                    src={bargain.image || "/buyer-dashboard/placeholder.svg"}
                                                    alt={bargain.product}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-card-foreground">{bargain.product}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {bargain.quantity}</p>
                                                    <p className="text-sm font-semibold text-accent">{bargain.offeredPrice}</p>
                                                </div>
                                                <Badge variant="outline" className="border-destructive text-destructive">
                                                    Rejected
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Item Request Responses */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-accent" />
                                        Item Request Responses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {itemRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={request.farmerAvatar || "/buyer-dashboard/placeholder.svg"} />
                                                <AvatarFallback>{request.farmer[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-card-foreground">{request.farmer}</p>
                                                <p className="text-sm text-muted-foreground truncate">{request.product}</p>
                                            </div>
                                            <img
                                                src={request.productImage || "/buyer-dashboard/placeholder.svg"}
                                                alt={request.product}
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Notifications */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-accent" />
                                        Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                            <div
                                                className={`mt-0.5 h-2 w-2 rounded-full ${
                                                    notification.type === "success"
                                                        ? "bg-success"
                                                        : notification.type === "warning"
                                                            ? "bg-warning"
                                                            : "bg-primary"
                                                }`}
                                            />
                                            <p className="text-sm text-card-foreground flex-1">{notification.message}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Chat Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-accent" />
                                        Recent Chats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {recentChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={chat.avatar || "/buyer-dashboard/placeholder.svg"} />
                                                <AvatarFallback>{chat.farmer[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-card-foreground">{chat.farmer}</p>
                                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                            </div>
                                            {chat.unread > 0 && <Badge className="bg-accent text-accent-foreground">{chat.unread}</Badge>}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    </main>
                    
                </div>
                <footer />
            </div>
        </ProtectedRoute>
    )
}