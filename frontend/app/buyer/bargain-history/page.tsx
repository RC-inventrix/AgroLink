"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargain-card"
import { Loader2 } from "lucide-react"

// Interface matching the UI Component requirements
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
    status: string
    vegetableId: string
}

export default function BuyerBargainPage() {
    const [items, setItems] = useState<BargainItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // 1. Fetch Buyer's Requests using REAL ID
    useEffect(() => {
        // Correct logic: Getting the ID directly from storage
        const currentUserId = sessionStorage.getItem("id")

        if (!currentUserId) {
            console.error("No user ID found. Redirecting to login...")
            // router.push("/login") // Uncomment to force login
            setIsLoading(false)
            return
        }

        const fetchBargains = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/bargains/buyer/${currentUserId}`)

                if (response.ok) {
                    const data = await response.json()

                    // Map backend data to frontend interface
                    const mappedData: BargainItem[] = data.map((item: any) => ({
                        id: item.id.toString(),
                        name: item.vegetableName,
                        seller: item.sellerId,
                        image: item.vegetableImage || "/placeholder.svg",
                        pricePerHundredG: (item.originalPricePerKg || 0) / 10,
                        pricePerKg: item.originalPricePerKg || 0,
                        requestedQuantityKg: item.quantity,
                        actualPrice: (item.originalPricePerKg || 0) * item.quantity,
                        requestedPrice: item.suggestedPrice,
                        discount: item.originalPricePerKg
                            ? ((item.originalPricePerKg * item.quantity - item.suggestedPrice) / (item.originalPricePerKg * item.quantity)) * 100
                            : 0,
                        // FIX: Normalize status to match UI expectation ("in-progress")
                        status: item.status.toLowerCase() === 'pending' ? 'in-progress' : item.status.toLowerCase(),
                        vegetableId: item.vegetableId
                    }))

                    setItems(mappedData)
                } else {
                    console.error("Failed to fetch bargains")
                }
            } catch (error) {
                console.error("Error fetching bargains:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBargains()
    }, [router])

    // --- Filter Logic ---
    const pendingItems = items.filter((item) => item.status === "in-progress")
    const acceptedItems = items.filter((item) => item.status === "accepted")
    const rejectedItems = items.filter((item) => item.status === "rejected")

    // --- Handlers ---
    const handleRemoveFromUI = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/bargains/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id))
            }
        } catch (error) {
            console.error("Error deleting bargain:", error)
        }
    }

    // Fixed: Expects item object, not just ID
    const handleAddToCart = (item: BargainItem) => {
        console.log("Add to cart:", item)
        // Add your cart logic here using item.vegetableId, item.requestedPrice, etc.
    }

    // Fixed: Expects item object
    const handleBargainAgain = (item: BargainItem) => {
        console.log("Bargain again:", item)
        // Router push logic
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="px-6 py-8 border-b border-border">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-2">My Bargain Requests</h1>
                    <p className="text-muted-foreground">Manage your negotiations and add accepted offers to your cart</p>
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
                                All Requests ({items.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="in-progress"
                                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1"
                            >
                                In Progress ({pendingItems.length})
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

                        {/* All Requests */}
                        <TabsContent value="all" className="space-y-4 mt-6">
                            {items.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <p className="text-muted-foreground">No bargain history found.</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status={item.status as any}
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        {/* In Progress */}
                        <TabsContent value="in-progress" className="space-y-4 mt-6">
                            {pendingItems.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <p className="text-muted-foreground">No active negotiations.</p>
                                </div>
                            ) : (
                                pendingItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="in-progress"
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        {/* Accepted */}
                        <TabsContent value="accepted" className="space-y-4 mt-6">
                            {acceptedItems.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <p className="text-muted-foreground">No accepted offers yet.</p>
                                </div>
                            ) : (
                                acceptedItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="accepted"
                                        onAddToCart={() => handleAddToCart(item)}
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        {/* Rejected */}
                        <TabsContent value="rejected" className="space-y-4 mt-6">
                            {rejectedItems.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <p className="text-muted-foreground">No rejected requests.</p>
                                </div>
                            ) : (
                                rejectedItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="rejected"
                                        onBargainAgain={() => handleBargainAgain(item)}
                                        onDelete={() => handleRemoveFromUI(item.id)}
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