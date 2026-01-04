"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { StatisticsCards } from "@/components/admin/statistics-cards"
import { ReportsSummary } from "@/components/admin/reports-summary"
import { UserManagement } from "@/components/admin/user-management"
import { Communications } from "@/components/admin/communications"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} open={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        <AdminHeader setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Statistics Overview */}
            <StatisticsCards />

            {/* Dynamic Sections */}
            <div className="mt-8 space-y-8">
              {activeSection === "overview" && (
                <>
                  <ReportsSummary />
                </>
              )}
              {activeSection === "reports" && <ReportsSummary />}
              {activeSection === "users" && <UserManagement />}
              {activeSection === "communications" && <Communications />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
