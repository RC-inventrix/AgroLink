"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock, KeyRound, Hash } from "lucide-react" // Added Hash icon
import { format } from "date-fns"
import BuyerHeader from "./headers/BuyerHeader"

interface OrderItem {
    id: string
    displayOrderId: string | number; // Added field for the actual DB ID
    name: string
    quantity: number
    pricePerKg: number
    image: string
    sellerName: string
    orderDate: Date
    status: "completed" | "pending"
    totalPrice: number
    otp?: string 
}

export function OrderHistoryClient() {
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)

    const gatewayUrl = "http://localhost:8080"

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        const userId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")

        if (!userId) {
            console.error("User ID not found in session storage")
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${gatewayUrl}/api/buyer/orders/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                const backendOrders = await res.json()
                const rawItemsList: any[] = []
                const sellerIds = new Set<string>()

                backendOrders.forEach((order: any) => {
                    let parsedItems = []
                    try {
                        if (order.itemsJson && order.itemsJson.startsWith("[")) {
                            parsedItems = JSON.parse(order.itemsJson)
                        } else {
                            parsedItems = [{
                                productName: "Order Items",
                                quantity: 1,
                                pricePerKg: order.amount / 100
                            }]
                        }
                    } catch (e) { console.error("JSON Parse error", e) }

                    parsedItems.forEach((item: any) => {
                        const sId = item.sellerId || order.sellerId
                        if (sId) sellerIds.add(sId)

                        rawItemsList.push({
                            orderId: order.id, // This is the numerical ID from the database
                            itemData: item,
                            status: order.status === "COMPLETED" ? "completed" : "pending",
                            createdAt: order.createdAt,
                            amount: order.amount,
                            sellerId: sId,
                            otp: order.otp 
                        })
                    })
                })

                let sellerNameMap: Record<string, string> = {}
                if (sellerIds.size > 0) {
                    try {
                        const idsParam = Array.from(sellerIds).join(',')
                        const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${idsParam}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        })
                        if (nameRes.ok) {
                            sellerNameMap = await nameRes.json()
                        }
                    } catch (err) { console.error("Identity service fetch failed", err) }
                }

                // Sorting by date descending
                const sortedRawList = rawItemsList.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                const finalOrders: OrderItem[] = sortedRawList.map((entry, index) => ({
                    id: `${entry.orderId}-${index}`,
                    displayOrderId: entry.orderId, // Mapping the actual Order ID
                    name: entry.itemData.productName || entry.itemData.name || "Unknown Item",
                    quantity: entry.itemData.quantity || 1,
                    pricePerKg: entry.itemData.pricePerKg || 0,
                    image: entry.itemData.imageUrl || entry.itemData.image || "/placeholder.svg",
                    sellerName: sellerNameMap[entry.sellerId] || "AgroLink Seller",
                    orderDate: new Date(entry.createdAt),
                    status: entry.status,
                    totalPrice: (entry.amount / 100),
                    otp: entry.otp 
                }))

                setOrders(finalOrders)
            }
        } catch (error) {
            console.error("Order fetch failed", error)
        } finally {
            setLoading(false)
        }
    }

    const completedOrders = orders.filter((o) => o.status === "completed")
    const pendingOrders = orders.filter((o) => o.status === "pending")

    return (
        <div>
            <BuyerHeader />
            <div className="flex">
                <div className="p-8 w-full">
                    <h1 className="text-3xl font-bold tracking-tight mb-6 text-[#03230F]">Order History</h1>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="bg-secondary">
                            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                            <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="all"><OrderList orders={orders} loading={loading} /></TabsContent>
                            <TabsContent value="completed"><OrderList orders={completedOrders} loading={loading} /></TabsContent>
                            <TabsContent value="pending"><OrderList orders={pendingOrders} loading={loading} /></TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function OrderList({ orders, loading }: { orders: OrderItem[], loading: boolean }) {
    if (loading) return <div className="text-center py-10 animate-pulse text-gray-400">Syncing with AgroLink services...</div>

    if (orders.length === 0) return (
        <Card className="p-12 text-center border-dashed">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No orders found.</p>
        </Card>
    )

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Card key={order.id} className="p-6 border-l-4 border-l-[#EEC044]">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border">
                            <img src={order.image} className="object-cover w-full h-full" alt={order.name} />
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* --- DISPLAY ORDER ID HERE --- */}
                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1">
                                        <Hash size={10} /> ORDER #{order.displayOrderId}
                                    </p>
                                    <h3 className="font-bold text-lg text-[#03230F]">{order.name}</h3>
                                    <p className="text-sm font-semibold text-[#2d5016]">Sold by {order.sellerName}</p>
                                </div>
                                <Badge variant={order.status === "completed" ? "default" : "secondary"} className={order.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}>
                                    {order.status === "completed" ? "Completed" : "Pending"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                <div><p className="text-xs text-muted-foreground">Qty</p><p className="font-bold">{order.quantity} kg</p></div>
                                <div><p className="text-xs text-muted-foreground">Rate</p><p className="font-bold">Rs. {order.pricePerKg}/kg</p></div>
                                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-bold">{format(order.orderDate, "MMM d, yyyy")}</p></div>
                                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-[#2d5016]">Rs. {order.totalPrice.toFixed(2)}</p></div>
                            </div>

                            {order.status === "pending" && order.otp && (
                                <div className="mt-6 p-4 bg-green-50 border-2 border-dashed border-[#03230F]/10 rounded-2xl flex justify-between items-center animate-in slide-in-from-top duration-300">
                                    <div>
                                        <p className="flex items-center gap-2 text-[10px] font-black uppercase text-[#03230F]">
                                            <KeyRound className="w-3 h-3 text-[#EEC044]" /> Delivery Handover OTP
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium">Provide this code to the seller to confirm delivery</p>
                                    </div>
                                    <div className="text-2xl font-black text-[#03230F] tracking-[0.3em] bg-white px-4 py-1 rounded-lg border shadow-sm">
                                        {order.otp}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}