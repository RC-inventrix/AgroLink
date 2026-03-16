/* fileName: auction-details-modal.tsx */
"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, TrendingUp, Calendar, User, Loader2, Truck, Gavel, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface AuctionDetailsModalProps {
    isOpen: boolean
    auction: any | null
    onClose: () => void
    onUpdate: () => void
}

export function AuctionDetailsModal({
                                        isOpen,
                                        auction,
                                        onClose,
                                        onUpdate,
                                    }: AuctionDetailsModalProps) {
    const [timeLeft, setTimeLeft] = useState("")
    const [newReservePrice, setNewReservePrice] = useState("")

    // --- NEW STATES FOR TIME EDITING ---
    const [editStartTime, setEditStartTime] = useState("")
    const [editEndTime, setEditEndTime] = useState("")
    const [isUpdatingTime, setIsUpdatingTime] = useState(false)

    const [isUpdatingReserve, setIsUpdatingReserve] = useState(false)
    const [isEndingAuction, setIsEndingAuction] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // --- STATE FOR BIDS FETCHING ---
    const [detailedAuction, setDetailedAuction] = useState<any>(null)
    const [loadingBids, setLoadingBids] = useState(false)

    // Format dates for input fields (YYYY-MM-DDTHH:mm)
    useEffect(() => {
        if (auction) {
            setEditStartTime(auction.startTime ? auction.startTime.substring(0, 16) : "")
            setEditEndTime(auction.endTime ? auction.endTime.substring(0, 16) : "")
        }
    }, [auction])

    // --- FETCH FULL AUCTION DETAILS (FOR BIDS) ---
    useEffect(() => {
        if (isOpen && auction?.id) {
            setLoadingBids(true)
            fetch(`${API_URL}/api/auctions/${auction.id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch detailed auction")
                    return res.json()
                })
                .then(data => {
                    setDetailedAuction(data)
                })
                .catch(err => console.error("Error fetching bids:", err))
                .finally(() => setLoadingBids(false))
        }
    }, [isOpen, auction?.id])

    // --- Timer Logic ---
    useEffect(() => {
        if (!auction?.endTime) return;

        const interval = setInterval(() => {
            const diff = new Date(auction.endTime).getTime() - new Date().getTime()
            if (diff <= 0) {
                setTimeLeft("Ended")
                clearInterval(interval)
                return
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24))
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            setTimeLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`)
        }, 1000)

        return () => clearInterval(interval)
    }, [auction?.endTime])

    if (!isOpen || !auction) return null

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    const handleUpdateTime = async () => {
        setError(null)
        setIsUpdatingTime(true)
        try {
            const res = await fetch(`${API_URL}/api/auctions/${auction.id}/time`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    startTime: editStartTime.length === 16 ? editStartTime + ":00" : editStartTime,
                    endTime: editEndTime.length === 16 ? editEndTime + ":00" : editEndTime
                }),
            })
            if (res.ok) {
                toast.success("Auction time updated successfully")
                onUpdate()
            } else {
                const errData = await res.text()
                setError(errData || "Failed to update time.")
            }
        } catch (e: any) {
            setError("Network error occurred.")
        } finally {
            setIsUpdatingTime(false)
        }
    }

    const handleUpdateReserve = async () => {
        setError(null)
        setIsUpdatingReserve(true)
        try {
            const res = await fetch(`${API_URL}/api/auctions/${auction.id}/reserve-price`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reservePrice: parseFloat(newReservePrice) }),
            })
            if (res.ok) {
                toast.success("Reserve price updated successfully")
                setNewReservePrice("")
                onUpdate()
            } else {
                const errData = await res.text()
                setError(errData || "Failed to update reserve price.")
            }
        } catch (e: any) {
            setError("Network error occurred.")
        } finally {
            setIsUpdatingReserve(false)
        }
    }

    const handleEndAuctionEarly = async () => {
        setError(null)
        setIsEndingAuction(true)
        try {
            const res = await fetch(`${API_URL}/api/auctions/${auction.id}/end-early`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                toast.success("Auction ended and winner selected!")
                onUpdate()
            } else {
                const errData = await res.text()
                setError(errData || "Failed to end auction.")
            }
        } catch (e: any) {
            setError("Network error occurred.")
        } finally {
            setIsEndingAuction(false)
        }
    }

    const handleCancelAuction = async () => {
        setError(null)
        setIsCancelling(true)
        try {
            const res = await fetch(`${API_URL}/api/auctions/${auction.id}/cancel`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                toast.success("Auction cancelled successfully")
                onUpdate()
            } else {
                const errData = await res.text()
                setError(errData || "Failed to cancel auction.")
            }
        } catch (e: any) {
            setError("Network error occurred.")
        } finally {
            setIsCancelling(false)
        }
    }

    const isActive = auction.status === 'ACTIVE'
    const isDraft = auction.status === 'DRAFT'
    const isCompleted = auction.status === 'COMPLETED'
    const isCancelled = auction.status === 'CANCELLED' || auction.status === 'EXPIRED'
    const bids = detailedAuction?.topBids || []

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* FIX: Forced maximum width and viewport width overrides to give elements breathing room */}
            <DialogContent className="!max-w-[1200px] w-[95vw] md:w-[90vw] p-0 overflow-hidden bg-white border-none rounded-2xl shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-bold text-[#03230F] flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-[#D4A017]" />
                            {auction.productName}
                        </DialogTitle>
                        <Badge className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${
                            isCompleted ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                isCancelled ? "bg-red-100 text-red-700 hover:bg-red-200" :
                                    isDraft ? "bg-gray-100 text-gray-700 hover:bg-gray-200" :
                                        "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}>
                            {auction.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200 absolute right-4 top-4">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* FIX: Adjusted to md:grid-cols-2 to prevent elements stacking on top of each other on laptop screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-10 max-h-[80vh] overflow-y-auto">

                    {/* LEFT COLUMN: Details & Bid History */}
                    <div className="space-y-6">
                        {/* Image & Basic Info */}
                        <div className="flex gap-5 items-start">
                            <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                <img
                                    src={auction.productImageUrl || "/placeholder.svg"}
                                    alt={auction.productName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Badge variant="secondary" className="bg-gray-100 px-3 py-1 text-sm">{auction.productQuantity} kg</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-orange-600 text-base">{timeLeft}</span>
                                </div>
                                {auction.isDeliveryAvailable && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Truck className="w-4 h-4 text-green-600" />
                                        <span className="text-base">Delivery available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Prices */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Starting Price</span>
                                <span className="font-bold text-lg text-gray-900">Rs. {formatCurrency(auction.startingPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Reserve Price</span>
                                <span className="font-bold text-lg text-gray-900">
                                    {auction.reservePrice ? `Rs. ${formatCurrency(auction.reservePrice)}` : "Not Set"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">Highest Bid</span>
                                <span className="text-2xl font-black text-[#D4A017]">
                                    Rs. {formatCurrency(detailedAuction?.currentHighestBidAmount || auction.currentHighestBidAmount || auction.startingPrice)}
                                </span>
                            </div>
                        </div>

                        {/* LIVE BID HISTORY */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col max-h-[350px]">
                            <h4 className="text-sm font-bold uppercase text-blue-600 tracking-wider mb-4">Live Bid History</h4>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {loadingBids ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-blue-500">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                        <p className="text-sm font-medium">Fetching bids...</p>
                                    </div>
                                ) : bids.length > 0 ? (
                                    bids.map((bid: any, idx: number) => (
                                        <div key={idx} className={`flex justify-between items-center text-base p-3 rounded-lg ${idx === 0 ? "bg-white shadow-md font-bold border border-blue-200" : "bg-white/60 text-gray-700 font-medium"}`}>
                                            <div className="flex items-center gap-3">
                                                {idx === 0 && <span className="text-[11px] bg-[#D4A017] text-white px-2 py-1 rounded uppercase font-black tracking-widest">Top</span>}
                                                <span className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {bid.bidderName || `Bidder #${bid.bidderId}`}
                                                </span>
                                            </div>
                                            <span className={idx === 0 ? "text-[#03230F] font-black" : ""}>Rs. {formatCurrency(bid.bidAmount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-10 h-10 text-blue-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-blue-500 italic">No bids have been placed for this auction yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Actions & Editing */}
                    <div className="space-y-6">
                        {(isDraft || isActive) && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
                                <h4 className="text-base font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3">
                                    <Calendar className="w-5 h-5 text-[#D4A017]" />
                                    Edit Auction Time
                                </h4>

                                <div className="space-y-4">
                                    {isDraft && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                                            <Input
                                                type="datetime-local"
                                                value={editStartTime}
                                                onChange={(e) => setEditStartTime(e.target.value)}
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Time</label>
                                        <Input
                                            type="datetime-local"
                                            value={editEndTime}
                                            onChange={(e) => setEditEndTime(e.target.value)}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleUpdateTime}
                                        disabled={isUpdatingTime}
                                        className="w-full h-10 text-sm bg-gray-900 text-white hover:bg-gray-800"
                                    >
                                        {isUpdatingTime ? "Saving..." : "Update Time"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {(isActive || isDraft) && (
                            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                                <h4 className="text-base font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3">
                                    <TrendingUp className="w-5 h-5 text-[#D4A017]" />
                                    Lower Reserve Price
                                </h4>
                                <div className="flex gap-3">
                                    <Input
                                        type="number"
                                        placeholder="New minimum..."
                                        value={newReservePrice}
                                        onChange={(e) => setNewReservePrice(e.target.value)}
                                        className="h-10 text-sm flex-1"
                                    />
                                    <Button
                                        onClick={handleUpdateReserve}
                                        disabled={isUpdatingReserve || !newReservePrice}
                                        className="h-10 text-sm px-8 bg-gray-900 text-white hover:bg-gray-800"
                                    >
                                        {isUpdatingReserve ? "..." : "Save"}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">Note: You can only lower the reserve price.</p>
                            </div>
                        )}

                        {(isActive || isDraft) && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-6 space-y-4">
                                <h4 className="text-base font-bold flex items-center gap-2 text-red-900 mb-3">
                                    <AlertCircle className="w-5 h-5" />
                                    Danger Zone
                                </h4>

                                {isActive && (
                                    <Button
                                        onClick={handleEndAuctionEarly}
                                        disabled={isEndingAuction || bids.length === 0}
                                        className="w-full h-12 bg-[#D4A017] hover:bg-[#D4A017]/90 text-[#03230F] font-bold rounded-lg uppercase tracking-widest transition-all"
                                    >
                                        {isEndingAuction ? "Ending Auction..." : "Select Winner Now"}
                                    </Button>
                                )}

                                <Button
                                    onClick={handleCancelAuction}
                                    disabled={isCancelling}
                                    variant="destructive"
                                    className="w-full h-12 rounded-lg uppercase tracking-widest font-bold transition-all text-sm"
                                >
                                    {isCancelling ? "Cancelling..." : isActive ? "Cancel Auction" : "Delete Draft"}
                                </Button>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-bold uppercase tracking-widest text-red-600">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}