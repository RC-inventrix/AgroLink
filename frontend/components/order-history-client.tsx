"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

interface OrderItem {
  id: string
  name: string
  quantity: number
  pricePerKg: number
  image: string
  sellerName: string
  orderDate: Date
  status: "completed" | "pending"
}

export function OrderHistoryClient() {
  const [orders] = useState<OrderItem[]>([
    {
      id: "1",
      name: "Fresh Tomatoes",
      quantity: 2.5,
      pricePerKg: 120,
      image: "/fresh-tomatoes.png",
      sellerName: "Green Valley Farms",
      orderDate: new Date(2024, 11, 20),
      status: "completed",
    },
    {
      id: "2",
      name: "Organic Carrots",
      quantity: 1.5,
      pricePerKg: 80,
      image: "/organic-carrots.png",
      sellerName: "Organic Harvest Co.",
      orderDate: new Date(2024, 11, 22),
      status: "pending",
    },
    {
      id: "3",
      name: "Green Spinach",
      quantity: 1,
      pricePerKg: 60,
      image: "/fresh-spinach.png",
      sellerName: "Fresh Greens Ltd.",
      orderDate: new Date(2024, 11, 18),
      status: "completed",
    },
    {
      id: "4",
      name: "Red Onions",
      quantity: 3,
      pricePerKg: 50,
      image: "/red-onions.jpg",
      sellerName: "Spice Gardens",
      orderDate: new Date(2024, 11, 25),
      status: "pending",
    },
    {
      id: "5",
      name: "Bell Peppers",
      quantity: 2,
      pricePerKg: 100,
      image: "/colorful-bell-peppers.png",
      sellerName: "Green Valley Farms",
      orderDate: new Date(2024, 11, 15),
      status: "completed",
    },
    {
      id: "6",
      name: "Broccoli",
      quantity: 1.2,
      pricePerKg: 90,
      image: "/fresh-broccoli.png",
      sellerName: "Fresh Greens Ltd.",
      orderDate: new Date(2024, 11, 23),
      status: "pending",
    },
  ])

  const allOrders = orders
  const completedOrders = orders.filter((order) => order.status === "completed")
  const pendingOrders = orders.filter((order) => order.status === "pending")

  const OrderCard = ({ order }: { order: OrderItem }) => (
    <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0">
          <img src={order.image || "/placeholder.svg"} alt={order.name} className="w-24 h-24 object-cover rounded-lg" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg">{order.name}</h3>
              <p className="text-sm text-muted-foreground">By {order.sellerName}</p>
            </div>
            <Badge
              variant="outline"
              className={
                order.status === "completed"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
              }
            >
              {order.status === "completed" ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <Clock className="w-3 h-3 mr-1" />
              )}
              {order.status === "completed" ? "Completed" : "To Be Completed"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium text-foreground">{order.quantity} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price per kg</p>
              <p className="font-medium text-foreground">Rs. {order.pricePerKg}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold text-primary">Rs. {(order.quantity * order.pricePerKg).toFixed(2)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">Ordered on {format(order.orderDate, "MMM dd, yyyy")}</p>
        </div>
      </div>
    </Card>
  )

  const OrderList = ({ orders: orderList }: { orders: OrderItem[] }) => (
    <div className="space-y-4">
      {orderList.length === 0 ? (
        <Card className="p-8 text-center border border-border">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders found</p>
        </Card>
      ) : (
        orderList.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">AgroLink</h1>
          <a href="/" className="text-primary-foreground hover:opacity-90">
            Home
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Order History</h2>
          <p className="text-muted-foreground">View all your vegetable orders and track their delivery status</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All Orders ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Completed ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pending ({pendingOrders.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="all" className="m-0">
              <OrderList orders={allOrders} />
            </TabsContent>
            <TabsContent value="completed" className="m-0">
              <OrderList orders={completedOrders} />
            </TabsContent>
            <TabsContent value="pending" className="m-0">
              <OrderList orders={pendingOrders} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
