/* fileName: auction-bid-popup.tsx */
"use client"

import { useState, useEffect } from "react"
import {
    X, Gavel, MapPin, Truck, Clock, AlertCircle, Check,
    Loader2, Navigation, ExternalLink, Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import LocationPicker from "@/components/LocationPicker"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Interfaces
interface Vegetable {
    id: string
    name: string
    image: string
    price1kg: number
    seller: string
    sellerId: string
    description: string
    rating: number
    quantity: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupAddress?: string
    pickupLatitude?: number
    pickupLongitude?: number
    isAuction?: boolean
    currentBid?: number
    startingPrice?: number
    endTime?: string
}

interface Bid {
    id: number
    bidderName: string
    bidAmount: number
    bidTime: string
    rank: number
}

interface FullAddress {
    streetAddress: string
    city: string
    district: string
    province: string
    zipcode: string
    latitude: number
    longitude: number
    formattedAddress?: string
}

interface AuctionBidPopupProps {
    isOpen: boolean
    onClose: () => void
    vegetable: Vegetable
}

// Reuse Haversine from purchase form as fallback
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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format bid input with commas while preserving decimals
const formatBidInput = (value: string) => {
    if (!value) return ""
    const [intPart, decimalPart] = value.split(".")
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt
}

const parseBidAmount = (value: string) => parseFloat(value.replace(/,/g, ""))

export default function AuctionBidPopup({ isOpen, onClose, vegetable }: AuctionBidPopupProps) {
    // --- State ---
    const [bids, setBids] = useState<Bid[]>([])
    const [currentHighest, setCurrentHighest] = useState<number>(vegetable.currentBid || vegetable.startingPrice || 0)
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [bidAmount, setBidAmount] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [confirming, setConfirming] = useState(false)

    // User Details for Bid Submission
    const [buyerEmail, setBuyerEmail] = useState<string>("")
    const [buyerName, setBuyerName] = useState<string>("")

    // Auction Specific Delivery Config (fetched from live auction data)
    const [auctionDeliveryConfig, setAuctionDeliveryConfig] = useState<{ base: number, extra: number }>({ base: 0, extra: 0 })

    // Address & Delivery State
    const [userDefaultAddress, setUserDefaultAddress] = useState<FullAddress | null>(null)
    const [addressOption, setAddressOption] = useState<"default" | "custom">("default")
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

    // Custom Location Picker State
    const [tempCustomLocation, setTempCustomLocation] = useState<any>({ latitude: null, longitude: null, streetAddress: "" })
    const [confirmedCustomLocation, setConfirmedCustomLocation] = useState<FullAddress | null>(null)

    // Calculations
    const [distance, setDistance] = useState<number>(0)
    const [deliveryFee, setDeliveryFee] = useState<number>(0)
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)

    // --- Effects ---

    // 1. Fetch Live Auction Details & User Data
    useEffect(() => {
        if (isOpen && vegetable.id) {
            const fetchAuctionDetails = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/auctions/${vegetable.id}`)
                    if (res.ok) {
                        const data = await res.json()
                        setBids(data.topBids || [])
                        setCurrentHighest(data.currentHighestBidAmount || data.startingPrice || 0)

                        // Store delivery config from API directly
                        setAuctionDeliveryConfig({
                            base: data.baseDeliveryFee || 0,
                            extra: data.extraFeePer3Km || 0
                        })
                    }
                } catch (e) {
                    console.error("Failed to fetch auction details", e)
                }
            }
            fetchAuctionDetails()
            const interval = setInterval(fetchAuctionDetails, 5000) // Polling
            return () => clearInterval(interval)
        }
    }, [isOpen, vegetable.id])

    // 2. Fetch User Info (Email & Address)
    useEffect(() => {
        const fetchUserData = async () => {
            const userId = sessionStorage.getItem("id")
            const token = sessionStorage.getItem("token")
            if (userId && isOpen) {
                try {
                    // --- CHANGED: Fetch Email from Identity Service via Gateway ---
                    const userRes = await fetch(`${API_URL}/auth/user/${userId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    if (userRes.ok) {
                        const userData = await userRes.json()
                        setBuyerEmail(userData.email || "")

                        const fullName = userData.fullname || userData.name || sessionStorage.getItem("name") || "Valued Bidder";
                        setBuyerName(fullName);
                    }

                    // --- CHANGED: Fetch Address from Identity Service via Gateway ---
                    const addrRes = await fetch(`${API_URL}/users/${userId}/address`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    if (addrRes.ok) {
                        const data = await addrRes.json()
                        const fullAddrStr = [data.address, data.city, data.district].filter(Boolean).join(", ")

                        if (data.latitude && data.longitude) {
                            setUserDefaultAddress({
                                streetAddress: data.address || "",
                                city: data.city || "",
                                district: data.district || "",
                                province: data.province || "",
                                zipcode: data.zipcode || "",
                                latitude: data.latitude,
                                longitude: data.longitude,
                                formattedAddress: fullAddrStr
                            })
                        }
                    }
                } catch (error) { console.error("Failed to fetch user data") }
            }
        }
        fetchUserData()
    }, [isOpen])

    // 3. Timer Logic
    useEffect(() => {
        if (!vegetable.endTime) return
        const timer = setInterval(() => {
            const end = new Date(vegetable.endTime!).getTime()
            const now = new Date().getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft("Ended")
                clearInterval(timer)
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`)
                else setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [vegetable.endTime])

    // 4. Delivery Calculation (Reusing Purchase Form Logic)
    useEffect(() => {
        if (!vegetable.deliveryAvailable || !isOpen) {
            setDeliveryFee(0)
            setDistance(0)
            return
        }

        const calculateRoute = async () => {
            let targetLat: number | null = null
            let targetLng: number | null = null

            if (addressOption === "default" && userDefaultAddress) {
                targetLat = userDefaultAddress.latitude
                targetLng = userDefaultAddress.longitude
            } else if (addressOption === "custom" && confirmedCustomLocation) {
                targetLat = confirmedCustomLocation.latitude
                targetLng = confirmedCustomLocation.longitude
            }

            if (targetLat && targetLng && vegetable.pickupLatitude && vegetable.pickupLongitude) {
                setIsCalculatingDistance(true)
                try {
                    const start = `${vegetable.pickupLongitude},${vegetable.pickupLatitude}`
                    const end = `${targetLng},${targetLat}`
                    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`

                    const response = await fetch(url)
                    const data = await response.json()
                    let calculatedDistance = 0

                    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
                        const distanceInMeters = data.routes[0].distance;
                        calculatedDistance = parseFloat((distanceInMeters / 1000).toFixed(1));
                    } else {
                        calculatedDistance = parseFloat(getHaversineDistance(
                            vegetable.pickupLatitude!, vegetable.pickupLongitude!, targetLat, targetLng
                        ).toFixed(1))
                    }

                    setDistance(calculatedDistance)

                    // Fee Calculation Logic (Consistent with Purchase Form)
                    // Use fetched config or fallbacks
                    const base = auctionDeliveryConfig.base || vegetable.baseCharge || 0
                    const rate = auctionDeliveryConfig.extra || vegetable.extraRatePerKm || 0

                    const chargeableDist = Math.max(0, calculatedDistance - 5) // 5km buffer
                    const fee = base + (chargeableDist * rate)
                    setDeliveryFee(Math.round(fee))

                } catch (error) {
                    console.error("Distance error", error)
                } finally {
                    setIsCalculatingDistance(false)
                }
            } else {
                setDistance(0)
                setDeliveryFee(0)
            }
        }
        calculateRoute()
    }, [addressOption, userDefaultAddress, confirmedCustomLocation, vegetable, isOpen, auctionDeliveryConfig])

    // --- Handlers ---

    const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, "")
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) setBidAmount(raw)
    }

    const preventScrollChange = (e: React.WheelEvent<HTMLInputElement>) => {
        (e.target as HTMLInputElement).blur();
    }

    const saveCustomAddress = () => {
        if (tempCustomLocation.latitude && tempCustomLocation.streetAddress) {
            const addrStr = `${tempCustomLocation.streetAddress}, ${tempCustomLocation.city || ''}`
            setConfirmedCustomLocation({
                streetAddress: tempCustomLocation.streetAddress,
                city: tempCustomLocation.city || "",
                district: tempCustomLocation.district || "",
                province: tempCustomLocation.province || "",
                zipcode: tempCustomLocation.zipcode || "",
                latitude: tempCustomLocation.latitude,
                longitude: tempCustomLocation.longitude,
                formattedAddress: addrStr
            })
            setIsAddressModalOpen(false)
        }
    }

    const validateBid = () => {
        setNotification(null)
        const amount = parseBidAmount(bidAmount)
        if (!amount || amount <= 0) {
            setNotification({ message: "Please enter a valid bid amount", type: "error" })
            return false
        }
        if (amount <= currentHighest) {
            setNotification({ message: `Bid must be higher than Rs. ${formatCurrency(currentHighest)}`, type: "error" })
            return false
        }
        if (vegetable.deliveryAvailable && addressOption === "custom" && !confirmedCustomLocation) {
            setNotification({ message: "Please select a delivery address", type: "error" })
            return false
        }
        return true
    }

    const initiateBid = () => {
        if (validateBid()) {
            setConfirming(true)
        }
    }

    const submitBid = async () => {
        setLoading(true)
        const userId = sessionStorage.getItem("id")
        // const userName = sessionStorage.getItem("name") || "Bidder"

        if (!userId) {
            setNotification({ message: "You must be logged in to bid", type: "error" })
            setLoading(false)
            return
        }

        // Construct Full Delivery Address Object
        let deliveryAddressObj = null;
        if (vegetable.deliveryAvailable) {
            if (addressOption === "default" && userDefaultAddress) {
                deliveryAddressObj = {
                    streetAddress: userDefaultAddress.streetAddress,
                    city: userDefaultAddress.city,
                    district: userDefaultAddress.district,
                    province: userDefaultAddress.province,
                    zipcode: userDefaultAddress.zipcode,
                    latitude: userDefaultAddress.latitude,
                    longitude: userDefaultAddress.longitude
                }
            } else if (addressOption === "custom" && confirmedCustomLocation) {
                deliveryAddressObj = {
                    streetAddress: confirmedCustomLocation.streetAddress,
                    city: confirmedCustomLocation.city,
                    district: confirmedCustomLocation.district,
                    province: confirmedCustomLocation.province,
                    zipcode: confirmedCustomLocation.zipcode,
                    latitude: confirmedCustomLocation.latitude,
                    longitude: confirmedCustomLocation.longitude
                }
            }
        }

        try {
            const res = await fetch(`${API_URL}/api/auctions/${vegetable.id}/bids`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    bidderId: parseInt(userId),
                    bidderName: buyerName,
                    bidderEmail: buyerEmail, // Added email
                    bidAmount: parseBidAmount(bidAmount),
                    deliveryAddress: deliveryAddressObj // Full address object
                })
            })

            if (res.ok) {
                const data = await res.json()
                setNotification({ message: "Bid placed successfully!", type: "success" })

                setCurrentHighest(data.bidAmount)
                setBids(prev => [{
                    id: data.id,
                    bidderName: "You",
                    bidAmount: data.bidAmount,
                    bidTime: new Date().toISOString(),
                    rank: 1
                }, ...prev].slice(0, 5))

                setConfirming(false)
                setBidAmount("")
            } else {
                const errData = await res.text()
                setNotification({ message: `Failed: ${errData || "Could not place bid"}`, type: "error" })
                setConfirming(false)
            }
        } catch (e) {
            setNotification({ message: "Network error occurred", type: "error" })
            setConfirming(false)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    // FIX: Corrected Google Maps URL
    const googleMapsUrl = vegetable.pickupLatitude && vegetable.pickupLongitude
        ? `https://www.google.com/maps/search/?api=1&query=${vegetable.pickupLatitude},${vegetable.pickupLongitude}`
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-blue-600" />
                        Place Your Bid
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <img src={vegetable.image} alt={vegetable.name} className="w-24 h-24 rounded-lg object-cover bg-white" />
                                <div>
                                    <h3 className="font-bold text-xl">{vegetable.name}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{vegetable.quantity} kg available</p>
                                    <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                                        <Store className="w-4 h-4" /> {vegetable.seller} ({vegetable.rating} ★)
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{vegetable.description}</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-600" /> Farmer's Location
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    {vegetable.pickupAddress || "Location provided on map"}
                                </p>
                                {googleMapsUrl && (
                                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                                        View on Google Maps <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>

                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                                        <Clock className="w-4 h-4" /> Time Left
                                    </div>
                                    <span className="font-mono font-bold text-red-600">{timeLeft || "Loading..."}</span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Recent Bids</h4>
                                    {bids.length > 0 ? (
                                        bids.map((bid, idx) => (
                                            <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded ${idx === 0 ? "bg-white shadow-sm font-semibold border border-blue-100" : "text-gray-600"}`}>
                                                <span className="flex items-center gap-2">
                                                    {idx === 0 && <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 rounded">#1</span>}
                                                    {bid.bidderName}
                                                </span>
                                                <span>Rs. {formatCurrency(bid.bidAmount)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No bids yet. Be the first!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {vegetable.deliveryAvailable ? (
                                <div className="p-5 border border-gray-200 rounded-xl">
                                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                                        <Truck className="w-4 h-4 text-green-600" /> Delivery Options
                                    </h3>

                                    <RadioGroup value={addressOption} onValueChange={(v: any) => setAddressOption(v)} className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <RadioGroupItem value="default" id="popup-def" className="mt-1" />
                                            <div>
                                                <Label htmlFor="popup-def">Registered Address</Label>
                                                <p className="text-xs text-gray-500">{userDefaultAddress?.formattedAddress || "No address found"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <RadioGroupItem value="custom" id="popup-cust" className="mt-1" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="popup-cust">Custom Location</Label>
                                                    {addressOption === "custom" && (
                                                        <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => setIsAddressModalOpen(true)}>
                                                            {confirmedCustomLocation ? "Change" : "Select"}
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">{confirmedCustomLocation?.formattedAddress || "Select a location"}</p>
                                            </div>
                                        </div>
                                    </RadioGroup>

                                    <div className="mt-4 pt-3 border-t flex justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            {isCalculatingDistance ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                                            {distance} km
                                        </span>
                                        <span className="font-bold text-green-700">Fee: Rs. {formatCurrency(deliveryFee)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-orange-50 text-orange-800 rounded-xl border border-orange-100 flex gap-2 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <span className="font-bold block">Pickup Only</span>
                                        You must collect this item from the farmer.
                                    </div>
                                </div>
                            )}

                            {/* Bidding Input Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <Label className="text-gray-700 font-semibold">Your Bid Amount (Rs.)</Label>
                                <div className="relative mt-2 mb-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs.</span>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={formatBidInput(bidAmount)}
                                        onChange={handleBidChange}
                                        onWheel={preventScrollChange}
                                        className="pl-10 h-12 text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        // Placeholder removed as requested
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Min required: Rs. {formatCurrency(currentHighest + 1)}
                                </p>

                                {notification && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {notification.message}
                                    </div>
                                )}

                                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={initiateBid}>
                                    Place Bid
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Dialog */}
                {confirming && (
                    <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
                        <div className="max-w-md w-full">
                            <h3 className="text-2xl font-bold mb-6">Confirm Your Bid</h3>

                            <div className="bg-gray-50 p-6 rounded-xl space-y-3 mb-6 border border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Bid Amount</span>
                                    <span>Rs. {formatCurrency(parseBidAmount(bidAmount))}</span>
                                </div>
                                {vegetable.deliveryAvailable && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery Fee</span>
                                        <span>Rs. {formatCurrency(deliveryFee)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-bold text-lg text-blue-700">
                                    <span>Total Payable (If Won)</span>
                                    <span>Rs. {formatCurrency(parseBidAmount(bidAmount) + deliveryFee)}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 h-12" onClick={() => setConfirming(false)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700" onClick={submitBid} disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Place Bid"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold">Select Custom Location</h3>
                            <button onClick={() => setIsAddressModalOpen(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            <LocationPicker
                                value={tempCustomLocation}
                                onChange={setTempCustomLocation}
                                variant="light"
                                showStreetAddress={true}
                                required={true}
                                label=""
                            />
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
                            <Button onClick={saveCustomAddress}>Set Location</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}