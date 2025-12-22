"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Edit2, ShoppingBag, Loader2 } from "lucide-react" // Added Loader2
import { VegetableItem } from "@/components/vegetable-item"
import { useState } from "react"
// import Link from "next/link" // Not used currently

// Sample data (Keep your existing data)
const cartItems = [
    {
        id: 1,
        name: "Fresh Tomatoes",
        quantity: 2.5,
        pricePerKg: 120,
        deliveryFee: 30,
        image: "/fresh-red-tomatoes.jpg",
    },
    {
        id: 2,
        name: "Organic Carrots",
        quantity: 1.5,
        pricePerKg: 80,
        deliveryFee: 25,
        image: "/fresh-orange-carrots.jpg",
    },
    {
        id: 3,
        name: "Green Spinach",
        quantity: 1.0,
        pricePerKg: 60,
        deliveryFee: 20,
        image: "/fresh-green-spinach-leaves.jpg",
    },
    {
        id: 4,
        name: "Red Onions",
        quantity: 3.0,
        pricePerKg: 50,
        deliveryFee: 25,
        image: "/fresh-red-onions.jpg",
    },
]

export function CheckoutPage() {
    const [loading, setLoading] = useState(false) // State to show loading spinner
    const [address] = useState({
        street: "123 Farm Road, Green Valley",
        city: "Mumbai, Maharashtra 400001",
        phone: "+91 98765 43210",
    })

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.pricePerKg, 0)
    const totalDeliveryFee = cartItems.reduce((sum, item) => sum + item.deliveryFee, 0)
    const total = subtotal + totalDeliveryFee

    // --- NEW: Payment Handler ---
    const handlePayment = async () => {
        try {
            setLoading(true)

            // TODO: Replace '1' with the actual logged-in user's ID from localStorage or Context
            const userId = 1;

            const response = await fetch(`http://localhost:8075/api/payment/create-checkout-session?userId=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Network response was not ok")
            }

            const data = await response.json()

            // Redirect the user to the Stripe Checkout page
            if (data.url) {
                window.location.href = data.url
            } else {
                console.error("No payment URL returned")
            }

        } catch (error) {
            console.error("Payment Error:", error)
            alert("Failed to initiate payment. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-primary-foreground">AgroLink.</div>
                    </div>
                    <div className="text-primary-foreground/80 text-sm">Checkout</div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Order</h1>
                    <p className="text-muted-foreground">Review your items and delivery details</p>
                </div>

                {/* Delivery Address Card */}
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
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Change
                        </Button>
                    </div>
                    <div className="ml-13 space-y-1">
                        <p className="text-foreground font-medium">{address.street}</p>
                        <p className="text-muted-foreground">{address.city}</p>
                        <p className="text-muted-foreground">{address.phone}</p>
                    </div>
                </Card>

                {/* Order Items */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Your Items ({cartItems.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <VegetableItem key={item.id} item={item} />
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <Card className="p-6 border-2 bg-card">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Total Delivery Fee</span>
                            <span className="font-medium">Rs. {totalDeliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-border my-3"></div>
                        <div className="flex justify-between text-foreground text-xl font-bold">
                            <span>Total Amount</span>
                            <span className="text-primary">Rs. {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold py-6"
                        size="lg"
                        onClick={handlePayment} // <--- ATTACHED HANDLER
                        disabled={loading}      // <--- DISABLE WHEN LOADING
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        By proceeding, you agree to our Terms & Conditions
                    </p>
                </Card>
            </div>
        </div>
    )
}