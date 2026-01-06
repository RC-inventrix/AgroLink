"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Edit2, ShoppingBag, X, Check, AlertCircle, Loader2 } from "lucide-react"
import { VegetableItem } from "@/components/vegetable-item"
import { useState, useEffect } from "react"

export function CheckoutPage() {
    // State for items loaded from Cart
    const [cartItems, setCartItems] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // --- Custom Notification State ---
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'loading';
    } | null>(null);

    const [address] = useState({
        street: "123 Farm Road, Green Valley",
        city: "Mumbai, Maharashtra 400001",
        phone: "+91 98765 43210",
    })

    // Auto-hide notification (except for loading state)
    useEffect(() => {
        if (notification && notification.type !== 'loading') {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // 1. Load Items from Session Storage on Mount
    useEffect(() => {
        const storedItems = sessionStorage.getItem("checkoutItems")
        if (storedItems) {
            try {
                const parsedItems = JSON.parse(storedItems)
                const formattedItems = parsedItems.map((item: any) => ({
                    id: item.id,
                    name: item.productName || item.name,
                    quantity: item.quantity,
                    pricePerKg: item.pricePerKg,
                    deliveryFee: 30,
                    image: item.imageUrl || item.image || "/placeholder.svg"
                }))
                setCartItems(formattedItems)
            } catch (e) {
                setNotification({ message: "Error loading checkout items.", type: 'error' });
            }
        }
    }, [])

    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.pricePerKg, 0)
    const total = subtotal + 30 

    // 2. Handle Payment Trigger
    const handleProceedToPayment = async () => {
        setLoading(true)
        setNotification({ message: "Preparing your secure payment session...", type: 'loading' });
        
        const userId = sessionStorage.getItem("id") || "1"

        try {
            const response = await fetch(`http://localhost:8080/api/payment/create-checkout-session?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.url) {
                    setNotification({ message: "Redirecting to Stripe Secure Payment...", type: 'success' });
                    // Small delay to let the user read the success state
                    setTimeout(() => {
                        window.location.href = data.url
                    }, 1000);
                } else {
                    setNotification({ message: "Payment service failed to provide a URL.", type: 'error' });
                }
            } else {
                setNotification({ message: "Order creation failed. Please try again.", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Network error. Unable to reach payment gateway.", type: 'error' });
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative">
            
            {/* --- CUSTOM NOTIFICATION UI --- */}
            {notification && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
                    notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" :
                    notification.type === 'loading' ? "bg-blue-950 border-blue-400 text-white" :
                    "bg-red-950 border-red-500 text-white"
                }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' && <Check className="w-5 h-5 text-green-400" />}
                        {notification.type === 'loading' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                        <p className="font-medium pr-4">{notification.message}</p>
                    </div>
                    {notification.type !== 'loading' && (
                        <button onClick={() => setNotification(null)} className="ml-auto hover:bg-white/10 p-1 rounded transition-colors">
                            <X className="w-4 h-4 opacity-70" />
                        </button>
                    )}
                </div>
            )}

            <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-primary-foreground">AgroLink.</div>
                    </div>
                    <div className="text-primary-foreground/80 text-sm font-medium">Secure Checkout</div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Order</h1>
                    <p className="text-muted-foreground">Review your items and shipping details</p>
                </div>

                {/* Address Section */}
                <Card className="p-6 mb-6 border-2 shadow-sm transition-all hover:border-primary/20">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Delivery Address</h2>
                            </div>
                        </div>
                    </div>
                    <div className="ml-13 space-y-1">
                        <p className="text-foreground font-medium">{address.street}</p>
                        <p className="text-muted-foreground">{address.city}</p>
                        <p className="text-sm text-primary font-medium pt-2">{address.phone}</p>
                    </div>
                </Card>

                {/* Items Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Your Items ({cartItems.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No items to checkout. Go back to cart?</p>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <VegetableItem key={item.id} item={item} />
                            ))
                        )}
                    </div>
                </div>

                {/* Summary Section */}
                <Card className="p-6 border-2 bg-card shadow-lg">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Delivery Fee</span>
                            <span className="font-medium">Rs. 30.00</span>
                        </div>
                        <div className="h-px bg-border my-3"></div>
                        <div className="flex justify-between text-foreground text-xl font-bold">
                            <span>Total Amount</span>
                            <span className="text-primary text-2xl">Rs. {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleProceedToPayment}
                        disabled={loading || cartItems.length === 0}
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold py-7 text-lg shadow-xl active:scale-95 transition-all"
                        size="lg"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Payment...
                            </div>
                        ) : "Proceed to Payment"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Secure transaction powered by Stripe Encryption
                    </p>
                </Card>
            </div>
        </div>
    )
}