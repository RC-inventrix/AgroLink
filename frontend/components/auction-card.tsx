"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Truck, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"

interface AuctionCardProps {
    auction: any
    onOpen: (auction: any) => void
}

export function AuctionCard({ auction, onOpen }: AuctionCardProps) {
    const [timeLeft, setTimeLeft] = useState("")

    useEffect(() => {
        // If no end time, don't run countdown
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

    const statusColors = {
        ACTIVE: "bg-blue-100 text-blue-700 border-blue-200",
        COMPLETED: "bg-green-100 text-green-700 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
        EXPIRED: "bg-orange-100 text-orange-700 border-orange-200",
        DRAFT: "bg-gray-100 text-gray-700 border-gray-200", // Added Draft style
    }

    // Safe checks for active/draft status
    const isActive = auction?.status?.toUpperCase() === "ACTIVE"
    const isDraft = auction?.status?.toUpperCase() === "DRAFT"

    // --- FIX: Logic to handle sold banners safely ---
    const isSold = auction?.status?.toUpperCase() === "COMPLETED"
    const soldPrice = auction.currentHighestBidAmount ?? 0
    const reserve = auction.reservePrice ?? 0
    const soldAtReserve = isSold && soldPrice >= reserve

    return (
        <Card
            onClick={() => onOpen(auction)}
            className="group relative overflow-hidden transition-all hover:shadow-lg border-border/60 cursor-pointer bg-white"
        >
            <div className="flex flex-col sm:flex-row p-4 gap-6">
                {/* Left: Image */}
                <div className="relative w-full sm:w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img
                        src={auction.productImageUrl || "/placeholder.png"}
                        alt={auction.productName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[#03230F] font-bold shadow-sm"
                    >
                        {auction.productQuantity}kg
                    </Badge>
                </div>

                {/* Right: Content */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge
                                    variant="outline"
                                    className={`font-bold tracking-wide border ${
                                        statusColors[auction.status as keyof typeof statusColors] ||
                                        "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {auction.status}
                                </Badge>
                                <span className="text-[12px] text-muted-foreground font-medium">
                  #{auction.id}
                </span>
                            </div>
                            <h3 className="text-xl font-black text-[#03230F] group-hover:text-[#D4A017] transition-colors">
                                {auction.productName}
                            </h3>
                        </div>

                        {/* Status Banners for Sold/Cancelled */}
                        {isSold && (
                            <Badge
                                className={`${
                                    soldAtReserve ? "bg-green-600" : "bg-yellow-500"
                                } text-white border-0 px-3 py-1`}
                            >
                                {soldAtReserve ? "Sold at Reserve" : "Sold Below Reserve"}
                            </Badge>
                        )}
                        {auction.status === "CANCELLED" && (
                            <Badge variant="destructive">Cancelled</Badge>
                        )}
                        {auction.status === "EXPIRED" && (
                            <Badge variant="destructive">Expired</Badge>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">
                                {isActive ? "Current Bid" : isSold ? "Sold Price" : "Starting Price"}
                            </p>
                            <p className="text-[18px] font-[700] text-[#1A1F25]">
                                {/* --- FIX: Use nullish coalescing (??) to prevent undefined errors --- */}
                                Rs. {(auction.currentHighestBidAmount ?? auction.startingPrice ?? 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">
                                Reserve Price
                            </p>
                            <p className="text-[18px] font-[700] text-[#1A1F25]">
                                {/* --- FIX: Handle null reserve price safely --- */}
                                {auction.reservePrice
                                    ? `Rs. ${auction.reservePrice.toLocaleString()}`
                                    : <span className="text-gray-400 text-sm font-normal">Not Set</span>
                                }
                            </p>
                        </div>

                        {/* Time Display */}
                        {(isActive || isDraft) && (
                            <div className="space-y-1">
                                <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">
                                    {isDraft ? "Starts In" : "Time Left"}
                                </p>
                                <div className={`flex items-center gap-1.5 text-[18px] font-[700] ${isDraft ? "text-orange-600" : "text-[#03230F]"}`}>
                                    <Clock className="w-5 h-5" />
                                    {/* For drafts, you might want to calculate time until start, but using same logic for now is fine if it shows future date */}
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
                            <span className="text-[#A3ACBA]">
                {auction.pickupAddress ? auction.pickupAddress.split(",")[0] : "Location N/A"}
              </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}