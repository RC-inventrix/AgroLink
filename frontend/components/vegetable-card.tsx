"use client"

import { useState, useEffect } from "react"
import { Star, ShoppingCart, Loader2, Check, AlertCircle, MessageCircle, HandCoins, Truck, MapPin, Package, Gavel, Timer } from "lucide-react"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    sellerId: string
    description: string
    rating: number
    category: string
    pricingType: string
    quantity: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupAddress?: string
    pickupLatitude?: number
    pickupLongitude?: number
    // Auction fields
    isAuction?: boolean
    currentBid?: number
    startingPrice?: number
    endTime?: string
    bidCount?: number
}

// Added onPlaceBid prop to the component signature
export default function VegetableCard({
                                          vegetable,
                                          onPlaceBid
                                      }: {
    vegetable: Vegetable,
    onPlaceBid?: (veg: Vegetable) => void
}) {
    const router = useRouter()
    const [adding, setAdding] = useState(false)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleRedirect = () => {
        sessionStorage.setItem("selectedVegetable", JSON.stringify(vegetable));
        router.push("/VegetableList/quantity")
    }

    const handleRedirectBargain = () => {
        sessionStorage.setItem("selectedVegetable", JSON.stringify(vegetable));
        router.push("/buyer/bargain")
    }

    const handleBidClick = () => {
        if (onPlaceBid) {
            onPlaceBid(vegetable);
        } else {
            // Fallback for standalone usage
            router.push(`/auction/${vegetable.id}`)
        }
    }

    const handleContactSeller = () => {
        router.push(`/buyer/chat?userId=${vegetable.sellerId}`);
    }

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Format remaining time for auctions
    const getAuctionTimeStatus = (endTime?: string) => {
        if (!endTime) return null;
        const end = new Date(endTime);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return <span className="text-red-600 font-bold">Ended</span>;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return <span className="text-orange-600 font-medium">{days} days left</span>;
        return <span className="text-orange-600 font-medium">{hours} hours left</span>;
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full border-border">
            {notification && (
                <div className={`absolute top-2 right-2 z-50 flex items-center gap-2 p-2 px-3 rounded-md shadow-lg border ${notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" : "bg-red-950 border-red-500 text-white"
                }`}>
                    {notification.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span className="text-xs font-medium">{notification.message}</span>
                </div>
            )}

            <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg shrink-0">
                <img src={vegetable.image || "/placeholder.svg"} alt={vegetable.name} className="w-full h-full object-cover" />

                {/* Auction Badge */}
                {vegetable.isAuction && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                        <Gavel className="h-3 w-3" />
                        AUCTION
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {!vegetable.isAuction && vegetable.quantity <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold px-3 py-1 border-2 border-white rounded">OUT OF STOCK</span>
                    </div>
                )}
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
                <div className="mb-2 flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl mb-1">{vegetable.name}</CardTitle>
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">{vegetable.rating}</span>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="outline" size="icon" className="rounded-full border-primary/20 text-primary w-8 h-8"
                            onClick={handleContactSeller}
                            title="Chat with Farmer"
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="mb-3">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Farmer: </span>
                        <span className="hover:underline hover:text-green-950">
                            <Link href={`/user/${vegetable.sellerId}?role=SELLER`}>{vegetable.seller}</Link>
                        </span>
                    </p>
                </div>

                <CardDescription className="mb-4 line-clamp-2 text-xs">{vegetable.description}</CardDescription>

                <div className="mb-4 space-y-2 text-sm bg-muted/40 p-2 rounded-lg border border-border/50">
                    <div className="flex items-start gap-2">
                        {vegetable.deliveryAvailable ? (
                            <>
                                <Truck className="h-4 w-4 text-green-700 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium text-green-700 block">Delivery Available</span>
                                    {!vegetable.isAuction && vegetable.baseCharge && (
                                        <span className="text-xs text-muted-foreground block">
                                            Base: Rs.{vegetable.baseCharge} {vegetable.extraRatePerKm ? `+ Rs.${vegetable.extraRatePerKm}/km` : ''}
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <MapPin className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                                <span className="font-medium text-orange-600">Pickup Only</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>Available: <span className="font-semibold">{vegetable.quantity} kg</span></span>
                    </div>

                    {vegetable.isAuction && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                            <Timer className="h-4 w-4 text-blue-600 shrink-0" />
                            <span className="text-xs">{getAuctionTimeStatus(vegetable.endTime)}</span>
                        </div>
                    )}
                </div>

                {/* Conditional Pricing Display */}
                <div className={`bg-muted p-3 rounded-lg mb-4 mt-auto ${vegetable.isAuction ? 'bg-blue-50/50 border border-blue-100' : ''}`}>
                    {vegetable.isAuction ? (
                        <div className="flex flex-col gap-1 text-center">
                            <p className="text-[10px] uppercase text-muted-foreground tracking-wide">
                                {vegetable.currentBid ? "Current Highest Bid" : "Starting Bid"}
                            </p>
                            <p className="text-xl font-bold text-blue-700">
                                Rs. {(vegetable.currentBid || vegetable.startingPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {vegetable.bidCount || 0} bids placed
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Per 100g</p>
                                <p className="text-lg font-bold text-primary">Rs. {vegetable.price100g.toFixed(2)}</p>
                            </div>
                            <div className="border-l border-border/50">
                                <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Per 1kg</p>
                                <p className="text-lg font-bold text-primary">Rs. {vegetable.price1kg.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conditional Action Buttons */}
                <div className="space-y-2">
                    {vegetable.isAuction ? (
                        <Button
                            onClick={handleBidClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                        >
                            <Gavel className="h-4 w-4" />
                            Place Bid
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={handleRedirect}
                                disabled={adding || vegetable.quantity <= 0}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 transition-all active:scale-95"
                            >
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                                {adding ? "Adding..." : "Add to Cart"}
                            </Button>
                            <Button
                                onClick={handleRedirectBargain}
                                disabled={vegetable.quantity <= 0}
                                variant="outline"
                                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <HandCoins className="h-4 w-4" />
                                Bargain
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}