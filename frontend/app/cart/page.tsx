"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import CartItem from "@/components/cart-item"
import CartSummary from "@/components/cart-summary"

// Interface matching your Backend Response
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

    // 1. Fetch Cart from Backend
    useEffect(() => {
        const fetchCart = async () => {
            const userId = sessionStorage.getItem("id") || "1"
            try {
                const res = await fetch(`http://localhost:8080/cart/${userId}`)
                if (res.ok) {
                    const data = await res.json()
                    // Map backend data to frontend structure & add 'selected' state
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

    // 2. Fix: Accept string ID (because CartItem passes a string), convert to number for state find
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

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Please select at least one item")
            return
        }
        alert(`Proceeding to checkout with Rs. ${totalPrice.toFixed(2)}`)
    }

    if (loading) return <div className="text-center py-20">Loading Cart...</div>

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Cart</h1>
                <p className="mb-8 text-gray-600">Select items and review your order</p>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
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
                                        // 3. Fix: Map Backend properties to Frontend props explicitly
                                        item={{
                                            id: item.id.toString(),  // UI expects string
                                            name: item.productName,  // UI expects 'name', backend has 'productName'
                                            image: item.imageUrl,    // UI expects 'image', backend has 'imageUrl'
                                            seller: item.sellerName, // UI expects 'seller', backend has 'sellerName'
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

                    {/* 4. Fix: Map 'selectedItems' to match Vegetable[] for Summary */}
                    <CartSummary
                        selectedItems={selectedItems.map(item => ({
                            id: item.id.toString(),
                            name: item.productName,
                            image: item.imageUrl,
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