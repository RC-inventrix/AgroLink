"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock } from "lucide-react"
import Image from "next/image"

interface Order {
  id: string
  vegetable: string
  image: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalPrice: number
  buyerName: string
  buyerProfile: string
  orderedDate: string
  completionDeadline: string
  status: "pending" | "processing" | "delayed"
  orderNotes: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return { badge: "bg-blue-100 text-blue-800", icon: "text-blue-600", label: "Pending" }
    case "processing":
      return { badge: "bg-orange-100 text-orange-800", icon: "text-orange-600", label: "Processing" }
    case "delayed":
      return { badge: "bg-red-100 text-red-800", icon: "text-red-600", label: "Delayed" }
    default:
      return { badge: "bg-gray-100 text-gray-800", icon: "text-gray-600", label: "Unknown" }
  }
}

const getDateColor = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) return "text-red-600"
  if (daysRemaining <= 2) return "text-orange-600"
  return "text-green-600"
}

const getDaysRemaining = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysRemaining
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function OrderCard({ order }: { order: Order }) {
  const statusInfo = getStatusColor(order.status)
  const daysRemaining = getDaysRemaining(order.completionDeadline)
  const dateColor = getDateColor(order.completionDeadline)

  return (
    <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Vegetable Image & Basic Info */}
        <div className="md:col-span-2">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image src={order.image || "/placeholder.svg"} alt={order.vegetable} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground truncate">{order.vegetable}</h3>
                <Badge className={statusInfo.badge}>{statusInfo.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Order ID: {order.id}</p>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Quantity:</span> {order.quantity} {order.unit}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Price/Unit:</span> Rs. {order.pricePerUnit}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer Information */}
        <div className="md:col-span-1">
          <h4 className="text-sm font-semibold text-foreground mb-3">Buyer Info</h4>
          <div className="flex gap-3 items-start">
            <User className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{order.buyerName}</p>
              <p className="text-xs text-muted-foreground truncate">{order.buyerProfile}</p>
            </div>
          </div>
        </div>

        {/* Timeline & Pricing */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Order Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Timeline</h4>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Ordered</p>
                    <p className="text-sm font-medium text-foreground">{formatDate(order.orderedDate)}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Clock className={`w-4 h-4 ${statusInfo.icon} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Due</p>
                    <p className={`text-sm font-medium ${dateColor}`}>{formatDate(order.completionDeadline)}</p>
                    <p className={`text-xs font-semibold ${dateColor}`}>{daysRemaining} days remaining</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Amount</h4>
              <div className="bg-[#f0f9f6] rounded-lg p-4 border border-[#1a5f3f]/10">
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#1a5f3f]">Rs. {order.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t flex gap-2 justify-end">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        <Button size="sm" className="bg-[#1a5f3f] hover:bg-[#0f4030]">
          Mark as Completed
        </Button>
      </div>
    </Card>
  )
}
