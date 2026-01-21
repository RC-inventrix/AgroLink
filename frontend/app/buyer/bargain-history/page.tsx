"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargain-card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

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
    const [addedToCartIds, setAddedToCartIds] = useState<string[]>([])
    // New state for beautiful notifications
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

    const router = useRouter()

    // 1. Fetch Buyer's Requests
    useEffect(() => {
        const currentUserId = sessionStorage.getItem("id")
        const storedAddedIds = JSON.parse(localStorage.getItem("addedToCartBargains") || "[]")
        setAddedToCartIds(storedAddedIds)

        if (!currentUserId) {
            console.error("No user ID found.")
            setIsLoading(false)
            return
        }

        const fetchBargains = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/bargains/buyer/${currentUserId}`)

                if (response.ok) {
                    const data = await response.json()

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
                        status: item.status.toLowerCase() === 'pending' ? 'in-progress' : item.status.toLowerCase(),
                        vegetableId: item.vegetableId
                    }))

                    setItems(mappedData)
                }
            } catch (error) {
                console.error("Error fetching bargains:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBargains()
    }, [router])

    // --- Helper for Notifications ---
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type })
        // Auto-hide after 3 seconds
        setTimeout(() => setNotification(null), 3000)
    }

    // --- Filter Logic ---
    const pendingItems = items.filter((item) => item.status === "in-progress")
    const rejectedItems = items.filter((item) => item.status === "rejected")

    // Logic: Accepted items that are NOT in the "Added to Cart" list
    const acceptedItems = items.filter((item) => item.status === "accepted" && !addedToCartIds.includes(item.id))

    // Logic: Accepted items that ARE in the "Added to Cart" list
    const addedToCartItems = items.filter((item) => item.status === "accepted" && addedToCartIds.includes(item.id))

    // Helper to determine status for "All" tab
    const getEffectiveStatus = (item: BargainItem) => {
        if (addedToCartIds.includes(item.id)) return "added-to-cart";
        return item.status as "in-progress" | "accepted" | "rejected";
    }

    // --- Handlers ---
    const handleRemoveFromUI = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/bargains/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id))
                showNotification("Request removed successfully", "success")
            }
        } catch (error) {
            console.error("Error deleting bargain:", error)
            showNotification("Failed to remove request", "error")
        }
    }

    const handleAddToCart = async (item: BargainItem) => {
        const currentUserId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")

        if (!currentUserId) {
            showNotification("Please log in to add items to the cart.", "error")
            return
        }

        const bargainedPricePerKg = item.requestedPrice / item.requestedQuantityKg

        const cartPayload = {
            userId: parseInt(currentUserId),
            productId: parseInt(item.vegetableId),
            productName: item.name,
            pricePerKg: bargainedPricePerKg,
            quantity: item.requestedQuantityKg,
            imageUrl: item.image,
            sellerId: parseInt(item.seller),
            sellerName: "Farmer " + item.seller
        }

        try {
            const res = await fetch("http://localhost:8080/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(cartPayload)
            })

            if (res.ok) {
                // 1. Update Local Storage
                const newAddedIds = [...addedToCartIds, item.id]
                setAddedToCartIds(newAddedIds)
                localStorage.setItem("addedToCartBargains", JSON.stringify(newAddedIds))

                // 2. Show Success Notification (No Redirect)
                showNotification(`Successfully added ${item.name} to your cart!`, "success")
            } else {
                showNotification("Failed to add item to cart. Please try again.", "error")
            }
        } catch (error) {
            console.error("Error adding to cart:", error)
            showNotification("Network error. Could not add to cart.", "error")
        }
    }

    const handleBargainAgain = (item: BargainItem) => {
        console.log("Bargain again", item.id);
        // Implement logic to reopen dialog or redirect to product page
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background pb-12">
            <div className="px-6 py-8 border-b border-border bg-card">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-foreground mb-2">My Bargain Requests</h1>
                    <p className="text-muted-foreground">Manage your negotiations and deals</p>
                </div>
            </div>

            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                    notification.type === 'success'
                        ? 'bg-[#2d5016] text-white'
                        : 'bg-red-600 text-white'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <Tabs defaultValue="all" className="w-full">
                <div className="w-full bg-accent/10 border-b border-border">
                    <div className="max-w-6xl mx-auto px-6">
                        <TabsList className="flex w-full h-auto p-0 bg-transparent rounded-none justify-start gap-0 overflow-x-auto">
                            <TabsTrigger value="all" className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1 whitespace-nowrap">
                                All Requests
                            </TabsTrigger>
                            <TabsTrigger value="in-progress" className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1 whitespace-nowrap">
                                Pending ({pendingItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="accepted" className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1 whitespace-nowrap">
                                Accepted ({acceptedItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1 whitespace-nowrap">
                                Rejected ({rejectedItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="added-to-cart" className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground transition-colors flex-1 whitespace-nowrap">
                                Added to Cart ({addedToCartItems.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-6xl mx-auto">
                        {/* ALL REQUESTS TAB - Shows items with Status Badge but NO Actions */}
                        <TabsContent value="all" className="space-y-4 mt-6">
                            {items.length === 0 ? <p className="text-center text-muted-foreground py-10">No history found.</p> :
                                items.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        // Pass the computed status so "Added to Cart" badge shows up
                                        status={getEffectiveStatus(item)}
                                        // Explicitly hide action buttons in this view
                                        hideActions={true}
                                    />
                                ))
                            }
                        </TabsContent>

                        <TabsContent value="in-progress" className="space-y-4 mt-6">
                            {pendingItems.length === 0 ? <p className="text-center text-muted-foreground py-10">No active negotiations.</p> :
                                pendingItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="in-progress"
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            }
                        </TabsContent>

                        <TabsContent value="accepted" className="space-y-4 mt-6">
                            {acceptedItems.length === 0 ? <p className="text-center text-muted-foreground py-10">No new accepted offers.</p> :
                                acceptedItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="accepted"
                                        onAddToCart={() => handleAddToCart(item)}
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            }
                        </TabsContent>

                        <TabsContent value="rejected" className="space-y-4 mt-6">
                            {rejectedItems.length === 0 ? <p className="text-center text-muted-foreground py-10">No rejected requests.</p> :
                                rejectedItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="rejected"
                                        onBargainAgain={() => handleBargainAgain(item)}
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            }
                        </TabsContent>

                        <TabsContent value="added-to-cart" className="space-y-4 mt-6">
                            {addedToCartItems.length === 0 ? <p className="text-center text-muted-foreground py-10">No items added to cart yet.</p> :
                                addedToCartItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="added-to-cart"
                                        // Usually no actions here as it's done
                                    />
                                ))
                            }
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </main>
    )
}