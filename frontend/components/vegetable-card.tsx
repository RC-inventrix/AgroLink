"use client"

import { useState, useEffect } from "react"
import { Star, ShoppingCart, Loader2, Check, AlertCircle, MessageCircle, HandCoins, Truck, MapPin, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Updated Interface to include location fields
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
    category?: string
    pricingType?: string
    quantity: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    // --- ADDED LOCATION FIELDS ---
    pickupAddress?: string
    pickupLatitude?: number
    pickupLongitude?: number
}

export default function VegetableCard({ vegetable }: { vegetable: Vegetable }) {
    const router = useRouter()
    const [adding, setAdding] = useState(false)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleRedirect = () => {
        // The vegetable object now contains the address due to the fix in vegetable-listings.tsx
        sessionStorage.setItem("selectedVegetable", JSON.stringify(vegetable));
        router.push("/VegetableList/quantity")
    }

    const handleRedirectBargain = () => {
        sessionStorage.setItem("selectedVegetable", JSON.stringify(vegetable));
        router.push("/buyer/bargain")
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

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative flex flex-col h-full">
            {notification && (
                <div className={`absolute top-2 right-2 z-50 flex items-center gap-2 p-2 px-3 rounded-md shadow-lg border ${notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" : "bg-red-950 border-red-500 text-white"
                }`}>
                    {notification.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <span className="text-xs font-medium">{notification.message}</span>
                </div>
            )}

            <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg shrink-0">
                <img src={vegetable.image || "/placeholder.svg"} alt={vegetable.name} className="w-full h-full object-cover" />
                {vegetable.quantity <= 0 && (
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
                                    {vegetable.baseCharge && (
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
                </div>

                <div className="bg-muted p-3 rounded-lg mb-4 mt-auto">
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
                </div>

                <div className="space-y-2">
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
                </div>
            </CardContent>
        </Card>
    )
}