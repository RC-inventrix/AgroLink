"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock, KeyRound, Hash, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import BuyerHeader from "./headers/BuyerHeader"

interface OrderItem {
    id: string
    displayOrderId: string | number; 
    name: string
    quantity: number
    pricePerKg: number
    image: string
    sellerName: string
    orderDate: Date
    status: "completed" | "pending" | "cancelled"
    totalPrice: number
    otp?: string 
}

// --- NEW COMPONENT: FETCHES REASON SEPARATELY ---
function CancelledReasonBlock({ orderId }: { orderId: string | number }) {
    const [reason, setReason] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReason = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const res = await fetch(`http://localhost:8080/api/buyer/orders/cancellation-detail/${orderId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReason(data.reason);
                }
            } catch (err) {
                console.error("Failed to fetch cancellation reason", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReason();
    }, [orderId]);

    if (loading) return <div className="mt-4 h-10 w-full animate-pulse bg-red-50 rounded-xl" />;
    if (!reason) return null;

    return (
        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl animate-in fade-in zoom-in-95 duration-300">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 mb-1">
                <AlertCircle size={12} /> Reason for Cancellation
            </p>
            <p className="text-sm text-gray-700 italic font-medium">
                "{reason}"
            </p>
        </div>
    );
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
        if (!userId) { setLoading(false); return; }

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
                            parsedItems = [{ productName: "Order Items", quantity: 1, pricePerKg: order.amount / 100 }]
                        }
                    } catch (e) { console.error("JSON Parse error", e) }

                    parsedItems.forEach((item: any) => {
                        const sId = item.sellerId || order.sellerId
                        if (sId) sellerIds.add(sId)
                        rawItemsList.push({
                            orderId: order.id,
                            itemData: item,
                            status: order.status === "COMPLETED" ? "completed" : 
                                    order.status === "CANCELLED" ? "cancelled" : "pending",
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
                        if (nameRes.ok) sellerNameMap = await nameRes.json()
                    } catch (err) {}
                }

                const finalOrders: OrderItem[] = rawItemsList
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((entry, index) => ({
                        id: `${entry.orderId}-${index}`,
                        displayOrderId: entry.orderId,
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
    const cancelledOrders = orders.filter((o) => o.status === "cancelled")

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <BuyerHeader />
            <div className="p-8 w-full max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-6 text-[#03230F]">Order History</h1>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-gray-100 p-1 rounded-xl mb-8">
                        <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                        <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
                    </TabsList>
                    <div className="mt-2">
                        <TabsContent value="all"><OrderList orders={orders} loading={loading} /></TabsContent>
                        <TabsContent value="completed"><OrderList orders={completedOrders} loading={loading} /></TabsContent>
                        <TabsContent value="pending"><OrderList orders={pendingOrders} loading={loading} /></TabsContent>
                        <TabsContent value="cancelled"><OrderList orders={cancelledOrders} loading={loading} /></TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

function OrderList({ orders, loading }: { orders: OrderItem[], loading: boolean }) {
    if (loading) return <div className="text-center py-10 animate-pulse text-gray-400 font-medium">Syncing...</div>
    if (orders.length === 0) return (
        <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No orders found.</p>
        </Card>
    )

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Card 
                    key={order.id} 
                    className={`p-6 border-l-4 transition-all hover:shadow-md ${
                        order.status === 'cancelled' ? 'border-l-red-500 bg-red-50/10' : 'border-l-[#EEC044] bg-white'
                    }`}
                >
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className={`relative h-24 w-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border ${order.status === 'cancelled' ? 'grayscale opacity-60' : ''}`}>
                            <img src={order.image} className="object-cover w-full h-full" alt={order.name} />
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1">
                                        <Hash size={10} /> ORDER #{order.displayOrderId}
                                    </p>
                                    <h3 className={`font-bold text-lg ${order.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-[#03230F]'}`}>
                                        {order.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-[#2d5016]">Sold by {order.sellerName}</p>
                                </div>
                                <Badge className={`font-bold px-3 py-1 rounded-full ${
                                    order.status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-100" : 
                                    order.status === "cancelled" ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                }`}>
                                    {order.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                                <div><p className="text-xs text-muted-foreground font-medium">Qty</p><p className="font-bold">{order.quantity} kg</p></div>
                                <div><p className="text-xs text-muted-foreground font-medium">Rate</p><p className="font-bold">Rs. {order.pricePerKg}/kg</p></div>
                                <div><p className="text-xs text-muted-foreground font-medium">Date</p><p className="font-bold">{format(order.orderDate, "MMM d, yyyy")}</p></div>
                                <div><p className="text-xs text-muted-foreground font-medium">Total Price</p><p className="font-bold text-[#2d5016]">Rs. {order.totalPrice.toFixed(2)}</p></div>
                            </div>

                            {/* --- INTEGRATED REASON BLOCK: Only for Cancelled Status --- */}
                            {order.status === "cancelled" && (
                                <CancelledReasonBlock orderId={order.displayOrderId} />
                            )}

                            {order.status === "pending" && order.otp && (
                                <div className="mt-6 p-4 bg-green-50 border-2 border-dashed border-[#03230F]/10 rounded-2xl flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <p className="flex items-center gap-2 text-[10px] font-black uppercase text-[#03230F]">
                                            <KeyRound className="w-3 h-3 text-[#EEC044]" /> Delivery OTP
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium">Handover code for seller</p>
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