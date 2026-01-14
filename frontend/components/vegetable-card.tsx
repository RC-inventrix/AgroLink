"use client"

import { useState, useEffect } from "react"
import { Star, ShoppingCart, Loader2, X, Check, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {useRouter} from "next/navigation";

interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    description: string
    rating: number
}

export default function VegetableCard({ vegetable }: { vegetable: Vegetable }) {
    const router = useRouter()

    const handleRedirect = () => {
        sessionStorage.setItem("selectedVegetable", JSON.stringify(vegetable));
        router.push("/VegetableList/quantity")
    }

    const [adding, setAdding] = useState(false)
    
    // --- Custom Notification State ---
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Auto-hide notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // const handleAddToCart = async () => {
    //     setAdding(true)
    //     setNotification(null)
    //     const userId = sessionStorage.getItem("id") || "1"
    //
    //     try {
    //         const res = await fetch("http://localhost:8080/cart/add", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 userId: userId,
    //                 productId: vegetable.id,
    //                 productName: vegetable.name,
    //                 pricePerKg: vegetable.price1kg,
    //                 quantity: 1,
    //                 imageUrl: vegetable.image,
    //                 sellerName: vegetable.seller
    //             })
    //         })
    //
    //         if (res.ok) {
    //             setNotification({
    //                 message: `${vegetable.name} added to cart!`,
    //                 type: 'success'
    //             });
    //         } else {
    //             setNotification({
    //                 message: "Failed to add item. Try again.",
    //                 type: 'error'
    //             });
    //         }
    //     } catch (error) {
    //         setNotification({
    //             message: "Connection error to cart service.",
    //             type: 'error'
    //         });
    //     } finally {
    //         setAdding(false)
    //     }
   // }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
            
            {/* --- COMPACT FLOATING NOTIFICATION --- */}
            {notification && (
                <div className={`absolute top-2 right-2 z-50 flex items-center gap-2 p-2 px-3 rounded-md shadow-lg border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    notification.type === 'success' 
                    ? "bg-[#03230F] border-green-500 text-white" 
                    : "bg-red-950 border-red-500 text-white"
                }`}>
                    {notification.type === 'success' ? (
                        <Check className="h-4 w-4 text-green-400" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-xs font-medium whitespace-nowrap">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-1 opacity-70 hover:opacity-100">
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
                <img
                    src={vegetable.image || "/placeholder.svg"}
                    alt={vegetable.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>

            <CardContent className="p-6">
                <div className="mb-3">
                    <CardTitle className="text-xl mb-1">{vegetable.name}</CardTitle>
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{vegetable.rating}</span>
                    </div>
                </div>

                <CardDescription className="mb-4 line-clamp-2">{vegetable.description}</CardDescription>

                <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Seller: </span>
                        {vegetable.seller}
                    </p>
                </div>

                <div className="bg-muted p-3 rounded-lg mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground">Per 100g</p>
                            <p className="text-lg font-bold text-primary">Rs. {vegetable.price100g}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Per 1kg</p>
                            <p className="text-lg font-bold text-primary">Rs. {vegetable.price1kg}</p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleRedirect}
                    disabled={adding}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 transition-all active:scale-95"
                >
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {adding ? "Adding..." : "Add to Cart"}
                </Button>
            </CardContent>
        </Card>
    )
}