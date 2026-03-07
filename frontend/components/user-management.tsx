"use client"

import { useState, useEffect } from "react"
import { Trash2, Ban, MessageSquare, CheckCircle, Loader2, AlertTriangle, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// --- Modal Component ---
function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  variant = "danger" 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  variant?: "danger" | "success"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className={variant === "danger" ? "text-red-500" : "text-green-500"} size={20} />
            {title}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full">
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button 
              className={variant === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
              onClick={onConfirm}
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<{ id: number; name: string; email: string; type: string; status: string; reports: number }[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "success";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    onConfirm: () => {},
  })

  useEffect(() => {
    fetchReportedUsers()
  }, [])

  const fetchReportedUsers = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem("token")
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      const reportRes = await fetch('http://localhost:8080/api/v1/moderation/all', { headers })
      if (!reportRes.ok) throw new Error("Failed to fetch reports")
      const allReports = await reportRes.json()

      const reportMap = allReports.reduce((acc: any, report: any) => {
        const targetId = report.reportedId
        if (targetId) acc[targetId] = (acc[targetId] || 0) + 1
        return acc
      }, {})

      const uniqueIds = Object.keys(reportMap)
      if (uniqueIds.length === 0) { setUsers([]); setLoading(false); return; }

      const idsParam = uniqueIds.join(',')
      const namesRes = await fetch(`http://localhost:8080/auth/fullnames?ids=${idsParam}`, { headers })
      const namesMap = namesRes.ok ? await namesRes.json() : {}

      const formattedUsers = uniqueIds.map(id => ({
        id: parseInt(id),
        name: namesMap[id] || "Unknown User",
        email: `UID: ${id}`, 
        type: "Reported", 
        status: "flagged",
        reports: reportMap[id]
      }))
      setUsers(formattedUsers)
    } catch (error) { console.error("Moderation Data Error:", error) }
    finally { setLoading(false) }
  }

  // --- Modal Logic Wrappers ---

  const triggerBan = (userId: number) => {
    setModalConfig({
      isOpen: true,
      title: "Confirm User Ban",
      message: "Are you sure you want to ban this user? They will lose all access to their dashboard immediately.",
      variant: "danger",
      onConfirm: () => executeBan(userId)
    })
  }

  const triggerUnban = (userId: number) => {
    setModalConfig({
      isOpen: true,
      title: "Restore Account",
      message: "This will restore the user's access to the platform. Do you wish to proceed?",
      variant: "success",
      onConfirm: () => executeUnban(userId)
    })
  }

  // --- API Execution Logic ---

  const executeBan = async (userId: number) => {
    setModalConfig(prev => ({ ...prev, isOpen: false }))
    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/auth/user/${userId}/ban?status=true`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: "banned" } : u))
      }
    } catch (error) { console.error(error) }
  }

  const executeUnban = async (userId: number) => {
    setModalConfig(prev => ({ ...prev, isOpen: false }))
    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/auth/user/${userId}/ban?status=false`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: "active" } : u))
      }
    } catch (error) { console.error(error) }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700"
      case "flagged": return "bg-orange-100 text-orange-700"
      case "banned": return "bg-red-100 text-red-700"
      default: return ""
    }
  }

  const getTypeColor = (type: string) => type === "Farmer" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      {/* Custom Popup Modal */}
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Reported Accounts Management</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">Review and manage accounts that have been reported by users.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No reported users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-border pb-4 last:border-b-0">
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
                    {user.status === "banned" ? (
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => triggerUnban(user.id)} title="Unban User">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={() => triggerBan(user.id)} title="Ban User">
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}