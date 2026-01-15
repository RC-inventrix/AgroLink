"use client"

import { useState, useEffect } from "react"
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

    // Ensure sessionStorage is accessed only on the client side to avoid SSR errors
    useEffect(() => {
        const id = sessionStorage.getItem("id")
        setSellerId(id)
    }, [])

    // --- CRITICAL FILTER: Show only orders matching the logged-in Seller ID ---
    const filteredOrders = initialOrders.filter((order) => {
        // 1. If sellerId hasn't loaded yet, don't show items
        if (!sellerId) return false

        // 2. Check if the order belongs to this seller
        const isMyOrder = order.sellerId?.toString() === sellerId?.toString()
        if (!isMyOrder) return false

        // 3. Filter by status for the active tab
        const status = order.status?.toUpperCase()
        if (activeTab === "pending") {
            return status === "PAID" || status === "COD_CONFIRMED" || status === "CREATED"
        }
        if (activeTab === "processing") {
            return status === "PROCESSING"
        }
        if (activeTab === "completed") {
            return status === "COMPLETED"
        }
        return false
    })

    const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
        setIsUpdating(true)
        
        // Determine the next status based on current status
        let nextStatus = "PROCESSING"
        if (currentStatus === "PROCESSING") nextStatus = "COMPLETED"

        try {
            const response = await fetch(`http://localhost:8080/api/seller/orders/${orderId}/status?status=${nextStatus}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
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
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto">
                <Button 
                    variant={activeTab === "pending" ? "default" : "outline"} 
                    onClick={() => setActiveTab("pending")}
                    disabled={isUpdating}
                >
                    Pending Orders
                </Button>
                <Button 
                    variant={activeTab === "processing" ? "default" : "outline"} 
                    onClick={() => setActiveTab("processing")}
                    disabled={isUpdating}
                >
                    Processing Orders
                </Button>
                <Button 
                    variant={activeTab === "completed" ? "default" : "outline"} 
                    onClick={() => setActiveTab("completed")}
                    disabled={isUpdating}
                >
                    Completed Orders
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