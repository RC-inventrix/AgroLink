import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  color: string
  bgColor: string
}

export default function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor }}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}
