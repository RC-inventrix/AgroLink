"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargainfarmerside-card"
import { Loader2 } from "lucide-react"

// Interface matching the UI Component requirements
interface BargainRequestUI {
    id: string
    name: string
    buyerName: string
    image: string
    pricePerHundredG: number
    pricePerKg: number
    requestedQuantityKg: number
    actualPrice: number // Total Original Price
    offeredPrice: number // Total Offered Price
    discount: number
    status: string
}

export default function BargainPage() {
    const [requests, setRequests] = useState<BargainRequestUI[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // This should come from your Auth Context. Hardcoded for testing as per instruction.
    const currentSellerId = "seller123"

    // Fetch Requests from Backend
    useEffect(() => {
        const fetchBargains = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/bargains/seller/${currentSellerId}`)
                if (response.ok) {
                    const data = await response.json()

                    // Map Backend Entity to UI Interface
                    const mappedData: BargainRequestUI[] = data.map((item: any) => {
                        const originalTotal = item.originalPricePerKg * item.quantity;
                        const discountAmount = originalTotal - item.suggestedPrice;
                        const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0;

                        return {
                            id: item.id.toString(),
                            name: item.vegetableName,
                            buyerName: item.buyerName || "Anonymous Buyer",
                            image: item.vegetableImage || "/placeholder.svg",
                            pricePerHundredG: (item.originalPricePerKg || 0) / 10,
                            pricePerKg: item.originalPricePerKg || 0,
                            requestedQuantityKg: item.quantity,
                            actualPrice: originalTotal,
                            offeredPrice: item.suggestedPrice,
                            discount: Math.round(discountPercent),
                            status: item.status // PENDING, ACCEPTED, REJECTED
                        };
                    });
                    setRequests(mappedData)
                }
            } catch (error) {
                console.error("Failed to fetch bargains", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBargains()
    }, [currentSellerId])

    // Handle Accept
    const handleAcceptDeal = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/bargains/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACCEPTED" })
            });

            if (response.ok) {
                // Update local state to move item to Accepted tab
                setRequests(prev => prev.map(item =>
                    item.id === id ? { ...item, status: "ACCEPTED" } : item
                ));
            }
        } catch (error) {
            console.error("Error accepting deal", error)
        }
    }

    // Handle Reject
    const handleRejectRequest = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/bargains/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" })
            });

            if (response.ok) {
                // Update local state to move item to Rejected tab
                setRequests(prev => prev.map(item =>
                    item.id === id ? { ...item, status: "REJECTED" } : item
                ));
            }
        } catch (error) {
            console.error("Error rejecting deal", error)
        }
    }

    // Handle Remove (UI Only)
    // This removes the item from the current view list, but does not delete from DB
    const handleRemoveFromUI = (id: string) => {
        setRequests(prev => prev.filter(item => item.id !== id));
    }

    // Filter lists based on Status
    const pendingItems = requests.filter(item => item.status === "PENDING")
    const acceptedItems = requests.filter(item => item.status === "ACCEPTED")
    const rejectedItems = requests.filter(item => item.status === "REJECTED")

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
                                All Requests ({requests.length})
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
                            {requests.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 rounded-lg">
                                    <p className="text-muted-foreground">No bargaining requests found</p>
                                </div>
                            ) : (
                                requests.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status="all"
                                        // For "All" tab, allow actions if pending, or remove if resolved
                                        onAccept={() => item.status === 'PENDING' && handleAcceptDeal(item.id)}
                                        onReject={() => item.status === 'PENDING' && handleRejectRequest(item.id)}
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
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
                                        onDelete={() => handleRemoveFromUI(item.id)}
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
                                        onRemove={() => handleRemoveFromUI(item.id)}
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