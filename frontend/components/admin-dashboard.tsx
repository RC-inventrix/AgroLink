"use client"

import { useState } from "react"
import StatCard from "./stat-card"
import ReportsSection from "./reports-section"
import UserManagementSection from "./user-management-section"
import CommunicationSection from "./communication-section"
import { AlertCircle, Users, UserX, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("reports")

  const stats = [
    {
      label: "Active Buyers",
      value: "1,243",
      icon: Users,
      color: "bg-green-100 text-green-700",
      bgColor: "#f0fdf4",
    },
    {
      label: "Active Farmers",
      value: "456",
      icon: Users,
      color: "bg-blue-100 text-blue-700",
      bgColor: "#f0f9ff",
    },
    {
      label: "Banned Users",
      value: "23",
      icon: UserX,
      color: "bg-red-100 text-red-700",
      bgColor: "#fef2f2",
    },
    {
      label: "Total Users",
      value: "1,719",
      icon: BarChart3,
      color: "bg-yellow-100 text-yellow-700",
      bgColor: "#fefce8",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage reports, users, and communications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === "reports"
                ? "text-secondary border-b-2 border-secondary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Reports & Moderation
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === "users"
                ? "text-secondary border-b-2 border-secondary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("communication")}
            className={`px-6 py-4 font-semibold text-sm transition-colors ${
              activeTab === "communication"
                ? "text-secondary border-b-2 border-secondary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Communication
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "reports" && <ReportsSection />}
          {activeTab === "users" && <UserManagementSection />}
          {activeTab === "communication" && <CommunicationSection />}
        </div>
      </div>
    </div>
  )
}
