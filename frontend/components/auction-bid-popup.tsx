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
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

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

const formatBidInput = (value: string) => {
    if (!value) return ""
    const [intPart, decimalPart] = value.split(".")
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt
}

const parseBidAmount = (value: string) => parseFloat(value.replace(/,/g, ""))

export default function AuctionBidPopup({ isOpen, onClose, vegetable }: AuctionBidPopupProps) {
    const { t } = useLanguage() // Initialized the hook
    const [bids, setBids] = useState<Bid[]>([])
    const [currentHighest, setCurrentHighest] = useState<number>(vegetable.currentBid || vegetable.startingPrice || 0)
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [bidAmount, setBidAmount] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [confirming, setConfirming] = useState(false)

    const [buyerEmail, setBuyerEmail] = useState<string>("")
    const [buyerName, setBuyerName] = useState<string>("")
    const [auctionDeliveryConfig, setAuctionDeliveryConfig] = useState<{ base: number, extra: number }>({ base: 0, extra: 0 })
    const [userDefaultAddress, setUserDefaultAddress] = useState<FullAddress | null>(null)
    const [addressOption, setAddressOption] = useState<"default" | "custom">("default")
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [tempCustomLocation, setTempCustomLocation] = useState<any>({ latitude: null, longitude: null, streetAddress: "" })
    const [confirmedCustomLocation, setConfirmedCustomLocation] = useState<FullAddress | null>(null)
    const [distance, setDistance] = useState<number>(0)
    const [deliveryFee, setDeliveryFee] = useState<number>(0)
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)

    useEffect(() => {
        if (isOpen && vegetable.id) {
            const fetchAuctionDetails = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/auctions/${vegetable.id}`)
                    if (res.ok) {
                        const data = await res.json()
                        setBids(data.topBids || [])
                        setCurrentHighest(data.currentHighestBidAmount || data.startingPrice || 0)

                        setAuctionDeliveryConfig({
                            base: data.baseDeliveryFee || 0,
                            extra: data.extraFeePer3Km || 0
                        })
                    }
                } catch (e) { console.error("Failed to fetch auction details", e) }
            }
            fetchAuctionDetails()
            const interval = setInterval(fetchAuctionDetails, 5000)
            return () => clearInterval(interval)
        }
    }, [isOpen, vegetable.id])

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = sessionStorage.getItem("id")
            const token = sessionStorage.getItem("token")
            if (userId && isOpen) {
                try {
                    const userRes = await fetch(`${API_URL}/auth/user/${userId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    if (userRes.ok) {
                        const userData = await userRes.json()
                        setBuyerEmail(userData.email || "")

                        const fullName = userData.fullname || userData.name || sessionStorage.getItem("name") || "Valued Bidder";
                        setBuyerName(fullName);
                    }

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

    useEffect(() => {
        if (!vegetable.endTime) return
        const timer = setInterval(() => {
            const end = new Date(vegetable.endTime!).getTime()
            const now = new Date().getTime()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft(t("bidPopupEnded"))
                clearInterval(timer)
            } else {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                
                if (days > 0) setTimeLeft(`${days}${t("Day")} ${hours}${t("Hour")} ${minutes}${t("Min")}`)
                else setTimeLeft(`${hours}${t("Hour")} ${minutes}${t("Min")} ${seconds}${t("Sec")}`)
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [vegetable.endTime, t])

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

                    const base = auctionDeliveryConfig.base || vegetable.baseCharge || 0
                    const rate = auctionDeliveryConfig.extra || vegetable.extraRatePerKm || 0

                    const chargeableDist = Math.max(0, calculatedDistance - 5)
                    const fee = base + (chargeableDist * rate)
                    setDeliveryFee(Math.round(fee))

                } catch (error) { console.error("Distance error", error) } 
                finally { setIsCalculatingDistance(false) }
            } else {
                setDistance(0)
                setDeliveryFee(0)
            }
        }
        calculateRoute()
    }, [addressOption, userDefaultAddress, confirmedCustomLocation, vegetable, isOpen, auctionDeliveryConfig])

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
            setNotification({ message: t("bidPopupValidAmount"), type: "error" })
            return false
        }
        if (amount <= currentHighest) {
            setNotification({ message: t("bidPopupHigherThan").replace("{amount}", formatCurrency(currentHighest)), type: "error" })
            return false
        }
        if (vegetable.deliveryAvailable && addressOption === "custom" && !confirmedCustomLocation) {
            setNotification({ message: t("bidPopupSelectDelivery"), type: "error" })
            return false
        }
        return true
    }

    const initiateBid = () => {
        if (validateBid()) setConfirming(true)
    }

    const submitBid = async () => {
        setLoading(true)
        const userId = sessionStorage.getItem("id")

        if (!userId) {
            setNotification({ message: t("bidPopupMustLogin"), type: "error" })
            setLoading(false)
            return
        }

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
                    bidderEmail: buyerEmail, 
                    bidAmount: parseBidAmount(bidAmount),
                    deliveryAddress: deliveryAddressObj
                })
            })

            if (res.ok) {
                const data = await res.json()
                setNotification({ message: t("bidPopupSuccess"), type: "success" })

                setCurrentHighest(data.bidAmount)
                setBids(prev => [{
                    id: data.id,
                    bidderName: t("bidPopupYou"),
                    bidAmount: data.bidAmount,
                    bidTime: new Date().toISOString(),
                    rank: 1
                }, ...prev].slice(0, 5))

                setConfirming(false)
                setBidAmount("")
            } else {
                const errData = await res.text()
                setNotification({ message: `${t("bidPopupFailed")}${errData || t("bidPopupCouldNotPlace")}`, type: "error" })
                setConfirming(false)
            }
        } catch (e) {
            setNotification({ message: t("bidPopupNetworkErr"), type: "error" })
            setConfirming(false)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const googleMapsUrl = vegetable.pickupLatitude && vegetable.pickupLongitude
        ? `https://www.google.com/maps/search/?api=1&query=${vegetable.pickupLatitude},${vegetable.pickupLongitude}`
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-blue-600 shrink-0" />
                        {t("bidPopupTitle")}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200 shrink-0">
                        <X className="w-5 h-5 shrink-0" />
                    </Button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <img src={vegetable.image} alt={vegetable.name} className="w-24 h-24 rounded-lg object-cover bg-white shrink-0" />
                                <div>
                                    <h3 className="font-bold text-xl">{vegetable.name}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{vegetable.quantity} {t("bidPopupKgAvail")}</p>
                                    <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
                                        <Store className="w-4 h-4 shrink-0" /> {vegetable.seller} ({vegetable.rating} ★)
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{vegetable.description}</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" /> {t("bidPopupFarmerLoc")}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    {vegetable.pickupAddress || t("bidPopupLocMap")}
                                </p>
                                {googleMapsUrl && (
                                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                                        {t("bidPopupViewMap")} <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                )}
                            </div>

                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                                        <Clock className="w-4 h-4 shrink-0" /> {t("bidPopupTimeLeft")}
                                    </div>
                                    <span className="font-mono font-bold text-red-600">{timeLeft || t("bidPopupLoading")}</span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider">{t("bidPopupRecentBids")}</h4>
                                    {bids.length > 0 ? (
                                        bids.map((bid, idx) => (
                                            <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded ${idx === 0 ? "bg-white shadow-sm font-semibold border border-blue-100" : "text-gray-600"}`}>
                                                <span className="flex items-center gap-2">
                                                    {idx === 0 && <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 rounded h-auto py-0.5">#1</span>}
                                                    {bid.bidderName}
                                                </span>
                                                <span>Rs. {formatCurrency(bid.bidAmount)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">{t("bidPopupNoBids")}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                            {vegetable.deliveryAvailable ? (
                                <div className="p-5 border border-gray-200 rounded-xl">
                                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                                        <Truck className="w-4 h-4 text-green-600 shrink-0" /> {t("bidPopupDelOptions")}
                                    </h3>

                                    <RadioGroup value={addressOption} onValueChange={(v: any) => setAddressOption(v)} className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <RadioGroupItem value="default" id="popup-def" className="mt-1 shrink-0" />
                                            <div>
                                                <Label htmlFor="popup-def">{t("bidPopupRegAddress")}</Label>
                                                <p className="text-xs text-gray-500">{userDefaultAddress?.formattedAddress || t("bidPopupNoAddress")}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <RadioGroupItem value="custom" id="popup-cust" className="mt-1 shrink-0" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="popup-cust">{t("bidPopupCustomLoc")}</Label>
                                                    {addressOption === "custom" && (
                                                        <Button variant="outline" size="sm" className="h-auto py-1 text-[10px]" onClick={() => setIsAddressModalOpen(true)}>
                                                            {confirmedCustomLocation ? t("bidPopupChange") : t("bidPopupSelect")}
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">{confirmedCustomLocation?.formattedAddress || t("bidPopupSelectLoc")}</p>
                                            </div>
                                        </div>
                                    </RadioGroup>

                                    <div className="mt-4 pt-3 border-t flex justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            {isCalculatingDistance ? <Loader2 className="w-3 h-3 animate-spin shrink-0" /> : <Navigation className="w-3 h-3 shrink-0" />}
                                            {distance} km
                                        </span>
                                        <span className="font-bold text-green-700">{t("bidPopupFee")}{formatCurrency(deliveryFee)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-orange-50 text-orange-800 rounded-xl border border-orange-100 flex gap-2 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <span className="font-bold block">{t("bidPopupPickupOnly")}</span>
                                        {t("bidPopupMustCollect")}
                                    </div>
                                </div>
                            )}

                            {/* Bidding Input Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <Label className="text-gray-700 font-semibold">{t("bidPopupYourBid")}</Label>
                                <div className="relative mt-2 mb-2">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs.</span>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={formatBidInput(bidAmount)}
                                        onChange={handleBidChange}
                                        onWheel={preventScrollChange}
                                        className="pl-10 h-12 text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    {t("bidPopupMinReq")}{formatCurrency(currentHighest + 1)}
                                </p>

                                {notification && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {notification.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                        {notification.message}
                                    </div>
                                )}

                                <Button size="lg" className="w-full h-auto py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all" onClick={initiateBid}>
                                    {t("PlaceBid")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Dialog */}
                {confirming && (
                    <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
                        <div className="max-w-md w-full">
                            <h3 className="text-2xl font-bold mb-6">{t("bidPopupConfirmTitle")}</h3>

                            <div className="bg-gray-50 p-6 rounded-xl space-y-3 mb-6 border border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("bidPopupBidAmount")}</span>
                                    <span>Rs. {formatCurrency(parseBidAmount(bidAmount))}</span>
                                </div>
                                {vegetable.deliveryAvailable && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t("bidPopupDelFee")}</span>
                                        <span>Rs. {formatCurrency(deliveryFee)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-bold text-lg text-blue-700">
                                    <span>{t("bidPopupTotalPayable")}</span>
                                    <span>Rs. {formatCurrency(parseBidAmount(bidAmount) + deliveryFee)}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 h-auto py-3" onClick={() => setConfirming(false)} disabled={loading}>
                                    {t("bidPopupCancel")}
                                </Button>
                                <Button className="flex-1 h-auto py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={submitBid} disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin shrink-0" /> : t("bidPopupConfirmBtn")}
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
                        <div className="p-4 border-b flex justify-between items-center shrink-0">
                            <h3 className="font-bold">{t("bidPopupSelectCustomLoc")}</h3>
                            <button onClick={() => setIsAddressModalOpen(false)}><X className="w-5 h-5 shrink-0 text-gray-500 hover:text-black" /></button>
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
                        <div className="p-4 border-t flex justify-end gap-2 shrink-0">
                            <Button variant="ghost" className="h-auto py-2" onClick={() => setIsAddressModalOpen(false)}>{t("bidPopupCancel")}</Button>
                            <Button className="h-auto py-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={saveCustomAddress}>{t("bidPopupSetLoc")}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}