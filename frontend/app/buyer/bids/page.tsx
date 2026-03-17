"use client"

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
    AlertCircle, Clock, Gavel, Loader2, MapPin,
    User, Package, CheckCircle2, XCircle, RefreshCw, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast, Toaster } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardNav } from "@/components/dashboard-nav"
import BuyerHeader from '@/components/headers/BuyerHeader';
import Footer2 from "@/components/footer/Footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- Types ---
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
    auctionStatus: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'DRAFT';
    auctionEndTime: string;
    myHighestBid: number;
    currentHighestBid: number | null;
    highestBidderId: number | null;
    isWinning: boolean;
    hasWon: boolean;
    myBidRank: number;
    farmerName: string;
    productQuantity: number;
    description: string;
    isDeliveryAvailable: boolean;
    baseDeliveryFee: number | null;
    extraFeePer3Km: number | null;
    pickupLatitude: number | null;
    pickupLongitude: number | null;
    myLastBidAddress: DeliveryAddress | null;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export default function BuyerBidsPage() {
    const [activities, setActivities] = useState<BuyerAuctionActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [myUserId, setMyUserId] = useState<number | null>(null);

    // Bidding Modal State
    const [isBidModalOpen, setIsBidModalOpen] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState<BuyerAuctionActivity | null>(null);
    const [bidAmount, setBidAmount] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchActivity = useCallback(async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const userIdStr = sessionStorage.getItem('id');

            if (!token || !userIdStr) {
                setError("Please log in to view your bids.");
                return;
            }

            const userId = parseInt(userIdStr);
            setMyUserId(userId);

            const response = await fetch(`${API_URL}/api/auctions/buyer/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) throw new Error("Endpoint not found. Please check API Gateway routing.");
                throw new Error("Failed to load your bidding activity.");
            }

            const data = await response.json();
            setActivities(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            toast.error("Failed to refresh data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivity();
        const intervalId = setInterval(fetchActivity, 30000);
        return () => clearInterval(intervalId);
    }, [fetchActivity]);

    const activeBids = useMemo(() => activities.filter(a => a.auctionStatus === 'ACTIVE'), [activities]);
    const wonAuctions = useMemo(() => activities.filter(a => a.hasWon), [activities]);
    const pastBids = useMemo(() => activities.filter(a =>
        a.auctionStatus !== 'ACTIVE' && a.auctionStatus !== 'DRAFT' && !a.hasWon
    ), [activities]);

    const getTimeRemaining = (endTimeStr: string) => {
        const end = new Date(endTimeStr).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return "Ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h ${minutes}m left`;
    };

    const handleOpenBidModal = (auction: BuyerAuctionActivity) => {
        setSelectedAuction(auction);
        setBidAmount("");
        setIsBidModalOpen(true);
    };

    const submitBid = async () => {
        if (!selectedAuction) return;

        const token = sessionStorage.getItem('token');
        const userId = sessionStorage.getItem('id');

        if (!token) {
            toast.error("Session expired. Please log in again.");
            return;
        }

        const amount = Number(bidAmount);
        const currentHigh = selectedAuction.currentHighestBid || 0;

        if (isNaN(amount) || amount <= currentHigh) {
            toast.error(`Bid must be higher than Rs. ${formatCurrency(currentHigh)}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/api/auctions/${selectedAuction.auctionId}/bids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bidderId: parseInt(userId as string),
                    bidderName: sessionStorage.getItem('name') || 'Bidder',
                    bidAmount: amount,
                    deliveryAddress: selectedAuction.myLastBidAddress
                }),
            });

            if (res.ok) {
                toast.success("Bid increased successfully!");
                setIsBidModalOpen(false);
                fetchActivity();
            } else {
                const errText = await res.text();
                toast.error(errText || "Failed to place bid. Invalid request.");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTabContent = (items: BuyerAuctionActivity[], emptyMessage: string) => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-[350px] rounded-xl bg-gray-200/50" />)}
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl mt-6 shadow-sm">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#03230F]">{emptyMessage}</h3>
                    <p className="text-gray-500 mt-2 text-sm">Explore active auctions to place new bids.</p>
                    <Button asChild className="mt-6 bg-[#03230F] text-[#EEC044] hover:bg-black font-bold uppercase tracking-widest text-xs shadow-md rounded-full px-8 py-5">
                        <Link href="/buyer/auctions">Find Auctions</Link>
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-6">
                {items.map(auction => (
                    <Card key={auction.auctionId} className="overflow-hidden flex flex-col border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#EEC044]/30 transition-all rounded-2xl bg-white">
                        <div className="relative h-48 bg-gray-50 border-b border-gray-100">
                            {auction.productImageUrl ? (
                                <img
                                    src={auction.productImageUrl}
                                    alt={auction.productName}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-300">
                                    <Package className="w-12 h-12 opacity-50" />
                                </div>
                            )}

                            <div className="absolute top-3 flex flex-col gap-2 w-full px-3">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-white text-[#03230F] hover:bg-white shadow-sm border-none font-bold uppercase tracking-widest text-[9px] px-3 py-1">
                                        <Gavel className="w-3 h-3 mr-1.5 text-[#EEC044]" />
                                        Rank #{auction.myBidRank}
                                    </Badge>

                                    {auction.auctionStatus === 'ACTIVE' && (
                                        <Badge className={`${auction.isWinning ? 'bg-green-500' : 'bg-red-500'} text-white border-none shadow-sm font-bold uppercase tracking-widest text-[9px] px-3 py-1`}>
                                            {auction.isWinning ? 'Winning' : 'Outbid'}
                                        </Badge>
                                    )}
                                    {auction.hasWon && (
                                        <Badge className="bg-[#EEC044] text-[#03230F] border-none shadow-sm font-bold uppercase tracking-widest text-[9px] px-3 py-1">
                                            Winner
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-black text-xl leading-tight text-[#03230F] uppercase tracking-tight">{auction.productName}</h3>
                                    <p className="text-xs text-gray-500 flex items-center mt-1.5 font-bold uppercase tracking-widest">
                                        <User className="w-3 h-3 mr-1 text-[#EEC044]" /> {auction.farmerName} • {auction.productQuantity}kg
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-5 bg-gray-100" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Your Bid</p>
                                    <p className="font-black text-xl text-[#03230F]">
                                        Rs. {formatCurrency(auction.myHighestBid)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Current High</p>
                                    <p className={`font-black text-xl ${auction.isWinning ? 'text-green-600' : 'text-red-600'}`}>
                                        Rs. {formatCurrency(auction.currentHighestBid || 0)}
                                    </p>
                                </div>
                            </div>

                            {auction.auctionStatus === 'ACTIVE' && (
                                <div className="flex items-center text-xs font-bold text-[#03230F] mb-6 bg-[#EEC044]/10 p-3 rounded-lg border border-[#EEC044]/30 uppercase tracking-widest">
                                    <Clock className="w-4 h-4 mr-2 text-[#EEC044]" />
                                    {getTimeRemaining(auction.auctionEndTime)}
                                </div>
                            )}

                            <div className="mt-auto pt-2">
                                {auction.auctionStatus === 'ACTIVE' && (
                                    <Button
                                        className={`w-full font-bold uppercase tracking-widest text-[11px] h-12 shadow-sm transition-all rounded-xl ${
                                            auction.isWinning 
                                            ? "bg-white text-[#03230F] border border-gray-200 hover:bg-gray-50" 
                                            : "bg-[#03230F] text-[#EEC044] hover:bg-black"
                                        }`}
                                        onClick={() => handleOpenBidModal(auction)}
                                    >
                                        {auction.isWinning ? "Increase Bid Anyway" : "Increase Bid Now"}
                                    </Button>
                                )}

                                {auction.hasWon && (
                                    <div className="w-full mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                                        <p className="text-sm text-green-800 font-medium">
                                            You have won this auction. <br />
                                            Please go to your <Link href="/buyer/orders" className="text-green-900 underline font-bold hover:text-green-700">Orders page</Link> to complete the purchase.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <Toaster position="top-center" richColors />
            <BuyerHeader />

            <div className="flex flex-1">
            
                <DashboardNav unreadCount={0} />

                <main className="flex-1 w-full overflow-x-hidden flex flex-col p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto w-full">
                        
                        {/* Theme Colors Applied: Clean Header Style from the new Image */}
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4">
                            <div>
                                <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">My Bids</h1>
                                <p className="text-[#A3ACBA] font-medium">Track your auction activity and winning status</p>
                            </div>
                            <button 
                                onClick={fetchActivity} 
                                disabled={loading}
                                className="w-full md:w-auto bg-[#03230F] text-[#EEC044] rounded-full px-8 py-3.5 font-bold uppercase text-xs tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                            </button>
                        </div>

                        {error ? (
                            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 rounded-xl shadow-sm">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <AlertDescription className="font-bold text-red-800">{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <Tabs defaultValue="active" className="w-full">
                                <TabsList className="bg-gray-100 p-1 border-b mb-6 w-full justify-start overflow-x-auto rounded-xl">
                                    <TabsTrigger value="active" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#EEC044] transition-all">
                                        Active Bids ({activeBids.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="won" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#EEC044] transition-all">
                                        Won ({wonAuctions.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="past" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#EEC044] transition-all">
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
                    </div>
                </main>
            </div>

            {/* Quick Bid Modal */}
            {isBidModalOpen && selectedAuction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />
                        
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-xl text-[#03230F] flex items-center gap-2 uppercase tracking-tight">
                                <Gavel className="w-5 h-5 text-[#EEC044]" />
                                Increase Bid
                            </h3>
                            <button onClick={() => setIsBidModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-black text-[#03230F] uppercase tracking-wide mb-1">{selectedAuction.productName}</h4>
                                <p className="text-sm font-bold text-gray-500">Current Highest: <span className="text-[#03230F]">Rs. {formatCurrency(selectedAuction.currentHighestBid || 0)}</span></p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Bid Amount (Rs.)</Label>
                                <Input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={`Min: Rs. ${formatCurrency((selectedAuction.currentHighestBid || 0) + 1)}`}
                                    className="text-lg h-14 bg-gray-50 border-gray-200 focus:ring-[#EEC044] rounded-xl font-bold text-[#03230F]"
                                />
                                <p className="text-[11px] text-gray-400 font-medium mt-1 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    This bid uses the same delivery address as your previous bid.
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-50" onClick={() => setIsBidModalOpen(false)}>Cancel</Button>
                                <Button
                                    className="flex-1 bg-[#03230F] hover:bg-black text-[#EEC044] rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all"
                                    onClick={submitBid}
                                    disabled={isSubmitting || !bidAmount}
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm Bid"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        
            <Footer2 />
        </div>
    );
}