"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"
import { toast } from "sonner"

interface OrdersListProps {
    initialOrders: any[]
    onOrderUpdated: () => void
}

export function OrdersList({ initialOrders, onOrderUpdated }: OrdersListProps) {
    const [activeTab, setActiveTab] = useState<"pending" | "processing" | "completed">("pending")
    const [isUpdating, setIsUpdating] = useState(false)
    
    // --- SAFE CLIENT-SIDE STATE FOR SELLER ID ---
    const [sellerId, setSellerId] = useState<string | null>(null)

    // Ensure sessionStorage is accessed only on the client side
    useEffect(() => {
        const id = sessionStorage.getItem("id")
        setSellerId(id)
    }, [])

    // --- CALCULATE TAB COUNTS ---
    // We use useMemo to recalculate counts only when initialOrders or sellerId changes
    const counts = useMemo(() => {
        if (!sellerId) return { pending: 0, processing: 0, completed: 0 };

        const myOrders = initialOrders.filter(
            (order) => order.sellerId?.toString() === sellerId?.toString()
        );

        return {
            pending: myOrders.filter((o) => 
                ["PAID", "COD_CONFIRMED", "CREATED"].includes(o.status?.toUpperCase())
            ).length,
            processing: myOrders.filter((o) => o.status?.toUpperCase() === "PROCESSING").length,
            completed: myOrders.filter((o) => o.status?.toUpperCase() === "COMPLETED").length,
        };
    }, [initialOrders, sellerId]);

    // --- FILTERED ORDERS FOR DISPLAY ---
    const filteredOrders = useMemo(() => {
        if (!sellerId) return [];

        return initialOrders.filter((order) => {
            // 1. Check if the order belongs to this seller
            const isMyOrder = order.sellerId?.toString() === sellerId?.toString()
            if (!isMyOrder) return false

            // 2. Filter by status for the active tab
            const status = order.status?.toUpperCase()
            if (activeTab === "pending") {
                return ["PAID", "COD_CONFIRMED", "CREATED"].includes(status)
            }
            if (activeTab === "processing") {
                return status === "PROCESSING"
            }
            if (activeTab === "completed") {
                return status === "COMPLETED"
            }
            return false
        })
    }, [initialOrders, sellerId, activeTab]);

    const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
        setIsUpdating(true)
        const token = sessionStorage.getItem("token");
        
        // Determine the next status based on current status
        let nextStatus = "PROCESSING"
        if (currentStatus === "PROCESSING") nextStatus = "COMPLETED"

        try {
            const response = await fetch(`http://localhost:8080/api/seller/orders/${orderId}/status?status=${nextStatus}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Added auth header for 403 prevention
                }
            })

            if (response.ok) {
                toast.success(`Order marked as ${nextStatus.toLowerCase()}`)
                onOrderUpdated() // Refresh the list from the parent
            } else {
                toast.error("Failed to update order status")
            }
        } catch (error) {
            console.error("Update Error:", error)
            toast.error("Server error. Please check if the backend is running.")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Tab Navigation with Dynamic Counts */}
            <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto">
                <Button 
                    variant={activeTab === "pending" ? "default" : "outline"} 
                    onClick={() => setActiveTab("pending")}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                >
                    Pending
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${activeTab === 'pending' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                        {counts.pending}
                    </span>
                </Button>

                <Button 
                    variant={activeTab === "processing" ? "default" : "outline"} 
                    onClick={() => setActiveTab("processing")}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                >
                    Processing
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${activeTab === 'processing' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                        {counts.processing}
                    </span>
                </Button>

                <Button 
                    variant={activeTab === "completed" ? "default" : "outline"} 
                    onClick={() => setActiveTab("completed")}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                >
                    Completed
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${activeTab === 'completed' ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                        {counts.completed}
                    </span>
                </Button>
            </div>

            {/* Orders Display */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusUpdate={() => handleUpdateStatus(order.id, order.status)}
                        />
                    ))
                ) : (
                    <Card className="p-12 text-center border-none shadow-sm">
                        <p className="text-muted-foreground">
                            {!sellerId 
                                ? "Verifying seller identity..." 
                                : `No orders found for your account in ${activeTab}.`}
                        </p>
                    </Card>
                )}
            </div>
        </div>
    )
}