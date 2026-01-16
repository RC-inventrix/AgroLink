"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Percent } from "lucide-react"
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
    const [quantityKg, setQuantityKg] = useState<string>("")
    const [quantityGrams, setQuantityGrams] = useState<string>("")
    const [suggestedPrice, setSuggestedPrice] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const router = useRouter()

    // Load vegetable data from sessionStorage on component mount
    useEffect(() => {
        const storedVegetable = sessionStorage.getItem("selectedVegetable")
        if (storedVegetable) {
            try {
                const parsedVegetable = JSON. parse(storedVegetable) as Vegetable
                setVegetable(parsedVegetable)
            } catch (error) {
                console.error("Error parsing vegetable data:", error)
                router.push("/") // Redirect to home if data is invalid
            }
        } else {
            // No vegetable selected, redirect back
            router.push("/")
        }
        setIsLoading(false)
    }, [router])

    // Calculate values only if vegetable data exists
    const quantityKgNum = quantityKg === "" ? 0 : Number. parseFloat(quantityKg)
    const quantityGramsNum = quantityGrams === "" ? 0 : Number.parseInt(quantityGrams)
    const totalQuantity = quantityKgNum + quantityGramsNum / 1000

    const existingPriceForTotal = vegetable ?  totalQuantity * vegetable.price1kg : 0
    const suggestedPriceNum = suggestedPrice === "" ? 0 : Number.parseFloat(suggestedPrice)
    const priceDifference = suggestedPriceNum - existingPriceForTotal
    const discountPercentage = existingPriceForTotal > 0 ? (priceDifference / existingPriceForTotal) * 100 : 0

    const handleCancel = () => {
        setQuantityKg("")
        setQuantityGrams("")
        setSuggestedPrice("")
        router.back()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vegetable) {
            alert("No vegetable selected")
            return
        }

        if (totalQuantity <= 0 || suggestedPriceNum <= 0) {
            alert("Please enter valid quantity and price")
            return
        }

        setIsSubmitting(true)

        const bargainData = {
            vegetableId:  vegetable.id,
            vegetableName: vegetable.name,
            quantity: totalQuantity,
            suggestedPrice: suggestedPriceNum,
            sellerId: vegetable.sellerId,
        }

        console.log("Bargain request submitted:", bargainData)
        alert(`Bargain request sent!\n\nQuantity: ${totalQuantity. toFixed(3)}kg\nSuggested Price: Rs. ${suggestedPriceNum}`)

        setQuantityKg("")
        setQuantityGrams("")
        setSuggestedPrice("")
        setIsSubmitting(false)
    }

    const handleQuantityKgChange = (e: React. ChangeEvent<HTMLInputElement>) => {
        setQuantityKg(e.target.value)
    }

    const handleQuantityGramsChange = (e: React. ChangeEvent<HTMLInputElement>) => {
        setQuantityGrams(e.target.value)
    }

    const handleSuggestedPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSuggestedPrice(e.target.value)
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-green-800 text-xl">Loading...</div>
            </div>
        )
    }

    // Show error if no vegetable data
    if (!vegetable) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">No vegetable selected</p>
                    <Button onClick={() => router.push("/")} className="bg-green-700 hover:bg-green-800">
                        Go Back to Listings
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Bargain Request</h1>

                <Card className="bg-white border-green-200 shadow-lg">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Product Details Section */}
                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Product Details</h2>
                                <div className="flex gap-8">
                                    {/* Image Section */}
                                    <div className="flex-shrink-0">
                                        <div className="relative h-48 w-48 rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                                            <img
                                                src={vegetable.image || "/placeholder.svg"}
                                                alt={vegetable.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-3xl font-bold text-green-800">{vegetable.name}</h3>
                                            <p className="text-sm text-green-700 mt-2">{vegetable.description}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-green-800">
                                                <span className="font-semibold">Seller:  </span>
                                                <span>{vegetable.seller}</span>
                                            </p>
                                        </div>

                                        {/* Price Information */}
                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                            <p className="text-xs text-green-700 font-medium mb-3">Current Prices</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-green-700">Per 100g</p>
                                                    <p className="text-xl font-bold text-green-800">Rs. {vegetable.price100g}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-700">Per 1kg</p>
                                                    <p className="text-xl font-bold text-green-800">Rs. {vegetable.price1kg}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-green-200"></div>

                            {/* Form Fields Section */}
                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Your Bargain Details</h2>
                                <div className="space-y-5 bg-green-50 border border-green-200 p-6 rounded-lg">
                                    {/* Quantity in Kg */}
                                    <div>
                                        <label htmlFor="quantityKg" className="block text-sm font-semibold text-green-800 mb-2">
                                            Quantity (Kilograms) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="quantityKg"
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={quantityKg}
                                            onChange={handleQuantityKgChange}
                                            placeholder="Enter quantity in kg"
                                            className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 placeholder-green-500 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        />
                                    </div>

                                    {/* Quantity in Grams */}
                                    <div>
                                        <label htmlFor="quantityGrams" className="block text-sm font-semibold text-green-800 mb-2">
                                            Quantity (Grams) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="quantityGrams"
                                            type="number"
                                            min="0"
                                            step="1"
                                            max="999"
                                            value={quantityGrams}
                                            onChange={handleQuantityGramsChange}
                                            placeholder="Enter quantity in grams (0-999)"
                                            className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 placeholder-green-500 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        />
                                    </div>

                                    {/* Total Quantity Display */}
                                    <div className="pt-3 border-t border-green-200 bg-white rounded p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-green-800">Total Quantity:</span>
                                            <span className="text-lg font-bold text-green-800">
                                                {totalQuantity.toFixed(3)} kg ({(totalQuantity * 1000).toFixed(0)} g)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Suggested Price for Total Quantity */}
                                    <div>
                                        <label htmlFor="suggestedPrice" className="block text-sm font-semibold text-green-800 mb-2">
                                            Suggested Price for Total Quantity (Rs.) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="suggestedPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={suggestedPrice}
                                            onChange={handleSuggestedPriceChange}
                                            placeholder="Enter your suggested price for entire quantity"
                                            className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 placeholder-green-500 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                        />
                                    </div>

                                    {/* Price Information for Total Quantity */}
                                    <div className="pt-3 border-t border-green-200 bg-white rounded p-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-green-800">Existing Price for {totalQuantity.toFixed(3)}kg: </span>
                                                <span className="text-sm font-semibold text-green-800">
                                                    Rs. {existingPriceForTotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-green-800">Your Suggested Price:</span>
                                                <span className="text-sm font-semibold text-green-800">Rs. {suggestedPriceNum.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Comparison */}
                                    <div className="pt-3 border-t border-green-200">
                                        <div className="flex justify-between items-center bg-white rounded p-4">
                                            <span className="text-sm text-green-800 font-medium">Price Comparison: </span>
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4 text-green-700" />
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        discountPercentage < 0 ? "text-green-700" : "text-orange-600"
                                                    }`}
                                                >
                                                    {discountPercentage < 0
                                                        ? `${Math.abs(discountPercentage).toFixed(1)}% discount`
                                                        : `${discountPercentage.toFixed(1)}% increase`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-2 bg-white border-green-300 text-green-800 hover:bg-green-50 hover:border-green-400"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    Go Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white font-semibold transition-all active:scale-95"
                                >
                                    <Percent className="h-5 w-5" />
                                    {isSubmitting ? "Sending..." : "Bargain the Item"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}