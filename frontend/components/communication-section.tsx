"use client"

import { useState } from "react"
import { Send, MessageSquare } from "lucide-react"

interface Message {
  id: string
  title: string
  content: string
  type: "global" | "targeted"
  recipients: string
  sentDate: string
  readRate: number
}

const mockMessages: Message[] = [
  {
    id: "MSG001",
    title: "Seasonal Vegetables Available",
    content: "New harvest of tomatoes and cucumbers now available in season.",
    type: "global",
    recipients: "All Users",
    sentDate: "2024-12-20",
    readRate: 78,
  },
  {
    id: "MSG002",
    title: "Premium Account Benefits",
    content: "Upgrade to premium for better visibility and reach.",
    type: "targeted",
    recipients: "All Farmers",
    sentDate: "2024-12-18",
    readRate: 65,
  },
  {
    id: "MSG003",
    title: "Payment Methods Update",
    content: "We've added new payment options for your convenience.",
    type: "global",
    recipients: "All Users",
    sentDate: "2024-12-15",
    readRate: 92,
  },
]

export default function CommunicationSection() {
  const [messages, setMessages] = useState(mockMessages)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "global" as const,
    recipients: "All Users",
  })

  const handleSendMessage = () => {
    if (formData.title && formData.content) {
      const newMessage: Message = {
        id: `MSG${String(messages.length + 1).padStart(3, "0")}`,
        ...formData,
        sentDate: new Date().toISOString().split("T")[0],
        readRate: 0,
      }
      setMessages([newMessage, ...messages])
      setFormData({ title: "", content: "", type: "global", recipients: "All Users" })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Send Message Form */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-secondary" />
            Create Announcement
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            New Announcement
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 border-t border-border pt-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title</label>
              <input
                type="text"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message</label>
              <textarea
                placeholder="Enter your announcement message"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="global">Global Announcement</option>
                  <option value="targeted">Targeted Message</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Recipients</label>
                <select
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  disabled={formData.type === "global"}
                >
                  <option>All Users</option>
                  <option>All Farmers</option>
                  <option>All Buyers</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Announcement
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages History */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Announcement History</h2>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{msg.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{msg.content}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    <strong>Type:</strong> {msg.type === "global" ? "Global" : "Targeted"}
                  </span>
                  <span>
                    <strong>Recipients:</strong> {msg.recipients}
                  </span>
                  <span>
                    <strong>Sent:</strong> {msg.sentDate}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-secondary">{msg.readRate}%</p>
                  <p className="text-xs text-muted-foreground">Read Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
