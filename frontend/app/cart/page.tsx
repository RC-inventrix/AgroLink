"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { X, ShoppingBag, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import CartItem from "@/components/cart-item"
import CartSummary from "@/components/cart-summary"
import BuyerHeader from "@/components/headers/BuyerHeader"
import { DashboardNav } from "@/components/dashboard-nav"
import Footer2 from "@/components/footer/Footer"

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
    deliveryFee: number
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
        type: 'success' | 'error' | 'info';
    } | null>(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
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
                        deliveryFee: item.deliveryFee || 0,
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
            const res = await fetch(`${API_URL}/cart/delete/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setItems(prevItems => prevItems.filter(item => item.id.toString() !== id));
                setNotification({ message: "Item removed from cart successfully.", type: 'success' });
            } else {
                setNotification({ message: "Failed to remove item. Please try again.", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Network error. Could not remove item.", type: 'error' });
        } finally {
            setDeletingId(null);
        }
    }

    const selectedItems = items.filter((item) => item.selected)
    const subtotal = selectedItems.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)
    const totalDeliveryFees = selectedItems.reduce((sum, item) => sum + item.deliveryFee, 0)
    const totalPrice = subtotal + totalDeliveryFees

    const handleSelectAll = (checked: boolean) => {
        setItems(items.map((item) => ({ ...item, selected: checked })))
    }

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
            setNotification({ message: "An error occurred. Please try again.", type: 'error' });
        }
    }

    return (
        
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <BuyerHeader/>

            {/* Notification Bar */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
                    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl border ${
                        notification.type === 'success' ? "bg-white border-green-500 text-green-800" :
                            notification.type === 'error' ? "bg-white border-red-500 text-red-800" :
                                "bg-[#03230F] border-[#EEC044] text-white"
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

            <div className="flex flex-1">
                
                <DashboardNav unreadCount={0} />

                <main className="flex-1 w-full overflow-hidden flex flex-col p-8">
                    <div className="max-w-6xl mx-auto w-full">
                        
                        
                        <div className="mb-8">
                            <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">Your Cart</h1>
                            <p className="text-[#A3ACBA] font-medium">Manage your selected agricultural products</p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader2 className="h-12 w-12 animate-spin text-[#EEC044] mb-4" />
                                <p className="text-[#03230F] font-bold">Loading your fresh picks...</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                        <div className="bg-white px-6 py-5 flex items-center gap-3 border-b border-gray-100">
                                            <Checkbox
                                                id="select-all"
                                                checked={items.length > 0 && selectedItems.length === items.length}
                                                onCheckedChange={handleSelectAll}
                                                className="data-[state=checked]:bg-[#03230F] data-[state=checked]:border-[#03230F]"
                                            />
                                            <label htmlFor="select-all" className="cursor-pointer font-black text-[#03230F] text-sm uppercase tracking-widest">
                                                Select All Items ({items.length})
                                            </label>
                                        </div>

                                        <div className="p-6 space-y-4 bg-gray-50/30">
                                            {items.length === 0 ? (
                                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-[#03230F] font-bold text-lg">Your cart is feeling light</p>
                                                    <p className="text-gray-500 text-sm mt-1">Add some fresh produce from the marketplace!</p>
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

                                <div className="lg:col-span-1">
                                    
                                    <CartSummary
                                        selectedItems={selectedItems.map(item => ({
                                            id: item.id.toString(),
                                            name: item.productName,
                                            image: item.imageUrl,
                                            pricePerKg: item.pricePerKg,
                                            quantity: item.quantity,
                                            seller: item.sellerName,
                                            selected: item.selected,
                                            deliveryFee: item.deliveryFee
                                        }))}
                                        totalPrice={totalPrice}
                                        subtotal={subtotal}
                                        totalDeliveryFees={totalDeliveryFees}
                                        onCheckout={handleCheckout}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
        
            <Footer2 />
        </div>
    )
}