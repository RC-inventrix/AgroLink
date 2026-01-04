"use client"

import { useState } from "react"
import { Send, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Communications() {
  const [announcements] = useState([
    {
      id: 1,
      title: "New Quality Standards",
      message: "All farmers must now follow updated quality guidelines for fresh produce.",
      target: "All Farmers",
      date: "2024-12-22",
      status: "published",
    },
    {
      id: 2,
      title: "Payment Method Update",
      message: "New payment methods are now available for all buyers.",
      target: "All Buyers",
      date: "2024-12-21",
      status: "published",
    },
    {
      id: 3,
      title: "Seasonal Promotion",
      message: "Special winter discounts available this month.",
      target: "All Users",
      date: "2024-12-20",
      status: "draft",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Send New Announcement */}
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
                placeholder="Announcement title"
                className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                placeholder="Write your announcement here..."
                rows={4}
                className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Target Audience</label>
                <select className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>All Users</option>
                  <option>All Farmers</option>
                  <option>All Buyers</option>
                  <option>Specific User</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Send className="mr-2 h-4 w-4" />
                Publish Now
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
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
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{announcement.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="flex items-center gap-1 bg-primary/10 text-primary">
                        <Users className="h-3 w-3" />
                        {announcement.target}
                      </Badge>
                      <Badge
                        className={
                          announcement.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }
                      >
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4 text-muted-foreground hover:text-foreground">
                    Edit
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
