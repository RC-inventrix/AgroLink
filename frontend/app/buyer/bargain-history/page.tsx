"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargain-card"
import { Loader2, CheckCircle2, XCircle, Leaf } from "lucide-react"

// Updated Interface to include Delivery Data
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
    deliveryRequired: boolean
    buyerAddress: string
    deliveryFee: number
}

export default function BuyerBargainPage() {
    const [items, setItems] = useState<BargainItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addedToCartIds, setAddedToCartIds] = useState<string[]>([])
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)

    const router = useRouter()

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
                        vegetableId: item.vegetableId,

                        // NEW LOGISTICS FIELDS MAPPED HERE
                        deliveryRequired: item.deliveryRequired || false,
                        buyerAddress: item.buyerAddress || "Pickup at Farm",
                        deliveryFee: item.deliveryFee || 0
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

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    const pendingItems = items.filter((item) => item.status === "in-progress")
    const rejectedItems = items.filter((item) => item.status === "rejected")
    const acceptedItems = items.filter((item) => item.status === "accepted" && !addedToCartIds.includes(item.id))
    const addedToCartItems = items.filter((item) => item.status === "accepted" && addedToCartIds.includes(item.id))

    const getEffectiveStatus = (item: BargainItem) => {
        if (addedToCartIds.includes(item.id)) return "added-to-cart";
        return item.status as "in-progress" | "accepted" | "rejected";
    }

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
            sellerName: "Farmer " + item.seller,
            // Including new data to the cart if backend expects it
            deliveryFee: item.deliveryFee,
            buyerAddress: item.buyerAddress,
            totalPrice: item.requestedPrice + item.deliveryFee
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
                const newAddedIds = [...addedToCartIds, item.id]
                setAddedToCartIds(newAddedIds)
                localStorage.setItem("addedToCartBargains", JSON.stringify(newAddedIds))
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
        router.push("/VegetableList"); // Redirect to listings to try again
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-green-800 flex items-center gap-3 font-semibold text-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-green-700" />
                    Harvesting your requests...
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-12 font-sans">
            {/* Themed Header */}
            <div className="px-6 py-10 bg-gradient-to-r from-green-900 to-green-800 text-white shadow-md">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <Leaf className="w-10 h-10 text-green-300" />
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-1">My Bargain Requests</h1>
                        <p className="text-green-100/80 font-medium">Manage your farm-fresh negotiations and deals</p>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-6 duration-300 ${
                    notification.type === 'success'
                        ? 'bg-green-800 text-white border border-green-700'
                        : 'bg-red-700 text-white border border-red-600'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                    <span className="font-medium tracking-wide">{notification.message}</span>
                </div>
            )}

            <Tabs defaultValue="all" className="w-full">
                <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-6xl mx-auto px-6">
                        <TabsList className="flex w-full h-auto p-0 bg-transparent rounded-none justify-start gap-6 overflow-x-auto hide-scrollbar">
                            <TabsTrigger value="all" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-green-700 data-[state=active]:bg-transparent data-[state=active]:text-green-800 text-gray-500 font-semibold hover:text-green-700 transition-colors whitespace-nowrap">
                                All Requests
                            </TabsTrigger>
                            <TabsTrigger value="in-progress" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent data-[state=active]:text-yellow-700 text-gray-500 font-semibold hover:text-yellow-600 transition-colors whitespace-nowrap">
                                Pending ({pendingItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="accepted" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700 text-gray-500 font-semibold hover:text-green-600 transition-colors whitespace-nowrap">
                                Accepted ({acceptedItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-700 text-gray-500 font-semibold hover:text-red-600 transition-colors whitespace-nowrap">
                                Rejected ({rejectedItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="added-to-cart" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 text-gray-500 font-semibold hover:text-blue-600 transition-colors whitespace-nowrap">
                                Cart ({addedToCartItems.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-6xl mx-auto">

                        <TabsContent value="all" className="space-y-6 mt-4">
                            {items.length === 0 ? <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No bargain history found.</p> :
                                items.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status={getEffectiveStatus(item)}
                                        hideActions={true}
                                    />
                                ))
                            }
                        </TabsContent>

                        <TabsContent value="in-progress" className="space-y-6 mt-4">
                            {pendingItems.length === 0 ? <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No active negotiations.</p> :
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

                        <TabsContent value="accepted" className="space-y-6 mt-4">
                            {acceptedItems.length === 0 ? <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No new accepted offers.</p> :
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

                        <TabsContent value="rejected" className="space-y-6 mt-4">
                            {rejectedItems.length === 0 ? <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No rejected requests.</p> :
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

                        <TabsContent value="added-to-cart" className="space-y-6 mt-4">
                            {addedToCartItems.length === 0 ? <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No items added to cart yet.</p> :
                                addedToCartItems.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="added-to-cart"
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