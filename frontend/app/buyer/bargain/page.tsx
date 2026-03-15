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
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import LocationPicker from "@/components/LocationPicker"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 1. Updated Interface
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
    const R = 6371; // Earth's radius in km
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

    useEffect(() => {
        const storedVegetable = sessionStorage.getItem("selectedVegetable")
        if (storedVegetable) {
            try {
                const parsedVegetable = JSON.parse(storedVegetable) as Vegetable
                setVegetable(parsedVegetable)
            } catch (error) {
                console.error("Error parsing vegetable data:", error)
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

    // --- FIX: Advanced Distance Calculation with OSRM Sanity Guard ---
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
                    // 1. Force strict numbers to prevent string concatenation bugs
                    const fLat = Number(vegetable.pickupLatitude);
                    const fLng = Number(vegetable.pickupLongitude);
                    const tLat = Number(targetLat);
                    const tLng = Number(targetLng);

                    // 2. Get true straight-line distance
                    const straightLineDistance = getHaversineDistance(fLat, fLng, tLat, tLng);

                    // Base estimate for road distance (1.3x straight line)
                    let finalCalculatedDistance = straightLineDistance * 1.3;

                    // 3. Request OSRM Routing (Note: OSRM format is always longitude,latitude)
                    const start = `${fLng},${fLat}`
                    const end = `${tLng},${tLat}`
                    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`

                    const response = await fetch(url)
                    const data = await response.json()

                    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
                        const osrmDistance = data.routes[0].distance / 1000; // Convert meters to km

                        // SANITY GUARD: If OSRM returns an absurd detour (e.g. > 2.5x straight line + 5km buffer), ignore it.
                        if (osrmDistance <= (straightLineDistance * 2.5) + 5) {
                            finalCalculatedDistance = osrmDistance;
                        } else {
                            console.warn(`OSRM suggested an impossible detour (${osrmDistance}km) for a ${straightLineDistance}km straight gap. Using estimation.`);
                        }
                    }

                    // 4. Update states
                    const cleanDistance = parseFloat(finalCalculatedDistance.toFixed(1));
                    setDistance(cleanDistance)

                    const base = Number(vegetable.baseCharge) || 0
                    const rate = Number(vegetable.extraRatePerKm) || 0
                    const chargeableDist = Math.max(0, cleanDistance - 5)
                    const fee = base + (chargeableDist * rate)

                    setDeliveryFee(Math.round(fee))

                } catch (error) {
                    console.error("Distance calculation error:", error)

                    // Fallback block with forced numbers
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
            alert("Please enter valid quantity and price")
            return
        }

        if (vegetable.deliveryAvailable && addressOption === "custom" && !confirmedCustomLocation) {
            alert("Please select a custom delivery address")
            return
        }

        setIsSubmitting(true)

        const currentBuyerName = sessionStorage.getItem("userEmail") || "Guest Buyer"
        const currentUserId = sessionStorage.getItem("id") || "1";

        const finalBuyerAddress = vegetable.deliveryAvailable
            ? (addressOption === "default" ? userDefaultAddress?.address : confirmedCustomLocation?.address)
            : "Pickup by Buyer";

        // Derive buyer coordinates from the selected delivery option
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

    // Fixed Google Maps URL Link
    const googleMapsUrl = vegetable?.pickupLatitude && vegetable?.pickupLongitude
        ? `https://www.google.com/maps?q=${vegetable.pickupLatitude},${vegetable.pickupLongitude}`
        : null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-green-800 text-xl flex items-center gap-2">
                    <Loader2 className="animate-spin w-6 h-6" /> Loading vegetable details...
                </div>
            </div>
        )
    }

    if (!vegetable) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">No vegetable selected</p>
                    <Button onClick={() => router.push("/VegetableList")} className="bg-green-700 hover:bg-green-800">
                        Go Back to Listings
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8 relative">

            {submitStatus !== 'idle' && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <Card className={`w-full max-w-md shadow-2xl border-0 bg-white`}>
                        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                            {submitStatus === 'success' ? (
                                <>
                                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-2 animate-bounce">
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-green-800">Bargain Sent!</h2>
                                    <p className="text-green-700">
                                        Your offer of <span className="font-bold">Rs. {formatCurrency(suggestedTotalNum)}</span> has been sent to the seller.
                                    </p>
                                    <p className="text-sm text-gray-500 mt-4">Redirecting you to listings...</p>
                                </>
                            ) : (
                                <>
                                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-2">
                                        <XCircle className="h-12 w-12 text-red-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-red-800">Request Failed</h2>
                                    <p className="text-gray-600">
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
                <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Bargain Request</h1>

                <Card className="bg-white border-green-200 shadow-lg mb-8">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Product Details</h2>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-shrink-0 mx-auto md:mx-0">
                                        <div className="relative h-48 w-48 rounded-lg overflow-hidden bg-gray-100 border border-green-200">
                                            <img
                                                src={vegetable.image || "/placeholder.svg"}
                                                alt={vegetable.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-3xl font-bold text-green-800">{vegetable.name}</h3>
                                            <p className="text-sm text-green-700 mt-2">{vegetable.description}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-green-800">
                                                <span className="font-semibold">Seller: </span>
                                                <span>{vegetable.seller}</span>
                                            </p>
                                        </div>

                                        <div className="bg-green-50/50 p-4 rounded-lg border border-green-100 shadow-sm">
                                            <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-green-700" /> Farmer's Location
                                            </h3>
                                            <p className="text-sm text-green-800 mb-2">
                                                {vegetable.pickupAddress || "Address not provided by farmer"}
                                            </p>
                                            {googleMapsUrl && (
                                                <a
                                                    href={googleMapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-xs font-medium text-green-700 hover:text-green-900 hover:underline transition-colors"
                                                >
                                                    <Map className="w-3 h-3" /> View on Google Maps <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                            <p className="text-xs text-green-700 font-medium mb-3">Store Prices</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-green-700">Per 100g</p>
                                                    <p className="text-xl font-bold text-green-800">
                                                        Rs. {vegetable.price100g.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-700">Per 1kg</p>
                                                    <p className="text-xl font-bold text-green-800">
                                                        Rs. {vegetable.price1kg.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-green-200"></div>

                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Your Offer</h2>
                                <div className="space-y-5 bg-green-50 border border-green-200 p-6 rounded-lg">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="quantityKg" className="block text-sm font-semibold text-green-800 mb-2">
                                                Quantity (Kilograms)
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
                                                className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="quantityGrams" className="block text-sm font-semibold text-green-800 mb-2">
                                                Quantity (Grams)
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
                                                className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white rounded border border-green-100 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-green-800">Total Weight:</span>
                                        <span className="text-lg font-bold text-green-800">
                                            {totalQuantityKg.toFixed(3)} kg
                                        </span>
                                    </div>

                                    <div>
                                        <label htmlFor="suggestedTotal" className="block text-sm font-semibold text-green-800 mb-2">
                                            I want to pay this Amount for the Product (Rs.) <span className="text-red-500">*</span>
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
                                            className="w-full px-4 py-2 bg-white border border-green-300 text-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="bg-white rounded p-4 border border-green-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-green-800">Store Price for this weight:</span>
                                            <span className="text-sm font-semibold text-green-800">
                                                Rs. {formatCurrency(existingPriceForTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                            <span className="text-sm text-green-800 font-medium">Your Discount Request:</span>
                                            <div className="flex items-center gap-2">
                                                <Percent className="h-4 w-4 text-green-700" />
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        discountPercentage < 0 ? "text-green-700" : "text-orange-600"
                                                    }`}
                                                >
                                                    {discountPercentage < 0
                                                        ? `${Math.abs(discountPercentage).toFixed(1)}% OFF`
                                                        : `${discountPercentage.toFixed(1)}% MORE`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-green-800 mb-6">Delivery Options</h2>

                                {vegetable.deliveryAvailable ? (
                                    <div className="p-6 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                                            <Truck className="w-4 h-4" /> Select Delivery Location
                                        </h3>

                                        <RadioGroup value={addressOption} onValueChange={(v: any) => setAddressOption(v)} className="space-y-3">
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
                                                            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsAddressModalOpen(true)}>
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
                                    <div className="p-5 bg-orange-50 rounded-lg border border-orange-100 text-orange-800 text-sm flex items-start gap-3">
                                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold mb-1">Pickup Only</p>
                                            <p className="opacity-90">Delivery is not available for this item. Please collect it from the farmer's location shown above.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Final Summary</h3>
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Your Product Offer</span>
                                        <span>Rs. {formatCurrency(suggestedTotalNum)}</span>
                                    </div>
                                    {vegetable.deliveryAvailable && (
                                        <div className="flex justify-between">
                                            <span>Calculated Delivery Fee</span>
                                            <span>Rs. {formatCurrency(deliveryFee)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-gray-300 flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-lg">Total Cost</span>
                                    <span className="text-2xl font-bold text-green-800">
                                        Rs. {formatCurrency(finalTotalWithDelivery)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    variant="outline"
                                    className="flex-1 border-green-300 text-green-800 hover:bg-green-50"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isCalculatingDistance}
                                    className="flex-1 bg-orange-700 hover:bg-orange-800 text-white transition-all active:scale-95"
                                >
                                    <Percent className="h-5 w-5 mr-2" />
                                    {isSubmitting ? "Sending..." : "Submit Offer"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
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

