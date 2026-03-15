/* fileName: auction-card.tsx */
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, MapPin, Clock } from "lucide-react"

interface AuctionCardProps {
    auction: any
    onOpen: (auction: any) => void
}

export function AuctionCard({ auction, onOpen }: AuctionCardProps) {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        if (!auction.endTime) return;

        const updateCountdown = () => {
            const endTime = new Date(auction.endTime).getTime()
            const now = new Date().getTime()
            const diff = endTime - now

            if (diff <= 0) {
                setTimeLeft("Ended")
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`)
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`)
            } else {
                setTimeLeft(`${minutes}m`)
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 60000)
        return () => clearInterval(interval)
    }, [auction.endTime])

    // Status Logic
    const status = auction.status?.toUpperCase()
    const isActive = status === "ACTIVE"
    const isDraft = status === "DRAFT"
    const isCompleted = status === "COMPLETED"
    const isCancelled = status === "CANCELLED" || status === "EXPIRED"

    // Sold Logic
    const soldPrice = auction.currentHighestBidAmount ?? 0
    const reserve = auction.reservePrice ?? 0
    const soldAtReserve = isCompleted && soldPrice >= reserve

    const getBadgeStyle = () => {
        if (isCompleted) return "bg-green-100 text-green-700 border-green-300"
        if (isCancelled) return "bg-red-100 text-red-700 border-red-300"
        if (isDraft) return "bg-gray-100 text-gray-700 border-gray-300"
        return "bg-blue-100 text-blue-700 border-blue-300"
    }

    const getStatusLabel = () => {
        if (isCompleted) return soldAtReserve ? "Sold (Met Reserve)" : "Sold (Below Reserve)"
        return status?.toLowerCase()
    }

    return (
        <Card
            onClick={() => onOpen(auction)}
            className={`p-0 border border-gray-100 bg-white rounded-[20px] shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                isCancelled ? "opacity-70 grayscale-[0.5]" : ""
            }`}
        >
            <div className="flex p-8 gap-8 relative flex-col sm:flex-row items-center sm:items-start">
                {/* Image Section */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#F1F1F1] border border-gray-50 flex items-center justify-center flex-shrink-0">
                    <img
                        src={auction.productImageUrl || "/placeholder.svg"}
                        alt={auction.productName}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content Section */}
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                            <h3 className="text-[22px] font-[800] text-[#03230F] tracking-tight leading-none mb-2">
                                {auction.productName}
                            </h3>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-gray-50">
                                    {auction.productQuantity} kg
                                </Badge>
                            </div>
                        </div>
                        <Badge className={`text-[11px] font-bold uppercase tracking-widest border ${getBadgeStyle()}`}>
                            {getStatusLabel()}
                        </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl">
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">
                                {isActive ? "Current Bid" : isCompleted ? "Sold Price" : "Starting Price"}
                            </p>
                            <p className="text-[18px] font-[700] text-[#D4A017]">
                                Rs. {(auction.currentHighestBidAmount ?? auction.startingPrice ?? 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">
                                Reserve Price
                            </p>
                            <p className="text-[18px] font-[700] text-[#1A1F25]">
                                {auction.reservePrice
                                    ? `Rs. ${auction.reservePrice.toLocaleString()}`
                                    : <span className="text-gray-400 text-sm font-normal">Not Set</span>
                                }
                            </p>
                        </div>

                        {/* Time Left / Starts In */}
                        {(isActive || isDraft) && (
                            <div className="space-y-1">
                                <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">
                                    {isDraft ? "Starts In" : "Time Left"}
                                </p>
                                <div className={`flex items-center gap-1.5 text-[18px] font-[700] ${isDraft ? "text-orange-600" : "text-[#03230F]"}`}>
                                    <Clock className="w-5 h-5" />
                                    {timeLeft}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delivery Info */}
                    {auction.isDeliveryAvailable && (
                        <div className="mt-6 flex items-center gap-2 text-[13px] text-[#697386]">
                            <Truck className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Delivery available</span>
                            <span className="text-[#A3ACBA]">•</span>
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {/* FIX: Render the entire address instead of splitting by comma */}
                            <span className="text-[#A3ACBA]">
                                {auction.pickupAddress ? auction.pickupAddress : "Location N/A"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}