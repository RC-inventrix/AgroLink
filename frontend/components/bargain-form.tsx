"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, ArrowLeft, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Vegetable {
    id: string
    name: string
    image:  string
    price100g: number
    price1kg: number
    seller: string
    sellerId: string
    description: string
    rating: number
}

interface BargainFormProps {
    vegetable?:  Vegetable // Made optional since we can load from sessionStorage
    onClose:  () => void
    onSubmit?:  (data: BargainRequestData) => void
}

export interface BargainRequestData {
    vegetableId: string
    vegetableName: string
    quantity:  number
    suggestedPrice:  number
    sellerId: string
}

export default function BargainForm({ vegetable:  propVegetable, onClose, onSubmit }: BargainFormProps) {
    const [vegetable, setVegetable] = useState<Vegetable | null>(propVegetable || null)
    const [quantityKg, setQuantityKg] = useState<number>(0)
    const [quantityGrams, setQuantityGrams] = useState<number>(0)
    const [suggestedPrice, setSuggestedPrice] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(! propVegetable)
    const router = useRouter()

    // Load vegetable data from sessionStorage if not passed as prop
    useEffect(() => {
        if (! propVegetable) {
            const storedVegetable = sessionStorage.getItem("selectedVegetable")
            if (storedVegetable) {
                try {
                    const parsedVegetable = JSON.parse(storedVegetable) as Vegetable
                    setVegetable(parsedVegetable)
                    setSuggestedPrice(parsedVegetable.price1kg) // Set initial suggested price
                } catch (error) {
                    console.error("Error parsing vegetable data:", error)
                }
            }
        } else {
            setSuggestedPrice(propVegetable.price1kg)
        }
        setIsLoading(false)
    }, [propVegetable])

    const totalQuantity = quantityKg + quantityGrams / 1000

    const handleGoBack = () => {
        router.back()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vegetable) {
            alert("No vegetable data available")
            return
        }

        if (totalQuantity <= 0 || suggestedPrice <= 0) {
            alert("Please enter valid quantity and price")
            return
        }

        setIsSubmitting(true)

        const bargainData: BargainRequestData = {
            vegetableId: vegetable.id,
            vegetableName: vegetable. name,
            quantity: totalQuantity,
            suggestedPrice,
            sellerId: vegetable. sellerId,
        }

        if (onSubmit) {
            await onSubmit(bargainData)
        }

        setIsSubmitting(false)
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md bg-white p-8">
                    <div className="text-center text-green-800">Loading vegetable data...</div>
                </Card>
            </div>
        )
    }

    // Show error if no vegetable data
    if (!vegetable) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md bg-white p-8">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">No vegetable data available</p>
                        <Button onClick={onClose} className="bg-green-700 hover:bg-green-800">
                            Close
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-white border-green-200 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-green-200 bg-white">
                    <h2 className="text-2xl font-bold text-green-800">Bargain Request</h2>
                    <button
                        onClick={onClose}
                        className="text-green-700 hover:text-green-900 transition-colors p-1"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Vegetable Image and Basic Info */}
                        <div className="flex gap-6">
                            {/* Image Section */}
                            <div className="flex-shrink-0">
                                <div className="relative h-40 w-40 rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                                    <img
                                        src={vegetable.image || "/placeholder.svg"}
                                        alt={vegetable.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-2xl font-bold text-green-800">{vegetable.name}</h3>
                                    <p className="text-sm text-green-700 mt-1">{vegetable.description}</p>
                                </div>

                                <div className="pt-2">
                                    <p className="text-sm text-green-800">
                                        <span className="font-semibold">Seller:  </span>
                                        <span>{vegetable.seller}</span>
                                    </p>
                                </div>

                                {/* Price Information */}
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-green-700 font-medium">Current Price (100g)</p>
                                            <p className="text-lg font-bold text-green-800 mt-1">Rs. {vegetable.price100g}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-green-700 font-medium">Current Price (1kg)</p>
                                            <p className="text-lg font-bold text-green-800 mt-1">Rs. {vegetable.price1kg}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5 bg-green-50 border border-green-200 p-5 rounded-lg">
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
                                    onChange={(e) => setQuantityKg(Number. parseFloat(e.target.value) || 0)}
                                    placeholder="Enter quantity in kg"
                                    className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 placeholder-green-500 rounded-lg focus:outline-none focus: border-green-600 focus: ring-1 focus:ring-green-600"
                                />
                            </div>

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
                                    onChange={(e) => setQuantityGrams(Number.parseInt(e.target.value) || 0)}
                                    placeholder="Enter quantity in grams (0-999)"
                                    className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 placeholder-green-500 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                />
                            </div>

                            <div className="pt-3 border-t border-green-200 bg-white rounded p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-800">Total Quantity: </span>
                                    <span className="text-lg font-bold text-green-800">
                                        {totalQuantity.toFixed(3)} kg ({(totalQuantity * 1000).toFixed(0)} g)
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="suggestedPrice" className="block text-sm font-semibold text-green-800 mb-2">
                                    Suggested Price (Rs./kg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="suggestedPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={suggestedPrice}
                                    onChange={(e) => setSuggestedPrice(Number.parseFloat(e.target.value) || 0)}
                                    placeholder="Enter your suggested price"
                                    className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 placeholder-green-500 rounded-lg focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                />
                            </div>

                            {/* Price Comparison */}
                            <div className="pt-3 border-t border-green-200">
                                <div className="flex justify-between items-center bg-white rounded p-3">
                                    <span className="text-sm text-green-800">Current Price vs Your Offer: </span>
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-4 w-4 text-green-700" />
                                        <span
                                            className={`text-sm font-semibold ${
                                                suggestedPrice < vegetable.price1kg ?  "text-green-700" :  "text-orange-600"
                                            }`}
                                        >
                                            {suggestedPrice < vegetable. price1kg
                                                ?  `${(((vegetable.price1kg - suggestedPrice) / vegetable.price1kg) * 100).toFixed(1)}% discount`
                                                : `${(((suggestedPrice - vegetable.price1kg) / vegetable.price1kg) * 100).toFixed(1)}% increase`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={handleGoBack}
                                variant="outline"
                                className="flex-1 flex items-center justify-center gap-2 bg-white border-green-300 text-green-800 hover:bg-green-50 hover:border-green-400"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Go Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white font-semibold transition-all active: scale-95"
                            >
                                <Percent className="h-5 w-5" />
                                {isSubmitting ? "Sending..." : "Bargain the Item"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}