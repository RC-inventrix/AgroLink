/* fileName: page.tsx */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HorizontalBargainCard } from "@/components/horizontal-bargain-card"
import { Loader2, CheckCircle2, XCircle, Handshake } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import BuyerHeader from "@/components/headers/BuyerHeader"
import Footer2 from "@/components/footer/Footer"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Updated Interface to include Delivery, Location, and Coordinates Data
interface BargainItem {
    id: string
    name: string
    seller: string
    sellerId: string 
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
    buyerLatitude: number | null
    buyerLongitude: number | null
}

export default function BuyerBargainPage() {
    const { t } = useLanguage(); // Initialized the hook
    const [items, setItems] = useState<BargainItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [addedToCartIds, setAddedToCartIds] = useState<string[]>([])
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null)
    const [navUnread, setNavUnread] = useState(0) 

    const router = useRouter()

    useEffect(() => {
        const currentUserId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")

        if (!currentUserId) {
            console.error("No user ID found.")
            setIsLoading(false)
            return
        }

        const fetchBargainsAndCartState = async () => {
            try {
                // Fetch both the bargain history and the current user's cart in parallel
                const [bargainsRes, cartRes] = await Promise.all([
                    fetch(`${API_URL}/api/bargains/buyer/${currentUserId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/cart/${currentUserId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                // 1. Map existing Cart Items to find which Bargains have already been converted to Cart Items
                if (cartRes.ok) {
                    const cartData = await cartRes.json();
                    const cartBargainIds = cartData
                        .filter((cartItem: any) => cartItem.bargainId != null)
                        .map((cartItem: any) => cartItem.bargainId.toString());
                    setAddedToCartIds(cartBargainIds);
                }

                // 2. Map Bargain History
                if (bargainsRes.ok) {
                    const data = await bargainsRes.json()

                    const mappedData: BargainItem[] = data.map((item: any) => ({
                        id: item.id.toString(),
                        name: item.vegetableName,
                        seller: `Farmer #${item.sellerId}`, // Default if name service is unavailable
                        sellerId: item.sellerId.toString(),
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
                        vegetableId: item.vegetableId.toString(),

                        // Logistics & Coordinates Mapped Here
                        deliveryRequired: item.deliveryRequired || false,
                        buyerAddress: item.buyerAddress || t("bargainBuyerPickupFarm"),
                        deliveryFee: item.deliveryFee || 0,
                        buyerLatitude: item.buyerLatitude || null,
                        buyerLongitude: item.buyerLongitude || null
                    }))

                    setItems(mappedData)
                }
            } catch (error) {
                console.error("Error fetching bargains:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBargainsAndCartState()
    }, [router, t])

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
            const res = await fetch(`${API_URL}/api/bargains/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id))
                showNotification(t("bargainBuyerMsgRemoved"), "success")
            }
        } catch (error) {
            console.error("Error deleting bargain:", error)
            showNotification(t("bargainBuyerMsgRemoveFail"), "error")
        }
    }

    const handleAddToCart = async (item: BargainItem) => {
        const currentUserId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")

        if (!currentUserId) {
            showNotification(t("bargainBuyerMsgLoginReq"), "error")
            return
        }

        if (item.deliveryRequired && (!item.buyerAddress || item.buyerAddress === "Pickup at Farm" || item.buyerAddress === t("bargainBuyerPickupFarm"))) {
            showNotification(t("bargainBuyerMsgMissingDel"), "error")
            return
        }

        const bargainedPricePerKg = item.requestedPrice / item.requestedQuantityKg
        const addressParts = item.buyerAddress ? item.buyerAddress.split(',').map(s => s.trim()) : [];
        const streetAddress = addressParts.length > 0 ? addressParts[0] : "N/A";
        const city = addressParts.length > 1 ? addressParts[1] : "N/A";

        const cartPayload = {
            userId: parseInt(currentUserId),
            buyerName: sessionStorage.getItem("name") || "Buyer",
            productId: parseInt(item.vegetableId),
            productName: item.name,
            pricePerKg: bargainedPricePerKg,
            quantity: item.requestedQuantityKg,
            imageUrl: item.image,
            sellerId: parseInt(item.sellerId),
            sellerName: item.seller,

            bargainId: parseInt(item.id),
            agreedPrice: item.requestedPrice,
            productPrice: item.requestedPrice,
            totalPrice: item.requestedPrice + item.deliveryFee,

            deliveryFee: item.deliveryFee,
            buyerAddress: item.buyerAddress,
            buyerStreetAddress: streetAddress,
            buyerCity: city,
            buyerLatitude: item.buyerLatitude,
            buyerLongitude: item.buyerLongitude
        }

        try {
            const res = await fetch(`${API_URL}/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(cartPayload)
            })

            if (res.ok) {
                setAddedToCartIds(prev => [...prev, item.id])
                showNotification(t("bargainBuyerMsgAddedCart"), "success")
            } else {
                showNotification(t("bargainBuyerMsgAddFail"), "error")
            }
        } catch (error) {
            console.error("Error adding to cart:", error)
            showNotification(t("bargainBuyerMsgServerError"), "error")
        }
    }

    const handleBargainAgain = (item: BargainItem) => {
        router.push("/VegetableList");
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <BuyerHeader />

            {notification && (
                <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-6 duration-300 ${
                    notification.type === 'success' ? 'bg-white text-green-800 border border-green-500' : 'bg-white text-red-800 border border-red-500'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> : <XCircle className="w-5 h-5 text-red-500 shrink-0"/>}
                    <span className="font-bold text-sm tracking-wide">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-1">
                <DashboardNav unreadCount={navUnread} />

                <main className="flex-1 w-full overflow-hidden flex flex-col p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto w-full">
                        
                        <div className="bg-[#03230F] rounded-[2rem] p-8 mb-8 text-white flex items-center gap-6 shadow-lg">
                            <div className="bg-[#EEC044] p-4 rounded-2xl flex-shrink-0">
                                <Handshake className="w-10 h-10 text-[#03230F]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight mb-1 text-white">{t("bargainBuyerTitle")}</h1>
                                <p className="text-gray-300 font-medium">{t("bargainBuyerSubtitle")}</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col min-h-[40vh] items-center justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-[#EEC044] mb-4 shrink-0" />
                                <p className="text-[#03230F] font-bold text-lg">{t("bargainBuyerLoading")}</p>
                            </div>
                        ) : (
                            <Tabs defaultValue="all" className="w-full">
                                <TabsList className="flex w-full h-14 p-0 bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm mb-6 no-scrollbar">
                                    <TabsTrigger 
                                        value="all" 
                                        className="flex-1 h-full rounded-none border border-transparent border-r-gray-200 last:border-r-transparent data-[state=active]:border-[#03230F] data-[state=active]:text-[#03230F] data-[state=active]:z-10 text-gray-500 font-bold transition-all bg-transparent hover:bg-gray-50 whitespace-nowrap px-4"
                                    >
                                        {t("bargainBuyerTabAll")} ({items.length})
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="in-progress" 
                                        className="flex-1 h-full rounded-none border border-transparent border-r-gray-200 last:border-r-transparent data-[state=active]:border-[#EEC044] data-[state=active]:text-[#EEC044] data-[state=active]:z-10 text-gray-500 font-bold transition-all bg-transparent hover:bg-gray-50 whitespace-nowrap px-4"
                                    >
                                        {t("bargainBuyerTabPending")} ({pendingItems.length})
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="accepted" 
                                        className="flex-1 h-full rounded-none border border-transparent border-r-gray-200 last:border-r-transparent data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:z-10 text-gray-500 font-bold transition-all bg-transparent hover:bg-gray-50 whitespace-nowrap px-4"
                                    >
                                        {t("bargainBuyerTabAccepted")} ({acceptedItems.length})
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="rejected" 
                                        className="flex-1 h-full rounded-none border border-transparent border-r-gray-200 last:border-r-transparent data-[state=active]:border-red-600 data-[state=active]:text-red-600 data-[state=active]:z-10 text-gray-500 font-bold transition-all bg-transparent hover:bg-gray-50 whitespace-nowrap px-4"
                                    >
                                        {t("bargainBuyerTabRejected")} ({rejectedItems.length})
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="added-to-cart" 
                                        className="flex-1 h-full rounded-none border border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:z-10 text-gray-500 font-bold transition-all bg-transparent hover:bg-gray-50 whitespace-nowrap px-4"
                                    >
                                        {t("bargainBuyerTabAddedToCart")} ({addedToCartItems.length})
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-4">
                                    <TabsContent value="all" className="space-y-6">
                                        {items.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                                <p className="text-[#03230F] font-bold text-lg mb-1">{t("bargainBuyerEmptyAllTitle")}</p>
                                                <p className="text-gray-500 text-sm">{t("bargainBuyerEmptyAllDesc")}</p>
                                            </div>
                                        ) : (
                                            items.map((item) => (
                                                <HorizontalBargainCard
                                                    key={item.id}
                                                    item={item}
                                                    status={getEffectiveStatus(item)}
                                                    hideActions={true}
                                                />
                                            ))
                                        )}
                                    </TabsContent>

                                    <TabsContent value="in-progress" className="space-y-6">
                                        {pendingItems.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                                <p className="text-[#03230F] font-bold text-lg mb-1">{t("bargainBuyerEmptyPendingTitle")}</p>
                                                <p className="text-gray-500 text-sm">{t("bargainBuyerEmptyPendingDesc")}</p>
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

                                    <TabsContent value="accepted" className="space-y-6">
                                        {acceptedItems.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                                <p className="text-[#03230F] font-bold text-lg mb-1">{t("bargainBuyerEmptyAcceptedTitle")}</p>
                                                <p className="text-gray-500 text-sm">{t("bargainBuyerEmptyAcceptedDesc")}</p>
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

                                    <TabsContent value="rejected" className="space-y-6">
                                        {rejectedItems.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                                <p className="text-[#03230F] font-bold text-lg mb-1">{t("bargainBuyerEmptyRejectedTitle")}</p>
                                                <p className="text-gray-500 text-sm">{t("bargainBuyerEmptyRejectedDesc")}</p>
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

                                    <TabsContent value="added-to-cart" className="space-y-6">
                                        {addedToCartItems.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                                <p className="text-[#03230F] font-bold text-lg mb-1">{t("bargainBuyerEmptyCartTitle")}</p>
                                                <p className="text-gray-500 text-sm">{t("bargainBuyerEmptyCartDesc")}</p>
                                            </div>
                                        ) : (
                                            addedToCartItems.map((item) => (
                                                <HorizontalBargainCard
                                                    key={item.id}
                                                    item={item}
                                                    status="added-to-cart"
                                                />
                                            ))
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        )}
                    </div>
                </main>
            </div>
            
            <Footer2 />
        </div>
    )
}