"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Edit2, ShoppingBag } from "lucide-react"
import { VegetableItem } from "@/components/vegetable-item"
import { useState, useEffect } from "react"

export function CheckoutPage() {
    // State for items loaded from Cart
    const [cartItems, setCartItems] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [address] = useState({
        street: "123 Farm Road, Green Valley",
        city: "Mumbai, Maharashtra 400001",
        phone: "+91 98765 43210",
    })

    // 1. Load Items from Session Storage on Mount
    useEffect(() => {
        const storedItems = sessionStorage.getItem("checkoutItems")
        if (storedItems) {
            // Map the cart data to the structure VegetableItem expects
            const parsedItems = JSON.parse(storedItems)
            const formattedItems = parsedItems.map((item: any) => ({
                id: item.id,
                name: item.productName || item.name, // Handle inconsistent naming
                quantity: item.quantity,
                pricePerKg: item.pricePerKg,
                deliveryFee: 30, // Default fee
                image: item.imageUrl || item.image || "/placeholder.svg"
            }))
            setCartItems(formattedItems)
        }
    }, [])

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.pricePerKg, 0)
    const totalDeliveryFee = cartItems.reduce((sum, item) => sum + (item.deliveryFee || 0), 0) // Should match backend logic
    const total = subtotal + 30 // Assuming fixed delivery for now, adjust as needed

    // 2. Handle Payment Trigger
    const handleProceedToPayment = async () => {
        setLoading(true)
        const userId = sessionStorage.getItem("id") || "1"

        try {
            // Call your Spring Boot Gateway -> Payment Service
            const response = await fetch(`http://localhost:8080/api/payment/create-checkout-session?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })

            if (response.ok) {
                const data = await response.json()
                // Redirect to Stripe URL provided by backend
                if (data.url) {
                    window.location.href = data.url
                } else {
                    console.error("No payment URL received")
                }
            } else {
                console.error("Payment initiation failed")
                alert("Failed to start payment. Please try again.")
            }
        } catch (error) {
            console.error("Error connecting to payment service", error)
            alert("Network error. Check console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-primary-foreground">AgroLink.</div>
                    </div>
                    <div className="text-primary-foreground/80 text-sm">Checkout</div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Order</h1>
                </div>

                {/* Address Section (Same as before) */}
                <Card className="p-6 mb-6 border-2">
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
                    </div>
                </Card>

                {/* Items Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Your Items ({cartItems.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {cartItems.length === 0 ? <p>No items to checkout.</p> : cartItems.map((item) => (
                            <VegetableItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                {/* Summary Section */}
                <Card className="p-6 border-2 bg-card">
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
                            <span className="text-primary">Rs. {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleProceedToPayment}
                        disabled={loading || cartItems.length === 0}
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold py-6"
                        size="lg"
                    >
                        {loading ? "Processing..." : "Proceed to Payment"}
                    </Button>

                </Card>
            </div>
        </div>
    )
}