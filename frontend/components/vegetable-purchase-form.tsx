"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    ShoppingCart,
    Loader2,
    X,
    Check,
    AlertCircle,
    MapPin,
    Truck,
    Store,
    Info,
    Navigation,
    Map,
    ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import LocationPicker from "@/components/LocationPicker"

interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    description: string
    rating: number
    sellerId: string
    quantity: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupLatitude?: number
    pickupLongitude?: number
    pickupAddress?: string
}

// 1. Keep Haversine as a Fallback (in case API fails)
const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper: Currency Formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

export default function VegetablePurchaseForm({ vegetable }: { vegetable: Vegetable }) {
    const router = useRouter()
    const [quantity, setQuantity] = useState<string>("1")
    const [adding, setAdding] = useState(false)
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

    // User & Address State
    const [userDefaultAddress, setUserDefaultAddress] = useState<{ address: string; lat: number; lng: number } | null>(null)
    const [addressOption, setAddressOption] = useState<"default" | "custom">("default")

    // Custom Address Picker State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [tempCustomLocation, setTempCustomLocation] = useState<any>({ latitude: null, longitude: null, streetAddress: "" })
    const [confirmedCustomLocation, setConfirmedCustomLocation] = useState<{ address: string; lat: number; lng: number } | null>(null)

    // Calculation State
    const [distance, setDistance] = useState<number>(0)
    const [deliveryFee, setDeliveryFee] = useState<number>(0)
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false) // UX Loading State

    // --- 1. Fetch User Data ---
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = sessionStorage.getItem("id")
            const token = sessionStorage.getItem("token")
            if (userId) {
                try {
                    const res = await fetch(`http://localhost:8080/api/users/${userId}/address`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    if (res.ok) {
                        const data = await res.json()
                        const fullAddr = [data.address, data.city, data.district].filter(Boolean).join(", ")
                        if (data.latitude && data.longitude) {
                            setUserDefaultAddress({
                                address: fullAddr,
                                lat: data.latitude,
                                lng: data.longitude
                            })
                        }
                    }
                } catch (error) { console.error("Failed to fetch address") }
            }
        }
        fetchUserData()
    }, [])

    useEffect(() => {
        if (isAddressModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isAddressModalOpen]);

    // --- 2. Calculate Real Road Distance (OSRM API) ---
    useEffect(() => {
        if (!vegetable.deliveryAvailable) {
            setDeliveryFee(0)
            setDistance(0)
            return
        }

        const calculateRoute = async () => {
            let targetLat: number | null = null
            let targetLng: number | null = null

            if (addressOption === "default" && userDefaultAddress) {
                targetLat = userDefaultAddress.lat
                targetLng = userDefaultAddress.lng
            } else if (addressOption === "custom" && confirmedCustomLocation) {
                targetLat = confirmedCustomLocation.lat
                targetLng = confirmedCustomLocation.lng
            }

            if (targetLat && targetLng && vegetable.pickupLatitude && vegetable.pickupLongitude) {
                setIsCalculatingDistance(true)

                try {
                    // OSRM API Call (Free, Open Source)
                    // Format: {longitude},{latitude};{longitude},{latitude}
                    const start = `${vegetable.pickupLongitude},${vegetable.pickupLatitude}`
                    const end = `${targetLng},${targetLat}`
                    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`

                    const response = await fetch(url)
                    const data = await response.json()

                    let calculatedDistance = 0;

                    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
                        // OSRM returns distance in METERS
                        const distanceInMeters = data.routes[0].distance;
                        calculatedDistance = parseFloat((distanceInMeters / 1000).toFixed(1));
                    } else {
                        // Fallback to Haversine if API fails
                        console.warn("OSRM API failed, using Haversine fallback");
                        calculatedDistance = parseFloat(getHaversineDistance(
                            vegetable.pickupLatitude!, vegetable.pickupLongitude!, targetLat, targetLng
                        ).toFixed(1));
                    }

                    setDistance(calculatedDistance)

                    // Fee Calculation
                    const base = vegetable.baseCharge || 0
                    const rate = vegetable.extraRatePerKm || 0
                    // Standard logic: Subtract 5km buffer, calculate remaining
                    const chargeableDist = Math.max(0, calculatedDistance - 5)
                    const fee = base + (chargeableDist * rate)
                    setDeliveryFee(Math.round(fee))

                } catch (error) {
                    console.error("Distance calculation error:", error)
                    // Emergency Fallback
                    const fallbackDist = parseFloat(getHaversineDistance(
                        vegetable.pickupLatitude!, vegetable.pickupLongitude!, targetLat, targetLng
                    ).toFixed(1));
                    setDistance(fallbackDist)
                    setDeliveryFee(Math.round((vegetable.baseCharge || 0) + (Math.max(0, fallbackDist - 5) * (vegetable.extraRatePerKm || 0))))
                } finally {
                    setIsCalculatingDistance(false)
                }
            } else {
                setDistance(0)
                setDeliveryFee(0)
            }
        }

        calculateRoute()
    }, [addressOption, userDefaultAddress, confirmedCustomLocation, vegetable])

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === "" || /^\d*\.?\d*$/.test(value)) setQuantity(value)
    }

    const preventScrollChange = (e: React.WheelEvent<HTMLInputElement>) => {
        (e.target as HTMLInputElement).blur();
    }

    const saveCustomAddress = () => {
        if (tempCustomLocation.latitude && tempCustomLocation.streetAddress) {
            const addrStr = `${tempCustomLocation.streetAddress}, ${tempCustomLocation.city || ''}`
            setConfirmedCustomLocation({
                address: addrStr,
                lat: tempCustomLocation.latitude,
                lng: tempCustomLocation.longitude
            })
            setIsAddressModalOpen(false)
        }
    }

    const handleAddToCart = async () => {
        const qty = parseFloat(quantity) || 0
        if (qty <= 0) {
            setNotification({ message: "Please enter a valid quantity", type: "error" })
            return
        }

        if (qty > vegetable.quantity) {
            setNotification({ message: `Only ${vegetable.quantity} kg available`, type: "error" })
            return
        }

        if (vegetable.deliveryAvailable && addressOption === "custom" && !confirmedCustomLocation) {
            setNotification({ message: "Please select a custom delivery address", type: "error" })
            return
        }

        setAdding(true)
        const userId = sessionStorage.getItem("id")
        const userName = sessionStorage.getItem("name") || "Buyer"

        const finalBuyerAddress = vegetable.deliveryAvailable
            ? (addressOption === "default" ? userDefaultAddress?.address : confirmedCustomLocation?.address)
            : "Pickup by Buyer";

        const goodsTotal = qty * vegetable.price1kg
        const finalTotal = goodsTotal + deliveryFee

        try {
            const res = await fetch("http://localhost:8080/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    buyerName: userName,
                    productId: vegetable.id,
                    productName: vegetable.name,
                    pricePerKg: vegetable.price1kg,
                    quantity: qty,
                    imageUrl: vegetable.image,
                    sellerName: vegetable.seller,
                    sellerId: vegetable.sellerId,
                    farmerAddress: vegetable.pickupAddress,
                    buyerAddress: finalBuyerAddress,
                    deliveryFee: deliveryFee,
                    productPrice: goodsTotal,
                    totalPrice: finalTotal
                }),
            })

            if (res.ok) {
                setNotification({ message: "Added to cart successfully!", type: "success" })
                setTimeout(() => router.push("/VegetableList"), 2000)
            } else {
                setNotification({ message: "Failed to add to cart", type: "error" })
            }
        } catch (e) {
            setNotification({ message: "Network error", type: "error" })
        } finally {
            setAdding(false)
        }
    }

    const googleMapsUrl = vegetable.pickupLatitude && vegetable.pickupLongitude
        ? `https://www.google.com/maps/search/?api=1&query=${vegetable.pickupLatitude},${vegetable.pickupLongitude}`
        : null;

    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            {notification && (
                <div className={`fixed top-5 right-5 z-[110] flex items-center p-4 rounded-lg shadow-xl border animate-in slide-in-from-right-5 ${
                    notification.type === 'success' ? "bg-green-900 border-green-600 text-white" : "bg-red-900 border-red-600 text-white"
                }`}>
                    {notification.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-4 hover:opacity-70"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* LEFT: Product Image & Basic Info */}
                <div className="bg-gray-50 p-8 flex flex-col">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white shadow-sm mb-6">
                        <img src={vegetable.image || "/placeholder.svg"} alt={vegetable.name} className="w-full h-full object-cover" />
                        {!vegetable.deliveryAvailable && (
                            <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <Store className="w-3 h-3" /> PICKUP ONLY
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{vegetable.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Store className="w-4 h-4" />
                            <span>Sold by <span className="font-semibold text-gray-900">{vegetable.seller}</span></span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-6">{vegetable.description}</p>

                        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> Farmer's Location
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {vegetable.pickupAddress || "Address not provided by farmer"}
                            </p>
                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                    <Map className="w-3 h-3" /> View on Google Maps <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Purchasing Logic */}
                <div className="p-8 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>

                    {/* Delivery Section - CONDITIONAL */}
                    {vegetable.deliveryAvailable ? (
                        <div className="mb-8 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Delivery Options
                            </h3>

                            <RadioGroup value={addressOption} onValueChange={(v: any) => setAddressOption(v)} className="space-y-3">
                                {/* Option 1: Registered Address */}
                                <div className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    addressOption === "default" ? "bg-white border-blue-500 ring-1 ring-blue-500" : "bg-transparent border-transparent hover:bg-white"
                                }`}>
                                    <RadioGroupItem value="default" id="opt-default" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="opt-default" className="cursor-pointer font-medium text-gray-900">
                                            Use Registered Address
                                        </Label>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {userDefaultAddress ? userDefaultAddress.address : "No address found on profile"}
                                        </p>
                                    </div>
                                </div>

                                {/* Option 2: Custom Address */}
                                <div className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    addressOption === "custom" ? "bg-white border-blue-500 ring-1 ring-blue-500" : "bg-transparent border-transparent hover:bg-white"
                                }`}>
                                    <RadioGroupItem value="custom" id="opt-custom" className="mt-1" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="opt-custom" className="cursor-pointer font-medium text-gray-900">
                                                Select Another Address
                                            </Label>
                                            {addressOption === "custom" && (
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsAddressModalOpen(true)}>
                                                    {confirmedCustomLocation ? "Change" : "Select"}
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {confirmedCustomLocation ? confirmedCustomLocation.address : "Click select to pick a location"}
                                        </p>
                                    </div>
                                </div>
                            </RadioGroup>

                            {/* Delivery Fee Info - UPDATED WITH BREAKDOWN & REAL ROAD DISTANCE */}
                            <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center text-sm">
                                <span className="text-blue-800 flex items-center gap-1">
                                    {isCalculatingDistance ? (
                                        <><Loader2 className="w-3 h-3 animate-spin"/> Calculating...</>
                                    ) : (
                                        <><Navigation className="w-3 h-3" /> Distance: {distance} km</>
                                    )}
                                </span>
                                <div className="text-right">
                                    <div className="font-bold text-blue-900">
                                        Delivery Fee: Rs. {formatCurrency(deliveryFee)}
                                    </div>
                                    <div className="text-[10px] text-blue-600 opacity-90 mt-0.5">
                                        Base: Rs. {formatCurrency(vegetable.baseCharge || 0)} + Rs. {formatCurrency(vegetable.extraRatePerKm || 0)}/km
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100 text-orange-800 text-sm flex items-start gap-3">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Pickup Only</p>
                                <p className="opacity-90">Delivery is not available for this item. Please collect it from the farmer's location shown.</p>
                            </div>
                        </div>
                    )}

                    {/* Quantity Section */}
                    <div className="mb-8">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity (kg)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={handleQuantityChange}
                                onWheel={preventScrollChange}
                                className="w-full p-3 pl-4 border border-gray-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Available Stock: {vegetable.quantity} kg</p>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="mt-auto bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Product Cost</span>
                                <span>Rs. {formatCurrency((parseFloat(quantity) || 0) * vegetable.price1kg)}</span>
                            </div>
                            {vegetable.deliveryAvailable && (
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span>Rs. {formatCurrency(deliveryFee)}</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-primary">
                                Rs. {formatCurrency((parseFloat(quantity) || 0) * vegetable.price1kg + deliveryFee)}
                            </span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full mt-6 text-lg font-semibold h-12"
                        onClick={handleAddToCart}
                        disabled={adding || isCalculatingDistance}
                    >
                        {adding ? <Loader2 className="animate-spin" /> : <ShoppingCart className="mr-2 w-5 h-5" />}
                        Add to Cart
                    </Button>
                </div>
            </div>

            {/* Custom Location Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-lg">Select Delivery Location</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            <LocationPicker
                                value={tempCustomLocation}
                                onChange={setTempCustomLocation}
                                variant="light"
                                showStreetAddress={true}
                                required={true}
                                label=""
                            />
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 flex-shrink-0">
                            <Button variant="outline" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
                            <Button onClick={saveCustomAddress}>Confirm Location</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}