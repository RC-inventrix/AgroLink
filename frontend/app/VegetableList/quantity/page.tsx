"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import VegetablePurchaseForm from "@/components/vegetable-purchase-form"
import { Loader2 } from "lucide-react"

interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    sellerId: number; // Added to prevent backend NullPointerException
    description: string
    rating: number
}

export default function Page() {
    const router = useRouter()
    const [selectedVegetable, setSelectedVegetable] = useState<Vegetable | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedData = sessionStorage.getItem("selectedVegetable")

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // Debug Check: Verify sellerId exists in your console
            if (!parsedData.sellerId) {
                console.warn("Warning: sellerId is missing from the selected vegetable data.");
            }
            
            setSelectedVegetable(parsedData)
        } else {
            console.error("No vegetable selected")
            router.push("/VegetableList")
        }

        setLoading(false)
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!selectedVegetable) return null

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            {/* The vegetable object now contains the critical sellerId */}
            <VegetablePurchaseForm vegetable={selectedVegetable} />
        </main>
    )
}