"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, TrendingUp, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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
  const [isUpdatingReserve, setIsUpdatingReserve] = useState(false)
  const [isEndingAuction, setIsEndingAuction] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null
  const isActive = auction?.status?.toUpperCase() === "ACTIVE"

  // Countdown Timer
  useEffect(() => {
    if (!auction) return

    const updateCountdown = () => {
      const endTime = new Date(auction.endTime).getTime()
      const now = new Date().getTime()
      const diff = endTime - now

      if (diff <= 0) {
        setTimeLeft("Auction Ended")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [auction])

  const handleUpdateReservePrice = async () => {
    setError(null)
    if (!newReservePrice.trim()) {
      setError("Please enter a valid reserve price.")
      return
    }

    const price = parseFloat(newReservePrice)
    if (isNaN(price) || price <= 0) {
      setError("Reserve price must be a positive number.")
      return
    }

    setIsUpdatingReserve(true)
    try {
      const res = await fetch(
        `http://localhost:8080/api/auctions/${auction.id}/reserve-price`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newReservePrice: price }),
        }
      )

      if (res.ok) {
        toast.success("Reserve price updated successfully!")
        setNewReservePrice("")
        onUpdate()
      } else {
        const data = await res.json()
        setError(data.message || "Failed to update reserve price.")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setIsUpdatingReserve(false)
    }
  }

  const handleEndAuction = async () => {
    setError(null)
    setIsEndingAuction(true)
    try {
      const res = await fetch(
        `http://localhost:8080/api/auctions/${auction.id}/end-early`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.ok) {
        toast.success("Auction ended and winner selected!")
        onUpdate()
        onClose()
      } else {
        const data = await res.json()
        setError(data.message || "Failed to end auction.")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setIsEndingAuction(false)
    }
  }

  const handleCancelAuction = async () => {
    setError(null)
    setIsCancelling(true)
    try {
      const res = await fetch(
        `http://localhost:8080/api/auctions/${auction.id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.ok) {
        toast.success("Auction cancelled successfully!")
        onUpdate()
        onClose()
      } else {
        const data = await res.json()
        setError(data.message || "Failed to cancel auction.")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (!auction) return null

  const topBids = auction.bids?.slice(0, 3) || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[30px] p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-black text-[#03230F] tracking-tight">
            {auction.productName}
          </DialogTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#03230F]" />
              <span className="text-[#D4A017] font-bold text-lg">{timeLeft}</span>
            </div>
            <Badge className="bg-[#03230F] text-[#D4A017] text-[11px] font-bold uppercase tracking-widest border-0">
              {auction.status?.toLowerCase()}
            </Badge>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 py-6">
          {/* Left: Auction Info */}
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden bg-gray-100 h-64 flex items-center justify-center">
              <img
                src={auction.productImageUrl || "/placeholder.svg"}
                alt={auction.productName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-widest">
                  Product Details
                </p>
                <p className="text-[14px] text-[#1A1F25] font-medium">
                  {auction.description}
                </p>
                <p className="text-[13px] text-[#697386] font-medium">
                  Quantity: <span className="font-bold text-[#03230F]">{auction.productQuantity} kg</span>
                </p>
              </div>

              {/* Pickup Address */}
              {auction.pickupAddress && (
                <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[13px] text-[#697386]">
                    <p className="font-bold text-[#03230F] mb-1">Pickup Location</p>
                    <p>{auction.pickupAddress}</p>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              {auction.isDeliveryAvailable && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-[13px] font-bold text-green-700 mb-2">✓ Delivery Available</p>
                  <p className="text-[12px] text-green-600">
                    Base Fee: Rs. {auction.baseDeliveryFee} + Rs. {auction.extraFeePer3Km} per 3km
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bids & Controls */}
          <div className="space-y-6">
            {/* Bid Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#D4A017]/10 to-[#D4A017]/5 p-4 rounded-xl border border-[#D4A017]/20">
                <p className="text-[11px] text-[#A3ACBA] font-bold uppercase tracking-widest mb-1">
                  Current Bid
                </p>
                <p className="text-[24px] font-black text-[#D4A017]">
                  Rs. {(auction.currentHighestBidAmount || auction.startingPrice).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#03230F]/10 to-[#03230F]/5 p-4 rounded-xl border border-[#03230F]/20">
                <p className="text-[11px] text-[#A3ACBA] font-bold uppercase tracking-widest mb-1">
                  Reserve
                </p>
                <p className="text-[24px] font-black text-[#03230F]">
                  Rs. {auction.reservePrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Bids */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <p className="text-[11px] text-[#A3ACBA] font-bold uppercase tracking-widest">
                {topBids.length > 0 ? "Top Bids" : "No Bids Yet"}
              </p>
              {topBids.map((bid, idx) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-black text-[#A3ACBA] bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-[#1A1F25]">{bid.bidderName}</p>
                      <p className="text-[11px] text-[#A3ACBA]">
                        {new Date(bid.bidTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] font-black text-[#D4A017]">
                    Rs. {bid.bidAmount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Control Panel */}
            {isActive && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* Update Reserve Price */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#03230F] block">
                    Lower Reserve Price
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter new reserve price"
                      value={newReservePrice}
                      onChange={(e) => {
                        setError(null)
                        setNewReservePrice(e.target.value)
                      }}
                      className="flex-1 h-10 rounded-lg focus:ring-[#03230F]"
                    />
                    <Button
                      onClick={handleUpdateReservePrice}
                      disabled={isUpdatingReserve || !newReservePrice.trim()}
                      className="h-10 bg-[#03230F] hover:bg-black text-[#EEC044] font-bold rounded-lg uppercase tracking-widest transition-all"
                    >
                      {isUpdatingReserve ? "..." : "Update"}
                    </Button>
                  </div>
                </div>

                {/* End Auction Button */}
                <Button
                  onClick={handleEndAuction}
                  disabled={isEndingAuction}
                  className="w-full h-11 bg-[#D4A017] hover:bg-[#C49007] text-[#03230F] font-bold rounded-lg uppercase tracking-widest transition-all"
                >
                  {isEndingAuction ? "Ending..." : "End Auction & Select Winner"}
                </Button>

                {/* Cancel Button */}
                <Button
                  onClick={handleCancelAuction}
                  disabled={isCancelling}
                  variant="destructive"
                  className="w-full h-11 rounded-lg uppercase tracking-widest font-bold transition-all"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Auction"}
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-red-600">
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
