"use client"

import { useState } from "react"
import { AdminHeader } from "../../../components/admin-header"
import { StatisticsCards } from "../../../components/statistics-cards"
import { ReportsSummary } from "../../../components/reports-summary"
import { UserManagement } from "../../../components/user-management"
import { Communications } from "../../../components/communications"
import { AdminSidebar } from "../../../components/admin-sidebar"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} open={sidebarOpen} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <AdminHeader setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50/50">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
            
            {/* --- DASHBOARD OVERVIEW SECTION --- */}
            {activeSection === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-4">Dashboard Overview</h2>
                  <StatisticsCards />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-4">Recent Activity</h3>
                  {/* Dashboard eke Reports pennaddi podi wenasak karanna puluwan passe */}
                  <ReportsSummary />
                </div>
              </div>
            )}

            {/* --- REPORTS SECTION (No Stats, Just Reports) --- */}
            {activeSection === "reports" && (
              <div className="space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight">Report Investigations</h2>
                    <p className="text-muted-foreground">Manage and resolve user reports</p>
                 </div>
                 <ReportsSummary />
              </div>
            )}

            {/* --- USER MANAGEMENT SECTION --- */}
            {activeSection === "users" && (
              <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage farmer and buyer accounts</p>
                 </div>
                <UserManagement />
              </div>
            )}

            {/* --- COMMUNICATIONS SECTION --- */}
            {activeSection === "communications" && (
              <div className="space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight">Communications Center</h2>
                    <p className="text-muted-foreground">Send announcements and notifications</p>
                 </div>
                <Communications />
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  )
}