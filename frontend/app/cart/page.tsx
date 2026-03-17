/* fileName: page.tsx */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { X, ShoppingBag, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import BuyerHeader from "@/components/headers/BuyerHeader"
import CartItem from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import CartSummary from "@/components/cart-summary" // Assumed path

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface CartItemData {
    id: number
    productId: number
    productName: string
    imageUrl: string
    pricePerKg: number
    quantity: number
    sellerName: string
    sellerId: number
    selected: boolean
    deliveryFee: number | null
    deliveryAddress: string
    distance: number
}

export default function Cart() {
    const [items, setItems] = useState<CartItemData[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info' | 'loading';
    } | null>(null);

    useEffect(() => {
        if (notification && notification.type !== 'loading') {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchCart = async () => {
            const userId = sessionStorage.getItem("id") || "1"
            try {
                const res = await fetch(`${API_URL}/cart/${userId}`)
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
                        selected: false,
                        deliveryFee: item.deliveryFee, // Preserves null if it's pickup
                        deliveryAddress: item.deliveryAddress || "",
                        distance: item.distance || 0,
                    }))
                    setItems(mappedItems)
                }
            } catch (error) {
                setNotification({ message: "Failed to load your cart. Please refresh.", type: 'error' });
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

    const handleDeleteItem = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`${API_URL}/cart/delete/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setItems(prevItems => prevItems.filter(item => item.id.toString() !== id));
                setNotification({ message: "Item removed from cart.", type: 'success' });
            } else {
                setNotification({ message: "Failed to remove item.", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Network error.", type: 'error' });
        } finally {
            setDeletingId(null);
        }
    }

    const selectedItems = items.filter((item) => item.selected)

    // Delivery fees are only calculated for items where deliveryFee is not null
    const subtotal = selectedItems.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)
    const totalDeliveryFees = selectedItems.reduce((sum, item) => sum + (item.deliveryFee || 0), 0)
    const totalPrice = subtotal + totalDeliveryFees

    const handleSelectAll = (checked: boolean) => {
        setItems(items.map((item) => ({ ...item, selected: checked })))
    }

    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            setNotification({ message: "Select items in your cart to proceed.", type: 'info' });
            return;
        }

        setNotification({ message: "Preparing your order request...", type: 'loading' });

        const userId = sessionStorage.getItem("id") || "1";
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");

        // Grab ONLY the IDs of the items the user checked
        const selectedItemIds = selectedItems.map(item => item.id);

        try {
            const userRes = await fetch(`${API_URL}/auth/user/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            let deliveryAddress = "Location N/A";
            let contactPhone = "N/A";

            if (userRes.ok) {
                const userData = await userRes.json();
                const formattedAddress = `${userData.address || ""}, ${userData.district || ""}`.replace(/^, |, $/g, '').trim();
                deliveryAddress = formattedAddress || deliveryAddress;
                contactPhone = userData.phone || contactPhone;
            }

            // PASS the selected cartItemIds in the body so the backend ONLY processes those!
            const response = await fetch(`${API_URL}/api/payment/cod?userId=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    deliveryAddress: deliveryAddress,
                    contactPhone: contactPhone,
                    cartItemIds: selectedItemIds
                })
            });

            if (response.ok) {
                setNotification({
                    message: "Order request sent! Check your order management page.",
                    type: 'success'
                });

                // Clear successfully ordered items from the UI cart state immediately
                setItems(items.filter(item => !item.selected));
            } else {
                setNotification({ message: "Failed to send order request.", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Network error. Could not send order request.", type: 'error' });
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
            <BuyerHeader/>

            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${
                        notification.type === 'success' ? "bg-white border-green-500 text-green-800" :
                            notification.type === 'error' ? "bg-white border-red-500 text-red-800" :
                                notification.type === 'loading' ? "bg-white border-blue-500 text-blue-800" :
                                    "bg-[#03230F] border-gray-700 text-white"
                    }`}>
                        {notification.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                        {notification.type === 'error' && <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />}
                        {notification.type === 'info' && <ShoppingBag className="w-6 h-6 text-[#EEC044] shrink-0" />}
                        {notification.type === 'loading' && <Loader2 className="w-6 h-6 text-blue-500 animate-spin shrink-0" />}
                        <p className="text-sm font-semibold flex-1 leading-snug">{notification.message}</p>
                        {notification.type !== 'loading' && (
                            <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition-opacity shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Cart</h1>
                <p className="text-gray-500 mb-8">Manage your selected agricultural products</p>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
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
                                        <p className="text-gray-500 font-medium">Your cart is feeling light. Add some fresh produce!</p>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={{
                                                id: item.id.toString(),
                                                name: item.productName,
                                                image: item.imageUrl,
                                                seller: item.sellerName,
                                                pricePerKg: item.pricePerKg,
                                                quantity: item.quantity,
                                                selected: item.selected,
                                                deliveryFee: item.deliveryFee, // Pass to component
                                                deliveryAddress: item.deliveryAddress
                                            }}
                                            onToggle={toggleItem}
                                            onDelete={handleDeleteItem}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({selectedItems.length} items)</span>
                                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Delivery Fee</span>
                                    <span className="font-medium">Rs. {totalDeliveryFees.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-4"></div>
                                <div className="flex justify-between text-[#03230F] text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-primary">Rs. {totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 text-center">
                                <p className="text-sm font-medium text-orange-800 flex items-center justify-center gap-1.5">
                                    <AlertCircle className="w-4 h-4" />
                                    Only Cash on Delivery is available
                                </p>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0 || notification?.type === 'loading'}
                                className="w-full bg-[#EEC044] text-[#03230F] hover:bg-[#EEC044]/90 font-bold py-6 text-base shadow-md active:scale-95 transition-all whitespace-normal h-auto"
                            >
                                {notification?.type === 'loading' ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Processing...</>
                                ) : (
                                    "Send order request"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}