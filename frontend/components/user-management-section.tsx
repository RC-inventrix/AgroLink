"use client"

import { useState } from "react"
import { Trash2, Ban } from "lucide-react"

interface User {
  id: string
  name: string
  type: "farmer" | "buyer"
  email: string
  joinDate: string
  status: "active" | "banned"
  violations: number
}

const mockUsers: User[] = [
  {
    id: "U001",
    name: "John Farmer",
    type: "farmer",
    email: "john@farm.com",
    joinDate: "2023-05-15",
    status: "active",
    violations: 2,
  },
  {
    id: "U002",
    name: "Sarah Store",
    type: "buyer",
    email: "sarah@store.com",
    joinDate: "2023-08-22",
    status: "banned",
    violations: 5,
  },
  {
    id: "U003",
    name: "Ahmed Market",
    type: "buyer",
    email: "ahmed@market.com",
    joinDate: "2024-01-10",
    status: "active",
    violations: 0,
  },
  {
    id: "U004",
    name: "Fresh Produce Co",
    type: "farmer",
    email: "fresh@produce.com",
    joinDate: "2024-03-05",
    status: "active",
    violations: 1,
  },
]

export default function UserManagementSection() {
  const [users, setUsers] = useState(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const handleBanUser = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "banned" as const } : u)))
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">User Accounts</h2>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-destructive text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                Ban Selected ({selectedUsers.length})
              </button>
              <button className="px-4 py-2 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/5">
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Join Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Violations</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{user.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.type === "farmer" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.joinDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.violations === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.violations}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {user.status === "active" && (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-700"
                          title="Ban user"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-700"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
