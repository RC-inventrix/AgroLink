"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargainfarmerside-card"

interface BargainRequest {
  id: string
  name: string
  buyerName: string
  image: string
  pricePerHundredG: number
  pricePerKg: number
  requestedQuantityKg: number
  actualPrice: number
  offeredPrice: number
  discount: number
}

const SAMPLE_REQUESTS: BargainRequest[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    buyerName: "Rajesh Kumar",
    image: "/red-tomatoes-vegetables.jpg",
    pricePerHundredG: 12,
    pricePerKg: 120,
    requestedQuantityKg: 5,
    actualPrice: 600,
    offeredPrice: 500,
    discount: 17,
  },
  {
    id: "2",
    name: "Bell Peppers",
    buyerName: "Priya Singh",
    image: "/colorful-bell-peppers.jpg",
    pricePerHundredG: 25,
    pricePerKg: 250,
    requestedQuantityKg: 3,
    actualPrice: 750,
    offeredPrice: 650,
    discount: 13,
  },
  {
    id: "3",
    name: "Fresh Carrots",
    buyerName: "Amit Patel",
    image: "/fresh-orange-carrots.jpg",
    pricePerHundredG: 8,
    pricePerKg: 80,
    requestedQuantityKg: 10,
    actualPrice: 800,
    offeredPrice: 700,
    discount: 12,
  },
  {
    id: "4",
    name: "Spinach Bundle",
    buyerName: "Deepa Nair",
    image: "/fresh-green-spinach.jpg",
    pricePerHundredG: 5,
    pricePerKg: 50,
    requestedQuantityKg: 2,
    actualPrice: 100,
    offeredPrice: 80,
    discount: 20,
  },
  {
    id: "5",
    name: "Broccoli Fresh",
    buyerName: "Vikram Sharma",
    image: "/fresh-broccoli-vegetables.jpg",
    pricePerHundredG: 20,
    pricePerKg: 200,
    requestedQuantityKg: 4,
    actualPrice: 800,
    offeredPrice: 700,
    discount: 12,
  },
]

export default function BargainPage() {
  const [allItems, setAllItems] = useState<BargainRequest[]>(SAMPLE_REQUESTS)
  const [pendingItems, setPendingItems] = useState<BargainRequest[]>([SAMPLE_REQUESTS[0], SAMPLE_REQUESTS[1]])
  const [acceptedItems, setAcceptedItems] = useState<BargainRequest[]>([SAMPLE_REQUESTS[2]])
  const [rejectedItems, setRejectedItems] = useState<BargainRequest[]>([SAMPLE_REQUESTS[3]])

  const handleRejectRequest = (id: string) => {
    const item = pendingItems.find((i) => i.id === id)
    if (item) {
      setPendingItems(pendingItems.filter((i) => i.id !== id))
      setRejectedItems([...rejectedItems, item])
    }
  }

  const handleAcceptDeal = (id: string) => {
    const item = pendingItems.find((i) => i.id === id)
    if (item) {
      setPendingItems(pendingItems.filter((i) => i.id !== id))
      setAcceptedItems([...acceptedItems, item])
    }
  }

  const handleDeleteFromPending = (id: string) => {
    setPendingItems(pendingItems.filter((item) => item.id !== id))
  }

  const handleRemoveFromAccepted = (id: string) => {
    setAcceptedItems(acceptedItems.filter((item) => item.id !== id))
  }

  const handleRespondWithNewPrice = (id: string) => {
    const item = rejectedItems.find((i) => i.id === id)
    if (item) {
      setRejectedItems(rejectedItems.filter((i) => i.id !== id))
      setPendingItems([...pendingItems, item])
    }
  }

  const handleDeleteFromRejected = (id: string) => {
    setRejectedItems(rejectedItems.filter((item) => item.id !== id))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Bargain Requests from Buyers</h1>
          <p className="text-muted-foreground">Accept or negotiate price offers on your fresh vegetables</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="w-full bg-accent/10 border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <TabsList className="flex w-full h-auto p-0 bg-transparent rounded-none justify-start gap-0">
              <TabsTrigger
                value="all"
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1"
              >
                All Requests ({allItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1"
              >
                Pending ({pendingItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1"
              >
                Accepted ({acceptedItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1"
              >
                Rejected ({rejectedItems.length})
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Tab Content - All Requests */}
            <TabsContent value="all" className="space-y-4 mt-6">
              {allItems.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No bargaining requests yet</p>
                </div>
              ) : (
                allItems.map((item) => <HorizontalBargainCard key={item.id} item={item} status="all" />)
              )}
            </TabsContent>

            {/* Tab Content - Pending */}
            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingItems.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No pending bargaining requests</p>
                </div>
              ) : (
                pendingItems.map((item) => (
                  <HorizontalBargainCard
                    key={item.id}
                    item={item}
                    status="pending"
                    onAccept={() => handleAcceptDeal(item.id)}
                    onReject={() => handleRejectRequest(item.id)}
                    onDelete={() => handleDeleteFromPending(item.id)}
                  />
                ))
              )}
            </TabsContent>

            {/* Tab Content - Accepted */}
            <TabsContent value="accepted" className="space-y-4 mt-6">
              {acceptedItems.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No accepted bargaining requests</p>
                </div>
              ) : (
                acceptedItems.map((item) => (
                  <HorizontalBargainCard
                    key={item.id}
                    item={item}
                    status="accepted"
                    onRemove={() => handleRemoveFromAccepted(item.id)}
                  />
                ))
              )}
            </TabsContent>

            {/* Tab Content - Rejected */}
            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedItems.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No rejected bargaining requests</p>
                </div>
              ) : (
                rejectedItems.map((item) => (
                  <HorizontalBargainCard
                    key={item.id}
                    item={item}
                    status="rejected"
                    onRespondWithNewPrice={() => handleRespondWithNewPrice(item.id)}
                    onDelete={() => handleDeleteFromRejected(item.id)}
                  />
                ))
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </main>
  )
}
