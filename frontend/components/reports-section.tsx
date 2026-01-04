"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface Report {
  id: string
  reportedUser: string
  userType: "farmer" | "buyer"
  reason: string
  reportedBy: string
  date: string
  status: "pending" | "reviewed" | "resolved"
  details: string
}

const mockReports: Report[] = [
  {
    id: "RPT001",
    reportedUser: "John Farmer",
    userType: "farmer",
    reason: "Fraudulent listing",
    reportedBy: "Ahmed Buyer",
    date: "2024-12-20",
    status: "pending",
    details: "Listed expired vegetables as fresh. Customer complained about quality mismatch.",
  },
  {
    id: "RPT002",
    reportedUser: "Sarah Store",
    userType: "buyer",
    reason: "Payment not received",
    reportedBy: "Hassan Farmer",
    date: "2024-12-19",
    status: "reviewed",
    details: "Buyer purchased vegetables but payment failed. No response to messages.",
  },
  {
    id: "RPT003",
    reportedUser: "Local Farm Co",
    userType: "farmer",
    reason: "Abusive behavior",
    reportedBy: "Multiple Buyers",
    date: "2024-12-18",
    status: "resolved",
    details: "Farmer responded with abusive language in chat. Case resolved with warning.",
  },
]

export default function ReportsSection() {
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [systemAlerts] = useState([
    { id: 1, message: "High fraud activity detected in region 5", severity: "high" },
    { id: 2, message: "Payment gateway experiencing delays", severity: "medium" },
  ])

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusIcon = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="w-4 h-4" />
      case "reviewed":
        return <CheckCircle className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* System Monitoring */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">System Monitoring</h2>
        <div className="space-y-3">
          {systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === "high" ? "bg-red-50 border-red-300" : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <p className={alert.severity === "high" ? "text-red-800" : "text-yellow-800"}>{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Report Summary</h2>
        <div className="space-y-4">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-secondary">{report.id}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(report.status)}`}
                      >
                        {getStatusIcon(report.status)}
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground mb-1">{report.reportedUser}</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Reported by:</strong> {report.reportedBy} • <strong>Date:</strong> {report.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedReport === report.id && (
                <div className="border-t border-border bg-muted p-5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Full Details</h4>
                    <p className="text-sm text-muted-foreground">{report.details}</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>
                    <button className="flex-1 px-4 py-2 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Take Action
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
