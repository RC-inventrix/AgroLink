"use client"

import { Users, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatisticsCards() {
  /* Updated stats to use brand colors and simplified styling */
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Active Farmers",
      value: "1,203",
      change: "+8%",
      icon: UserCheck,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Active Buyers",
      value: "1,644",
      change: "+15%",
      icon: UserCheck,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Banned Users",
      value: "28",
      change: "+2",
      icon: UserX,
      bgColor: "bg-red-100",
      iconColor: "text-red-700",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} rounded-lg p-2`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
