"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

interface OrderItem {
    id: string
    name: string
    quantity: number
    pricePerKg: number
    image: string
    sellerName: string
    orderDate: Date
    status: "completed" | "pending"
    totalPrice: number
}

export function OrderHistoryClient() {
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)

    const gatewayUrl = "http://localhost:8080"

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        // --- DIRECTLY ACCESS ID FROM SESSION STORAGE ---
        const userId = sessionStorage.getItem("id") 
        const token = sessionStorage.getItem("token")
        
        if (!userId) {
            console.error("User ID not found in session storage")
            setLoading(false)
            return
        }

        try {
            // 1. Fetch Orders from Order Service using the direct userId
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
                        // Collect seller ID (usually an ID from the backend)
                        const sId = item.sellerId || order.sellerId 
                        if (sId) sellerIds.add(sId)
                        
                        rawItemsList.push({
                            orderId: order.id,
                            itemData: item,
                            status: order.status === "COMPLETED" ? "completed" : "pending",
                            createdAt: order.createdAt,
                            amount: order.amount,
                            sellerId: sId
                        })
                    })
                })

                // 2. Fetch Seller Names from Identity Service using sellerIds collected
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

                // 3. Final mapping to the UI structure
                const finalOrders: OrderItem[] = rawItemsList.map((entry, index) => ({
                    id: `${entry.orderId}-${index}`,
                    name: entry.itemData.productName || entry.itemData.name || "Unknown Item",
                    quantity: entry.itemData.quantity || 1,
                    pricePerKg: entry.itemData.pricePerKg || 0,
                    image: entry.itemData.imageUrl || entry.itemData.image || "/placeholder.svg",
                    sellerName: sellerNameMap[entry.sellerId] || "AgroLink Seller",
                    orderDate: new Date(entry.createdAt),
                    status: entry.status,
                    totalPrice: (entry.amount / 100)
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
            
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
    )
}

function OrderList({ orders, loading }: { orders: OrderItem[], loading: boolean }) {
    if (loading) return <div className="text-center py-10 animate-pulse">Syncing with services...</div>
    
    if (orders.length === 0) return (
        <Card className="p-12 text-center border-dashed">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No orders found.</p>
        </Card>
    )

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Card key={order.id} className="p-6 border-l-4 border-l-primary/20">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border">
                             <img src={order.image} className="object-cover w-full h-full" alt={order.name} />
                        </div>
                        
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{order.name}</h3>
                                    <p className="text-sm font-semibold text-primary">Sold by {order.sellerName}</p>
                                </div>
                                <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                                    {order.status === "completed" ? "Completed" : "Pending"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                                <div><p className="text-xs text-muted-foreground">Qty</p><p className="font-bold">{order.quantity} kg</p></div>
                                <div><p className="text-xs text-muted-foreground">Rate</p><p className="font-bold">Rs. {order.pricePerKg}/kg</p></div>
                                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-bold">{format(order.orderDate, "MMM d, yyyy")}</p></div>
                                <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-[#2d5016]">Rs. {order.totalPrice.toFixed(2)}</p></div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}