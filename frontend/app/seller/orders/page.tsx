"use client"

import { useState, useEffect } from "react"
import Header from "@/app/seller/orders/header"
import { OrdersList } from "@/components/orders-list"
import { StatsOverview } from "@/components/stats-overview"

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

    // Calculate Total Revenue (Sum of 'amount' from all orders)
    // Backend amount is in cents, so divide by 100
    const totalRevenue = orders.reduce((acc, order) => acc + (order.amount / 100), 0)

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
                        <p className="text-muted-foreground">Manage your vegetable orders</p>
                    </div>

                    <StatsOverview totalOrders={orders.length} totalRevenue={totalRevenue} />

                    <OrdersList
                        initialOrders={orders}
                        onOrderUpdated={fetchOrders} // Refresh list after status change
                    />
                </div>
            </main>
        </div>
    )
}