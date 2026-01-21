"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import VegetablePurchaseForm from "@/components/vegetable-purchase-form"
import { Loader2 } from "lucide-react"

// Define the interface again so TypeScript knows what to expect
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
}

export default function Page() {
    const router = useRouter()
    const [selectedVegetable, setSelectedVegetable] = useState<Vegetable | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Try to get the data from Session Storage
        const storedData = sessionStorage.getItem("selectedVegetable")

        if (storedData) {
            // 2. If found, parse it back into an object and save to state
            setSelectedVegetable(JSON.parse(storedData))
        } else {
            // 3. If NOT found (user typed URL directly), redirect back to list
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
        return null // Should have redirected already
    }

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            {/* Pass the dynamic data instead of the sample */}
            <VegetablePurchaseForm vegetable={selectedVegetable} />
        </main>
    )
}