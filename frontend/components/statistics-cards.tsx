"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Users, UserCheck, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatisticsCards() {
  const [totalUsers, setTotalUsers] = useState("0")
  const [activeFarmers, setActiveFarmers] = useState("0")
  const [activeBuyers, setActiveBuyers] = useState("0")
  const [bannedUsers, setBannedUsers] = useState("0") // NEW state for banned users

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://localhost:8080/auth"
        
        // Parallel fetching for better performance
        const [usersRes, farmersRes, buyersRes, bannedRes] = await Promise.all([
          axios.get(`${baseUrl}/count`),
          axios.get(`${baseUrl}/count/farmers`),
          axios.get(`${baseUrl}/count/buyers`),
          axios.get(`${baseUrl}/count/banned`) // NEW endpoint call
        ])

        setTotalUsers(usersRes.data.toString())
        setActiveFarmers(farmersRes.data.toString())
        setActiveBuyers(buyersRes.data.toString())
        setBannedUsers(bannedRes.data.toString()) // Update state

      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchData()
  }, [])

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      change: "+12%",
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Active Farmers",
      value: activeFarmers,
      change: "+8%",
      icon: UserCheck,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Active Buyers",
      value: activeBuyers,
      change: "+15%",
      icon: UserCheck,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Banned Users",
      value: bannedUsers, // Now using backend data
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