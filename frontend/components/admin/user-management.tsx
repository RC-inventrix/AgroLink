"use client"

import { useState } from "react"
import { Trash2, Ban, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function UserManagement() {
  const [users] = useState([
    {
      id: 1,
      name: "Ahmed Hassan",
      type: "Farmer",
      email: "ahmed@farm.com",
      status: "active",
      joinDate: "2024-01-15",
      reports: 0,
    },
    {
      id: 2,
      name: "Zainab Ali",
      type: "Buyer",
      email: "zainab@buyer.com",
      status: "active",
      joinDate: "2024-02-20",
      reports: 1,
    },
    {
      id: 3,
      name: "Suspicious Account",
      type: "Farmer",
      email: "suspicious@farm.com",
      status: "flagged",
      joinDate: "2024-11-10",
      reports: 3,
    },
    {
      id: 4,
      name: "Banned User",
      type: "Buyer",
      email: "banned@user.com",
      status: "banned",
      joinDate: "2024-03-05",
      reports: 5,
    },
  ])

  /* Updated status and type colors to match the AgroLink design system */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "flagged":
        return "bg-orange-100 text-orange-700"
      case "banned":
        return "bg-red-100 text-red-700"
      default:
        return ""
    }
  }

  const getTypeColor = (type: string) => {
    return type === "Farmer" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Take action on user accounts based on report investigations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-semibold text-foreground">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(user.type)}>{user.type}</Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                  {user.reports > 0 && <Badge className="bg-red-100 text-red-700">{user.reports} reports</Badge>}
                </div>

                <div className="ml-4 flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-orange-600">
                    <Ban className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
