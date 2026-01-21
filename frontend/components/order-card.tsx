"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, User, Hash, KeyRound, AlertCircle } from "lucide-react" // Added AlertCircle
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

interface OrderCardProps {
    order: any
    onStatusUpdate?: () => void 
    onOfferAction?: (offerId: number, newStatus: string) => Promise<void>
}

export function OrderCard({ order, onStatusUpdate, onOfferAction }: OrderCardProps) {
    const [buyerName, setBuyerName] = useState<string>("Loading...") 
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
    const [otpInput, setOtpInput] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null) // New state for inline error
    
    const status = order.status?.toUpperCase();
    const isCompleted = status === "COMPLETED"
    const isProcessing = status === "PROCESSING"
    const isOfferOrder = order.isOfferOrder 
    
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    useEffect(() => {
        const fetchBuyerName = async () => {
            try {
                const res = await fetch(`http://localhost:8080/auth/user/${order.userId}`);
                if (res.ok) {
                    const userData = await res.json();
                    setBuyerName(userData.fullname || userData.username);
                } else {
                    setBuyerName(`Buyer #${order.userId}`); 
                }
            } catch (error) {
                console.error("Failed to fetch user name:", error);
                setBuyerName("Unknown Buyer");
            }
        };

        if (order.userId) {
            fetchBuyerName();
        }
    }, [order.userId]);

    const handleVerifyOtp = async () => {
        setError(null); // Clear previous errors

        if (otpInput.length !== 6) {
            setError("Please enter a 6-digit code.");
            return;
        }

        setIsVerifying(true);
        try {
            const endpoint = isOfferOrder 
                ? `http://localhost:8080/api/offers/${order.id}/verify-otp`
                : `http://localhost:8080/api/seller/orders/${order.id}/verify-otp`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ otp: otpInput })
            });

            if (res.ok) {
                toast.success("Order Verified and Completed!");
                setIsOtpModalOpen(false);
                setOtpInput("");
                if (onStatusUpdate) onStatusUpdate();
            } else {
                const data = await res.json();
                // Set the error message returned from the backend
                setError(data.message || "Invalid OTP. Please try again.");
                toast.error("Verification failed.");
            }
        } catch (err) {
            setError("Connection error. Please check your internet.");
            toast.error("Server error.");
        } finally {
            setIsVerifying(false);
        }
    };

    // Parsing itemsJson logic...
    let itemDetails = { name: "Fresh Vegetables", image: "/placeholder.svg", quantity: 0, pricePerKg: 0 };
    try {
        const items = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : order.itemsJson;
        if (items && items.length > 0) {
            itemDetails = {
                name: items[0].productName || items[0].name,
                image: items[0].imageUrl || items[0].image,
                quantity: items[0].quantity,
                pricePerKg: items[0].pricePerKg
            };
        }
    } catch (e) { console.error("Error parsing itemsJson", e); }

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });

    return (
        <>
            <Card className="p-0 border border-gray-100 bg-white rounded-[20px] shadow-sm overflow-hidden transition-all hover:shadow-md mb-4">
                <div className="flex p-8 gap-8 relative flex-col sm:flex-row items-center sm:items-start">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 bg-[#F1F1F1] border border-gray-50 flex items-center justify-center">
                        <img 
                            src={itemDetails.image || "/placeholder.svg"} 
                            alt={itemDetails.name} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                    </div>

                    <div className="flex-1 flex flex-col w-full">
                        <div className="flex justify-between items-start w-full">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1 text-[#A3ACBA] mb-1">
                                    <Hash className="w-3 h-3" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">
                                        order #{order.id}
                                    </span>
                                </div>
                                <h3 className="text-[22px] font-[800] text-[#0A2540] tracking-tight leading-none mb-1">{itemDetails.name}</h3>
                                <div className="flex items-center gap-1.5 text-[#697386]">
                                    <User className="w-4 h-4" />
                                    <p className="text-[15px] font-medium">Buyer: <span className="text-[#0A2540] font-semibold">{buyerName}</span></p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isCompleted ? "bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]" : "bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]"}`}>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[13px] font-bold capitalize">{order.status?.toLowerCase()}</span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-12 max-w-2xl">
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">Quantity</p><p className="text-[18px] font-[700] text-[#1A1F25]">{itemDetails.quantity} kg</p></div>
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">Price per kg</p><p className="text-[18px] font-[700] text-[#1A1F25]">Rs. {itemDetails.pricePerKg}</p></div>
                            <div className="space-y-1"><p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">Total</p><p className="text-[18px] font-[700] text-[#1A1F25]">Rs. {(order.amount / 100).toLocaleString()}</p></div>
                        </div>

                        <div className="mt-6">
                            <p className="text-[13px] text-[#A3ACBA] font-medium">Ordered on <span className="text-[#697386] font-semibold">{orderDate}</span></p>
                        </div>
                    </div>
                </div>

                {!isCompleted && (
                    <div className="bg-[#F8FAFC] px-8 py-4 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isProcessing || isOfferOrder) {
                                    setError(null); // Reset error when opening
                                    setIsOtpModalOpen(true);
                                } else if (onStatusUpdate) {
                                    onStatusUpdate();
                                }
                            }}
                            className="text-[13px] font-black uppercase tracking-widest text-[#03230F] hover:text-green-700 transition-colors"
                        >
                            {isProcessing || isOfferOrder ? "Verify & Complete" : "Accept This Order"}
                        </button>
                    </div>
                )}
            </Card>

            <Dialog open={isOtpModalOpen} onOpenChange={(open) => {
                setIsOtpModalOpen(open);
                if (!open) {
                    setError(null);
                    setOtpInput("");
                }
            }}>
                <DialogContent className="sm:max-w-[425px] rounded-[30px] p-8">
                    <DialogHeader className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-2">
                            <KeyRound className="w-8 h-8 text-[#166534]" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-[#03230F] uppercase tracking-tight">
                            Verify Delivery
                        </DialogTitle>
                        <p className="text-sm text-gray-500 font-medium">
                            Enter the 6-digit handover code provided by the buyer to complete this order.
                        </p>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-4">
                        <Input
                            type="text"
                            placeholder="0 0 0 0 0 0"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => {
                                setError(null); // Clear error while typing
                                setOtpInput(e.target.value.replace(/\D/g, ""));
                            }}
                            className={`text-center text-3xl font-black tracking-[0.5em] h-16 rounded-2xl border-2 transition-all duration-300 ${
                                error ? "border-red-500 bg-red-50 focus-visible:ring-red-500" : "border-gray-100 focus-visible:ring-[#03230F]"
                            }`}
                        />
                        
                        {/* --- ERROR MESSAGE DISPLAY --- */}
                        {error && (
                            <div className="flex items-center justify-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={handleVerifyOtp}
                            disabled={isVerifying || otpInput.length !== 6}
                            className="w-full h-14 rounded-2xl bg-[#03230F] hover:bg-black text-[#EEC044] font-black uppercase tracking-widest transition-all"
                        >
                            {isVerifying ? "Verifying..." : "Confirm Delivery"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}