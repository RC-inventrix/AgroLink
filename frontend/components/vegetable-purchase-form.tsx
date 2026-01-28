"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ShoppingCart, Loader2, X, Check, AlertCircle, MapPin, Truck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {router} from "next/client";
import {useRouter} from "next/navigation";
import {Router} from "next/router";
import LocationPicker from "@/components/LocationPicker"
import { calculateDistance, calculateDeliveryFee } from "@/lib/geo-utils"

interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    description: string
    rating: number
    sellerId: number
    // New fields
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    sellerLatitude?: number
    sellerLongitude?: number
}

export default function VegetablePurchaseForm({ vegetable }: { vegetable: Vegetable }) {
    // CHANGE 1: Initialize state as a string ("1") instead of a number (1)
    // This allows the input to be completely empty ("") while typing
    const router = useRouter()
    const [quantity, setQuantity] = useState<string>("1")

    const [adding, setAdding] = useState(false)
    const [notification, setNotification] = useState<{
        message: string
        type: "success" | "error"
    } | null>(null)

    // Delivery address state
    const [showLocationPicker, setShowLocationPicker] = useState(false)
    const [deliveryLocation, setDeliveryLocation] = useState({
        province: "",
        district: "",
        city: "",
        streetAddress: "",
        latitude: null as number | null,
        longitude: null as number | null,
    })
    const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null)
    const [deliveryFee, setDeliveryFee] = useState<number>(0)

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    // Calculate delivery fee when location changes
    useEffect(() => {
        if (
            vegetable.deliveryAvailable &&
            vegetable.sellerLatitude &&
            vegetable.sellerLongitude &&
            deliveryLocation.latitude &&
            deliveryLocation.longitude &&
            vegetable.baseCharge !== undefined &&
            vegetable.extraRatePerKm !== undefined
        ) {
            const distance = calculateDistance(
                vegetable.sellerLatitude,
                vegetable.sellerLongitude,
                deliveryLocation.latitude,
                deliveryLocation.longitude
            )
            setDeliveryDistance(distance)
            const fee = calculateDeliveryFee(distance, vegetable.baseCharge, vegetable.extraRatePerKm)
            setDeliveryFee(fee)
        } else {
            setDeliveryDistance(null)
            setDeliveryFee(0)
        }
    }, [deliveryLocation, vegetable])

    // CHANGE 2: Helper to safely get the number for calculations
    const getQuantityNumber = () => {
        const num = parseFloat(quantity)
        return isNaN(num) ? 0 : num
    }

    const calculateTotalPrice = () => {
        const qty = getQuantityNumber()
        const itemTotal = vegetable.price1kg * qty
        const total = itemTotal + deliveryFee
        return total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const calculateItemTotal = () => {
        const qty = getQuantityNumber()
        const total = vegetable.price1kg * qty
        return total.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    // CHANGE 3: Updated Handler allows empty strings
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Allow user to clear the input completely
        if (value === "") {
            setQuantity("")
            return
        }

        // Only allow positive numbers (regex ensures standard number format)
        if (/^\d*\.?\d*$/.test(value)) {
            setQuantity(value)
        }
    }



    const handleReirectToProductList=()=>{
        router.push("/VegetableList")
    }

    const handleAddToCart = async () => {
        // CHANGE 4: Validate before sending
        const finalQuantity = getQuantityNumber()

        if (finalQuantity <= 0) {
            setNotification({
                message: "Please enter a valid quantity greater than 0",
                type: "error"
            })
            return
        }

        // Validate delivery location if delivery is available
        if (vegetable.deliveryAvailable && !deliveryLocation.latitude) {
            setNotification({
                message: "Please select a delivery address",
                type: "error"
            })
            return
        }

        setAdding(true)
        setNotification(null)
        const userId = sessionStorage.getItem("id") || "1"

        try {
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
                    sellerId: vegetable.sellerId,
                    // Add delivery info
                    deliveryFee: deliveryFee,
                    deliveryAddress: deliveryLocation.city 
                        ? `${deliveryLocation.streetAddress}, ${deliveryLocation.city}, ${deliveryLocation.district}` 
                        : "",
                    distance: deliveryDistance || 0
                }),
            })

            if (res.ok) {
                setNotification({
                    message: `${finalQuantity}kg of ${vegetable.name} added to cart!`,
                    type: "success",
                })
                // Optional: Reset to "1" after success, or keep as is
                setQuantity("1")
               setTimeout(()=>{
                   handleReirectToProductList()
               },3000)

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
                    className={`absolute top-4 right-4 z-5  0 flex items-center gap-2 p-3 px-4 rounded-md shadow-lg border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
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
                        {/* Delivery Address Section */}
                        {vegetable.deliveryAvailable && (
                            <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-bold text-black">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        Delivery Address
                                    </label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowLocationPicker(!showLocationPicker)}
                                        className="text-xs"
                                    >
                                        {deliveryLocation.city ? "Change" : "Select"} Address
                                    </Button>
                                </div>

                                {deliveryLocation.city ? (
                                    <div className="text-sm text-gray-700">
                                        <p className="font-semibold">{deliveryLocation.city}, {deliveryLocation.district}</p>
                                        <p className="text-xs">{deliveryLocation.streetAddress}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No address selected</p>
                                )}

                                {showLocationPicker && (
                                    <div className="mt-4 animate-in fade-in duration-300">
                                        <LocationPicker
                                            value={deliveryLocation}
                                            onChange={setDeliveryLocation}
                                            variant="light"
                                            showStreetAddress={true}
                                            required={false}
                                            label=""
                                        />
                                    </div>
                                )}

                                {/* Delivery Info Display */}
                                {deliveryDistance !== null && deliveryFee > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-300 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">Distance:</span>
                                            <span className="font-semibold">{deliveryDistance} km</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">
                                                <Truck className="inline w-3 h-3 mr-1" />
                                                Delivery Fee:
                                            </span>
                                            <span className="font-bold text-black">Rs. {deliveryFee.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-2 border-black rounded-lg p-4">
                            <label htmlFor="quantity" className="block text-sm font-bold text-black mb-2">
                                Quantity (kg)
                            </label>
                            <input
                                id="quantity"
                                type="number" // Still use type="number" for mobile keyboard
                                min="0"
                                step="any" // Allows decimals smoothly
                                value={quantity} // Binds to our string state
                                onChange={handleQuantityChange}
                                placeholder="Enter quantity"
                                className="w-full px-4 py-2 border-2 border-black rounded-md text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        <div className="bg-black text-white rounded-lg p-4">
                            <p className="text-sm text-gray-300 mb-2">Order Summary</p>
                            <div className="space-y-2 mb-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Item Total:</span>
                                    <span>Rs. {calculateItemTotal()}</span>
                                </div>
                                {deliveryFee > 0 && (
                                    <div className="flex justify-between">
                                        <span>Delivery Fee:</span>
                                        <span>Rs. {deliveryFee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-600 pt-2"></div>
                            </div>
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