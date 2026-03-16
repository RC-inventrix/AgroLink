/* fileName: components/auction-details-modal.tsx */
"use client"

import { useState, useEffect } from "react"
import { X, Gavel, Clock, MapPin, Truck, AlertCircle, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface AuctionDetailsModalProps {
    isOpen: boolean
    auction: any
    onClose: () => void
    onUpdate: () => void
}

export function AuctionDetailsModal({ isOpen, auction, onClose, onUpdate }: AuctionDetailsModalProps) {
    const [detailedAuction, setDetailedAuction] = useState<any>(null)
    const [loadingBids, setLoadingBids] = useState(false)
    const [timeLeft, setTimeLeft] = useState("")

    // --- FIX: Fetch full auction details (including bids) when modal opens ---
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', { style: 'decimal', minimumFractionDigits: 2 }).format(amount || 0);
    }

    // Safely extract the bids from the newly fetched detailedAuction
    const bids = detailedAuction?.topBids || []
    const isCompleted = auction.status === 'COMPLETED'
    const isCancelled = auction.status === 'CANCELLED' || auction.status === 'EXPIRED'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-[#03230F]" />
                        Auction Details & Live Bids
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* LEFT COLUMN: Auction Info */}
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <img src={auction.productImageUrl || "/placeholder.svg"} alt={auction.productName} className="w-24 h-24 rounded-lg object-cover bg-white" />
                                <div>
                                    <h3 className="font-bold text-xl">{auction.productName}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{auction.productQuantity} kg available</p>
                                    <Badge variant="outline" className={isCompleted ? "bg-green-100 text-green-800" : isCancelled ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                                        {auction.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <span className="text-sm text-gray-500 uppercase font-bold">Starting Price</span>
                                    <span className="font-bold text-gray-900">Rs. {formatCurrency(auction.startingPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-3">
                                    <span className="text-sm text-gray-500 uppercase font-bold">Reserve Price</span>
                                    <span className="font-bold text-gray-900">{auction.reservePrice ? `Rs. ${formatCurrency(auction.reservePrice)}` : "Not Set"}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-sm text-[#D4A017] uppercase font-bold">Current Highest</span>
                                    <span className="font-bold text-xl text-[#D4A017]">
                                        Rs. {formatCurrency(detailedAuction?.currentHighestBidAmount || auction.currentHighestBidAmount || auction.startingPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Live Bid History */}
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col h-full min-h-[300px]">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-blue-200/50">
                                <div className="flex items-center gap-2 text-blue-800 font-medium">
                                    <Clock className="w-4 h-4" /> Time Left
                                </div>
                                <span className="font-mono font-bold text-red-600">{timeLeft || "Loading..."}</span>
                            </div>

                            <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider mb-3">Live Bid History</h4>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {loadingBids ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-blue-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <p className="text-sm">Fetching bids...</p>
                                    </div>
                                ) : bids.length > 0 ? (
                                    bids.map((bid: any, idx: number) => (
                                        <div key={idx} className={`flex justify-between items-center text-sm p-3 rounded-lg ${idx === 0 ? "bg-white shadow-sm font-semibold border border-blue-200" : "bg-white/50 text-gray-600"}`}>
                                            <div className="flex items-center gap-3">
                                                {idx === 0 && <span className="text-[10px] bg-[#D4A017] text-white px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Top</span>}
                                                <span className="flex items-center gap-1.5">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                    {bid.bidderName || `Bidder #${bid.bidderId}`}
                                                </span>
                                            </div>
                                            <span className={idx === 0 ? "text-[#03230F] font-bold" : "font-medium"}>Rs. {formatCurrency(bid.bidAmount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <AlertCircle className="w-10 h-10 text-blue-200 mx-auto mb-2" />
                                        <p className="text-sm text-blue-400 italic">No bids have been placed for this auction yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}