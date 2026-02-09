"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Percent, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

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
}

export default function BargainPage() {
    const [vegetable, setVegetable] = useState<Vegetable | null>(null)

    // Inputs
    const [quantityKg, setQuantityKg] = useState<string>("")
    const [quantityGrams, setQuantityGrams] = useState<string>("")
    const [suggestedTotal, setSuggestedTotal] = useState<string>("")

    // States for UI feedback
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [isLoading, setIsLoading] = useState(true)

    const router = useRouter()

    // Helper function to format currency with commas
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    // Helper: Prevents mouse wheel from changing numbers
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
        e.currentTarget.blur()
    }

    // Load vegetable data
    useEffect(() => {
        const storedVegetable = sessionStorage.getItem("selectedVegetable")
        if (storedVegetable) {
            try {
                const parsedVegetable = JSON.parse(storedVegetable) as Vegetable
                setVegetable(parsedVegetable)
            } catch (error) {
                console.error("Error parsing vegetable data:", error)
                router.push("/")
            }
        } else {
            router.push("/")
        }
        setIsLoading(false)
    }, [router])

    // --- Calculations ---
    const quantityKgNum = quantityKg === "" ? 0 : Number.parseFloat(quantityKg)
    const quantityGramsNum = quantityGrams === "" ? 0 : Number.parseInt(quantityGrams)

    const totalQuantityKg = quantityKgNum + quantityGramsNum / 1000
    const existingPriceForTotal = vegetable ? totalQuantityKg * vegetable.price1kg : 0

    const suggestedTotalNum = suggestedTotal === "" ? 0 : Number.parseFloat(suggestedTotal)

    const priceDifference = suggestedTotalNum - existingPriceForTotal
    const discountPercentage = existingPriceForTotal > 0 ? (priceDifference / existingPriceForTotal) * 100 : 0

    const handleCancel = () => {
        setQuantityKg("")
        setQuantityGrams("")
        setSuggestedTotal("")
        router.back()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vegetable) return

        if (totalQuantityKg <= 0 || suggestedTotalNum <= 0) {
            alert("Please enter valid quantity and price")
            return
        }

        setIsSubmitting(true)

        // 1. Get the current user's name from sessionStorage
        // (Adjust the key "user" if you saved it under a different name like "currentUser")
        // 1. Get the user email directly (NO JSON.parse needed)
        // This assumes you stored it like: sessionStorage.setItem("userEmail", "test@gmail.com")
        const currentBuyerName = sessionStorage.getItem("userEmail") || "Guest Buyer"
        const currentUserId = sessionStorage.getItem("id") || "1";
        // if (storedUser) {
        //     try {
        //         const parsedUser = JSON.parse(storedUser)
        //         // specific field might be .name, .fullName, or .username depending on your login logic
        //         currentBuyerName = parsedUser.name || parsedUser.fullName || "Guest Buyer"
        //     } catch (err) {
        //         console.error("Could not parse user data", err)
        //     }
        // }

        // 2. Prepare Payload with ALL required fields
        const bargainData = {
            vegetableId: vegetable.id,
            vegetableName: vegetable.name,
            vegetableImage: vegetable.image,
            quantity: totalQuantityKg,
            suggestedPrice: suggestedTotalNum, // Correct field name
            originalPricePerKg: vegetable.price1kg,
            sellerId: vegetable.sellerId,
            buyerName: currentBuyerName // <--- Added buyerName here
        }

        try {
            const response = await fetch('http://localhost:8080/api/bargains/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': currentUserId,
                },
                body: JSON.stringify(bargainData),
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            setSubmitStatus('success')

            setTimeout(() => {
                router.push("/VegetableList")
            }, 2000)

        } catch (error) {
            console.error("Submission failed:", error)
            setSubmitStatus('error')

            setTimeout(() => {
                setSubmitStatus('idle')
                setIsSubmitting(false)
            }, 3000)
        }
    }

    // Loading Screen
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-green-800 text-xl animate-pulse">Loading vegetable details...</div>
            </div>
        )
    }

    // No Data Screen
    if (!vegetable) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">No vegetable selected</p>
                    <Button onClick={() => router.push("/VegetableList")} className="bg-green-700 hover:bg-green-800">
                        Go Back to Listings
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8 relative">

            {/* SUCCESS / ERROR OVERLAY */}
            {submitStatus !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <Card className={`w-full max-w-md shadow-2xl border-0 bg-white`}>
                        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">

                            {submitStatus === 'success' ? (
                                <>
                                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-2 animate-bounce">
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-green-800">Bargain Sent!</h2>
                                    <p className="text-green-700">
                                        Your offer of <span className="font-bold">Rs. {formatCurrency(suggestedTotalNum)}</span> has been sent to the seller.
                                    </p>
                                    <p className="text-sm text-gray-500 mt-4">Redirecting you to listings...</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-2">
                                        <XCircle className="h-12 w-12 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-red-800">Request Failed</h2>
                                    <p className="text-gray-600">
                                        We couldn't reach the server. Please check your connection or try again.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-4">Reloading form...</p>
                                </>
                            )}

                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Bargain Request</h1>

                <Card className="bg-white border-green-200 shadow-lg">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Product Details Section */}
                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Product Details</h2>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0 mx-auto md:mx-0">
                                        <div className="relative h-48 w-48 rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                                            <img
                                                src={vegetable.image || "/placeholder.svg"}
                                                alt={vegetable.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-3xl font-bold text-green-800">{vegetable.name}</h3>
                                            <p className="text-sm text-green-700 mt-2">{vegetable.description}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-green-800">
                                                <span className="font-semibold">Seller: </span>
                                                <span>{vegetable.seller}</span>
                                            </p>
                                        </div>

                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                            <p className="text-xs text-green-700 font-medium mb-3">Store Prices</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-green-700">Per 100g</p>
                                                    <p className="text-xl font-bold text-green-800">
                                                        Rs. {vegetable.price100g.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-700">Per 1kg</p>
                                                    <p className="text-xl font-bold text-green-800">
                                                        Rs. {vegetable.price1kg.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-green-200"></div>

                            {/* Bargain Section */}
                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Your Offer</h2>
                                <div className="space-y-5 bg-green-50 border border-green-200 p-6 rounded-lg">

                                    {/* Quantity Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="quantityKg" className="block text-sm font-semibold text-green-800 mb-2">
                                                Quantity (Kilograms)
                                            </label>
                                            <input
                                                id="quantityKg"
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={quantityKg}
                                                onChange={(e) => setQuantityKg(e.target.value)}
                                                onWheel={handleWheel}
                                                disabled={isSubmitting}
                                                placeholder="0"
                                                className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="quantityGrams" className="block text-sm font-semibold text-green-800 mb-2">
                                                Quantity (Grams)
                                            </label>
                                            <input
                                                id="quantityGrams"
                                                type="number"
                                                min="0"
                                                step="1"
                                                max="999"
                                                value={quantityGrams}
                                                onChange={(e) => setQuantityGrams(e.target.value)}
                                                onWheel={handleWheel}
                                                disabled={isSubmitting}
                                                placeholder="0"
                                                className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Calculated Quantity Display */}
                                    <div className="p-4 bg-white rounded border border-green-100 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-green-800">Total Weight:</span>
                                        <span className="text-lg font-bold text-green-800">
                      {totalQuantityKg.toFixed(3)} kg
                    </span>
                                    </div>

                                    {/* Price Input (Total Amount) */}
                                    <div>
                                        <label htmlFor="suggestedTotal" className="block text-sm font-semibold text-green-800 mb-2">
                                            I want to pay this Total Amount (Rs.) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="suggestedTotal"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={suggestedTotal}
                                            onChange={(e) => setSuggestedTotal(e.target.value)}
                                            onWheel={handleWheel}
                                            disabled={isSubmitting}
                                            placeholder="e.g. 1500"
                                            className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Calculations & Comparison */}
                                    <div className="bg-white rounded p-4 border border-green-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-green-800">Store Price for this weight:</span>
                                            <span className="text-sm font-semibold text-green-800">
                        Rs. {formatCurrency(existingPriceForTotal)}
                      </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                            <span className="text-sm text-green-800 font-medium">Your Discount Request:</span>
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4 text-green-700" />
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        discountPercentage < 0 ? "text-green-700" : "text-orange-600"
                                                    }`}
                                                >
                          {discountPercentage < 0
                              ? `${Math.abs(discountPercentage).toFixed(1)}% OFF`
                              : `${discountPercentage.toFixed(1)}% MORE`
                          }
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="flex-1 border-green-300 text-green-800 hover:bg-green-50"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-orange-700 hover:bg-orange-800 text-white transition-all active:scale-95"
                                >
                                    <Percent className="h-5 w-5 mr-2" />
                                    {isSubmitting ? "Sending..." : "Submit Offer"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}