"use client"

import { useState } from "react"
import BargainForm from "@/components/bargain-form"
import type { BargainRequestData } from "@/components/bargain-form"

// Sample vegetable data for demonstration
const SAMPLE_VEGETABLE = {
    id: "1",
    name: "Tomatoes",
    image: "https://images.unsplash.com/photo-1592841657303-dc2b5537acda?w=400&h=400&fit=crop",
    price100g: 25,
    price1kg: 250,
    seller: "Fresh Farm Produce",
    sellerId: "seller-1",
    description: "Fresh, organic tomatoes directly from the farm. Rich in lycopene and vitamin C.",
    rating: 4.5,
}

export default function Home() {
    const [showBargainForm, setShowBargainForm] = useState(false)

    const handleBargainSubmit = (data: BargainRequestData) => {
        console.log("Bargain request submitted:", data)
        // Handle the bargain request - send to API, save to database, etc.
        alert(`Bargain request sent!\n\nQuantity: ${data.quantity}kg\nSuggested Price: Rs. ${data.suggestedPrice}/kg`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">Vegetable Bargaining</h1>

                {/* Demo Card */}
                <div className="bg-gray-800 border border-green-700/30 rounded-lg p-6 mb-8">
                    <div className="space-y-4">
                        <div className="flex gap-6">
                            <img
                                src={SAMPLE_VEGETABLE.image || "/placeholder.svg"}
                                alt={SAMPLE_VEGETABLE.name}
                                className="w-40 h-40 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white">{SAMPLE_VEGETABLE.name}</h2>
                                <p className="text-gray-400 mt-2">{SAMPLE_VEGETABLE.description}</p>
                                <p className="text-green-400 font-semibold mt-4">Seller: {SAMPLE_VEGETABLE.seller}</p>
                                <div className="flex gap-6 mt-4">
                                    <div>
                                        <p className="text-xs text-gray-400">Per 100g</p>
                                        <p className="text-lg font-bold text-green-400">Rs. {SAMPLE_VEGETABLE.price100g}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Per 1kg</p>
                                        <p className="text-lg font-bold text-green-400">Rs. {SAMPLE_VEGETABLE.price1kg}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowBargainForm(true)}
                            className="w-full mt-6 bg-orange-700 hover:bg-orange-800 text-white font-semibold py-3 rounded-lg transition-all active:scale-95"
                        >
                            Bargain the Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Bargain Form Modal */}
            {showBargainForm && (
                <BargainForm
                    vegetable={SAMPLE_VEGETABLE}
                    onClose={() => setShowBargainForm(false)}
                    onSubmit={handleBargainSubmit}
                />
            )}
        </div>
    )
}
