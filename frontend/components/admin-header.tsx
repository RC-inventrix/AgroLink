"use client"

import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
}

export function AdminHeader({ setSidebarOpen, sidebarOpen }: AdminHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
        {/* Left - Menu Toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground hover:text-primary">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground hover:text-accent hover:bg-accent/10">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
