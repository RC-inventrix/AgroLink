"use client"

import { OrdersList } from "@/components/orders-list"
import { StatsOverview } from "@/components/stats-overview"
import { useEffect, useState } from "react"
import SellerHeader from "@/components/headers/SellerHeader";
import SellerSidebar from "../dashboard/SellerSideBar";
import "../dashboard/SellerDashboard.css"

export default function Home() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/seller/orders")
            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            }
        } catch (error) {
            console.error("Failed to fetch orders", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const totalRevenue = orders.reduce((acc, order) => acc + (order.amount / 100), 0)

    return (
        // Changed: Added h-screen and overflow-hidden to the root div
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <SellerHeader />
            
            {/* Changed: flex-1 and overflow-hidden here ensure the sidebar/main content fill remaining space */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Ensure SellerSidebar has min-h-full or h-full internally */}
                <SellerSidebar unreadCount={0} activePage="orders" />
                
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
                            <p className="text-muted-foreground">Manage your vegetable orders</p>
                        </div>

                        <StatsOverview totalOrders={orders.length} totalRevenue={totalRevenue} />

                        <OrdersList
                            initialOrders={orders}
                            onOrderUpdated={fetchOrders} 
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}