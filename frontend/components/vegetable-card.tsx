"use client"

import { useState } from "react"
import { Star, ShoppingCart, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    const [adding, setAdding] = useState(false)

    const handleAddToCart = async () => {
        setAdding(true)
        const userId = sessionStorage.getItem("id") || "1" // Fallback to "1" for testing if not logged in

        try {
            const res = await fetch("http://localhost:8080/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    productId: vegetable.id,
                    productName: vegetable.name,
                    pricePerKg: vegetable.price1kg,
                    quantity: 1, // Default to 1kg for now
                    imageUrl: vegetable.image,
                    sellerName: vegetable.seller
                })
            })

            if (res.ok) {
                alert("Added to cart!")
            } else {
                alert("Failed to add to cart")
            }
        } catch (error) {
            console.error(error)
            alert("Error connecting to server")
        } finally {
            setAdding(false)
        }
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    {adding ? "Adding..." : "Add to Cart"}
                </Button>
            </CardContent>
        </Card>
    )
}