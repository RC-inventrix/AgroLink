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
import { AlertCircle, Clock, TrendingUp, MapPin, Truck, Calendar, Hourglass, PlayCircle, Save } from "lucide-react"
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

    // --- NEW STATES FOR TIME EDITING ---
    const [editStartTime, setEditStartTime] = useState("")
    const [editEndTime, setEditEndTime] = useState("")
    const [isUpdatingTime, setIsUpdatingTime] = useState(false)

    const [isUpdatingReserve, setIsUpdatingReserve] = useState(false)
    const [isEndingAuction, setIsEndingAuction] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [isStartingNow, setIsStartingNow] = useState(false) // New state
    const [error, setError] = useState<string | null>(null)

    // --- NEW: State for full details ---
    const [fetchedDetails, setFetchedDetails] = useState<any>(null)

    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null

    // --- NEW: Fetch Full Details on Open ---
    useEffect(() => {
        if (isOpen && auction?.id) {
            setFetchedDetails(null);
            const fetchFullDetails = async () => {
                try {
                    const res = await fetch(`http://localhost:8080/api/auctions/${auction.id}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setFetchedDetails(data);
                        // Initialize edit states
                        setEditStartTime(data.startTime ? data.startTime.slice(0, 16) : "");
                        setEditEndTime(data.endTime ? data.endTime.slice(0, 16) : "");
                    }
                } catch (e) {
                    console.error("Failed to load full auction details", e);
                }
            };
            fetchFullDetails();
        }
    }, [isOpen, auction, token]);

    // --- USE MERGED DATA ---
    const displayData = fetchedDetails || auction;

    // Status Checks
    const status = displayData?.status?.toUpperCase()
    const isActive = status === "ACTIVE"
    const isDraft = status === "DRAFT"
    const isEditable = isActive || isDraft

    // --- HELPER: Safe Date Parsing & Formatting ---
    const parseDate = (dateInput: any) => {
        if (!dateInput) return null;
        const d = new Date(dateInput);
        return isNaN(d.getTime()) ? null : d;
    };

    // --- FIX: Header Z-Index Management ---
    useEffect(() => {
        if (isOpen) {
            const header = document.querySelector('header');
            let originalZIndex = '';
            if (header) {
                originalZIndex = header.style.zIndex;
                header.style.zIndex = '0';
            }
            return () => {
                if (header) {
                    header.style.zIndex = originalZIndex;
                }
            };
        }
    }, [isOpen]);

    // Countdown Timer
    useEffect(() => {
        if (!displayData) return

        const updateCountdown = () => {
            const start = parseDate(displayData.startTime);
            const end = parseDate(displayData.endTime);
            const now = new Date().getTime();

            let targetTime = 0;

            if (isDraft && start) {
                targetTime = start.getTime();
            } else if (end) {
                targetTime = end.getTime();
            } else {
                setTimeLeft(isDraft ? "Loading..." : "Ended");
                return;
            }

            const diff = targetTime - now;

            if (diff <= 0) {
                setTimeLeft(isDraft ? "Started" : "Ended")
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
    }, [displayData, isDraft])

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setNewReservePrice("")
            setError(null)
        }
    }, [isOpen])

    // --- HELPER: Format number with commas ---
    const formatNumber = (value: string) => {
        if (!value) return "";
        const rawValue = value.replace(/,/g, "");
        if (isNaN(Number(rawValue))) return value;
        return Number(rawValue).toLocaleString("en-US");
    };

    const handleReserveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, "");
        if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
            const parts = rawValue.split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            setNewReservePrice(parts.join("."));
        }
    };

    // --- NEW: Start Auction Immediately ---
    const handleStartNow = async () => {
        if (!confirm("Are you sure you want to start this auction immediately? It will move to the Active tab.")) return;

        setIsStartingNow(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost:8080/api/auctions/${displayData.id}/start-now`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Auction started successfully!");
                onUpdate();
                onClose();
            } else {
                const err = await res.json().catch(() => ({ message: "Failed to start auction" }));
                setError(err.message);
            }
        } catch (e) {
            setError("Network error occurred");
        } finally {
            setIsStartingNow(false);
        }
    };

    // --- NEW: Update Auction Times ---
    const handleUpdateTime = async () => {
        setIsUpdatingTime(true);
        setError(null);

        // Append :00 if seconds missing (datetime-local inputs don't always have seconds)
        const formatForBackend = (val: string) => val.length === 16 ? val + ":00" : val;

        const payload: any = {
            endTime: formatForBackend(editEndTime)
        };

        // Only include startTime if it's a draft (Active auctions can't change start time)
        if (isDraft) {
            payload.startTime = formatForBackend(editStartTime);
        }

        try {
            const res = await fetch(`http://localhost:8080/api/auctions/${displayData.id}/time`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Auction timing updated!");
                const updated = await res.json();
                setFetchedDetails(updated); // Update local view
                onUpdate(); // Update parent list
            } else {
                const err = await res.json().catch(() => ({ message: "Failed to update time" }));
                setError(err.message);
            }
        } catch (e) {
            setError("Network error occurred");
        } finally {
            setIsUpdatingTime(false);
        }
    };

    const handleUpdateReserve = async () => {
        const cleanPrice = newReservePrice.replace(/,/g, "");
        if (!cleanPrice || isNaN(Number(cleanPrice))) {
            setError("Please enter a valid price")
            return
        }
        setIsUpdatingReserve(true)
        setError(null)
        try {
            const res = await fetch(
                `http://localhost:8080/api/auctions/${displayData.id}/reserve-price`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ reservePrice: parseFloat(cleanPrice) }),
                }
            )
            if (res.ok) {
                toast.success("Reserve price updated successfully")
                onUpdate()
                setFetchedDetails({ ...fetchedDetails, reservePrice: parseFloat(cleanPrice) })
            } else {
                const err = await res.text()
                setError(err || "Failed to update reserve price")
            }
        } catch (err) {
            setError("Network error occurred")
        } finally {
            setIsUpdatingReserve(false)
        }
    }

    const handleEndAuction = async () => {
        setIsEndingAuction(true)
        setError(null)
        try {
            const res = await fetch(
                `http://localhost:8080/api/auctions/${displayData.id}/end-early`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (res.ok) {
                toast.success("Auction ended and winner selected")
                onUpdate()
                onClose()
            } else {
                const err = await res.json()
                setError(err.message || "Failed to end auction")
            }
        } catch (err) {
            setError("Network error occurred")
        } finally {
            setIsEndingAuction(false)
        }
    }

    const handleCancelAuction = async () => {
        if (!confirm("Are you sure you want to cancel this auction? This cannot be undone.")) return
        setIsCancelling(true)
        setError(null)
        try {
            const res = await fetch(
                `http://localhost:8080/api/auctions/${displayData.id}/cancel`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            if (res.ok) {
                toast.success("Auction cancelled successfully")
                onUpdate()
                onClose()
            } else {
                const err = await res.json()
                setError(err.message || "Failed to cancel auction")
            }
        } catch (err) {
            setError("Network error occurred")
        } finally {
            setIsCancelling(false)
        }
    }

    if (!displayData) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                style={{ zIndex: 2147483647 }}
                className="sm:max-w-4xl p-0 gap-0 bg-[#F8F9FA] rounded-2xl border border-gray-100 shadow-2xl !z-[99999] max-h-[90vh] flex flex-col"
            >
                {/* Header Section */}
                <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-start flex-shrink-0">
                    <div className="flex gap-6">
                        <div className="h-24 w-24 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            <img
                                src={displayData.productImageUrl || "/placeholder.svg"}
                                alt={displayData.productName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-[#03230F] hover:bg-[#03230F] text-white uppercase tracking-wider text-[10px] font-bold px-2 py-0.5">
                                    #{displayData.id}
                                </Badge>
                                <Badge variant="outline" className={`font-bold uppercase text-[10px] tracking-widest ${
                                    isDraft ? "bg-gray-100 text-gray-600 border-gray-300" :
                                        isActive ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            "bg-green-50 text-green-700 border-green-200"
                                }`}>
                                    {displayData.status}
                                </Badge>
                            </div>

                            <DialogTitle className="text-2xl font-black text-[#03230F] mb-1">
                                {displayData.productName}
                            </DialogTitle>

                            <div className="flex items-center gap-4 text-sm text-[#697386] font-medium">
                                <span className="flex items-center gap-1.5">
                                  <TrendingUp className="w-4 h-4 text-[#D4A017]" />
                                    {displayData.productQuantity}kg
                                </span>
                                {displayData.isDeliveryAvailable && (
                                    <span className="flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-green-600" />
                                    Delivery Available
                                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#A3ACBA] mb-1">
                            {isDraft ? "Starts In" : isActive ? "Time Remaining" : "Ended"}
                        </p>
                        <div className={`text-3xl font-black tabular-nums tracking-tight ${
                            isDraft ? "text-gray-400" :
                                isActive ? "text-[#D4A017]" : "text-green-600"
                        }`}>
                            {timeLeft}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-y-auto">

                    {/* LEFT COL: Bids & Schedule */}
                    <div className="md:col-span-2 p-6 bg-white">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#03230F] mb-6 flex items-center gap-2">
                            {isDraft ? (
                                <>
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Auction Schedule
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4" />
                                    Recent Bids
                                </>
                            )}
                        </h3>

                        {isDraft ? (
                            // --- DRAFT UI: Editable Inputs ---
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Hourglass className="w-4 h-4" />
                                        </div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-orange-700">Starts On</p>
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        className="bg-white border-orange-200 focus:border-orange-400"
                                        value={editStartTime}
                                        onChange={(e) => setEditStartTime(e.target.value)}
                                    />
                                </div>

                                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Ends On</p>
                                    </div>
                                    <Input
                                        type="datetime-local"
                                        className="bg-white border-blue-200 focus:border-blue-400"
                                        value={editEndTime}
                                        onChange={(e) => setEditEndTime(e.target.value)}
                                    />
                                </div>

                                <div className="sm:col-span-2 flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateTime}
                                        disabled={isUpdatingTime}
                                        className="bg-[#03230F] text-white"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isUpdatingTime ? "Saving..." : "Save Schedule Changes"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // --- ACTIVE UI: Bids + End Time Edit ---
                            <div className="space-y-6">
                                {/* Only Active Auctions can edit End Time */}
                                {isActive && (
                                    <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Ends On</p>
                                                <p className="text-sm font-medium text-gray-600">Extend or shorten auction time</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="datetime-local"
                                                className="w-auto h-9 text-sm bg-white"
                                                value={editEndTime}
                                                onChange={(e) => setEditEndTime(e.target.value)}
                                            />
                                            <Button size="sm" variant="outline" onClick={handleUpdateTime} disabled={isUpdatingTime}>
                                                {isUpdatingTime ? "..." : "Update"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Bids List */}
                                <div className="space-y-3">
                                    {displayData.bids && displayData.bids.length > 0 ? (
                                        displayData.bids.map((bid: any, index: number) => (
                                            <div key={bid.id} className={`flex items-center justify-between p-4 rounded-xl border ${index === 0 ? "bg-yellow-50 border-[#FCE100]" : "bg-gray-50 border-gray-100"}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? "bg-[#D4A017] text-[#03230F]" : "bg-gray-200 text-gray-500"}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#03230F] text-sm">{bid.bidderName}</p>
                                                        <p className="text-[11px] text-gray-500">{new Date(bid.bidTime).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <p className={`font-black text-lg ${index === 0 ? "text-[#03230F]" : "text-gray-600"}`}>
                                                    Rs. {bid.bidAmount.toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 font-medium">No bids placed yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: Control Panel */}
                    <div className="p-6 bg-[#F8F9FA] space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#03230F] mb-2">
                            Management
                        </h3>

                        {/* Current Stats */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3ACBA] mb-1">Current Highest Bid</p>
                                <p className="text-2xl font-black text-[#03230F]">
                                    Rs. {(displayData.currentHighestBidAmount || displayData.startingPrice).toLocaleString()}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3ACBA] mb-1">Reserve Price</p>
                                <p className="text-lg font-bold text-gray-600">
                                    {displayData.reservePrice ? `Rs. ${displayData.reservePrice.toLocaleString()}` : "Not Set"}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {isEditable && (
                            <div className="space-y-3 pt-2">

                                {/* NEW: Start Now Button (Draft Only) */}
                                {isDraft && (
                                    <Button
                                        onClick={handleStartNow}
                                        disabled={isStartingNow}
                                        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg uppercase tracking-widest transition-all"
                                    >
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        {isStartingNow ? "Starting..." : "Start Auction Now"}
                                    </Button>
                                )}

                                <div className="bg-white p-3 rounded-xl border border-gray-200">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#697386] mb-2 block">
                                        {displayData.reservePrice ? "Lower Reserve Price" : "Set Reserve Price"}
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Amount"
                                            className="h-9 text-sm"
                                            value={newReservePrice}
                                            onChange={handleReserveChange}
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleUpdateReserve}
                                            disabled={isUpdatingReserve}
                                            className="bg-[#03230F] text-white hover:bg-[#0f4623]"
                                        >
                                            {isUpdatingReserve ? "..." : "Update"}
                                        </Button>
                                    </div>
                                </div>

                                {isActive && (
                                    <Button
                                        onClick={handleEndAuction}
                                        disabled={isEndingAuction}
                                        className="w-full h-11 bg-[#D4A017] hover:bg-[#C49007] text-[#03230F] font-bold rounded-lg uppercase tracking-widest transition-all"
                                    >
                                        {isEndingAuction ? "Ending..." : "End Auction & Select Winner"}
                                    </Button>
                                )}

                                <Button
                                    onClick={handleCancelAuction}
                                    disabled={isCancelling}
                                    variant="destructive"
                                    className="w-full h-11 rounded-lg uppercase tracking-widest font-bold transition-all"
                                >
                                    {isCancelling ? "Cancelling..." : isActive ? "Cancel Auction" : "Delete Draft"}
                                </Button>
                            </div>
                        )}

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