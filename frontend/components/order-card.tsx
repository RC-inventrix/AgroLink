"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock, CheckCircle } from "lucide-react"

interface OrderCardProps {
    order: any
    onStatusUpdate: () => void
}

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
    // 1. Calculate Remaining Time (10 Day Deadline)
    const orderDate = new Date(order.createdAt)
    const deadlineDate = new Date(orderDate)
    deadlineDate.setDate(deadlineDate.getDate() + 10) // Add 10 days

    const today = new Date()
    const timeDiff = deadlineDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

    const isCompleted = order.status === "COMPLETED"

    // 2. Handle Status Update
    const handleUpdateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/seller/orders/${order.id}/status?status=${newStatus}`, {
                method: "PUT"
            })
            if (res.ok) {
                onStatusUpdate() // Refresh list
            }
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    return (
        <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Order Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">Order #{order.stripeId ? order.stripeId.substring(0, 8) : order.id}</h3>
                                <Badge variant="outline">{order.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{order.itemsJson}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Buyer Details */}
                        <div className="flex gap-2 items-start">
                            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Buyer</p>
                                <p className="text-sm font-medium">{order.customerName || "Guest User"}</p>
                                <p className="text-xs text-muted-foreground">{order.customerEmail || "No Email"}</p>
                            </div>
                        </div>

                        {/* Order Date */}
                        <div className="flex gap-2 items-start">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Ordered Date</p>
                                <p className="text-sm font-medium">{orderDate.toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Remaining Time (Hidden if Completed) */}
                        {!isCompleted && (
                            <div className="flex gap-2 items-start">
                                <Clock className={`w-4 h-4 ${daysRemaining < 3 ? "text-red-500" : "text-green-500"} mt-0.5`} />
                                <div>
                                    <p className="text-xs text-muted-foreground">Deadline</p>
                                    <p className="text-sm font-medium">{deadlineDate.toLocaleDateString()}</p>
                                    <p className={`text-xs font-semibold ${daysRemaining < 3 ? "text-red-500" : "text-green-600"}`}>
                                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Overdue"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Amount */}
                        <div className="flex gap-2 items-start">
                            <div className="bg-green-50 p-2 rounded-lg">
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-lg font-bold text-green-700">Rs. {(order.amount / 100).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-2 min-w-[150px]">
                    {(order.status === "PAID" || order.status === "COD_CONFIRMED" || order.status === "CREATED") && (
                        <Button
                            onClick={() => handleUpdateStatus("PROCESSING")}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            Accept Order
                        </Button>
                    )}

                    {order.status === "PROCESSING" && (
                        <Button
                            onClick={() => handleUpdateStatus("COMPLETED")}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            Mark as Completed
                        </Button>
                    )}

                    {isCompleted && (
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-100 rounded-md">
                            <CheckCircle className="w-6 h-6 text-green-600 mb-1" />
                            <span className="text-sm font-medium text-gray-600">Order Completed</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}