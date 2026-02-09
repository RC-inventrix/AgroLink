"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"
import { toast } from "sonner"

interface OrdersListProps {
    initialOrders: any[]
    onOrderUpdated: () => void
    onOfferAction?: (offerId: number, newStatus: string) => Promise<void>
}

export function OrdersList({ initialOrders, onOrderUpdated, onOfferAction }: OrdersListProps) {
    const [activeTab, setActiveTab] = useState<"pending" | "processing" | "completed" | "cancelled">("pending")
    const [isUpdating, setIsUpdating] = useState(false)
    const [sellerId, setSellerId] = useState<string | null>(null)

    useEffect(() => {
        const id = sessionStorage.getItem("id")
        setSellerId(id)
    }, [])

    const getTime = (dateStr: string) => new Date(dateStr).getTime();

    // 1. Updated Counts to include Cancelled
    const counts = useMemo(() => {
        if (!sellerId) return { pending: 0, processing: 0, completed: 0, cancelled: 0 };

        const myOrders = initialOrders.filter(
            (order) => order.sellerId?.toString() === sellerId?.toString()
        );

        return {
            pending: myOrders.filter((o) =>
                ["PAID", "COD_CONFIRMED", "CREATED", "PENDING"].includes(o.status?.toUpperCase())
            ).length,
            processing: myOrders.filter((o) => o.status?.toUpperCase() === "PROCESSING").length,
            completed: myOrders.filter((o) => o.status?.toUpperCase() === "COMPLETED").length,
            cancelled: myOrders.filter((o) => o.status?.toUpperCase() === "CANCELLED").length,
        };
    }, [initialOrders, sellerId]);

    // 2. Updated Filtered logic
    const filteredOrders = useMemo(() => {
        if (!sellerId) return [];

        const filtered = initialOrders.filter((order) => {
            const isMyOrder = order.sellerId?.toString() === sellerId?.toString()
            if (!isMyOrder) return false

            const status = order.status?.toUpperCase()
            if (activeTab === "pending") {
                return ["PAID", "COD_CONFIRMED", "CREATED", "PENDING"].includes(status)
            }
            if (activeTab === "processing") return status === "PROCESSING"
            if (activeTab === "completed") return status === "COMPLETED"
            if (activeTab === "cancelled") return status === "CANCELLED"
            return false
        });

        return filtered.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

    }, [initialOrders, sellerId, activeTab]);

    /**
     * FIX: Accepts forcedStatus as the priority. 
     * If forcedStatus is "CANCELLED", it will actually send "CANCELLED" to your API.
     */
    const handleUpdateStatus = async (orderId: number, currentStatus: string, forcedStatus?: string) => {
        if (forcedStatus === "REFRESH") {
            onOrderUpdated();
            return;
        }

        setIsUpdating(true)
        const token = sessionStorage.getItem("token");

        // Logic to determine what the next status is if one isn't forced
        let nextStatus = forcedStatus; 
        
        if (!nextStatus) {
            if (currentStatus === "PROCESSING") nextStatus = "COMPLETED"
            else nextStatus = "PROCESSING" // Default flow: Pending -> Processing
        }

        try {
            const response = await fetch(`http://localhost:8080/api/seller/orders/${orderId}/status?status=${nextStatus}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                toast.success(`Order marked as ${nextStatus.toLowerCase()}`)
                onOrderUpdated()
            } else {
                toast.error("Failed to update order status")
            }
        } catch (error) {
            console.error("Update Error:", error)
            toast.error("Server error.")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto">
                {(["pending", "processing", "completed", "cancelled"] as const).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "outline"}
                        onClick={() => setActiveTab(tab)}
                        disabled={isUpdating}
                        className={`flex items-center gap-2 capitalize ${tab === 'cancelled' && activeTab === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                        {tab}
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${activeTab === tab ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                            {counts[tab]}
                        </span>
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            // Pass forcedStatus correctly to the card
                            onStatusUpdate={(forcedStatus?: string) => 
                                handleUpdateStatus(order.id, order.status, forcedStatus)
                            }
                            onOfferAction={order.isOfferOrder ? onOfferAction : undefined}
                        />
                    ))
                ) : (
                    <Card className="p-12 text-center border-none shadow-sm">
                        <p className="text-muted-foreground">
                            {!sellerId
                                ? "Verifying seller identity..."
                                : `No orders found in ${activeTab}.`}
                        </p>
                    </Card>
                )}
            </div>
        </div>
    )
}