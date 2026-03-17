"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargainfarmerside-card"
import { Loader2, Handshake } from "lucide-react"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../dashboard/SellerSideBar"
import Footer2 from "@/components/footer/Footer"
import "../dashboard/SellerDashboard.css"

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

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
            <SellerHeader />
            
            <div className="flex flex-1">
                <SellerSidebar unreadCount={0} activePage="bargains" />

                <main className="flex-1 p-8">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-[#004d2b] flex flex-col items-center gap-3 font-semibold text-lg">
                                <Loader2 className="h-10 w-10 animate-spin text-[#EEC044]" />
                                Loading bargaining requests...
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-8 bg-[#03230F] text-white p-8 rounded-3xl shadow-lg flex items-center gap-4">
                                <div className="bg-[#EEC044] p-3 rounded-2xl">
                                    <Handshake className="w-8 h-8 text-[#03230F]" />
                                </div>
                                <div>
                                    <h1 className="text-[32px] font-black mb-1 tracking-tight">Buyer Bargains</h1>
                                    <p className="text-gray-300 font-medium">Review and manage price negotiations from buyers</p>
                                </div>
                            </div>

                            {/* Tabs Section */}
                            <Tabs defaultValue="all" className="w-full">
                                <div className="w-full bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
                                    <TabsList className="flex w-full h-auto p-0 bg-transparent rounded-none justify-start gap-6 overflow-x-auto hide-scrollbar px-6">
                                        <TabsTrigger value="all" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#004d2b] data-[state=active]:bg-transparent data-[state=active]:text-[#004d2b] text-gray-500 font-bold hover:text-[#004d2b] transition-colors whitespace-nowrap">
                                            All Requests ({requests.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="pending" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#EEC044] data-[state=active]:bg-transparent data-[state=active]:text-[#b38f2b] text-gray-500 font-bold hover:text-[#EEC044] transition-colors whitespace-nowrap">
                                            Pending ({pendingItems.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="accepted" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-700 text-gray-500 font-bold hover:text-green-600 transition-colors whitespace-nowrap">
                                            Accepted ({acceptedItems.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="rejected" className="px-2 py-5 rounded-none border-b-[3px] border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-700 text-gray-500 font-bold hover:text-red-600 transition-colors whitespace-nowrap">
                                            Rejected ({rejectedItems.length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Content Sections */}
                                <div>
                                    <TabsContent value="all" className="space-y-6 mt-0">
                                        {requests.length === 0 ? (
                                            <div className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                                <p className="font-semibold text-lg text-[#004d2b]">No bargaining requests found.</p>
                                                <p className="text-sm mt-2">When buyers negotiate prices, they will appear here.</p>
                                            </div>
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

                                    <TabsContent value="pending" className="space-y-6 mt-0">
                                        {pendingItems.length === 0 ? (
                                            <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300 font-semibold">No pending bargaining requests.</p>
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

                                    <TabsContent value="accepted" className="space-y-6 mt-0">
                                        {acceptedItems.length === 0 ? (
                                            <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300 font-semibold">No accepted deals yet.</p>
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

                                    <TabsContent value="rejected" className="space-y-6 mt-0">
                                        {rejectedItems.length === 0 ? (
                                            <p className="text-center text-gray-500 py-16 bg-white rounded-2xl border border-dashed border-gray-300 font-semibold">No rejected bargaining requests.</p>
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
                            </Tabs>
                        </div>
                    )}
                </main>
            </div>
            
            <Footer2 />
        </div>
    )
}