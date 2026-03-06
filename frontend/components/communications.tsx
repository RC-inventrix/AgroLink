"use client"

import { useState, useEffect } from "react"
import { Send, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Communications() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "ALL",
    priority: "NORMAL"
  })

  // 1. Fetch History on Mount
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setIsFetching(true)
      const token = sessionStorage.getItem("token")
      const res = await fetch("http://localhost:8080/api/v1/announcements/all", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    } finally {
      setIsFetching(false)
    }
  }

  // 2. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent, status: "PUBLISHED" | "DRAFT") => {
    e.preventDefault()
    if (!formData.title || !formData.message) return alert("Please fill in all fields")

    setLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      const res = await fetch("http://localhost:8080/api/v1/announcements/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          status: status
        })
      })

      if (res.ok) {
        setFormData({ title: "", message: "", targetAudience: "ALL", priority: "NORMAL" })
        fetchHistory() // Refresh the list
        alert(`Announcement ${status === "PUBLISHED" ? "published" : "saved as draft"} successfully!`)
      }
    } catch (error) {
      alert("Error connecting to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Announcement */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Create New Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
                className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your announcement here..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Target Audience</label>
                <select 
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="ALL">All Users</option>
                  <option value="FARMER">All Farmers</option>
                  <option value="BUYER">All Buyers</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={(e) => handleSubmit(e, "PUBLISHED")} 
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Publish Now
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={(e) => handleSubmit(e, "DRAFT")}
                disabled={loading}
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Announcements History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Announcements History</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4">
              {announcements.length === 0 && <p className="text-center text-muted-foreground py-4">No announcements found.</p>}
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{announcement.title}</h4>
                        {announcement.priority === "URGENT" && <Badge className="bg-red-100 text-red-700 text-[10px]">URGENT</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{announcement.message}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className="flex items-center gap-1 bg-primary/10 text-primary">
                          <Users className="h-3 w-3" />
                          {announcement.targetAudience}
                        </Badge>
                        <Badge
                          className={
                            announcement.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }
                        >
                          {announcement.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4 text-muted-foreground hover:text-foreground">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}