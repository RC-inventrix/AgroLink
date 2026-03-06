"use client"

import { useState, useEffect } from "react"
import { Send, Users, Loader2, Trash2, Edit2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Communications() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null) // Track which ID is being edited

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "ALL",
    priority: "NORMAL"
  })

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

  // Set form to edit mode
  const startEdit = (ann: any) => {
    setEditingId(ann.id)
    setFormData({
      title: ann.title,
      message: ann.message,
      targetAudience: ann.targetAudience,
      priority: ann.priority
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ title: "", message: "", targetAudience: "ALL", priority: "NORMAL" })
  }

  const handleSubmit = async (e: React.FormEvent, status: "PUBLISHED" | "DRAFT") => {
    e.preventDefault()
    setLoading(true)
    const token = sessionStorage.getItem("token")
    
    // Determine if we are creating or updating
    const url = editingId 
      ? `http://localhost:8080/api/v1/announcements/${editingId}` 
      : "http://localhost:8080/api/v1/announcements/create"
    
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...formData, status })
      })

      if (res.ok) {
        cancelEdit()
        fetchHistory()
        alert(`Announcement ${editingId ? "updated" : "created"} successfully!`)
      }
    } catch (error) { alert("Server error") }
    finally { setLoading(false) }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this notice?")) return
    const token = sessionStorage.getItem("token")
    const res = await fetch(`http://localhost:8080/api/v1/announcements/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
    if (res.ok) fetchHistory()
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{editingId ? "Edit Announcement" : "Create New Announcement"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2" />
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
              <Button onClick={(e) => handleSubmit(e, "PUBLISHED")} disabled={loading} className="bg-accent text-black hover:bg-accent-hover">
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
            {announcements.map((ann) => (
              <div key={ann.id} className="border-b border-border pb-4 last:border-b-0 flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{ann.title}</h4>
                  <p className="text-sm text-muted-foreground">{ann.message}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(ann)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(ann.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}