'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    AlertCircle, Clock, Gavel, Loader2, MapPin,
    User, Package, Truck, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast, Toaster } from 'sonner';
import BuyerHeader from '@/components/headers/BuyerHeader';

// --- Types (Matched with Backend DTO) ---

interface DeliveryAddress {
    streetAddress?: string;
    city?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
}

interface BuyerAuctionActivity {
    auctionId: number;
    productName: string;
    productImageUrl: string | null;
    auctionStatus: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    auctionEndTime: string;
    myHighestBid: number;
    currentHighestBid: number;
    highestBidderId: number;
    isWinning: boolean;
    hasWon: boolean;
    myBidRank: number;

    farmerName: string;
    productQuantity: number;
    description: string;
    isDeliveryAvailable: boolean;
    baseDeliveryFee: number;
    extraFeePer3Km: number;
    pickupLatitude?: number;
    pickupLongitude?: number;
    myLastBidAddress?: DeliveryAddress;
}

// --- Helper Functions ---

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};

const calculateDeliveryCost = async (auction: BuyerAuctionActivity): Promise<{ distance: number, fee: number }> => {
    if (!auction.isDeliveryAvailable || !auction.myLastBidAddress?.latitude || !auction.pickupLatitude) {
        return { distance: 0, fee: 0 };
    }

    const startLat = auction.pickupLatitude;
    const startLng = auction.pickupLongitude!;
    const endLat = auction.myLastBidAddress.latitude;
    const endLng = auction.myLastBidAddress.longitude!;

    let distanceKm = 0;

    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
            distanceKm = parseFloat((data.routes[0].distance / 1000).toFixed(1));
        } else {
            throw new Error("OSRM no route");
        }
    } catch (e) {
        distanceKm = getHaversineDistance(startLat, startLng, endLat, endLng);
    }

    const base = auction.baseDeliveryFee || 0;
    const rate = auction.extraFeePer3Km || 0;

    let fee = base;
    if (distanceKm > 3 && rate > 0) {
        const extraKm = distanceKm - 3;
        const extraIntervals = Math.ceil(extraKm / 3);
        fee += rate * extraIntervals;
    }

    return { distance: distanceKm, fee: Math.round(fee) };
};

// --- Components ---

const CountdownTimer = ({ endTime }: { endTime: string }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                setIsEnded(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m left`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isEnded ? 'text-red-600' : 'text-[#03230F]'}`}>
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}
        </div>
    );
};

const BidAgainModal = ({
                           isOpen,
                           onClose,
                           auction,
                           onSuccess
                       }: {
    isOpen: boolean;
    onClose: () => void;
    auction: BuyerAuctionActivity;
    onSuccess: () => void;
}) => {
    const [bidAmountStr, setBidAmountStr] = useState('');
    const [loading, setLoading] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState({ distance: 0, fee: 0 });

    useEffect(() => {
        if (isOpen) {
            setBidAmountStr('');
            calculateDeliveryCost(auction).then(info => setDeliveryInfo(info));
        }
    }, [isOpen, auction]);

    if (!isOpen) return null;

    const currentBidAmount = parseFloat(bidAmountStr.replace(/,/g, '')) || 0;
    const totalAmount = currentBidAmount + deliveryInfo.fee;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (raw) {
            setBidAmountStr(parseInt(raw).toLocaleString());
        } else {
            setBidAmountStr('');
        }
    };

    const handlePlaceBid = async () => {
        const amount = parseFloat(bidAmountStr.replace(/,/g, ''));

        if (!amount || amount <= auction.currentHighestBid) {
            toast.error(`Bid must be higher than Rs. ${formatCurrency(auction.currentHighestBid)}`);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const bidderId = localStorage.getItem('buyerId') || sessionStorage.getItem('id');

            if (!bidderId || !token) {
                toast.error("Session expired. Please log in again.");
                setLoading(false);
                return;
            }

            const res = await fetch(`http://localhost:8080/api/auctions/${auction.auctionId}/bids`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    bidderId: parseInt(bidderId),
                    bidAmount: amount,
                    deliveryAddress: auction.myLastBidAddress || null
                })
            });

            if (res.ok) {
                toast.success("Bid placed successfully!");
                onSuccess();
                onClose();
            } else {
                const errorText = await res.text();
                let message = "Could not place bid";
                try {
                    const jsonError = JSON.parse(errorText);
                    message = jsonError.message || message;
                } catch (e) {
                    message = errorText || message;
                }
                toast.error(message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Could not place bid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-200 p-4">
            <Card className="w-full max-w-md shadow-2xl overflow-hidden border-0">
                <div className="bg-[#03230F] p-4 text-white">
                    <h2 className="text-lg font-black uppercase tracking-widest">Place New Bid</h2>
                    <p className="text-xs text-white/70 truncate">{auction.productName}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                Your Bid Amount (LKR)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={bidAmountStr}
                                    onChange={handleAmountChange}
                                    placeholder={`${formatCurrency(auction.currentHighestBid + 100)}`}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent font-black text-xl text-[#03230F]"
                                />
                            </div>
                            <p className="text-[10px] text-red-500 mt-1 font-medium">
                                * Minimum required: Rs. {formatCurrency(auction.currentHighestBid + 1)}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Bid Amount</span>
                                <span className="font-semibold">Rs. {bidAmountStr || '0.00'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Est. Delivery Fee</span>
                                <span className="font-semibold text-gray-600">
                                    {auction.isDeliveryAvailable ? `Rs. ${formatCurrency(deliveryInfo.fee)}` : 'N/A'}
                                </span>
                            </div>
                            <Separator className="bg-gray-200" />
                            <div className="flex justify-between text-base font-bold text-[#03230F]">
                                <span>Total Estimated</span>
                                <span>Rs. {formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 font-bold">
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-[#D4A017] text-[#03230F] hover:bg-[#b88a12] font-black uppercase tracking-widest"
                            onClick={handlePlaceBid}
                            disabled={loading || currentBidAmount <= auction.currentHighestBid}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Bid"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const AuctionCard = ({
                         auction,
                         onRefresh,
                         currentUserId
                     }: {
    auction: BuyerAuctionActivity;
    onRefresh: () => void;
    currentUserId: number | null;
}) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState<{ distance: number, fee: number } | null>(null);
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f9fafb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominantBaseline="middle" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
    const farmerMapLink = (auction.pickupLatitude && auction.pickupLongitude)
        ? `https://www.google.com/maps/search/?api=1&query=${auction.pickupLatitude},${auction.pickupLongitude}`
        : null;

    useEffect(() => {
        calculateDeliveryCost(auction).then(info => setDeliveryInfo(info));
    }, [auction]);

    // ✅ THE DOUBLE-LAYER FIX:
    // Checks API's boolean. If serialization fails, falls back to direct explicit ID comparison!
    const isWinning = auction.auctionStatus === 'ACTIVE' &&
        (auction.isWinning === true || auction.highestBidderId === currentUserId);

    const isOutbid = auction.auctionStatus === 'ACTIVE' && !isWinning;
    const isWon = auction.hasWon === true;

    let borderColor = 'border-gray-200';
    if (isWinning) borderColor = 'border-green-500';
    if (isOutbid) borderColor = 'border-red-500';
    if (isWon) borderColor = 'border-[#D4A017]';

    return (
        <>
            <Card className={`group relative overflow-hidden bg-white transition-all hover:shadow-lg border-l-4 ${borderColor}`}>
                <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-50">
                        <Image
                            src={auction.productImageUrl || placeholderImage}
                            alt={auction.productName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 200px"
                        />
                        <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-white/90 text-[#03230F] font-bold backdrop-blur-sm shadow-sm">
                                <Package className="w-3 h-3 mr-1" />
                                {auction.productQuantity} KG
                            </Badge>
                        </div>
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] mb-1">
                                        Auction #{auction.auctionId}
                                    </p>
                                    <h3 className="text-lg font-bold text-[#03230F] line-clamp-1 group-hover:text-[#D4A017] transition-colors">
                                        {auction.productName}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                                        <User className="w-3 h-3" /> {auction.farmerName || "Unknown Farmer"}
                                    </p>
                                </div>
                                <CountdownTimer endTime={auction.auctionEndTime} />
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                                {auction.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <Truck className={`w-3.5 h-3.5 ${auction.isDeliveryAvailable ? 'text-green-600' : 'text-orange-500'}`} />
                                    {auction.isDeliveryAvailable ? (
                                        <span>
                                            Delivery Available
                                            {deliveryInfo && <span className="font-bold ml-1 text-green-700">
                                                (Rs. {formatCurrency(deliveryInfo.fee)})
                                            </span>}
                                        </span>
                                    ) : (
                                        <span className="text-orange-700 font-semibold">Pickup Only</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="truncate" title={auction.isDeliveryAvailable ? auction.myLastBidAddress?.city : "Farmer Location"}>
                                        {auction.isDeliveryAvailable
                                            ? `To: ${auction.myLastBidAddress?.city || "Set on Bid"}`
                                            : farmerMapLink
                                                ? <a href={farmerMapLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">From: Farmer's Location</a>
                                                : `From: ${"Farmer's Location"}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
                            <div className="w-full sm:w-auto">
                                {isWinning && (
                                    <div className="flex items-center gap-2 text-green-700 mb-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">You are the highest bidder</span>
                                    </div>
                                )}
                                {isOutbid && (
                                    <div className="flex items-center gap-2 text-red-600 mb-2">
                                        <XCircle className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Outbid by another user</span>
                                    </div>
                                )}
                                {isWon && (
                                    <div className="flex items-center gap-2 text-[#D4A017] mb-2">
                                        <Gavel className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Auction Won</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                                    <div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                                            My Bid
                                        </span>
                                        <span className="text-base font-bold text-[#03230F]">
                                            Rs. {formatCurrency(auction.myHighestBid)}
                                        </span>
                                    </div>

                                    {(isOutbid || auction.currentHighestBid > auction.myHighestBid) && (
                                        <div>
                                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                                                Highest
                                            </span>
                                            <span className="text-base font-bold text-red-600">
                                                Rs. {formatCurrency(auction.currentHighestBid)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full sm:w-auto flex justify-end">
                                {auction.auctionStatus === 'ACTIVE' && (
                                    <Button
                                        onClick={() => setShowBidModal(true)}
                                        className={`w-full sm:w-auto font-bold uppercase tracking-widest text-xs h-10 px-6 ${isWinning
                                            ? 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                                            : 'bg-[#D4A017] text-[#03230F] hover:bg-[#b88a12] shadow-md'
                                        }`}
                                    >
                                        {isWinning ? "Increase Bid" : "Place Higher Bid"}
                                    </Button>
                                )}

                                {isWon && (
                                    <Link href="/buyer/orders">
                                        <Button className="w-full sm:w-auto bg-[#03230F] text-[#D4A017] hover:bg-black font-black uppercase tracking-widest text-xs h-10 px-6">
                                            Checkout Now
                                        </Button>
                                    </Link>
                                )}

                                {auction.auctionStatus !== 'ACTIVE' && !isWon && (
                                    <Badge variant="outline" className="h-10 px-4 text-gray-400 border-gray-200">
                                        Closed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <BidAgainModal
                isOpen={showBidModal}
                onClose={() => setShowBidModal(false)}
                auction={auction}
                onSuccess={onRefresh}
            />
        </>
    );
};

export default function MyBidsDashboard() {
    const [auctions, setAuctions] = useState<BuyerAuctionActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('active');

    // ✅ Extract the explicit User ID exactly once to pass to children
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const fetchAuctions = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const buyerId = localStorage.getItem('buyerId') || sessionStorage.getItem('id');
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!buyerId) {
                setError("User ID not found. Please log in.");
                setLoading(false);
                return;
            }

            // Set for child components to use
            setCurrentUserId(parseInt(buyerId, 10));

            const response = await fetch(`http://localhost:8080/api/auctions/buyer/${buyerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch auctions');

            const data = await response.json();
            setAuctions(data);
            setError(null);
        } catch (err) {
            console.error(err);
            if (!isSilent) setError("Could not load your bids. Please try again.");
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuctions();
        const interval = setInterval(() => {
            fetchAuctions(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchAuctions]);

    const activeBids = useMemo(() => auctions.filter((a) => a.auctionStatus === 'ACTIVE'), [auctions]);
    const wonAuctions = useMemo(() => auctions.filter((a) => a.hasWon === true), [auctions]);
    const pastBids = useMemo(
        () => auctions.filter((a) => a.auctionStatus !== 'ACTIVE' && a.hasWon === false),
        [auctions],
    );

    const renderTabContent = (data: BuyerAuctionActivity[], emptyMsg: string) => {
        if (data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Gavel className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold">{emptyMsg}</p>
                    <p className="text-xs text-gray-400 mt-1">Check the marketplace to start bidding.</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {data.map((auction) => (
                    <AuctionCard
                        key={auction.auctionId}
                        auction={auction}
                        onRefresh={() => fetchAuctions(false)}
                        currentUserId={currentUserId} // Passing explicit parsed ID
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Toaster richColors position="top-center" />
            <BuyerHeader />
            <main className="container max-w-5xl mx-auto p-4 md:p-8">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-widest text-[#03230F]">My Bids</h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium">Manage your active bids and view your auction history.</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAuctions(false)}
                        className="hidden md:flex gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800 rounded-xl">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="font-medium">{error}</AlertDescription>
                        <Button variant="link" onClick={() => fetchAuctions(false)} className="text-red-800 underline ml-2 p-0 h-auto font-bold">Retry</Button>
                    </Alert>
                )}

                {loading && auctions.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="w-full h-48 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-white border p-1 rounded-xl mb-6 h-auto inline-flex shadow-sm">
                            <TabsTrigger
                                value="active"
                                className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#D4A017] transition-all"
                            >
                                Active ({activeBids.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="won"
                                className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#D4A017] transition-all"
                            >
                                Won ({wonAuctions.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="past"
                                className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#D4A017] transition-all"
                            >
                                Past ({pastBids.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {renderTabContent(activeBids, "No active bids found")}
                        </TabsContent>

                        <TabsContent value="won" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {renderTabContent(wonAuctions, "No won auctions yet")}
                        </TabsContent>

                        <TabsContent value="past" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {renderTabContent(pastBids, "No past bid history")}
                        </TabsContent>
                    </Tabs>
                )}
            </main>
        </div>
    );
}