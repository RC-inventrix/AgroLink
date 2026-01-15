"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Edit2, ShoppingBag, X, Check, AlertCircle, Loader2, Phone, Save } from "lucide-react"
import { VegetableItem } from "@/components/vegetable-item"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CheckoutPage() {
    const [cartItems, setCartItems] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isEditingAddress, setIsEditingAddress] = useState(false)

    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'loading';
    } | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
    const router = useRouter()

    // --- UPDATED: Editable Address State ---
    const [address, setAddress] = useState({
        street: "123 Farm Road, Green Valley",
        city: "Mumbai, Maharashtra 400001",
        phone: "+91 98765 43210",
    })

    useEffect(() => {
        if (notification && notification.type !== 'loading') {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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

    const handleProceedToPayment = async () => {
        setLoading(true)
        setNotification({ message: "Preparing your secure payment session...", type: 'loading' });
        
        const userId = sessionStorage.getItem("id") || "1"

        try {
            if (paymentMethod === "cash") {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                // Note: You can now send the 'address' state to your backend if your API supports it
                const response = await fetch(`http://localhost:8080/api/payment/cod?userId=${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    // Optional: Sending the updated address to the backend
                    body: JSON.stringify({ deliveryAddress: address })
                });

                if (response.ok) {
                    router.push("/buyer/order-success");
                } else {
                    setNotification({ message: "Failed to place order. Check permissions.", type: 'error' });
                }
                return;
            }

            // STRIPE OPTION
            const response = await fetch(`http://localhost:8080/api/payment/create-checkout-session?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok) {
                const data = await response.json()
                if (data.url) {
                    setNotification({ message: "Redirecting to Stripe Secure Payment...", type: 'success' });
                    setTimeout(() => { window.location.href = data.url }, 1000);
                }
            } else {
                setNotification({ message: "Order creation failed.", type: 'error' });
            }
        } catch (error) {
            setNotification({ message: "Network error.", type: 'error' });
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative">
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
                </div>
            )}

            <header className="sticky top-0 z-50 bg-primary border-b border-primary-foreground/10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary-foreground">AgroLink.</div>
                    <div className="text-primary-foreground/80 text-sm font-medium">Secure Checkout</div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Order</h1>
                    <p className="text-muted-foreground">Review your items and shipping details</p>
                </div>

                {/* --- UPDATED: Editable Address Section --- */}
                <Card className="p-6 mb-6 border-2 shadow-sm transition-all hover:border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">Delivery Details</h2>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary/80"
                            onClick={() => setIsEditingAddress(!isEditingAddress)}
                        >
                            {isEditingAddress ? <><Save className="w-4 h-4 mr-2"/> Save</> : <><Edit2 className="w-4 h-4 mr-2"/> Edit</>}
                        </Button>
                    </div>

                    {!isEditingAddress ? (
                        <div className="space-y-2 ml-1">
                            <p className="text-foreground font-medium">{address.street}</p>
                            <p className="text-muted-foreground">{address.city}</p>
                            <div className="flex items-center gap-2 text-primary font-medium pt-2">
                                <Phone className="w-4 h-4" />
                                <span>{address.phone}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 animate-in fade-in duration-300">
                            <div className="grid gap-2">
                                <Label htmlFor="street">Street Address</Label>
                                <Input 
                                    id="street" 
                                    value={address.street} 
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                    placeholder="House No, Building, Street"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">City & Pincode</Label>
                                <Input 
                                    id="city" 
                                    value={address.city} 
                                    onChange={(e) => setAddress({...address, city: e.target.value})}
                                    placeholder="City, State, Zip"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Mobile Number</Label>
                                <Input 
                                    id="phone" 
                                    value={address.phone} 
                                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Items Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">Your Items ({cartItems.length})</h2>
                    </div>
                    <div className="space-y-4">
                        {cartItems.length === 0 ? <p>No items to checkout.</p> : cartItems.map((item) => <VegetableItem key={item.id} item={item} />)}
                    </div>
                </div>

                {/* Summary & Payment */}
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
                            <span className="text-primary text-2xl">Rs. {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-6 p-4 border border-border rounded-lg">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition" style={{ borderColor: paymentMethod === "card" ? "var(--primary)" : undefined }}>
                                <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="w-4 h-4" />
                                <span className="font-semibold">Credit/Debit Card</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition" style={{ borderColor: paymentMethod === "cash" ? "var(--primary)" : undefined }}>
                                <input type="radio" name="payment" value="cash" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} className="w-4 h-4" />
                                <span className="font-semibold">Cash on Delivery</span>
                            </label>
                        </div>
                    </div>

                    <Button
                        onClick={handleProceedToPayment}
                        disabled={loading || cartItems.length === 0 || isEditingAddress}
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold py-7 text-lg shadow-xl active:scale-95 transition-all"
                        size="lg"
                    >
                        {loading ? "Processing..." : isEditingAddress ? "Save Address to Continue" : `Proceed to ${paymentMethod === "card" ? "Payment" : "Order Confirmation"}`}
                    </Button>
                </Card>
            </div>
        </div>
    )
}