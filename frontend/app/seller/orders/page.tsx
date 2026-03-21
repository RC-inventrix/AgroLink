/* fileName: page.tsx */
"use client"

import { OrdersList } from "@/components/orders-list"
import { StatsOverview } from "@/components/stats-overview"
import { useEffect, useState } from "react"
import SellerHeader from "@/components/headers/SellerHeader";
import SellerSidebar from "../dashboard/SellerSideBar";
import "../dashboard/SellerDashboard.css"
import { Toaster } from "sonner"
import Footer2 from "@/components/footer/Footer";
import { useLanguage } from "@/context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function OrdersPage() {
    const { t } = useLanguage();
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const farmerId = sessionStorage.getItem("id");

            if (!farmerId || !token) {
                setLoading(false);
                return;
            }

            // Fetches orders assigned to this seller
            const res = await fetch(`${API_URL}/api/seller/orders/${farmerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json()
                // Ensure the data includes 'createdAt' and 'handlingTime' for the countdown
                setOrders(data)
            } else {
                console.error("API Error:", res.status, res.statusText);
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

    // Revenue calculation based on fetched order amounts
    const totalRevenue = orders.reduce((acc, order) => acc + (order.amount / 100), 0)

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
            <Toaster position="top-center" richColors /> 
            
            <SellerHeader />
            
            <div className="flex flex-1">
                {/* Sidebar handles polling for live chat updates */}
                <SellerSidebar unreadCount={0} activePage="orders" />
                
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">{t("ordersTitle")}</h1>
                            <p className="text-[#A3ACBA] font-medium">{t("ordersSubtitle")}</p>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-gray-200 rounded-2xl animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : (
                            <>
                                <StatsOverview totalOrders={orders.length} totalRevenue={totalRevenue} />

                                <div className="mt-8">
                                    <OrdersList
                                        initialOrders={orders}
                                        onOrderUpdated={fetchOrders} 
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
            
            <Footer2 />
        </div>
    )
}