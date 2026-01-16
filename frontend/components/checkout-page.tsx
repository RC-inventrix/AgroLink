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
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
    const router = useRouter()

    const [address, setAddress] = useState({ street: "", city: "", phone: "" })

    // 1. Fetch User Data (Address) on Mount
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = sessionStorage.getItem("id")
            const token = sessionStorage.getItem("token")
            if (!userId || !token) return;

            try {
                const response = await fetch(`http://localhost:8080/auth/user/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setAddress({
                        street: userData.address || "Add your street address",
                        city: userData.district || "Update your city",
                        phone: userData.phone || "No phone number",
                    });
                }
            } catch (error) { console.error("Profile fetch failed:", error); }
        };
        fetchUserData();
    }, []);

    // 2. Load Items from Session
    // 2. Load Items from Session
useEffect(() => {
    const storedItems = sessionStorage.getItem("checkoutItems")
    if (storedItems) {
        try {
            const parsedItems = JSON.parse(storedItems)
            setCartItems(parsedItems.map((item: any) => ({
                id: item.id,
                name: item.productName || item.name,
                quantity: item.quantity,
                pricePerKg: item.pricePerKg,
                image: item.imageUrl || "/placeholder.svg",
                // --- ADD THIS LINE ---
                sellerId: item.sellerId 
            })))
        } catch (e) { setNotification({ message: "Error loading items.", type: 'error' }); }
    }
}, [])

    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.pricePerKg, 0)
    const total = subtotal + 30 

    const handleProceedToPayment = async () => {
        const userId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")
        
        if (!userId || !token) {
            setNotification({ message: "Please log in again.", type: 'error' });
            return;
        }

        setLoading(true)
        setNotification({ message: "Processing your order...", type: 'loading' });
        
        try {
            if (paymentMethod === "cash") {
                const response = await fetch(`http://localhost:8080/api/payment/cod?userId=${userId}`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        deliveryAddress: `${address.street}, ${address.city}`,
                        contactPhone: address.phone 
                    })
                });
                if (response.ok) router.push("/buyer/order-success");
                else throw new Error("COD Failed");
            } else {
                // --- FIX: Added Authorization Header for Stripe ---
                const response = await fetch(`http://localhost:8080/api/payment/create-checkout-session?userId=${userId}`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    if (data.url) {
                        setNotification({ message: "Redirecting to Stripe...", type: 'success' });
                        window.location.href = data.url;
                    }
                } else throw new Error("Stripe Failed");
            }
        } catch (error) {
            setNotification({ message: "Order failed. Please try again.", type: 'error' });
        } finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen bg-background relative">
            {notification && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all ${
                    notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" :
                    notification.type === 'loading' ? "bg-blue-950 border-blue-400 text-white" : "bg-red-950 border-red-500 text-white"
                }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
                        <p className="font-medium pr-4">{notification.message}</p>
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-50 bg-[#03230F] py-4 border-b border-white/10">
                <div className="container mx-auto px-4 flex justify-between items-center text-white">
                    <div className="text-2xl font-bold">AgroLink.</div>
                    <div className="text-sm opacity-80">Secure Checkout</div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold text-[#03230F] mb-6">Complete Your Order</h1>

                <Card className="p-6 mb-6 border-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="text-primary"/> Delivery Details</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingAddress(!isEditingAddress)}>
                            {isEditingAddress ? <><Save className="w-4 h-4 mr-2"/> Done</> : <><Edit2 className="w-4 h-4 mr-2"/> Change</>}
                        </Button>
                    </div>
                    {!isEditingAddress ? (
                        <div className="space-y-1">
                            <p className="font-medium">{address.street || "Loading..."}</p>
                            <p className="text-muted-foreground">{address.city}</p>
                            <p className="text-primary font-medium flex items-center gap-2 mt-2"><Phone className="w-4 h-4"/>{address.phone}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 animate-in fade-in">
                            <Input value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} placeholder="Street" />
                            <Input value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} placeholder="City" />
                            <Input value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} placeholder="Phone" />
                        </div>
                    )}
                </Card>

                {/* --- ADDED: Order Items Section --- */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ShoppingBag className="text-primary"/> Your Items</h2>
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
                                <img src={item.image} className="w-16 h-16 rounded object-cover" alt={item.name} />
                                <div className="flex-1">
                                    <p className="font-bold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.quantity} kg x Rs. {item.pricePerKg}</p>
                                </div>
                                <p className="font-bold">Rs. {(item.quantity * item.pricePerKg).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="p-6 border-2 bg-card">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Delivery Fee</span><span>Rs. 30.00</span></div>
                        <div className="border-t pt-2 flex justify-between font-bold text-xl text-[#03230F]">
                            <span>Total</span><span>Rs. {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-6 space-y-3">
                        {/* <p className="font-semibold">Payment Method</p>
                        <div 
                            className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <input type="radio" checked={paymentMethod === 'card'} readOnly /> <span>Credit/Debit Card</span>
                        </div> */}
                        {/* <div 
                            className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <input type="radio" checked={paymentMethod === 'cash'} readOnly /> <span>Cash on Delivery</span>
                        </div> */}
                    </div>

                    <Button
                        onClick={handleProceedToPayment}
                        disabled={loading || cartItems.length === 0 || isEditingAddress}
                        className="w-full bg-[#EEC044] text-[#03230F] hover:bg-[#EEC044]/90 py-7 text-lg font-bold"
                    >
                        {loading ? "Processing..." : `Confirm & Place Order`}
                    </Button>
                </Card>
            </div>
        </div>
    )
}