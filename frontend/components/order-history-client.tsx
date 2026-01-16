"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

// Interface for what we want to display (Flattened Item)
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

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        // 1. Get both ID and Token for the current session to ensure identity
        const userId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")

        if (!userId || !token) {
            console.error("User not authenticated.")
            setLoading(false)
            return
        }

        try {
            // 2. Add Authorization header to the request to prevent 403 Forbidden
            const res = await fetch(`http://localhost:8080/api/buyer/orders/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (res.ok) {
                const backendOrders = await res.json()
                const allItems: OrderItem[] = []

                backendOrders.forEach((order: any) => {
                    // 3. Security Check: Only process items if they belong to this user
                    if (order.userId?.toString() !== userId.toString()) return;

                    // 4. Determine UI Status
                    const uiStatus = order.status === "COMPLETED" ? "completed" : "pending"

                    // 5. Parse the Items JSON safely
                    let parsedItems = []
                    try {
                        if (order.itemsJson && order.itemsJson.startsWith("[")) {
                            parsedItems = JSON.parse(order.itemsJson)
                        } else {
                            parsedItems = [{ productName: "Order Items", quantity: 1, pricePerKg: order.amount / 100 }]
                        }
                    } catch (e) {
                        console.error("Failed to parse items for order", order.id)
                    }

                    // 6. Flatten to individual items for the history view
                    parsedItems.forEach((item: any, index: number) => {
                        allItems.push({
                            id: `${order.id}-${index}`,
                            name: item.productName || item.name || "Unknown Item",
                            quantity: item.quantity || 1,
                            pricePerKg: item.pricePerKg || 0,
                            image: item.imageUrl || item.image || "/placeholder.svg",
                            sellerName: item.sellerName || "AgroLink Seller",
                            orderDate: new Date(order.createdAt),
                            status: uiStatus,
                            totalPrice: (order.amount / 100)
                        })
                    })
                })

                setOrders(allItems)
            } else if (res.status === 403) {
                console.error("Access forbidden: Invalid token.")
            }
        } catch (error) {
            console.error("Failed to fetch order history", error)
        } finally {
            setLoading(false)
        }
    }

    const completedOrders = orders.filter((order) => order.status === "completed")
    const pendingOrders = orders.filter((order) => order.status === "pending")

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-[#03230F]">Order History</h1>
                <p className="text-muted-foreground">View your vegetable orders and track their delivery status</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary">
                    <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="all" className="m-0">
                        <OrderList orders={orders} loading={loading} />
                    </TabsContent>
                    <TabsContent value="completed" className="m-0">
                        <OrderList orders={completedOrders} loading={loading} />
                    </TabsContent>
                    <TabsContent value="pending" className="m-0">
                        <OrderList orders={pendingOrders} loading={loading} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

function OrderList({ orders, loading }: { orders: OrderItem[], loading: boolean }) {
    if (loading) return <div className="text-center py-10 text-muted-foreground">Loading your orders...</div>
    
    if (orders.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">No orders found</h3>
                <p className="text-muted-foreground text-sm mt-2">
                    You haven&apos;t placed any orders in this category yet.
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <Card key={order.id} className="p-6 overflow-hidden border-l-4 border-l-[#EEC044] transition-shadow hover:shadow-md">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            <img
                                src={order.image}
                                alt={order.name}
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{order.name}</h3>
                                    <p className="text-sm text-muted-foreground">Sold by {order.sellerName}</p>
                                </div>
                                <Badge
                                    variant={order.status === "completed" ? "default" : "secondary"}
                                    className={
                                        order.status === "completed"
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }
                                >
                                    {order.status === "completed" ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Completed
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                                    <p className="font-medium">{order.quantity} kg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                                    <p className="font-medium">Rs. {order.pricePerKg}/kg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Date Placed</p>
                                    <p className="font-medium">
                                        {format(order.orderDate, "MMM d, yyyy")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Order Total</p>
                                    <p className="font-bold text-[#03230F]">
                                        Rs. {(order.quantity * order.pricePerKg).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}