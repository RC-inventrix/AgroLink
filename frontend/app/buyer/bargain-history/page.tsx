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

    // Simulating logged-in user ID (Replace with actual auth logic)
    const currentUserId = "1"

    // 1. Fetch Buyer's Requests
    useEffect(() => {
        const fetchBargains = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/bargains/buyer/${currentUserId}`)
                if (response.ok) {
                    const data = await response.json()

                    const mappedData: BargainItem[] = data.map((item: any) => {
                        const originalTotal = item.originalPricePerKg * item.quantity;
                        // Calculate discount percentage based on total prices
                        const discountAmount = originalTotal - item.suggestedPrice;
                        const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0;

                        return {
                            id: item.id.toString(),
                            vegetableId: item.vegetableId,
                            name: item.vegetableName,
                            seller: item.sellerId,
                            image: item.vegetableImage || "/placeholder.svg",
                            pricePerHundredG: (item.originalPricePerKg || 0) / 10,
                            pricePerKg: item.originalPricePerKg || 0,
                            requestedQuantityKg: item.quantity,
                            actualPrice: originalTotal,
                            requestedPrice: item.suggestedPrice,
                            discount: Math.round(discountPercent),
                            status: item.status
                        };
                    });
                    setItems(mappedData)
                }
            } catch (error) {
                console.error("Failed to fetch bargains", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBargains()
    }, [])

    // 2. Handle "Delete Request" (In-Progress) - Removes from DB
    const handleDeleteRequest = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/bargains/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setItems(prev => prev.filter(item => item.id !== id));
            } else {
                alert("Failed to delete request");
            }
        } catch (error) {
            console.error("Error deleting bargain", error)
        }
    }

    // 3. Handle "Remove" (Accepted/Rejected) - UI Only
    const handleRemoveFromUI = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }

    // 4. Handle "Add to Cart" (Accepted) - Adds to Cart with Discounted Price
    const handleAddToCart = async (item: BargainItem) => {
        try {
            // Calculate the effective Price Per Kg from the bargain deal
            // Formula: Total Bargained Price / Total Quantity
            const effectivePricePerKg = item.requestedPrice / item.requestedQuantityKg;

            const cartPayload = {
                userId: Number(currentUserId),
                productId: Number(item.vegetableId), // Converting String ID to Long
                productName: item.name,
                imageUrl: item.image,
                sellerName: item.seller,
                quantity: item.requestedQuantityKg,
                pricePerKg: effectivePricePerKg // Passing the calculated unit price
            };

            // NOTE: Updated path to /cart/add (without /api) as requested
            const response = await fetch("http://localhost:8080/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // "X-User-Id": currentUserId // Optional if using Gateway/Security Context
                },
                body: JSON.stringify(cartPayload)
            });

            if (response.ok) {
                alert(`${item.name} added to cart at discounted price!`);
                // Optional: Remove from list after adding
                // handleRemoveFromUI(item.id);
            } else {
                console.error("Failed to add to cart");
                alert("Failed to add to cart");
            }
        } catch (error) {
            console.error("Error adding to cart", error);
        }
    }

    // 5. Handle "Bargain Again" (Rejected) - Redirects to Bargain Form
    const handleBargainAgain = (item: BargainItem) => {
        const vegetableData = {
            id: item.vegetableId,
            name: item.name,
            image: item.image,
            price1kg: item.pricePerKg,
            price100g: item.pricePerHundredG,
            seller: item.seller,
            sellerId: item.seller,
            description: "Bargain Again Request",
        };

        sessionStorage.setItem("selectedVegetable", JSON.stringify(vegetableData));
        router.push("/buyer/bargain");
    }

    // Filter Items
    const pendingItems = items.filter(item => item.status === "PENDING")
    const acceptedItems = items.filter(item => item.status === "ACCEPTED")
    const rejectedItems = items.filter(item => item.status === "REJECTED")

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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
                                        status={item.status === 'PENDING' ? 'in-progress' : item.status.toLowerCase() as any}
                                        onDelete={() => handleDeleteRequest(item.id)}
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
                                        onDelete={() => handleDeleteRequest(item.id)}
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