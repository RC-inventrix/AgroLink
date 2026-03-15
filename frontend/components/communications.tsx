"use client"

import { useState, useEffect } from "react"
import { Send, Users, Loader2, Trash2, Edit2, XCircle, AlertTriangle, X, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// --- Custom Confirmation Modal Component ---
function ConfirmModal({ 
  isOpen, title, message, onConfirm, onCancel, variant = "danger" 
}: { 
  isOpen: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; variant?: "danger" | "success"
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-border bg-card shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            {variant === "danger" ? <AlertTriangle className="text-red-500" size={20} /> : <CheckCircle className="text-green-500" size={20} />}
            {title}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full"><X size={16} /></Button>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button 
              className={variant === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-accent text-black hover:bg-accent-hover"}
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

export function Communications() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    variant: "success" as "success" | "danger",
    onConfirm: () => {},
  })

  const [formData, setFormData] = useState({ title: "", message: "", targetAudience: "ALL", priority: "NORMAL" })

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    try {
      setIsFetching(true)
      const token = sessionStorage.getItem("token")
      const res = await fetch("http://localhost:8080/api/v1/announcements/all", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) setAnnouncements(await res.json())
    } catch (error) { console.error("Fetch failed:", error) }
    finally { setIsFetching(false) }
  }

  const startEdit = (ann: any) => {
    setEditingId(ann.id)
    setFormData({ title: ann.title, message: ann.message, targetAudience: ann.targetAudience, priority: ann.priority })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ title: "", message: "", targetAudience: "ALL", priority: "NORMAL" })
  }

  // --- Trigger Modals ---
  const triggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    
    setModalConfig({
      isOpen: true,
      title: editingId ? "Update Announcement" : "Publish Announcement",
      message: editingId 
        ? "Are you sure you want to save changes to this announcement?" 
        : "This will immediately notify the selected target audience. Continue?",
      variant: "success",
      onConfirm: () => executeSubmit("PUBLISHED")
    });
  }

  const triggerDelete = (id: number) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Notice",
      message: "Are you sure? This action is permanent and users will no longer see this message.",
      variant: "danger",
      onConfirm: () => executeDelete(id)
    });
  }

  // --- API Actions ---
  const executeSubmit = async (status: "PUBLISHED" | "DRAFT") => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setLoading(true)
    const token = sessionStorage.getItem("token")
    const url = editingId ? `http://localhost:8080/api/v1/announcements/${editingId}` : "http://localhost:8080/api/v1/announcements/create"
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status })
      })
      if (res.ok) { cancelEdit(); fetchHistory(); }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const executeDelete = async (id: number) => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    const token = sessionStorage.getItem("token")
    try {
      const res = await fetch(`http://localhost:8080/api/v1/announcements/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) fetchHistory()
    } catch (error) { console.error(error) }
  }

  return (
    <div className="space-y-6">
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <Card className="border-border bg-card">
        <CardHeader><CardTitle>{editingId ? "Edit Announcement" : "Create New Announcement"}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={triggerSubmit}>
            <div>
              <label className="text-sm font-medium">Title</label>
              <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} className="rounded-lg border border-border bg-input px-4 py-2">
                <option value="ALL">All Users</option>
                <option value="FARMER">All Farmers</option>
                <option value="BUYER">All Buyers</option>
              </select>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="rounded-lg border border-border bg-input px-4 py-2">
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="bg-accent text-black hover:bg-accent-hover">
                {loading ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {editingId ? "Update & Publish" : "Publish Now"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={cancelEdit} className="text-red-500">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle>Announcements History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isFetching ? <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" /></div> : 
              announcements.map((ann) => (
                <div key={ann.id} className="border-b border-border pb-4 last:border-b-0 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{ann.title}</h4>
                        {ann.priority === "URGENT" && <Badge className="bg-red-100 text-red-700 text-[10px]">URGENT</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ann.message}</p>
                    <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase">{ann.targetAudience}</Badge>
                        <Badge className={`text-[10px] ${ann.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{ann.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(ann)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => triggerDelete(ann.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}