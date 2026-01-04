"use client"

import { BarChart3, FileText, Users, MessageSquare, Settings, LogOut } from "lucide-react"

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  open: boolean
}

export function AdminSidebar({ activeSection, setActiveSection, open }: AdminSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "users", label: "User Management", icon: Users },
    { id: "communications", label: "Communications", icon: MessageSquare },
  ]

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-sm font-bold text-sidebar-primary-foreground">A</span>
        </div>
        {open && (
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">AgroLink</h1>
            <p className="text-xs text-sidebar-foreground/70">Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-3 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
              }`}
              title={!open ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {open && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 px-3 py-4 border-t border-sidebar-border">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10 transition-all"
          title={!open ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {open && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:text-red-400 transition-all"
          title={!open ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {open && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
