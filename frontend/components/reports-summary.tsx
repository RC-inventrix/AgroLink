"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ReportsSummary() {
  const [reports] = useState([
    {
      id: 1,
      reporter: "John Farmer",
      reportedUser: "Suspicious Buyer",
      reason: "Fraudulent payment",
      status: "pending",
      date: "2024-12-22",
      details: "User attempted to pay with invalid card",
    },
    {
      id: 2,
      reporter: "Market Admin",
      reportedUser: "Aggressive Seller",
      reason: "Abusive language",
      status: "resolved",
      date: "2024-12-21",
      details: "User used inappropriate language in chat",
    },
    {
      id: 3,
      reporter: "Buyer Network",
      reportedUser: "Product Quality Issue",
      reason: "Unverified product quality",
      status: "in-progress",
      date: "2024-12-20",
      details: "Product photos appear to be fake",
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "resolved":
        return "bg-green-100 text-green-700"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pending Reports", value: "12", icon: Clock, color: "text-orange-600" },
          { label: "In Progress", value: "5", icon: AlertCircle, color: "text-blue-600" },
          { label: "Resolved", value: "28", icon: CheckCircle, color: "text-green-600" },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <Card key={idx} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reports Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{report.reportedUser}</h4>
                      <Badge className={getStatusColor(report.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">Reporter:</span> {report.reporter}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Reason:</span> {report.reason}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{report.details}</p>
                  </div>
                  <Button className="ml-4 bg-accent hover:bg-accent/90 text-accent-foreground">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
