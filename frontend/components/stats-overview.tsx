"use client"

import { Card } from "@/components/ui/card"
import { Clock, Package, TrendingUp } from "lucide-react"

export function StatsOverview() {
  const stats = [
    {
      icon: Package,
      label: "Total Orders",
      value: "12",
      color: "bg-blue-50 text-blue-600",
    },
    // {
    //   icon: Clock,
    //   label: "Average Days Remaining",
    //   value: "4.2",
    //   color: "bg-orange-50 text-orange-600",
    // },
    {
      icon: TrendingUp,
      label: "Total Value",
      value: "Rs. 8,450",
      color: "bg-green-50 text-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="p-6 border-none shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
