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
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

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
    const { t } = useLanguage() // Initialized the hook
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
                setError(t("buyerBidsLoginReq"));
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
                if (response.status === 404) throw new Error(t("buyerBidsEndpointErr"));
                throw new Error(t("buyerBidsLoadFail"));
            }

            const data = await response.json();
            setActivities(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || t("buyerBidsUnexpectedErr"));
            toast.error(t("buyerBidsRefreshFail"));
        } finally {
            setLoading(false);
        }
    }, [t]);

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

        if (diff <= 0) return t("buyerBidsEnded");

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return t("buyerBidsTimeLeftDays").replace("{days}", days.toString()).replace("{hours}", hours.toString());
        return t("buyerBidsTimeLeftHours").replace("{hours}", hours.toString()).replace("{minutes}", minutes.toString());
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
            toast.error(t("buyerBidsSessionExp"));
            return;
        }

        const amount = Number(bidAmount);
        const currentHigh = selectedAuction.currentHighestBid || 0;

        if (isNaN(amount) || amount <= currentHigh) {
            toast.error(t("buyerBidsHigherThan").replace("{amount}", formatCurrency(currentHigh)));
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
                toast.success(t("buyerBidsSuccess"));
                setIsBidModalOpen(false);
                fetchActivity();
            } else {
                const errText = await res.text();
                toast.error(errText || t("buyerBidsPlaceFail"));
            }
        } catch (error) {
            toast.error(t("buyerBidsNetworkErr"));
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
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 shrink-0" />
                    <h3 className="text-lg font-bold text-[#03230F]">{emptyMessage}</h3>
                    <p className="text-gray-500 mt-2 text-sm">{t("buyerBidsExplore")}</p>
                    <Button asChild className="mt-6 h-auto bg-[#03230F] text-[#EEC044] hover:bg-black font-bold uppercase tracking-widest text-xs shadow-md rounded-full px-8 py-4">
                        <Link href="/buyer/auctions">{t("buyerBidsFind")}</Link>
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-6">
                {items.map(auction => (
                    <Card key={auction.auctionId} className="overflow-hidden flex flex-col border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#EEC044]/30 transition-all rounded-2xl bg-white">
                        <div className="relative h-48 bg-gray-50 border-b border-gray-100 shrink-0">
                            {auction.productImageUrl ? (
                                <img
                                    src={auction.productImageUrl}
                                    alt={auction.productName}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-gray-300">
                                    <Package className="w-12 h-12 opacity-50 shrink-0" />
                                </div>
                            )}

                            <div className="absolute top-3 flex flex-col gap-2 w-full px-3">
                                <div className="flex justify-between items-start gap-2">
                                    <Badge className="bg-white text-[#03230F] hover:bg-white shadow-sm border-none font-bold uppercase tracking-widest text-[9px] px-3 py-1 shrink-0 h-auto">
                                        <Gavel className="w-3 h-3 mr-1.5 text-[#EEC044] shrink-0" />
                                        {t("buyerBidsRank").replace("{rank}", auction.myBidRank.toString())}
                                    </Badge>

                                    {auction.auctionStatus === 'ACTIVE' && (
                                        <Badge className={`${auction.isWinning ? 'bg-green-500' : 'bg-red-500'} text-white border-none shadow-sm font-bold uppercase tracking-widest text-[9px] px-3 py-1 shrink-0 h-auto`}>
                                            {auction.isWinning ? t("buyerBidsWinning") : t("buyerBidsOutbid")}
                                        </Badge>
                                    )}
                                    {auction.hasWon && (
                                        <Badge className="bg-[#EEC044] text-[#03230F] border-none shadow-sm font-bold uppercase tracking-widest text-[9px] px-3 py-1 shrink-0 h-auto">
                                            {t("buyerBidsWinner")}
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
                                        <User className="w-3 h-3 mr-1 text-[#EEC044] shrink-0" /> {auction.farmerName} • {auction.productQuantity}{t("purchaseKgUnit")}
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-5 bg-gray-100" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t("buyerBidsYourBid")}</p>
                                    <p className="font-black text-xl text-[#03230F]">
                                        Rs. {formatCurrency(auction.myHighestBid)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t("buyerBidsCurrentHigh")}</p>
                                    <p className={`font-black text-xl ${auction.isWinning ? 'text-green-600' : 'text-red-600'}`}>
                                        Rs. {formatCurrency(auction.currentHighestBid || 0)}
                                    </p>
                                </div>
                            </div>

                            {auction.auctionStatus === 'ACTIVE' && (
                                <div className="flex items-center text-xs font-bold text-[#03230F] mb-6 bg-[#EEC044]/10 p-3 rounded-lg border border-[#EEC044]/30 uppercase tracking-widest">
                                    <Clock className="w-4 h-4 mr-2 text-[#EEC044] shrink-0" />
                                    {getTimeRemaining(auction.auctionEndTime)}
                                </div>
                            )}

                            <div className="mt-auto pt-2">
                                {auction.auctionStatus === 'ACTIVE' && (
                                    <Button
                                        className={`w-full font-bold uppercase tracking-widest text-[11px] h-auto py-3.5 shadow-sm transition-all rounded-xl ${
                                            auction.isWinning 
                                            ? "bg-white text-[#03230F] border border-gray-200 hover:bg-gray-50" 
                                            : "bg-[#03230F] text-[#EEC044] hover:bg-black"
                                        }`}
                                        onClick={() => handleOpenBidModal(auction)}
                                    >
                                        {auction.isWinning ? t("buyerBidsIncreaseAnyway") : t("buyerBidsIncreaseNow")}
                                    </Button>
                                )}

                                {auction.hasWon && (
                                    <div className="w-full mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                                        <p className="text-sm text-green-800 font-medium">
                                            {t("buyerBidsWonMsg1")} <br />
                                            {t("buyerBidsWonMsg2")} <Link href="/buyer/order-history" className="text-green-900 underline font-bold hover:text-green-700">{t("buyerBidsOrdersLink")}</Link>{t("buyerBidsWonMsg3")}
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
                        
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4">
                            <div>
                                <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">{t("buyerBidsTitle")}</h1>
                                <p className="text-[#A3ACBA] font-medium">{t("buyerBidsSubtitle")}</p>
                            </div>
                            <button 
                                onClick={fetchActivity} 
                                disabled={loading}
                                className="w-full md:w-auto bg-[#03230F] text-[#EEC044] rounded-full px-8 py-3.5 h-auto font-bold uppercase text-xs tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 shrink-0 ${loading ? 'animate-spin' : ''}`} /> {t("buyerBidsRefresh")}
                            </button>
                        </div>

                        {error ? (
                            <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 rounded-xl shadow-sm">
                                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                <AlertDescription className="font-bold text-red-800">{error}</AlertDescription>
                            </Alert>
                        ) : (
                            <Tabs defaultValue="active" className="w-full">
                                <TabsList className="bg-gray-100 p-1 border-b mb-6 w-full justify-start overflow-x-auto rounded-xl min-h-[44px] h-auto">
                                    <TabsTrigger value="active" className="rounded-lg h-auto px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#EEC044] transition-all whitespace-nowrap">
                                        {t("buyerBidsTabActive")} ({activeBids.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="won" className="rounded-lg h-auto px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#EEC044] transition-all whitespace-nowrap">
                                        {t("buyerBidsTabWon")} ({wonAuctions.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="past" className="rounded-lg h-auto px-6 py-2.5 font-bold data-[state=active]:bg-[#03230F] data-[state=active]:text-[#EEC044] transition-all whitespace-nowrap">
                                        {t("buyerBidsTabPast")} ({pastBids.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="active" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {renderTabContent(activeBids, t("buyerBidsEmptyActive"))}
                                </TabsContent>
                                <TabsContent value="won" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {renderTabContent(wonAuctions, t("buyerBidsEmptyWon"))}
                                </TabsContent>
                                <TabsContent value="past" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {renderTabContent(pastBids, t("buyerBidsEmptyPast"))}
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
                        
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                            <h3 className="font-black text-xl text-[#03230F] flex items-center gap-2 uppercase tracking-tight">
                                <Gavel className="w-5 h-5 text-[#EEC044] shrink-0" />
                                {t("buyerBidsModalTitle")}
                            </h3>
                            <button onClick={() => setIsBidModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0">
                                <X className="w-5 h-5 shrink-0" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-black text-[#03230F] uppercase tracking-wide mb-1">{selectedAuction.productName}</h4>
                                <p className="text-sm font-bold text-gray-500">{t("buyerBidsModalCurrent")} <span className="text-[#03230F]">Rs. {formatCurrency(selectedAuction.currentHighestBid || 0)}</span></p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("buyerBidsModalNewAmount")}</Label>
                                <Input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder={t("buyerBidsModalMin").replace("{amount}", formatCurrency((selectedAuction.currentHighestBid || 0) + 1))}
                                    className="text-lg h-14 bg-gray-50 border-gray-200 focus:ring-[#EEC044] rounded-xl font-bold text-[#03230F]"
                                />
                                <p className="text-[11px] text-gray-400 font-medium mt-1 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    {t("buyerBidsModalAddressNote")}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                                <Button variant="outline" className="flex-1 rounded-xl h-auto py-3.5 font-bold uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-50 min-w-fit" onClick={() => setIsBidModalOpen(false)}>
                                    {t("commonCancel")}
                                </Button>
                                <Button
                                    className="flex-[2] bg-[#03230F] hover:bg-black text-[#EEC044] rounded-xl h-auto py-3.5 font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all min-w-fit"
                                    onClick={submitBid}
                                    disabled={isSubmitting || !bidAmount}
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" /> : t("buyerBidsModalConfirm")}
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