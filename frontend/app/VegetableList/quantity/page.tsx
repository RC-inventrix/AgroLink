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
    description: string
    rating: number
    sellerId: string // Changed to string to match backend consistency
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupLatitude?: number
    pickupLongitude?: number
    pickupAddress?: string // Farmer's address
}

export default function Page() {
    const router = useRouter()
    const [selectedVegetable, setSelectedVegetable] = useState<Vegetable | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedData = sessionStorage.getItem("selectedVegetable")
        if (storedData) {
            setSelectedVegetable(JSON.parse(storedData))
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

    if (!selectedVegetable) {
        return null
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <VegetablePurchaseForm vegetable={selectedVegetable} />
        </main>
    )
}