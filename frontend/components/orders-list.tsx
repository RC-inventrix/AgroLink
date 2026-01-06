"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"

interface OrdersListProps {
    initialOrders: any[]
    onOrderUpdated: () => void
}

export function OrdersList({ initialOrders, onOrderUpdated }: OrdersListProps) {
    const [activeTab, setActiveTab] = useState<"pending" | "processing" | "completed">("pending")

    // Filter orders based on the active tab
    const filteredOrders = initialOrders.filter((order) => {
        const status = order.status
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

    return (
        <div className="space-y-6">
            {/* Tab Buttons */}
            <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto">
                <Button
                    variant={activeTab === "pending" ? "default" : "outline"}
                    onClick={() => setActiveTab("pending")}
                >
                    Pending Orders
                </Button>
                <Button
                    variant={activeTab === "processing" ? "default" : "outline"}
                    onClick={() => setActiveTab("processing")}
                >
                    Processing Orders
                </Button>
                <Button
                    variant={activeTab === "completed" ? "default" : "outline"}
                    onClick={() => setActiveTab("completed")}
                >
                    Completed Orders
                </Button>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusUpdate={onOrderUpdated}
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