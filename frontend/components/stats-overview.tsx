"use client"

import { Card } from "@/components/ui/card"
import { Package, TrendingUp } from "lucide-react"

interface StatsProps {
    totalOrders: number
    totalRevenue: number
}

export function StatsOverview({ totalOrders, totalRevenue }: StatsProps) {
    const stats = [
        {
            icon: Package,
            label: "Total Orders",
            value: totalOrders.toString(),
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: TrendingUp,
            label: "Total Revenue",
            value: `Rs. ${totalRevenue.toLocaleString()}`,
            color: "bg-green-50 text-green-600",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                    <Card key={idx} className="p-6 border-none shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}