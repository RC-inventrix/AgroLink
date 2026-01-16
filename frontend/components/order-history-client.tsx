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

    // --- 1. Combined Effect: Update Status & Fetch Data ---
    const gatewayUrl = "http://localhost:8080"

    useEffect(() => {
        const initializeOrderHistory = async () => {
            const userId = sessionStorage.getItem("id");
            const token = sessionStorage.getItem("token");

            if (!userId || !token) {
                console.error("User not authenticated.");
                setLoading(false);
                return;
            }

            // Step A: Mark accepted orders as seen in the database permanently
            // This calls the PUT endpoint in your BuyerOrderController
            try {
                await fetch(`http://localhost:8080/api/buyer/orders/mark-seen/${userId}`, {
                    method: "PUT",
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json" 
                    }
                });
            } catch (err) {
                console.error("Failed to sync 'seen' status with backend:", err);
            }

            // Step B: Fetch the actual order records
            await fetchOrders(userId, token);
        };

        initializeOrderHistory();
    }, []);

    const fetchOrders = async (userId: string, token: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/buyer/orders/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            
            if (res.ok) {
                const backendOrders = await res.json()
                const rawItemsList: any[] = []
                const sellerIds = new Set<string>()

                backendOrders.forEach((order: any) => {
                    // Security Check: Only process items if they belong to this user
                    if (order.userId?.toString() !== userId.toString()) return;

                    const uiStatus = order.status === "COMPLETED" ? "completed" : "pending"

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
                    } catch (e) {
                        console.error("Failed to parse items for order", order.id)
                    }

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

                // --- 2. SORTING: Descending Order (Newest First) ---
                const sortedItems = allItems.sort((a, b) => 
                    b.orderDate.getTime() - a.orderDate.getTime()
                );

                setOrders(sortedItems)
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
                <Card key={order.id} className="p-6 overflow-hidden border-l-4 border-l-[#EEC044] transition-shadow hover:shadow-md">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            <img src={order.image} alt={order.name} className="object-cover w-full h-full" />
                        </div>
                        
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{order.name}</h3>
                                    <p className="text-sm font-semibold text-primary">Sold by {order.sellerName}</p>
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
                                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completed</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                                    )}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
                                <div><p className="text-xs text-muted-foreground mb-1">Quantity</p><p className="font-medium">{order.quantity} kg</p></div>
                                <div><p className="text-xs text-muted-foreground mb-1">Unit Price</p><p className="font-medium">Rs. {order.pricePerKg}/kg</p></div>
                                <div><p className="text-xs text-muted-foreground mb-1">Date Placed</p><p className="font-medium">{format(order.orderDate, "MMM d, yyyy")}</p></div>
                                <div><p className="text-xs text-muted-foreground mb-1">Order Total</p><p className="font-bold text-[#03230F]">Rs. {(order.quantity * order.pricePerKg).toFixed(2)}</p></div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}