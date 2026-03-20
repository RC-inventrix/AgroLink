"use client"

import { Card } from "@/components/ui/card"
import { Package, TrendingUp } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

interface StatsProps {
    totalOrders: number
    totalRevenue: number
}

export function StatsOverview({ totalOrders, totalRevenue }: StatsProps) {
    const { t } = useLanguage() // Initialized the hook

    const stats = [
        {
            icon: Package,
            label: t("ordersTotalCount"), // Translated
            value: totalOrders.toString(),
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: TrendingUp,
            label: t("ordersTotalRevenue"), // Translated
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
                            <div className={`p-3 rounded-full ${stat.color} shrink-0`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}