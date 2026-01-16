"use client"

import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
}

export function AdminHeader({ setSidebarOpen, sidebarOpen }: AdminHeaderProps) {
  // දැනට අපිට සැබෑ Server එකක් නැති නිසා, මේකෙන් අපිට Test කරන්න පුළුවන්.
  // පස්සේ කාලෙක මේක Backend එකෙන් එන විදිහට හදමු.
  const isOnline = true; // මෙතන 'false' දැම්මොත් "System Offline" කියලා වැටෙයි.

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
        {/* Left - Menu Toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-foreground hover:text-primary">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Center - Title */}
        <div className="flex-1 text-center hidden md:block">
          <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Right - Actions & System Health */}
        <div className="flex items-center gap-4">
          
          {/* Dynamic System Health Indicator */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded-full ${
            isOnline 
              ? "bg-green-100 border-green-200" // Online (green)
              : "bg-red-100 border-red-200"     // Offline (red)
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isOnline ? "bg-green-400" : "bg-red-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}></span>
            </span>
            <span className={`text-xs font-semibold ${
                isOnline ? "text-green-700" : "text-red-700"
            }`}>
              {isOnline ? "System Online" : "System Offline"}
            </span>
          </div>

          <Button variant="ghost" size="icon" className="text-foreground hover:text-accent hover:bg-accent/10">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
            A
          </div>
        </div>
      </div>
       
      {/* Mobile Title */}
      <div className="md:hidden text-center pb-4">
          <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
      </div>
    </header>
  )
}