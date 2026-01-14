"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { X, ShoppingBag, AlertCircle, CheckCircle2 } from "lucide-react"
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
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    // --- Custom Notification State (Bottom Style) ---
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // 1. Fetch Cart
    useEffect(() => {
        const fetchCart = async () => {
            const userId = sessionStorage.getItem("id") || "1"
            try {
                const res = await fetch(`http://localhost:8080/cart/${userId}`)
                if (res.ok) {
                    const data = await res.json()
                    const mappedItems = data.map((item: any) => ({
                        id:  item.id,
                        productId: item.productId,
                        productName: item.productName,
                        imageUrl:  item.imageUrl,
                        pricePerKg: item. pricePerKg,
                        quantity: item.quantity,
                        sellerName: item. sellerName,
                        selected: false
                    }))
                    setItems(mappedItems)
                }
            } catch (error) {
                setNotification({ message: "Failed to load your cart.  Please refresh.", type: 'error' });
            } finally {
                setLoading(false)
            }
        }
        fetchCart()
    }, [])

    const toggleItem = (id: string) => {
        const numericId = parseInt(id);
        setItems(items.map((item) =>
            (item.id === numericId ?  { ...item, selected: !item.selected } : item)
        ))
    }

    // --- DELETE ITEM HANDLER ---
    const handleDeleteItem = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`http://localhost:8080/cart/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove item from local state
                setItems(prevItems => prevItems.filter(item => item.id. toString() !== id));
                setNotification({ message: "Item removed from cart successfully.", type: 'success' });
            } else {
                setNotification({ message: "Failed to remove item.  Please try again.", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Network error. Could not remove item.", type: 'error' });
        } finally {
            setDeletingId(null);
        }
    }

    const selectedItems = items.filter((item) => item.selected)
    const totalPrice = selectedItems. reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)

    const handleSelectAll = (checked: boolean) => {
        setItems(items.map((item) => ({ ...item, selected: checked })))
    }

    // --- CHECKOUT HANDLER ---
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            setNotification({ message: "Select items in your cart to proceed to checkout.", type: 'info' });
            return
        }

        try {
            sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
            setNotification({ message: "Redirecting to checkout...", type: 'success' });

            setTimeout(() => {
                router.push("/buyer/checkout");
            }, 800);
        } catch (err) {
            setNotification({ message: "An error occurred.  Please try again.", type: 'error' });
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-[#03230F] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your fresh picks...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <Header />

            {/* --- CUSTOM BOTTOM NOTIFICATION UI --- */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${
                        notification.type === 'success' ? "bg-white border-green-500 text-green-800" :
                            notification.type === 'error' ? "bg-white border-red-500 text-red-800" :
                                "bg-[#03230F] border-gray-700 text-white"
                    }`}>
                        {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {notification.type === 'info' && <ShoppingBag className="w-5 h-5 text-[#EEC044]" />}

                        <p className="text-sm font-semibold flex-1">{notification.message}</p>

                        <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg: px-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-gray-500 mb-8">Manage your selected agricultural products</p>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg: col-span-2">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="bg-gray-50/50 px-6 py-4 flex items-center gap-3 border-b border-gray-200">
                                <Checkbox
                                    id="select-all"
                                    checked={items.length > 0 && selectedItems.length === items.length}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="cursor-pointer font-bold text-gray-700 text-sm uppercase tracking-wider">
                                    Select All Items ({items.length})
                                </label>
                            </div>

                            <div className="p-6 space-y-4">
                                {items.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-medium">Your cart is feeling light.  Add some fresh produce!</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={{
                                                id: item. id. toString(),
                                                name: item.productName,
                                                image: item.imageUrl,
                                                seller: item.sellerName,
                                                pricePerKg: item.pricePerKg,
                                                quantity: item.quantity,
                                                selected: item.selected
                                            }}
                                            onToggle={toggleItem}
                                            onDelete={handleDeleteItem}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <CartSummary
                        selectedItems={selectedItems. map(item => ({
                            id: item.id. toString(),
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