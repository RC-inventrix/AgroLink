"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ShoppingCart, Loader2, X, Check, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Updated interface to include the critical sellerId field
interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    sellerId: number; // Added to fix backend NullPointerException
    description: string
    rating: number
}

export default function VegetablePurchaseForm({ vegetable }: { vegetable: Vegetable }) {
    const router = useRouter()
    const [quantity, setQuantity] = useState<string>("1")
    const [adding, setAdding] = useState(false)
    const [notification, setNotification] = useState<{
        message: string
        type: "success" | "error"
    } | null>(null)

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    const getQuantityNumber = () => {
        const num = parseFloat(quantity)
        return isNaN(num) ? 0 : num
    }

    const calculateTotalPrice = () => {
        const qty = getQuantityNumber()
        const total = vegetable.price1kg * qty
        return total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === "") {
            setQuantity("")
            return
        }
        if (/^\d*\.?\d*$/.test(value)) {
            setQuantity(value)
        }
    }

    const handleReirectToProductList = () => {
        router.push("/VegetableList")
    }

    const handleAddToCart = async () => {
        const finalQuantity = getQuantityNumber()

        if (finalQuantity <= 0) {
            setNotification({
                message: "Please enter a valid quantity greater than 0",
                type: "error"
            })
            return
        }

        setAdding(true)
        setNotification(null)
        const userId = sessionStorage.getItem("id") || "1"

        try {
            // This request body now includes the sellerId to prevent backend crashes
            const res = await fetch("http://localhost:8080/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    productId: vegetable.id,
                    productName: vegetable.name,
                    pricePerKg: vegetable.price1kg,
                    quantity: finalQuantity,
                    imageUrl: vegetable.image,
                    sellerName: vegetable.seller,
                    sellerId: vegetable.sellerId, // CRITICAL FIX: Sends the seller ID to the database
                }),
            })

            if (res.ok) {
                setNotification({
                    message: `${finalQuantity}kg of ${vegetable.name} added to cart!`,
                    type: "success",
                })
                setQuantity("1")
                setTimeout(() => {
                    handleReirectToProductList()
                }, 2000)

            } else {
                setNotification({
                    message: "Failed to add item. Try again.",
                    type: "error",
                })
            }
        } catch (error) {
            setNotification({
                message: "Connection error to cart service.",
                type: "error",
            })
        } finally {
            setAdding(false)
        }
    }

    return (
        <Card className="overflow-hidden border-2 border-black bg-white relative max-w-2xl">
            {notification && (
                <div
                    className={`absolute top-4 right-4 z-50 flex items-center gap-2 p-3 px-4 rounded-md shadow-lg border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
                        notification.type === "success" ? "bg-white border-black text-black" : "bg-black border-red-600 text-white"
                    }`}
                >
                    {notification.type === "success" ? (
                        <Check className="h-5 w-5 text-black" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 opacity-70 hover:opacity-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                <div>
                    <div className="relative h-80 bg-gray-100 overflow-hidden rounded-lg border-2 border-black">
                        <img
                            src={vegetable.image || "/placeholder.svg"}
                            alt={vegetable.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-black mb-2">{vegetable.name}</h1>
                        <p className="text-sm text-gray-700 mb-4 font-medium">
                            Seller: <span className="text-black font-bold">{vegetable.seller}</span>
                        </p>

                        <div className="bg-gray-100 border-2 border-black rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 uppercase">Per 100g</p>
                                    <p className="text-2xl font-bold text-black">Rs. {vegetable.price100g}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 uppercase">Per 1kg</p>
                                    <p className="text-2xl font-bold text-black">Rs. {vegetable.price1kg}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm line-clamp-3 mb-6">{vegetable.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="border-2 border-black rounded-lg p-4">
                            <label htmlFor="quantity" className="block text-sm font-bold text-black mb-2">
                                Quantity (kg)
                            </label>
                            <input
                                id="quantity"
                                type="number"
                                min="0"
                                step="any"
                                value={quantity}
                                onChange={handleQuantityChange}
                                placeholder="Enter quantity"
                                className="w-full px-4 py-2 border-2 border-black rounded-md text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="bg-black text-white rounded-lg p-4">
                            <p className="text-sm text-gray-300 mb-2">Total Price</p>
                            <p className="text-3xl font-bold">Rs. {calculateTotalPrice()}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                {quantity || 0} kg @ Rs. {vegetable.price1kg}/kg
                            </p>
                        </div>

                        <Button
                            onClick={handleAddToCart}
                            disabled={adding}
                            className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 rounded-lg border-2 border-black flex items-center gap-2 transition-all active:scale-95 text-base"
                        >
                            {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                            {adding ? "Adding to Cart..." : "Add to Cart"}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}