"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, KeyRound, Hash, Star, MessageSquare, CheckCircle2, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { toast, Toaster } from "sonner"
import BuyerHeader from "./headers/BuyerHeader"
import Link from "next/link"

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
                        className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                </button>
            ))}
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
    status: "completed" | "pending"
    totalPrice: number
    otp?: string
    orderReview?: any 
    sellerId?: string
}

export function OrderHistoryClient() {
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)
    const gatewayUrl = "http://localhost:8080"

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
                            status: order.status === "COMPLETED" ? "completed" : "pending",
                            createdAt: order.createdAt,
                            amount: order.amount,
                            sellerId: sId,
                            otp: order.otp, // PRESERVING OTP FROM BACKEND
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

                // Inside fetchOrders function...

const finalOrders: OrderItem[] = rawItemsList
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((entry, index) => ({
        id: `${entry.orderId}-${index}`,
        displayOrderId: entry.orderId,
        name: entry.itemData.productName || entry.itemData.name || "Unknown Item",
        quantity: entry.itemData.quantity || 1,
        pricePerKg: entry.itemData.pricePerKg || 0,
        image: entry.itemData.imageUrl || entry.itemData.image || "/placeholder.svg",
        
        // --- FIX: Add this line ---
        sellerId: entry.sellerId, 
        // --------------------------

        sellerName: sellerNameMap[entry.sellerId] || "AgroLink Seller",
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
        <div>
            <Toaster position="top-center" richColors />
            <BuyerHeader />
            <div className="p-8 w-full">
                <h1 className="text-3xl font-bold tracking-tight mb-6 text-[#03230F]">Order History</h1>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-secondary">
                        <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({orders.filter(o => o.status === "completed").length})</TabsTrigger>
                        <TabsTrigger value="pending">Pending ({orders.filter(o => o.status === "pending").length})</TabsTrigger>
                    </TabsList>
                    <div className="mt-6">
                        <TabsContent value="all"><OrderList orders={orders} loading={loading} onRefresh={fetchOrders}/></TabsContent>
                        <TabsContent value="completed"><OrderList orders={orders.filter(o => o.status === "completed")} loading={loading} onRefresh={fetchOrders}/></TabsContent>
                        <TabsContent value="pending"><OrderList orders={orders.filter(o => o.status === "pending")} loading={loading} onRefresh={fetchOrders}/></TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

function OrderList({ orders, loading, onRefresh }: { orders: OrderItem[], loading: boolean, onRefresh: () => void }) {
    if (loading) return <div className="text-center py-10 animate-pulse text-gray-400">Loading AgroLink Orders...</div>
    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCardItem key={order.id} order={order} onRefresh={onRefresh} />
            ))}
        </div>
    )
}

function OrderCardItem({ order, onRefresh }: { order: OrderItem, onRefresh: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    // CHECK DATABASE: If buyerRating exists in orderReview record from DB
    const hasReviewed = order.orderReview && order.orderReview.buyerRating !== null;
    const sellerHasReviewed = order.orderReview && order.orderReview.sellerRating !== null;

    const handleSubmitReview = async () => {
        if (rating === 0) { toast.error("Please select a rating"); return; }
        setIsSubmitting(true);
        const userId = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:8080/api/reviews/${order.displayOrderId}?userId=${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ rating, comment })
            });

            if (res.ok) {
                toast.success("Review submitted!");
                onRefresh(); 
            }
        } catch (err) { toast.error("Submission failed"); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <Card className="p-0 border-l-4 border-l-[#EEC044] overflow-hidden bg-white">
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-secondary border flex-shrink-0">
                        <img src={order.image} className="object-cover w-full h-full" alt={order.name} />
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1"><Hash size={10} /> ORDER #{order.displayOrderId}</p>
                                <h3 className="font-bold text-lg text-[#03230F]">{order.name}</h3>
                                <p className="text-sm font-semibold text-[#2d5016]">Sold by <Link href={`/user/${order.sellerId}?role=SELLER`}>{order.sellerName}</Link></p>
                            </div>
                            <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                            <div><p className="text-xs text-muted-foreground">Qty</p><p className="font-bold">{order.quantity} kg</p></div>
                            <div><p className="text-xs text-muted-foreground">Rate</p><p className="font-bold">Rs. {order.pricePerKg}</p></div>
                            <div><p className="text-xs text-muted-foreground">Date</p><p className="font-bold">{format(order.orderDate, "MMM d, yyyy")}</p></div>
                            <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold text-[#2d5016]">Rs. {order.totalPrice.toFixed(2)}</p></div>
                        </div>

                        {order.status === "pending" && order.otp && (
                            <div className="mt-6 p-4 bg-green-50 border-2 border-dashed border-[#03230F]/10 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="flex items-center gap-2 text-[10px] font-black uppercase text-[#03230F]">
                                        <KeyRound className="w-3 h-3 text-[#EEC044]" /> Delivery Handover OTP
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">Provide this code to the seller to confirm delivery</p>
                                </div>
                                <div className="text-2xl font-black text-[#03230F] tracking-[0.3em] bg-white px-4 py-1 rounded-lg border shadow-sm">
                                    {order.otp}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TWO COLUMN REVIEW SECTION --- */}
            {order.status === "completed" && (
                <div className="bg-[#F8FAFC] border-t border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* COLUMN 1: BUYER REVIEW (Form or Text) */}
                        <div className="space-y-4">
                            {hasReviewed ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-black uppercase text-green-600">Your Feedback to Seller</span>
                                    </div>
                                    <StarRating rating={order.orderReview.buyerRating} />
                                    <p className="text-sm text-[#4A5568] italic bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        "{order.orderReview.buyerComment}"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-[#03230F]" />
                                        <h4 className="text-[13px] font-black uppercase tracking-widest text-[#03230F]">Rate your experience</h4>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <StarRating rating={rating} setRating={setRating} interactive={true} />
                                        <textarea 
                                            placeholder="How was the crop quality and transaction?"
                                            className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-[#EEC044]/20"
                                            rows={3}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <Button 
                                            onClick={handleSubmitReview} 
                                            disabled={isSubmitting} 
                                            className="w-fit bg-[#03230F] text-[#EEC044] font-bold px-8 py-2 rounded-xl uppercase tracking-widest transition-all hover:bg-black"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Review"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* COLUMN 2: SELLER REVIEW (Feedback about the Buyer) */}
                        <div className="space-y-4 border-l-0 md:border-l md:pl-8 border-gray-200">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#03230F]" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-[#03230F]">Seller's Feedback for You</h4>
                            </div>
                            
                            {sellerHasReviewed ? (
                                <div className="space-y-3">
                                    <StarRating rating={order.orderReview.sellerRating} />
                                    <p className="text-sm text-[#4A5568] leading-relaxed bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        "{order.orderReview.sellerComment}"
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium italic">
                                        Submitted on {format(new Date(order.orderReview.sellerReviewedAt), "MMM d, yyyy")}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-8 text-center bg-white/50 rounded-xl border border-dashed border-gray-200">
                                    <Clock className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-400 font-medium px-4">
                                        The seller hasn't left a review for this transaction yet.
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