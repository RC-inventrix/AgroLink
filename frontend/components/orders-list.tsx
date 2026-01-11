"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"
import { toast } from "sonner" // Optional: for notifications

interface OrdersListProps {
    initialOrders: any[]
    onOrderUpdated: () => void
}

export function OrdersList({ initialOrders, onOrderUpdated }: OrdersListProps) {
    const [activeTab, setActiveTab] = useState<"pending" | "processing" | "completed">("pending")
    const [isUpdating, setIsUpdating] = useState(false);

    // Filter orders based on the active tab
    const filteredOrders = initialOrders.filter((order) => {
        const status = order.status?.toUpperCase();
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

    // NEW: Function to handle the actual API call to Spring Boot
    const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
        setIsUpdating(true);
        
        // Determine the next status based on current logic
        // If it was Pending (PAID), move to PROCESSING. If it was PROCESSING, move to COMPLETED.
        let nextStatus = "PROCESSING";
        if (currentStatus === "PROCESSING") nextStatus = "COMPLETED";

        try {
            const response = await fetch(`http://localhost:8080/api/seller/orders/${orderId}/status?status=${nextStatus}`, {
                method: 'PUT', // or PATCH
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                toast.success(`Order marked as ${nextStatus.toLowerCase()}`);
                onOrderUpdated(); // Refresh the list from the server
            } else {
                toast.error("Failed to update order status");
            }
        } catch (error) {
            console.error("Update Error:", error);
            toast.error("Server error. Please check if backend is running.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto">
                <Button variant={activeTab === "pending" ? "default" : "outline"} onClick={() => setActiveTab("pending")}>
                    Pending Orders
                </Button>
                <Button variant={activeTab === "processing" ? "default" : "outline"} onClick={() => setActiveTab("processing")}>
                    Processing Orders
                </Button>
                <Button variant={activeTab === "completed" ? "default" : "outline"} onClick={() => setActiveTab("completed")}>
                    Completed Orders
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            // Pass the new function here
                            onStatusUpdate={() => handleUpdateStatus(order.id, order.status)}
                        />
                    ))
                ) : (
                    <Card className="p-12 text-center border-none shadow-sm">
                        <p className="text-muted-foreground">No orders found in {activeTab}.</p>
                    </Card>
                )}
            </div>
        </div>
    )
}