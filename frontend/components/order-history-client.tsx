"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, KeyRound, Hash, Star, MessageSquare, CheckCircle2, Clock, User, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import BuyerHeader from "./headers/BuyerHeader"
import Link from "next/link"
import ReportProblemModalBuyer from "./buyers/reportProblemModelBuyer"
import { DashboardNav } from "@/components/dashboard-nav"
import Footer2 from "@/components/footer/Footer"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

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
                    className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform active:scale-90 shrink-0`}
                >
                    <Star
                        className={`w-5 h-5 shrink-0 ${star <= rating ? "fill-[#EEC044] text-[#EEC044]" : "text-gray-200"}`}
                    />
                </button>
            ))}
        </div>
    );
}

// --- FETCHES CANCELLATION REASON ---
function CancelledReasonBlock({ orderId }: { orderId: string | number }) {
    const { t } = useLanguage() // Initialized the hook
    const [reason, setReason] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReason = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/buyer/orders/cancellation-detail/${orderId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReason(data.reason);
                }
            } catch (err) {
                console.error("Failed to fetch cancellation reason", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReason();
    }, [orderId]);

    if (loading) return <div className="mt-4 h-10 w-full animate-pulse bg-red-50 rounded-xl" />;
    if (!reason) return null;

    return (
        <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl animate-in fade-in zoom-in-95 duration-300">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 mb-1">
                <AlertCircle size={12} className="shrink-0" /> {t("orderHistReasonCancel")}
            </p>
            <p className="text-sm text-gray-700 italic font-medium">
                "{reason}"
            </p>
        </div>
    );
}

interface OrderItem {
    id: string
    displayOrderId: string | number
    name: string
    quantity: number
    pricePerKg: number
    image: string
    sellerName: string
    orderDate: Date
    status: "completed" | "pending" | "cancelled"
    totalPrice: number
    otp?: string
    orderReview?: any
    sellerId?: string
}

export function OrderHistoryClient() {
    const { t } = useLanguage() // Initialized the hook
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const [navUnread, setNavUnread] = useState(0)
    const gatewayUrl = API_URL

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        const userId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")
        if (!userId) { setLoading(false); return; }

        try {
            const res = await fetch(`${gatewayUrl}/api/buyer/orders/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (res.ok) {
                const backendOrders = await res.json()
                const rawItemsList: any[] = []
                const sellerIds = new Set<string>()

                backendOrders.forEach((order: any) => {
                    let parsedItems = []
                    try {
                        parsedItems = (order.itemsJson && order.itemsJson.startsWith("["))
                            ? JSON.parse(order.itemsJson)
                            : [{ productName: "Order Items", quantity: 1, pricePerKg: order.amount / 100 }];
                    } catch (e) { console.error("JSON Parse error", e) }

                    parsedItems.forEach((item: any) => {
                        const sId = item.sellerId || order.sellerId
                        if (sId) sellerIds.add(sId)
                        rawItemsList.push({
                            orderId: order.id,
                            itemData: item,
                            status: order.status === "COMPLETED" ? "completed" :
                                order.status === "CANCELLED" ? "cancelled" : "pending",
                            createdAt: order.createdAt,
                            amount: order.amount,
                            sellerId: sId,
                            otp: order.otp,
                            orderReview: order.orderReview
                        })
                    })
                })

                let sellerNameMap: Record<string, string> = {}
                if (sellerIds.size > 0) {
                    const idsParam = Array.from(sellerIds).join(',')
                    const nameRes = await fetch(`${gatewayUrl}/auth/fullnames?ids=${idsParam}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    if (nameRes.ok) sellerNameMap = await nameRes.json()
                }

                const finalOrders: OrderItem[] = rawItemsList
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((entry, index) => ({
                        id: `${entry.orderId}-${index}`,
                        displayOrderId: entry.orderId,
                        name: entry.itemData.productName || entry.itemData.name || t("orderHistUnknownItem"),
                        quantity: entry.itemData.quantity || 1,
                        pricePerKg: entry.itemData.pricePerKg || 0,
                        image: entry.itemData.imageUrl || entry.itemData.image || "/placeholder.svg",
                        sellerId: entry.sellerId,
                        sellerName: sellerNameMap[entry.sellerId] || t("orderHistAgroSeller"),
                        orderDate: new Date(entry.createdAt),
                        status: entry.status,
                        totalPrice: (entry.amount / 100),
                        otp: entry.otp,
                        orderReview: entry.orderReview
                    }))

                setOrders(finalOrders)
            }
        } catch (error) { console.error("Order fetch failed", error) }
        finally { setLoading(false) }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
            <Toaster position="top-center" richColors />
            <BuyerHeader />
            
            <div className="flex flex-1">
                <DashboardNav unreadCount={navUnread} />
                <main className="flex-1 w-full overflow-x-hidden flex flex-col">
                    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 w-full flex-1">
                        
                        <div className="mb-8">
                            <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">{t("orderHistTitle")}</h1>
                            <p className="text-[#A3ACBA] font-medium">{t("orderHistSubtitle")}</p>
                        </div>

                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="bg-gray-100 border border-gray-200 shadow-sm rounded-xl p-1 mb-6 flex flex-wrap h-auto min-h-[44px]">
                                <TabsTrigger value="all" className="flex-1 h-auto py-2 data-[state=active]:bg-white data-[state=active]:text-[#03230F] data-[state=active]:shadow-sm font-bold text-gray-500 rounded-lg">{t("orderHistTabAll")} ({orders.length})</TabsTrigger>
                                <TabsTrigger value="completed" className="flex-1 h-auto py-2 data-[state=active]:bg-white data-[state=active]:text-[#03230F] data-[state=active]:shadow-sm font-bold text-gray-500 rounded-lg">{t("orderHistTabCompleted")} ({orders.filter(o => o.status === "completed").length})</TabsTrigger>
                                <TabsTrigger value="pending" className="flex-1 h-auto py-2 data-[state=active]:bg-white data-[state=active]:text-[#03230F] data-[state=active]:shadow-sm font-bold text-gray-500 rounded-lg">{t("orderHistTabPending")} ({orders.filter(o => o.status === "pending").length})</TabsTrigger>
                                <TabsTrigger value="cancelled" className="flex-1 h-auto py-2 data-[state=active]:bg-white data-[state=active]:text-[#03230F] data-[state=active]:shadow-sm font-bold text-gray-500 rounded-lg">{t("orderHistTabCancelled")} ({orders.filter(o => o.status === "cancelled").length})</TabsTrigger>
                            </TabsList>

                            <div className="mt-2">
                                <TabsContent value="all">
                                    <OrderList orders={orders} loading={loading} onRefresh={fetchOrders} />
                                </TabsContent>
                                <TabsContent value="completed">
                                    <OrderList orders={orders.filter(o => o.status === "completed")} loading={loading} onRefresh={fetchOrders} />
                                </TabsContent>
                                <TabsContent value="pending">
                                    <OrderList orders={orders.filter(o => o.status === "pending")} loading={loading} onRefresh={fetchOrders} />
                                </TabsContent>
                                <TabsContent value="cancelled">
                                    <OrderList orders={orders.filter(o => o.status === "cancelled")} loading={loading} onRefresh={fetchOrders} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </main>
            </div>
            <Footer2 />
        </div>
    )
}

function OrderList({ orders, loading, onRefresh }: { orders: OrderItem[], loading: boolean, onRefresh: () => void }) {
    const { t } = useLanguage() // Initialized the hook

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#EEC044] mb-4 shrink-0" />
            <p className="text-[#03230F] font-bold">{t("orderHistLoading")}</p>
        </div>
    )
    if (orders.length === 0) return (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <Package className="w-16 h-16 text-gray-300 mb-4 shrink-0" />
            <p className="text-[#03230F] font-bold text-lg">{t("orderHistNoOrders")}</p>
            <p className="text-gray-500 text-sm mt-1">{t("orderHistNoOrdersDesc")}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <OrderCardItem key={order.id} order={order} onRefresh={onRefresh} />
            ))}
        </div>
    )
}

function OrderCardItem({ order, onRefresh }: { order: OrderItem, onRefresh: () => void }) {
    const { t } = useLanguage() // Initialized the hook
    const [showReportModal, setShowReportModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const hasReviewed = order.orderReview && order.orderReview.buyerRating !== null;
    const sellerHasReviewed = order.orderReview && order.orderReview.sellerRating !== null;

    const handleSubmitReview = async () => {
        if (rating === 0) { toast.error(t("orderHistSelectRating")); return; }
        setIsSubmitting(true);
        const userId = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");

        try {
            const res = await fetch(`${API_URL}/api/reviews/${order.displayOrderId}?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                toast.success(t("orderHistReviewSuccess"));
                onRefresh();
            }
        } catch (err) { toast.error(t("orderHistReviewFail")); }
        finally { setIsSubmitting(false); }
    };

    const getTranslatedStatus = (status: string) => {
        if (status === "completed") return t("orderHistTabCompleted");
        if (status === "pending") return t("orderHistTabPending");
        if (status === "cancelled") return t("orderHistTabCancelled");
        return status;
    };

    return (
        <Card className={`p-0 overflow-hidden bg-white shadow-sm border-l-4 transition-all hover:shadow-md rounded-2xl border-gray-200 ${order.status === 'cancelled' ? 'border-l-red-500 opacity-90' : 'border-l-[#03230F]'}`}>
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 shadow-sm">
                        <img src={order.image} className="object-cover w-full h-full" alt={order.name} />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 flex items-center gap-1 mb-1 uppercase tracking-widest"><Hash size={10} className="shrink-0" /> {t("orderHistOrderHash")}{order.displayOrderId}</p>
                                <h3 className="font-black text-xl text-[#03230F]">{order.name}</h3>
                                <p className="text-sm font-semibold text-gray-500 mt-0.5 flex flex-wrap gap-1">
                                    {t("orderHistSoldBy")} <Link href={`/user/${order.sellerId}?role=SELLER`} className="text-[#03230F] hover:text-[#EEC044] hover:underline transition-colors truncate">{order.sellerName}</Link>
                                </p>
                            </div>
                            <Badge variant={order.status === "completed" ? "default" : "secondary"} className={`capitalize font-bold px-3 py-1 text-[10px] tracking-widest uppercase h-auto shrink-0 ${
                                order.status === 'completed' ? 'bg-[#03230F] text-[#EEC044]' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-none' : 
                                'bg-[#EEC044]/20 text-[#03230F] border-none'
                            }`}>
                                {getTranslatedStatus(order.status)}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
                            <div><p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t("orderHistQty")}</p><p className="font-bold text-[#03230F]">{order.quantity} {t("purchaseKgUnit")}</p></div>
                            <div><p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t("orderHistRate")}</p><p className="font-bold text-[#03230F]">Rs. {order.pricePerKg}</p></div>
                            <div><p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t("orderHistDate")}</p><p className="font-bold text-[#03230F]">{format(order.orderDate, "MMM d, yyyy")}</p></div>
                            <div><p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{t("orderHistTotal")}</p><p className="font-black text-lg text-[#03230F] whitespace-nowrap">Rs. {order.totalPrice.toFixed(2)}</p></div>
                        </div>

                        {order.status === "pending" && order.otp && (
                            <div className="mt-6 p-4 bg-[#EEC044]/10 border-2 border-dashed border-[#EEC044]/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <p className="flex items-center gap-2 text-xs font-black uppercase text-[#03230F]">
                                        <KeyRound className="w-4 h-4 text-[#EEC044] shrink-0" /> {t("orderHistDeliveryOtp")}
                                    </p>
                                    <p className="text-[11px] text-gray-500 font-medium mt-1">{t("orderHistOtpDesc")}</p>
                                </div>
                                <div className="text-2xl font-black text-[#03230F] tracking-[0.3em] bg-white px-5 py-2 rounded-xl border border-[#EEC044]/30 shadow-sm shrink-0">
                                    {order.otp}
                                </div>
                            </div>
                        )}

                        {order.status === "cancelled" && (
                            <div className="mt-4">
                                <CancelledReasonBlock orderId={order.displayOrderId} />
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowReportModal(true)}
                                        className="text-red-600 border-red-200 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest transition-colors rounded-lg h-auto py-2"
                                    >
                                        <AlertCircle size={12} className="mr-1.5 shrink-0" />
                                        {t("orderHistReportProblem")}
                                    </Button>
                                </div>
                                <ReportProblemModalBuyer
                                    orderId={order.displayOrderId}
                                    isOpen={showReportModal}
                                    onClose={() => setShowReportModal(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {order.status === "completed" && (
                <div className="bg-gray-50 border-t border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            {hasReviewed ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                        <span className="text-xs font-black uppercase tracking-widest text-green-600">{t("orderHistYourFeedback")}</span>
                                    </div>
                                    <StarRating rating={order.orderReview.buyerRating} />
                                    <p className="text-sm text-gray-600 italic bg-white p-4 rounded-xl border border-gray-200 shadow-sm font-medium">
                                        "{order.orderReview.buyerComment}"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-[#EEC044] shrink-0" />
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-[#03230F]">{t("orderHistRateExp")}</h4>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <StarRating rating={rating} setRating={setRating} interactive={true} />
                                        <textarea
                                            placeholder={t("orderHistReviewPlaceholder")}
                                            className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-[#EEC044]/50 transition-all font-medium text-[#03230F]"
                                            rows={3}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <Button
                                            onClick={handleSubmitReview}
                                            disabled={isSubmitting}
                                            className="w-fit bg-[#03230F] text-[#EEC044] font-bold px-8 py-2.5 h-auto rounded-xl uppercase tracking-widest text-xs transition-all hover:bg-black shadow-md mt-1"
                                        >
                                            {isSubmitting ? t("orderHistSubmitting") : t("orderHistSubmitReview")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 border-l-0 md:border-l md:border-gray-200 md:pl-8">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-[#EEC044] shrink-0" />
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#03230F]">{t("orderHistSellerFeedback")}</h4>
                            </div>
                            {sellerHasReviewed ? (
                                <div className="space-y-3">
                                    <StarRating rating={order.orderReview.sellerRating} />
                                    <p className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm font-medium italic">
                                        "{order.orderReview.sellerComment}"
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                    <Clock className="w-8 h-8 text-gray-300 mb-2 shrink-0" />
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest px-4">
                                        {t("orderHistPendingReview")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}