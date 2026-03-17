/* fileName: page.tsx */
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Percent,
    CheckCircle,
    XCircle,
    MapPin,
    Map,
    ExternalLink,
    Truck,
    Loader2,
    Info,
    Navigation,
    X,
    Package,
    AlertCircle,
    Check,
    HandCoins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import LocationPicker from "@/components/LocationPicker"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    sellerId: string
    description: string
    rating: number
    quantity: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupLatitude?: number
    pickupLongitude?: number
    pickupAddress?: string
}

// Haversine formula for straight-line distance
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

export default function BargainPage() {
    const [vegetable, setVegetable] = useState<Vegetable | null>(null)

    // Inputs (Bargain)
    const [quantityKg, setQuantityKg] = useState<string>("")
    const [quantityGrams, setQuantityGrams] = useState<string>("")
    const [suggestedTotal, setSuggestedTotal] = useState<string>("")

    // States for UI feedback
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [isLoading, setIsLoading] = useState(true)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Location & Delivery States
    const [userDefaultAddress, setUserDefaultAddress] = useState<{ address: string; lat: number; lng: number } | null>(null)
    const [addressOption, setAddressOption] = useState<"default" | "custom">("default")
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [tempCustomLocation, setTempCustomLocation] = useState<any>({ latitude: null, longitude: null, streetAddress: "" })
    const [confirmedCustomLocation, setConfirmedCustomLocation] = useState<{ address: string; lat: number; lng: number } | null>(null)
    const [distance, setDistance] = useState<number>(0)
    const [deliveryFee, setDeliveryFee] = useState<number>(0)
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)

    const router = useRouter()

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
        e.currentTarget.blur()
    }

    // Auto-hide notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const storedVegetable = sessionStorage.getItem("selectedVegetable")
        if (storedVegetable) {
            try {
                const parsedVegetable = JSON.parse(storedVegetable) as Vegetable
                setVegetable(parsedVegetable)
            } catch (error) {
                router.push("/")
            }
        } else {
            router.push("/")
        }
        setIsLoading(false)
    }, [router])

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = sessionStorage.getItem("id")
            const token = sessionStorage.getItem("token")
            if (userId) {
                try {
                    const res = await fetch(`${API_URL}/api/users/${userId}/address`, {
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

    // Distance Calculation Logic
    useEffect(() => {
        if (!vegetable || !vegetable.deliveryAvailable) {
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

            if (targetLat !== null && targetLng !== null && vegetable.pickupLatitude && vegetable.pickupLongitude) {
                setIsCalculatingDistance(true)

                try {
                    const fLat = Number(vegetable.pickupLatitude);
                    const fLng = Number(vegetable.pickupLongitude);
                    const tLat = Number(targetLat);
                    const tLng = Number(targetLng);

                    const straightLineDistance = getHaversineDistance(fLat, fLng, tLat, tLng);
                    let finalCalculatedDistance = straightLineDistance * 1.3;

                    const start = `${fLng},${fLat}`
                    const end = `${tLng},${tLat}`
                    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`

                    const response = await fetch(url)
                    const data = await response.json()

                    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
                        const osrmDistance = data.routes[0].distance / 1000;
                        if (osrmDistance <= (straightLineDistance * 2.5) + 5) {
                            finalCalculatedDistance = osrmDistance;
                        }
                    }

                    const cleanDistance = parseFloat(finalCalculatedDistance.toFixed(1));
                    setDistance(cleanDistance)

                    const base = Number(vegetable.baseCharge) || 0
                    const rate = Number(vegetable.extraRatePerKm) || 0
                    const chargeableDist = Math.max(0, cleanDistance - 5)
                    const fee = base + (chargeableDist * rate)

                    setDeliveryFee(Math.round(fee))

                } catch (error) {
                    const fLat = Number(vegetable.pickupLatitude);
                    const fLng = Number(vegetable.pickupLongitude);
                    const tLat = Number(targetLat);
                    const tLng = Number(targetLng);

                    const fallbackDist = parseFloat((getHaversineDistance(fLat, fLng, tLat, tLng) * 1.3).toFixed(1));
                    setDistance(fallbackDist)

                    const base = Number(vegetable.baseCharge) || 0
                    const rate = Number(vegetable.extraRatePerKm) || 0
                    setDeliveryFee(Math.round(base + (Math.max(0, fallbackDist - 5) * rate)))
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

    const quantityKgNum = quantityKg === "" ? 0 : Number.parseFloat(quantityKg)
    const quantityGramsNum = quantityGrams === "" ? 0 : Number.parseInt(quantityGrams)

    const totalQuantityKg = quantityKgNum + quantityGramsNum / 1000
    const existingPriceForTotal = vegetable ? totalQuantityKg * vegetable.price1kg : 0

    const suggestedTotalNum = suggestedTotal === "" ? 0 : Number.parseFloat(suggestedTotal)
    const finalTotalWithDelivery = suggestedTotalNum + deliveryFee

    const priceDifference = suggestedTotalNum - existingPriceForTotal
    const discountPercentage = existingPriceForTotal > 0 ? (priceDifference / existingPriceForTotal) * 100 : 0

    // Quantity Validation Logic
    const isQuantityExceeded = vegetable ? totalQuantityKg > vegetable.quantity : false;

    const handleCancel = () => {
        setQuantityKg("")
        setQuantityGrams("")
        setSuggestedTotal("")
        router.back()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vegetable) return

        if (totalQuantityKg <= 0 || suggestedTotalNum <= 0) {
            setNotification({ message: "Please enter a valid quantity and your requested price.", type: 'error' });
            return
        }

        if (isQuantityExceeded) {
            setNotification({ message: `You cannot request more than the available stock (${vegetable.quantity} kg).`, type: 'error' });
            return;
        }

        if (vegetable.deliveryAvailable && addressOption === "custom" && !confirmedCustomLocation) {
            setNotification({ message: "Please select a custom delivery address.", type: 'error' });
            return
        }

        setIsSubmitting(true)

        const currentBuyerName = sessionStorage.getItem("userEmail") || "Guest Buyer"
        const currentUserId = sessionStorage.getItem("id") || "1";

        const finalBuyerAddress = vegetable.deliveryAvailable
            ? (addressOption === "default" ? userDefaultAddress?.address : confirmedCustomLocation?.address)
            : "Pickup by Buyer";

        const buyerCoords = vegetable.deliveryAvailable
            ? (addressOption === "default" ? userDefaultAddress : confirmedCustomLocation)
            : null;

        const bargainData = {
            vegetableId: vegetable.id,
            vegetableName: vegetable.name,
            vegetableImage: vegetable.image,
            quantity: totalQuantityKg,
            suggestedPrice: suggestedTotalNum,
            originalPricePerKg: vegetable.price1kg,
            sellerId: vegetable.sellerId,
            buyerName: currentBuyerName,
            deliveryRequired: vegetable.deliveryAvailable,
            buyerAddress: finalBuyerAddress,
            buyerLatitude: buyerCoords?.lat ?? null,
            buyerLongitude: buyerCoords?.lng ?? null,
            deliveryFee: deliveryFee,
            distance: distance,
            finalTotal: finalTotalWithDelivery
        }

        try {
            const response = await fetch(`${API_URL}/api/bargains/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': currentUserId,
                },
                body: JSON.stringify(bargainData),
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            setSubmitStatus('success')

            setTimeout(() => {
                router.push("/VegetableList")
            }, 2000)

        } catch (error) {
            console.error("Submission failed:", error)
            setSubmitStatus('error')

            setTimeout(() => {
                setSubmitStatus('idle')
                setIsSubmitting(false)
            }, 3000)
        }
    }

    const googleMapsUrl = vegetable?.pickupLatitude && vegetable?.pickupLongitude
        ? `https://www.google.com/maps?q=${vegetable.pickupLatitude},${vegetable.pickupLongitude}`
        : null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-[#03230F] text-xl flex items-center gap-2 font-bold">
                    <Loader2 className="animate-spin w-6 h-6" /> Loading product details...
                </div>
            </div>
        )
    }

    if (!vegetable) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4 font-bold">No product selected</p>
                    <Button onClick={() => router.push("/VegetableList")} className="bg-[#03230F] text-white hover:bg-[#03230F]/90">
                        Go Back to Listings
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 relative">

            {/* Custom Notification */}
            {notification && (
                <div className={`fixed top-5 right-5 z-[9999] flex items-center p-4 rounded-xl shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
                    notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" : "bg-red-950 border-red-500 text-white"
                }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                        <p className="font-medium pr-4">{notification.message}</p>
                    </div>
                    <button onClick={() => setNotification(null)} className="ml-auto hover:bg-white/10 p-1 rounded transition-colors">
                        <X className="w-4 h-4 opacity-70" />
                    </button>
                </div>
            )}

            {/* Success/Error Overlay */}
            {submitStatus !== 'idle' && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <Card className={`w-full max-w-md shadow-2xl border-0 bg-white rounded-3xl overflow-hidden`}>
                        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                            {submitStatus === 'success' ? (
                                <>
                                    <div className="h-24 w-24 rounded-full bg-[#03230F]/5 flex items-center justify-center mb-2 animate-bounce">
                                        <CheckCircle className="h-14 w-14 text-[#03230F]" />
                                    </div>
                                    <h2 className="text-3xl font-black text-[#03230F]">Bargain Sent!</h2>
                                    <p className="text-gray-600 font-medium">
                                        Your offer of <span className="font-bold text-[#03230F]">Rs. {formatCurrency(suggestedTotalNum)}</span> has been securely sent to the seller.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-4">Redirecting you to listings...</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                        <XCircle className="h-14 w-14 text-red-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-red-800">Request Failed</h2>
                                    <p className="text-gray-600 font-medium">
                                        We couldn't reach the server. Please check your connection or try again.
                                    </p>
                                    <p className="text-sm text-gray-400 mt-4">Reloading form...</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-[#03230F] tracking-tight mb-3">Bargain Request</h1>
                    <p className="text-gray-500 font-medium">Propose a fair price to the seller for your desired quantity.</p>
                </div>

                <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden mb-8">
                    <CardContent className="p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-10">

                            {/* Section 1: Product Details */}
                            <div>
                                <h2 className="text-xl font-bold text-[#03230F] mb-6 flex items-center gap-2 border-b pb-3">
                                    <Package className="w-5 h-5 text-[#EEC044]" /> Product Details
                                </h2>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0 mx-auto md:mx-0">
                                        <div className="relative h-48 w-48 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                                            <img
                                                src={vegetable.image || "/placeholder.svg"}
                                                alt={vegetable.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-3xl font-bold text-[#03230F]">{vegetable.name}</h3>
                                            <p className="text-sm text-gray-500 mt-2 font-medium">{vegetable.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg inline-flex border border-gray-100">
                                            <span className="font-semibold text-[#03230F]">Seller:</span>
                                            <span>{vegetable.seller}</span>
                                        </div>

                                        {/* AVAILABLE QUANTITY & LOCATION */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-[#03230F]/5 p-4 rounded-xl border border-[#03230F]/10">
                                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-[#03230F]" /> Available Stock
                                                </h3>
                                                <p className="text-2xl font-black text-[#03230F]">
                                                    {vegetable.quantity} <span className="text-sm font-semibold text-gray-500">kg</span>
                                                </p>
                                            </div>

                                            <div className="bg-[#03230F]/5 p-4 rounded-xl border border-[#03230F]/10">
                                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-[#03230F]" /> Farmer's Location
                                                </h3>
                                                <p className="text-sm text-[#03230F] font-medium truncate mb-2" title={vegetable.pickupAddress || ""}>
                                                    {vegetable.pickupAddress || "Address not provided"}
                                                </p>
                                                {googleMapsUrl && (
                                                    <a
                                                        href={googleMapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#EEC044] bg-[#03230F] px-2.5 py-1 rounded-md hover:bg-[#03230F]/90 transition-colors"
                                                    >
                                                        <Map className="w-3 h-3" /> View Map
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Store Prices */}
                                        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4 border-b pb-2">Store Retail Prices</p>
                                            <div className="grid grid-cols-2 gap-6 divide-x divide-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Per 100g</p>
                                                    <p className="text-2xl font-black text-[#03230F]">
                                                        Rs. {vegetable.price100g.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="pl-6">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Per 1kg</p>
                                                    <p className="text-2xl font-black text-[#03230F]">
                                                        Rs. {vegetable.price1kg.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Your Offer */}
                            <div>
                                <h2 className="text-xl font-bold text-[#03230F] mb-6 flex items-center gap-2 border-b pb-3">
                                    <Percent className="w-5 h-5 text-[#EEC044]" /> Your Custom Offer
                                </h2>

                                <div className="space-y-6 bg-gray-50 border border-gray-200 p-6 md:p-8 rounded-2xl shadow-inner">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="quantityKg" className="block text-sm font-bold text-gray-700">
                                                Quantity Needed (Kilograms)
                                            </label>
                                            <input
                                                id="quantityKg"
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={quantityKg}
                                                onChange={(e) => setQuantityKg(e.target.value)}
                                                onWheel={handleWheel}
                                                disabled={isSubmitting}
                                                placeholder="0"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent transition-all disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="quantityGrams" className="block text-sm font-bold text-gray-700">
                                                Quantity Needed (Grams)
                                            </label>
                                            <input
                                                id="quantityGrams"
                                                type="number"
                                                min="0"
                                                step="1"
                                                max="999"
                                                value={quantityGrams}
                                                onChange={(e) => setQuantityGrams(e.target.value)}
                                                onWheel={handleWheel}
                                                disabled={isSubmitting}
                                                placeholder="0"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Real-time Validation Error */}
                                    {isQuantityExceeded && (
                                        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-200">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <p>Error: Requested quantity ({totalQuantityKg.toFixed(3)} kg) exceeds available stock ({vegetable.quantity} kg).</p>
                                        </div>
                                    )}

                                    <div className="p-5 bg-white rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                                        <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Requested Weight:</span>
                                        <span className={`text-xl font-black ${isQuantityExceeded ? 'text-red-600' : 'text-[#03230F]'}`}>
                                            {totalQuantityKg.toFixed(3)} kg
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="suggestedTotal" className="block text-sm font-bold text-gray-700">
                                            Your Proposed Price (Rs.) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="suggestedTotal"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={suggestedTotal}
                                            onChange={(e) => setSuggestedTotal(e.target.value)}
                                            onWheel={handleWheel}
                                            disabled={isSubmitting}
                                            placeholder="e.g. 1500"
                                            className="w-full px-4 py-4 bg-white border-2 border-gray-300 text-gray-900 font-bold text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-[#EEC044] transition-all disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="bg-[#03230F] rounded-xl p-5 border border-[#03230F] space-y-3 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                                        <div className="flex justify-between items-center relative z-10">
                                            <span className="text-sm text-gray-300 font-medium">Original Retail Price (for {totalQuantityKg.toFixed(3)} kg):</span>
                                            <span className="text-sm font-bold text-white">
                                                Rs. {formatCurrency(existingPriceForTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/10 pt-3 relative z-10">
                                            <span className="text-sm text-white font-bold tracking-wide uppercase">Your Custom Deal:</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-base font-black px-3 py-1 rounded-md ${
                                                    discountPercentage < 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                                }`}
                                                >
                                                    {discountPercentage < 0
                                                        ? `${Math.abs(discountPercentage).toFixed(1)}% DISCOUNT`
                                                        : `${discountPercentage.toFixed(1)}% HIGHER`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Delivery */}
                            <div>
                                <h2 className="text-xl font-bold text-[#03230F] mb-6 flex items-center gap-2 border-b pb-3">
                                    <Truck className="w-5 h-5 text-[#EEC044]" /> Delivery Options
                                </h2>

                                {vegetable.deliveryAvailable ? (
                                    <div className="p-6 md:p-8 bg-blue-50/40 rounded-2xl border border-blue-100 shadow-inner">
                                        <RadioGroup value={addressOption} onValueChange={(v: any) => setAddressOption(v)} className="space-y-4">
                                            <div className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                addressOption === "default" ? "bg-white border-[#03230F] shadow-md" : "bg-transparent border-gray-200 hover:bg-white"
                                            }`}>
                                                <RadioGroupItem value="default" id="opt-default" className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor="opt-default" className="cursor-pointer font-bold text-gray-900 text-base">
                                                        Use My Registered Address
                                                    </Label>
                                                    <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                                                        {userDefaultAddress ? userDefaultAddress.address : "No address found on profile"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                addressOption === "custom" ? "bg-white border-[#03230F] shadow-md" : "bg-transparent border-gray-200 hover:bg-white"
                                            }`}>
                                                <RadioGroupItem value="custom" id="opt-custom" className="mt-1" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="opt-custom" className="cursor-pointer font-bold text-gray-900 text-base">
                                                            Deliver to Another Location
                                                        </Label>
                                                        {addressOption === "custom" && (
                                                            <Button type="button" size="sm" className="h-8 text-xs bg-[#03230F] text-[#EEC044] hover:bg-[#03230F]/90 rounded-lg font-bold" onClick={() => setIsAddressModalOpen(true)}>
                                                                {confirmedCustomLocation ? "Change Location" : "Select on Map"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                                                        {confirmedCustomLocation ? confirmedCustomLocation.address : "Click select to pick a location"}
                                                    </p>
                                                </div>
                                            </div>
                                        </RadioGroup>

                                        <div className="mt-6 pt-5 border-t border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-2 bg-blue-100/50 px-3 py-1.5 rounded-lg border border-blue-200">
                                                {isCalculatingDistance ? (
                                                    <><Loader2 className="w-4 h-4 text-blue-600 animate-spin"/> <span className="text-sm font-bold text-blue-800">Calculating route...</span></>
                                                ) : (
                                                    <><Navigation className="w-4 h-4 text-blue-600" /> <span className="text-sm font-bold text-blue-800">Distance: {distance} km</span></>
                                                )}
                                            </div>
                                            <div className="text-left sm:text-right bg-white p-3 rounded-xl border border-blue-100 shadow-sm w-full sm:w-auto">
                                                <div className="font-black text-[#03230F] text-lg">
                                                    Delivery Fee: Rs. {formatCurrency(deliveryFee)}
                                                </div>
                                                <div className="text-xs font-semibold text-gray-500 mt-1">
                                                    Base: Rs. {formatCurrency(vegetable.baseCharge || 0)} + Rs. {formatCurrency(vegetable.extraRatePerKm || 0)}/km
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-orange-50 rounded-2xl border border-orange-200 flex items-start gap-4 shadow-sm">
                                        <div className="p-3 bg-orange-100 rounded-full shrink-0">
                                            <Info className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-orange-900 text-lg mb-1">Pickup Only</p>
                                            <p className="text-orange-800 font-medium leading-relaxed">Delivery is not available for this item. Please be prepared to collect it directly from the farmer's location.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Final Summary Card */}
                            <div className="mt-10 bg-[#03230F] rounded-3xl p-8 border-4 border-[#EEC044]/20 shadow-2xl relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEC044]/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

                                <h3 className="text-xl font-black text-white mb-6 relative z-10">Final Summary</h3>

                                <div className="space-y-4 mb-6 relative z-10">
                                    <div className="flex justify-between items-center text-gray-300 font-medium">
                                        <span>Your Product Offer</span>
                                        <span className="text-lg text-white">Rs. {formatCurrency(suggestedTotalNum)}</span>
                                    </div>
                                    {vegetable.deliveryAvailable && (
                                        <div className="flex justify-between items-center text-gray-300 font-medium">
                                            <span>Calculated Delivery Fee</span>
                                            <span className="text-lg text-white">Rs. {formatCurrency(deliveryFee)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-5 border-t border-white/20 flex justify-between items-end relative z-10">
                                    <div>
                                        <span className="font-black text-gray-300 text-sm uppercase tracking-wider block mb-1">Total Cost Estimate</span>
                                    </div>
                                    <span className="text-4xl font-black text-[#EEC044]">
                                        Rs. {formatCurrency(finalTotalWithDelivery)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-6 text-lg rounded-xl shadow-sm"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" /> Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isCalculatingDistance || isQuantityExceeded || totalQuantityKg <= 0 || suggestedTotalNum <= 0}
                                    className="flex-[2] bg-[#EEC044] hover:bg-[#d4a833] text-[#03230F] font-black py-6 text-lg rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 border-0"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-6 h-6 animate-spin mr-2" /> Sending Offer...</>
                                    ) : (
                                        <><HandCoins className="h-6 w-6 mr-2" /> Submit Bargain Request</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="font-bold text-xl text-[#03230F]">Select Delivery Location</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500"/></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <LocationPicker
                                value={tempCustomLocation}
                                onChange={setTempCustomLocation}
                                variant="light"
                                showStreetAddress={true}
                                required={true}
                                label=""
                            />
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                            <Button variant="outline" className="font-bold rounded-xl" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
                            <Button onClick={saveCustomAddress} className="bg-[#03230F] text-[#EEC044] hover:bg-[#03230F]/90 font-bold rounded-xl shadow-md">Confirm Location</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}