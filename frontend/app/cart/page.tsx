"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // <--- Import Router
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import CartItem from "@/components/cart-item"
import CartSummary from "@/components/cart-summary"

interface CartItemData {
    id: number
    productId: number
    productName: string
    imageUrl: string
    pricePerKg: number
    quantity: number
    sellerName: string
    selected: boolean
}

export default function Cart() {
    const [items, setItems] = useState<CartItemData[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter() // <--- Initialize Router

    // 1. Fetch Cart (No changes here)
    useEffect(() => {
        const fetchCart = async () => {
            const userId = sessionStorage.getItem("id") || "1"
            try {
                const res = await fetch(`http://localhost:8080/cart/${userId}`)
                if (res.ok) {
                    const data = await res.json()
                    const mappedItems = data.map((item: any) => ({
                        id: item.id,
                        productId: item.productId,
                        productName: item.productName,
                        imageUrl: item.imageUrl,
                        pricePerKg: item.pricePerKg,
                        quantity: item.quantity,
                        sellerName: item.sellerName,
                        selected: false
                    }))
                    setItems(mappedItems)
                }
            } catch (error) {
                console.error("Failed to load cart", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCart()
    }, [])

    const toggleItem = (id: string) => {
        const numericId = parseInt(id);
        setItems(items.map((item) =>
            (item.id === numericId ? { ...item, selected: !item.selected } : item)
        ))
    }

    const selectedItems = items.filter((item) => item.selected)
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)

    const handleSelectAll = (checked: boolean) => {
        setItems(items.map((item) => ({ ...item, selected: checked })))
    }

    // --- UPDATED CHECKOUT HANDLER ---
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one item")
            return
        }

        // 1. Save selected items to Session Storage so Checkout page can read them
        sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));

        // 2. Navigate to Checkout Page
        router.push("/buyer/checkout");
    }
    // -------------------------------

    if (loading) return <div className="text-center py-20">Loading Cart...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Cart</h1>
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {/* Cart List Logic (Same as before) */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-center gap-3 pb-6 border-b border-gray-200">
                                <Checkbox
                                    id="select-all"
                                    checked={items.length > 0 && selectedItems.length === items.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="cursor-pointer font-semibold text-gray-900">
                                    Select All Items ({items.length})
                                </label>
                            </div>
                            <div className="space-y-4">
                                {items.length === 0 ? <p>Your cart is empty.</p> : items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={{
                                            id: item.id.toString(),
                                            name: item.productName,
                                            image: item.imageUrl,
                                            seller: item.sellerName,
                                            pricePerKg: item.pricePerKg,
                                            quantity: item.quantity,
                                            selected: item.selected
                                        }}
                                        onToggle={toggleItem}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <CartSummary
                        selectedItems={selectedItems.map(item => ({
                            id: item.id.toString(),
                            name: item.productName,
                            image: item.imageUrl, // Pass image for summary if needed
                            pricePerKg: item.pricePerKg,
                            quantity: item.quantity,
                            seller: item.sellerName,
                            selected: item.selected
                        }))}
                        totalPrice={totalPrice}
                        onCheckout={handleCheckout}
                    />
                </div>
            </main>
        </div>
    )
}