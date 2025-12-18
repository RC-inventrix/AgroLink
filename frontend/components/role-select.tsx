"use client"

import { useState } from "react"
import { ChevronDown, Users, Briefcase, Shield } from "lucide-react"

interface RoleSelectProps {
  value: string
  onChange: (value: string) => void
}

const roles = [
  {
    id: "farmer",
    label: "Farmer",
    icon: Users,
    description: "I grow and sell agricultural products",
  },
  {
    id: "buyer",
    label: "Buyer",
    icon: Briefcase,
    description: "I purchase agricultural products",
  },
  {
    id: "admin",
    label: "Admin",
    icon: Shield,
    description: "I manage the platform",
  },
]

export default function RoleSelect({ value, onChange }: RoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedRole = roles.find((role) => role.id === value)
  const Icon = selectedRole?.icon || Users

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-input text-foreground hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-medium">{selectedRole?.label}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {roles.map((role) => {
            const RoleIcon = role.icon
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onChange(role.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 ${
                  value === role.id ? "bg-primary/10 border-l-4 border-primary" : ""
                }`}
              >
                <RoleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{role.label}</p>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
