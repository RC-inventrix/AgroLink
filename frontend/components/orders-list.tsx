"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderCard } from "./order-card"
import { Filter } from "lucide-react"

const mockOrders = [
  {
    id: "ORD-001",
    vegetable: "Fresh Tomatoes",
    image: "/red-tomatoes.jpg",
    quantity: 25,
    unit: "kg",
    pricePerUnit: 120,
    totalPrice: 3000,
    buyerName: "Rajesh Kumar",
    buyerProfile: "rajesh@agroshop.com",
    orderedDate: "2025-01-15",
    completionDeadline: "2025-01-20",
    status: "pending",
    orderNotes: "Urgent delivery needed",
  },
  {
    id: "ORD-002",
    vegetable: "Organic Carrots",
    image: "/orange-carrots.jpg",
    quantity: 15,
    unit: "kg",
    pricePerUnit: 80,
    totalPrice: 1200,
    buyerName: "Priya Singh",
    buyerProfile: "priya.singh@freshfarm.in",
    orderedDate: "2025-01-18",
    completionDeadline: "2025-01-23",
    status: "processing",
    orderNotes: "Handle with care",
  },
  {
    id: "ORD-003",
    vegetable: "Green Spinach",
    image: "/green-spinach-leaves.jpg",
    quantity: 10,
    unit: "kg",
    pricePerUnit: 60,
    totalPrice: 600,
    buyerName: "Amit Patel",
    buyerProfile: "amit.patel@greenmart.com",
    orderedDate: "2025-01-19",
    completionDeadline: "2025-01-22",
    status: "pending",
    orderNotes: "Fresh picking required",
  },
  {
    id: "ORD-004",
    vegetable: "Red Onions",
    image: "/red-onions.jpg",
    quantity: 30,
    unit: "kg",
    pricePerUnit: 50,
    totalPrice: 1500,
    buyerName: "Neha Gupta",
    buyerProfile: "neha.gupta@veggie.in",
    orderedDate: "2025-01-17",
    completionDeadline: "2025-01-25",
    status: "delayed",
    orderNotes: "Bulk order for restaurant",
  },
  {
    id: "ORD-005",
    vegetable: "Bell Peppers (Mixed)",
    image: "/colorful-bell-peppers.png",
    quantity: 20,
    unit: "kg",
    pricePerUnit: 100,
    totalPrice: 2000,
    buyerName: "Vikram Sharma",
    buyerProfile: "vikram@produce.co.in",
    orderedDate: "2025-01-20",
    completionDeadline: "2025-01-26",
    status: "pending",
    orderNotes: "Mixed colors preferred",
  },
  {
    id: "ORD-006",
    vegetable: "Cauliflower",
    image: "/white-cauliflower.jpg",
    quantity: 18,
    unit: "kg",
    pricePerUnit: 70,
    totalPrice: 1260,
    buyerName: "Sunita Das",
    buyerProfile: "sunita.das@freshzone.in",
    orderedDate: "2025-01-16",
    completionDeadline: "2025-01-24",
    status: "processing",
    orderNotes: "Store in cool place",
  },
]

export function OrdersList() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("deadline")

  const filteredOrders =
    filterStatus === "all" ? mockOrders : mockOrders.filter((order) => order.status === filterStatus)

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "deadline") {
      return new Date(a.completionDeadline).getTime() - new Date(b.completionDeadline).getTime()
    } else if (sortBy === "price") {
      return b.totalPrice - a.totalPrice
    } else if (sortBy === "oldest") {
      return new Date(a.orderedDate).getTime() - new Date(b.orderedDate).getTime()
    }
    return 0
  })

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className={filterStatus === "all" ? "bg-[#1a5f3f]" : ""}
          >
            All Orders
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            className={filterStatus === "pending" ? "bg-[#1a5f3f]" : ""}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "processing" ? "default" : "outline"}
            onClick={() => setFilterStatus("processing")}
            className={filterStatus === "processing" ? "bg-[#1a5f3f]" : ""}
          >
            Processing
          </Button>
          <Button
            variant={filterStatus === "delayed" ? "default" : "outline"}
            onClick={() => setFilterStatus("delayed")}
            className={filterStatus === "delayed" ? "bg-[#1a5f3f]" : ""}
          >
            Delayed
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border rounded-md px-3 py-2 bg-white text-foreground border-border"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="price">Sort by Price (High to Low)</option>
            <option value="oldest">Sort by Oldest First</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-4">
        {sortedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {sortedOrders.length === 0 && (
        <Card className="p-12 text-center border-none shadow-sm">
          <p className="text-muted-foreground mb-2">No orders found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </Card>
      )}
    </div>
  )
}
