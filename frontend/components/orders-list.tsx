"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"
import { toast } from "sonner"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface OrdersListProps {
    initialOrders: any[]
    onOrderUpdated: () => void
    onOfferAction?: (offerId: number, newStatus: string) => Promise<void>
}

export function OrdersList({ initialOrders, onOrderUpdated, onOfferAction }: OrdersListProps) {
    const { t } = useLanguage() // Initialized the hook
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
     * NEW: Mark notifications as read for a specific order
     * This calls the endpoint defined in your BuyerOrderController/Notification logic
     */
    const markNotificationsAsRead = async (orderId: number) => {
        const token = sessionStorage.getItem("token");
        try {
            // This assumes you have a way to fetch notification IDs for an order, 
            // or your backend has an endpoint to mark all notifications for a specific orderId as read.
            // Based on your provided AuthController/OrderControllers, we trigger the update.
            await fetch(`${API_URL}/api/buyer/orders/notifications/mark-order-read/${orderId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    }

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
            const response = await fetch(`${API_URL}/api/seller/orders/${orderId}/status?status=${nextStatus}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                // Clear unread status visually when the order is updated
                await markNotificationsAsRead(orderId);
                
                toast.success(t("ordersUpdateSuccess").replace("{status}", nextStatus.toLowerCase()))
                onOrderUpdated()
            } else {
                toast.error(t("ordersUpdateFailed"))
            }
        } catch (error) {
            console.error("Update Error:", error)
            toast.error(t("ordersServerError"))
        } finally {
            setIsUpdating(false)
        }
    }

    // Helper function to translate tab labels for UI display while keeping actual logic values intact
    const getTabLabel = (tab: string) => {
        switch (tab) {
            case "pending": return t("ordersTabPending");
            case "processing": return t("ordersTabProcessing");
            case "completed": return t("ordersTabCompleted");
            case "cancelled": return t("ordersTabCancelled");
            default: return tab;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-border pb-4 overflow-x-auto no-scrollbar">
                {(["pending", "processing", "completed", "cancelled"] as const).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "outline"}
                        onClick={() => setActiveTab(tab)}
                        disabled={isUpdating}
                        className={`flex items-center gap-2 h-auto py-2.5 ${tab === 'cancelled' && activeTab === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                        {getTabLabel(tab)}
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold shrink-0 ${activeTab === tab ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
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
                            onStatusUpdate={(forcedStatus?: string) => 
                                handleUpdateStatus(order.id, order.status, forcedStatus)
                            }
                            onOfferAction={order.isOfferOrder ? onOfferAction : undefined}
                        />
                    ))
                ) : (
                    <Card className="p-12 text-center border-none shadow-sm">
                        <p className="text-muted-foreground font-medium">
                            {!sellerId
                                ? t("ordersVerifyingSeller")
                                : t("ordersNoOrders").replace("{status}", getTabLabel(activeTab))}
                        </p>
                    </Card>
                )}
            </div>
        </div>
    )
}