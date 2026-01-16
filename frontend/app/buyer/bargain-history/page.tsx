"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargain-card"

interface BargainItem {
  id: string
  name: string
  seller: string
  image: string
  pricePerHundredG: number
  pricePerKg: number
  requestedQuantityKg: number
  actualPrice: number
  requestedPrice: number
  discount: number
}

// Sample data
const SAMPLE_VEGETABLES: BargainItem[] = [
  {
    id: "1",
    name: "Organic Tomatoes",
    seller: "Fresh Farm Co.",
    image: "/red-tomatoes-vegetables.jpg",
    pricePerHundredG: 12,
    pricePerKg: 120,
    requestedQuantityKg: 5,
    actualPrice: 600,
    requestedPrice: 500,
    discount: 17,
  },
  {
    id: "2",
    name: "Bell Peppers",
    seller: "Valley Farms",
    image: "/colorful-bell-peppers.jpg",
    pricePerHundredG: 25,
    pricePerKg: 250,
    requestedQuantityKg: 3,
    actualPrice: 750,
    requestedPrice: 650,
    discount: 13,
  },
  {
    id: "3",
    name: "Fresh Carrots",
    seller: "Green Valley",
    image: "/fresh-orange-carrots.jpg",
    pricePerHundredG: 8,
    pricePerKg: 80,
    requestedQuantityKg: 10,
    actualPrice: 800,
    requestedPrice: 700,
    discount: 12,
  },
  {
    id: "4",
    name: "Spinach Bundle",
    seller: "Local Organic",
    image: "/fresh-green-spinach.jpg",
    pricePerHundredG: 5,
    pricePerKg: 50,
    requestedQuantityKg: 2,
    actualPrice: 100,
    requestedPrice: 80,
    discount: 20,
  },
  {
    id: "5",
    name: "Broccoli Fresh",
    seller: "Farm Direct",
    image: "/fresh-broccoli-vegetables.jpg",
    pricePerHundredG: 20,
    pricePerKg: 200,
    requestedQuantityKg: 4,
    actualPrice: 800,
    requestedPrice: 700,
    discount: 12,
  },
]

export default function BargainPage() {
  const [allItems, setAllItems] = useState<BargainItem[]>(SAMPLE_VEGETABLES)
  const [inProgressItems, setInProgressItems] = useState<BargainItem[]>([SAMPLE_VEGETABLES[0], SAMPLE_VEGETABLES[1]])
  const [acceptedItems, setAcceptedItems] = useState<BargainItem[]>([SAMPLE_VEGETABLES[2]])
  const [rejectedItems, setRejectedItems] = useState<BargainItem[]>([SAMPLE_VEGETABLES[3]])

  const handleDeleteFromInProgress = (id: string) => {
    setInProgressItems(inProgressItems.filter((item) => item.id !== id))
  }

  const handleAddToCart = (id: string) => {
    console.log(`Added item ${id} to cart`)
  }

  const handleDeleteFromAccepted = (id: string) => {
    setAcceptedItems(acceptedItems.filter((item) => item.id !== id))
  }

  const handleBargainAgain = (id: string) => {
    const item = rejectedItems.find((i) => i.id === id)
    if (item) {
      setRejectedItems(rejectedItems.filter((i) => i.id !== id))
      setInProgressItems([...inProgressItems, item])
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Bargain Requests</h1>
          <p className="text-muted-foreground">Manage your vegetable bargaining negotiations in one place</p>
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
                All Orders ({allItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="in-progress"
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1"
              >
                In Progress ({inProgressItems.length})
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

            {/* Tab Content - In Progress */}
            <TabsContent value="in-progress" className="space-y-4 mt-6">
              {inProgressItems.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No bargaining requests in progress</p>
                </div>
              ) : (
                inProgressItems.map((item) => (
                  <HorizontalBargainCard
                    key={item.id}
                    item={item}
                    status="in-progress"
                    onDelete={() => handleDeleteFromInProgress(item.id)}
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
                    onAddToCart={() => handleAddToCart(item.id)}
                    onDelete={() => handleDeleteFromAccepted(item.id)}
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
                    onBargainAgain={() => handleBargainAgain(item.id)}
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
