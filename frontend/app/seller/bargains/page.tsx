"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargainfarmerside-card"
import { Loader2, Leaf } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Updated Interface to include logistics and map data
interface BargainRequestUI {
    id: string
    name: string
    buyerName: string
    buyerId: number
    image: string
    pricePerHundredG: number
    pricePerKg: number
    requestedQuantityKg: number
    actualPrice: number
    offeredPrice: number
    discount: number
    status: string
    deliveryRequired: boolean
    buyerAddress: string
    deliveryFee: number
    buyerLatitude: number | null
    buyerLongitude: number | null
}

export default function BargainPage() {
    const [requests, setRequests] = useState<BargainRequestUI[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const currentSellerId = sessionStorage.getItem("id")

        if (!currentSellerId) {
            console.error("No seller ID found.")
            setIsLoading(false)
            return
        }

        const fetchBargains = async () => {
            try {
                const response = await fetch(`${API_URL}/api/bargains/seller/${currentSellerId}`);
                if (response.ok) {
                    const data = await response.json();

                    // 2. Extract unique Buyer IDs
                    const buyerIds = Array.from(new Set(data.map((item: any) => item.buyerId))).filter(Boolean);

                    let nameMap: Record<number, string> = {};

                    // 3. Fetch Full Names from AuthController
                    if (buyerIds.length > 0) {
                        const namesResponse = await fetch(`http://localhost:8080/auth/fullnames?ids=${buyerIds.join(',')}`);
                        if (namesResponse.ok) {
                            nameMap = await namesResponse.json();
                        }
                    }

                    // 4. Map Backend Entity to UI Interface
                    const mappedData: BargainRequestUI[] = data.map((item: any) => {
                        const originalTotal = item.originalPricePerKg * item.quantity;
                        const discountAmount = originalTotal - item.suggestedPrice;
                        const discountPercent = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0;

                        return {
                            id: item.id.toString(),
                            name: item.vegetableName,
                            // Update: Use fullname from nameMap
                            buyerName: nameMap[item.buyerId] || item.buyerName || "Anonymous Buyer",
                            buyerId: item.buyerId,
                            image: item.vegetableImage || "/placeholder.svg",
                            pricePerHundredG: (item.originalPricePerKg || 0) / 10,
                            pricePerKg: item.originalPricePerKg || 0,
                            requestedQuantityKg: item.quantity,
                            actualPrice: originalTotal,
                            offeredPrice: item.suggestedPrice,
                            discount: Math.round(discountPercent),
                            status: item.status,
                            deliveryRequired: item.deliveryRequired || false,
                            buyerAddress: item.buyerAddress || "Pickup at Farm",
                            deliveryFee: item.deliveryFee || 0,
                            buyerLatitude: item.buyerLatitude || null,
                            buyerLongitude: item.buyerLongitude || null
                        };
                    });
                    setRequests(mappedData);
                }
            } catch (error) {
                console.error("Failed to fetch bargains", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBargains();
    }, []);

    const handleAcceptDeal = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/bargains/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACCEPTED" })
            });

            if (response.ok) {
                setRequests(prev => prev.map(item =>
                    item.id === id ? { ...item, status: "ACCEPTED" } : item
                ));
            }
        } catch (error) {
            console.error("Error accepting deal", error)
        }
    }

    const handleRejectRequest = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/bargains/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" })
            });

            if (response.ok) {
                setRequests(prev => prev.map(item =>
                    item.id === id ? { ...item, status: "REJECTED" } : item
                ));
            }
        } catch (error) {
            console.error("Error rejecting deal", error)
        }
    }

    const handleRemoveFromUI = (id: string) => {
        setRequests(prev => prev.filter(item => item.id !== id));
    }

    const pendingItems = requests.filter(item => item.status === "PENDING")
    const acceptedItems = requests.filter(item => item.status === "ACCEPTED")
    const rejectedItems = requests.filter(item => item.status === "REJECTED")

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-green-800 flex items-center gap-3 font-semibold text-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-green-700" />
                    Loading farmer dashboard...
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-12 font-sans">
            <div className="px-6 py-10 bg-linear-to-r from-green-900 to-green-800 text-white shadow-md">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <Leaf className="w-10 h-10 text-green-300" />
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-1">Incoming Requests</h1>
                        <p className="text-green-100/80 font-medium">Review buyer offers, accept deals, and manage deliveries</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-6xl mx-auto px-6">
                        <TabsList className="flex w-full h-auto p-0 bg-transparent rounded-none justify-start gap-6 overflow-x-auto hide-scrollbar">
                            <TabsTrigger value="all" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-green-700 data-[state=active]:bg-transparent data-[state=active]:text-green-800 text-gray-500 font-semibold hover:text-green-700 transition-colors whitespace-nowrap">
                                All Requests ({requests.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-transparent data-[state=active]:text-yellow-700 text-gray-500 font-semibold hover:text-yellow-600 transition-colors whitespace-nowrap">
                                Pending ({pendingItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="accepted" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700 text-gray-500 font-semibold hover:text-green-600 transition-colors whitespace-nowrap">
                                Accepted ({acceptedItems.length})
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-700 text-gray-500 font-semibold hover:text-red-600 transition-colors whitespace-nowrap">
                                Rejected ({rejectedItems.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-6xl mx-auto">
                        <TabsContent value="all" className="space-y-6 mt-4">
                            {requests.length === 0 ? (
                                <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No bargaining requests found.</p>
                            ) : (
                                requests.map((item) => (
                                    <HorizontalBargainCard
                                        key={item.id}
                                        item={item}
                                        status={item.status.toLowerCase() as any}
                                        onAccept={() => item.status === 'PENDING' && handleAcceptDeal(item.id)}
                                        onReject={() => item.status === 'PENDING' && handleRejectRequest(item.id)}
                                        onDelete={() => handleRemoveFromUI(item.id)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="pending" className="space-y-6 mt-4">
                            {pendingItems.length === 0 ? (
                                <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No pending bargaining requests.</p>
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

                        <TabsContent value="accepted" className="space-y-6 mt-4">
                            {acceptedItems.length === 0 ? (
                                <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No accepted deals yet.</p>
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

                        <TabsContent value="rejected" className="space-y-6 mt-4">
                            {rejectedItems.length === 0 ? (
                                <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">No rejected bargaining requests.</p>
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