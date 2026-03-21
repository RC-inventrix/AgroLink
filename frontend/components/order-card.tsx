/* fileName: order-card.tsx */
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, User, Hash, KeyRound, AlertCircle, Star, MessageSquare, Clock, XCircle, Truck, Store, MapPin, Timer } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- HELPER COMPONENT: STAR RATING ---
function StarRating({ rating, setRating, interactive = false }: { rating: number, setRating?: (r: number) => void, interactive?: boolean }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => interactive && setRating?.(star)}
                    className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform active:scale-90`}
                >
                    <Star
                        className={`w-5 h-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                </button>
            ))}
        </div>
    );
}

interface OrderCardProps {
    order: any
    onStatusUpdate?: (forcedStatus?: string) => void
    onOfferAction?: (offerId: number, newStatus: string) => Promise<void>
}

export function OrderCard({ order, onStatusUpdate, onOfferAction }: OrderCardProps) {
    const { t } = useLanguage()
    const [buyerName, setBuyerName] = useState<string>(t("authProcessing") || "Loading...")

    // Countdown States
    const [timeLeft, setTimeLeft] = useState<string>("")
    const [isOverdue, setIsOverdue] = useState(false)

    // Modals & Inputs
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
    const [otpInput, setOtpInput] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState("")
    const [isCancelling, setIsCancelling] = useState(false)

    const [error, setError] = useState<string | null>(null)

    // Review states
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewComment, setReviewComment] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    const status = order.status?.toUpperCase();
    const isCompleted = status === "COMPLETED"
    const isCancelled = status === "CANCELLED"
    const isProcessing = status === "PROCESSING"
    const isOfferOrder = order.isOfferOrder

    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
    const sellerHasReviewed = order.orderReview && order.orderReview.sellerRating !== null;
    const buyerHasReviewed = order.orderReview && order.orderReview.buyerRating !== null;

    // --- EFFECT: FETCH BUYER NAME ---
    useEffect(() => {
        const fetchBuyerName = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/user/${order.userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const userData = await res.json();
                    setBuyerName(userData.fullname || userData.username || `${t("purchaseBuyerFallback")} #${order.userId}`);
                } else {
                    setBuyerName(`${t("purchaseBuyerFallback")} #${order.userId}`);
                }
            } catch (error) {
                setBuyerName(t("orderCardUnknownBuyer"));
            }
        };
        if (order.userId) fetchBuyerName();
    }, [order.userId, t, token]);

    // --- EFFECT: REAL-TIME COUNTDOWN & AUTO-CANCEL ---
    useEffect(() => {
        if (isCompleted || isCancelled) return;

        const handleAutoCancel = async () => {
            try {
                const response = await fetch(`${API_URL}/api/seller/orders/${order.id}/cancel`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ reason: "Order cancelled automatically because fulfillment time expired (overdue)." })
                });

                if (response.ok) {
                    toast.error(`Order #${order.id} has been automatically cancelled due to delay.`);
                    if (onStatusUpdate) onStatusUpdate("REFRESH");
                }
            } catch (err) {
                console.error("Auto-cancel failed", err);
            }
        };

        const calculateTime = () => {
            const start = new Date(order.createdAt).getTime();
            const limitMs = (order.handlingTime || 1) * 24 * 60 * 60 * 1000;
            const deadline = start + limitMs;
            const now = new Date().getTime();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("Overdue");
                setIsOverdue(true);
                handleAutoCancel();
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setTimeLeft(`${d > 0 ? d + "d " : ""}${h}h ${m}m`);
            setIsOverdue(false);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000); 
        return () => clearInterval(timer);
    }, [order.id, order.createdAt, order.handlingTime, isCompleted, isCancelled, token, onStatusUpdate]);

    // --- HANDLER: VERIFY OTP ---
    const handleVerifyOtp = async () => {
        setError(null);
        if (otpInput.length !== 6) {
            setError("Please enter a 6-digit code.");
            return;
        }
        setIsVerifying(true);
        try {
            const endpoint = isOfferOrder
                ? `${API_URL}/api/offers/${order.id}/verify-otp`
                : `${API_URL}/api/seller/orders/${order.id}/verify-otp`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ otp: otpInput })
            });

            if (res.ok) {
                toast.success("Order Verified and Completed!");
                setIsOtpModalOpen(false);
                setOtpInput("");
                if (onStatusUpdate) onStatusUpdate("COMPLETED");
            } else {
                const data = await res.json();
                setError(data.message || "Invalid OTP.");
            }
        } catch (err) { setError("Connection error."); }
        finally { setIsVerifying(false); }
    };

    // --- HANDLER: CANCEL ORDER ---
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            setError("Please provide a reason.");
            return;
        }
        setIsCancelling(true);
        try {
            const res = await fetch(`${API_URL}/api/seller/orders/${order.id}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ reason: cancelReason })
            });
            if (res.ok) {
                toast.success("Order Cancelled.");
                setIsCancelModalOpen(false);
                if (onStatusUpdate) onStatusUpdate("CANCELLED");
            } else { toast.error("Failed to cancel."); }
        } catch (err) { toast.error("Server error."); }
        finally { setIsCancelling(false); }
    };

    // --- HANDLER: SUBMIT REVIEW ---
    const handleSubmitReview = async () => {
        if (reviewRating === 0) return toast.error("Select a rating.");
        setIsSubmittingReview(true);
        try {
            const userId = sessionStorage.getItem("id");
            const res = await fetch(`${API_URL}/api/reviews/${order.id}?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
            });
            if (res.ok) {
                toast.success("Review submitted!");
                if (onStatusUpdate) onStatusUpdate("REFRESH");
            }
        } catch (err) { toast.error("Server error."); }
        finally { setIsSubmittingReview(false); }
    };

    // Item Parser
    let itemDetails = { name: "Product", image: "/placeholder.svg", quantity: 0, pricePerKg: 0 };
    try {
        const items = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : order.itemsJson;
        if (items?.[0]) {
            const item = items[0];
            itemDetails = {
                name: item.productName || item.name,
                image: item.imageUrl || item.image,
                quantity: item.quantity,
                pricePerKg: item.pricePerKg
            };
        }
    } catch (e) {}

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const isDelivery = order.isDelivery === true;
    const deliveryFee = order.deliveryFee || 0;
    const finalTotal = order.amount / 100;
    const goodsTotal = finalTotal - deliveryFee;

    const getTranslatedStatus = (statusStr: string) => {
        if (!statusStr) return "";
        const s = statusStr.toUpperCase();
        if (s === "PENDING") return t("ordersTabPending");
        if (s === "PROCESSING") return t("ordersTabProcessing");
        if (s === "COMPLETED") return t("ordersTabCompleted");
        if (s === "CANCELLED") return t("ordersTabCancelled");
        if (s === "CREATED") return t("ordersStatusCreated");
        if (s === "PAID") return t("ordersStatusPaid");
        if (s === "COD_CONFIRMED") return t("ordersStatusCodConfirmed");
        return statusStr.toLowerCase();
    };

    return (
        <>
            <Card className={`p-0 border border-gray-100 bg-white rounded-[20px] shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md ${isCancelled ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                <div className="flex p-8 gap-8 relative flex-col sm:flex-row items-center sm:items-start">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#F1F1F1] border border-gray-50 flex items-center justify-center shrink-0">
                        <img src={itemDetails.image} alt={itemDetails.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-1 text-[#A3ACBA] mb-1">
                                    <Hash className="w-3 h-3 shrink-0" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">{t("orderCardOrderHash")}{order.id}</span>
                                </div>
                                <h3 className="text-[22px] font-[800] text-[#0A2540] tracking-tight leading-none mb-1">{itemDetails.name}</h3>
                                <div className="flex items-center gap-1.5 text-[#697386]">
                                    <User className="w-4 h-4 shrink-0" />
                                    <p className="text-[15px] font-medium">{t("orderCardBuyerLabel")} <Link href={`/user/${order.userId}`} className="text-[#0A2540] font-bold hover:text-[#166534] hover:underline transition-all cursor-pointer">{buyerName}</Link></p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 ${isCompleted ? "bg-[#F0FDF4] text-[#166534] border-[#DCFCE7]" : isCancelled ? "bg-red-50 text-red-600 border-red-100" : "bg-[#FFFBEB] text-[#92400E] border-[#FEF3C7]"}`}>
                                    {isCancelled ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                    <span className="text-[13px] font-bold capitalize">{getTranslatedStatus(order.status)}</span>
                                </div>
                                
                                {!isCompleted && !isCancelled && (
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider shadow-sm animate-pulse ${isOverdue ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                        <Timer className="w-3.5 h-3.5" />
                                        <span>{timeLeft} {isOverdue ? "" : "Left"}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={isDelivery ? "mt-5 p-4 bg-blue-50/50 rounded-xl border border-blue-100" : "mt-5 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100"}>
                            <div className="flex items-center gap-2 text-[#0A2540] mb-2">
                                {isDelivery ? <Truck className="w-5 h-5 text-blue-600 shrink-0" /> : <Store className="w-5 h-5 text-emerald-600 shrink-0" />}
                                <span className="font-bold text-sm tracking-tight">{isDelivery ? t("orderCardDeliveryOrder") : t("orderCardPickupOrder")}</span>
                            </div>
                            {isDelivery ? (
                                <>
                                    {order.deliveryAddress && <p className="text-[13px] text-gray-700 font-medium flex items-start gap-1.5"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />{order.deliveryAddress}</p>}
                                    {order.buyerLatitude && order.buyerLongitude && (
                                        <a href={`https://www.google.com/maps?q=${order.buyerLatitude},${order.buyerLongitude}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[12px] font-bold text-blue-600 hover:text-blue-800 hover:underline">{t("orderCardViewMaps")}</a>
                                    )}
                                </>
                            ) : <p className="text-[13px] text-gray-600 font-medium mt-1">{t("orderCardPickupDesc")}</p>}
                        </div>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em] leading-tight min-h-[1.5rem]">{t("orderCardQuantity")}</p><p className="text-[16px] font-[700] text-[#1A1F25]">{itemDetails.quantity} {t("purchaseKgUnit")}</p></div>
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em] leading-tight min-h-[1.5rem]">{t("orderCardGoodsTotal")}</p><p className="text-[16px] font-[700] text-[#1A1F25]">Rs. {goodsTotal.toLocaleString()}</p></div>
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em] leading-tight min-h-[1.5rem]">{t("orderCardDeliveryFee")}</p><p className="text-[16px] font-[700] text-[#1A1F25]">Rs. {deliveryFee.toLocaleString()}</p></div>
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em] leading-tight min-h-[1.5rem]">{t("orderCardFinalTotal")}</p><p className="text-[16px] font-[900] text-[#166534]">Rs. {finalTotal.toLocaleString()}</p></div>
                        </div>

                        <p className="mt-5 text-[13px] text-[#A3ACBA] font-medium">{t("orderCardOrderedOn")} <span className="text-[#697386] font-semibold">{orderDate}</span></p>
                    </div>
                </div>

                {isCompleted && (
                    <div className="bg-[#F8FAFC] px-8 py-6 border-t border-gray-100 grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#03230F] mb-4">{t("orderCardBuyerFeedback")}</h4>
                            {buyerHasReviewed ? (
                                <div className="space-y-3">
                                    <StarRating rating={order.orderReview.buyerRating} />
                                    <p className="text-sm italic bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-[#4A5568]">"{order.orderReview.buyerComment}"</p>
                                </div>
                            ) : <p className="text-xs text-gray-400 font-medium italic">{t("orderCardNoReview")}</p>}
                        </div>
                        <div className="md:border-l md:pl-8 border-gray-200">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#03230F] mb-4">{t("orderCardRateBuyer")}</h4>
                            {sellerHasReviewed ? (
                                <div className="space-y-3">
                                    <StarRating rating={order.orderReview.sellerRating} />
                                    <p className="text-sm italic bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-[#4A5568]">"{order.orderReview.sellerComment}"</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <StarRating rating={reviewRating} setRating={setReviewRating} interactive />
                                    <textarea placeholder={t("orderCardReviewPlaceholder")} className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03230F] outline-none transition-all" rows={2} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                                    <Button onClick={handleSubmitReview} disabled={isSubmittingReview || reviewRating === 0} className="w-fit bg-[#03230F] hover:bg-black text-[#EEC044] text-[10px] h-auto py-2 px-6 font-bold rounded-lg uppercase tracking-widest transition-all">
                                        {t("orderCardSubmitReview")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isCompleted && !isCancelled && (
                    <div className="bg-[#F8FAFC] px-8 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-6">
                        <button onClick={() => { setError(null); setIsCancelModalOpen(true); }} className="text-[12px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors h-auto py-2">
                            {t("orderCardCancelOrder")}
                        </button>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            if (isProcessing || isOfferOrder) {
                                setIsOtpModalOpen(true);
                            } else if (onStatusUpdate) {
                                onStatusUpdate();
                            }
                        }} className="text-[12px] font-black uppercase tracking-widest text-[#03230F] hover:text-green-700 transition-colors h-auto py-2">
                            {isProcessing || isOfferOrder ? t("orderCardVerifyComplete") : t("orderCardAcceptOrder")}
                        </button>
                    </div>
                )}
            </Card>

            {/* OTP Modal */}
            <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
                <DialogContent className="rounded-[30px] p-8 max-w-[425px]">
                    <DialogHeader className="items-center flex flex-col space-y-4">
                        <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center">
                            <KeyRound className="w-8 h-8 text-[#166534]" />
                        </div>
                        <DialogTitle className="uppercase font-black text-2xl text-[#03230F] tracking-tight">Verify Delivery</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <Input type="text" maxLength={6} placeholder="000000" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} className="text-center text-3xl font-black tracking-[0.5em] h-16 rounded-2xl border-2 focus-visible:ring-[#03230F]" />
                        {error && <div className="text-red-600 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                    </div>
                    <DialogFooter><Button onClick={handleVerifyOtp} disabled={isVerifying || otpInput.length !== 6} className="w-full h-14 bg-[#03230F] hover:bg-black text-[#EEC044] font-black uppercase rounded-2xl tracking-widest transition-all">{isVerifying ? "Verifying..." : "Confirm Delivery"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Modal */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="rounded-[30px] p-8 max-w-[425px]">
                    <DialogHeader className="items-center flex flex-col space-y-4">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <DialogTitle className="uppercase font-black text-2xl text-[#03230F]">Cancel Order</DialogTitle>
                        <p className="text-sm text-gray-500 font-medium">Please state the reason for cancellation.</p>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <textarea placeholder="e.g. Out of stock, pricing error..." className="w-full h-32 p-4 rounded-2xl border-2 border-gray-100 focus:border-red-500 outline-none text-sm resize-none transition-all" value={cancelReason} onChange={(e) => { setError(null); setCancelReason(e.target.value); }} />
                        {error && <div className="text-red-500 text-xs font-bold uppercase text-center flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
                    </div>
                    <DialogFooter><Button onClick={handleCancelOrder} disabled={isCancelling || !cancelReason.trim()} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase rounded-2xl tracking-widest transition-all">{isCancelling ? "Processing..." : "Confirm Cancellation"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}