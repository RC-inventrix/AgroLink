"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock } from "lucide-react"

interface OrderCardProps {
    order: any
    onStatusUpdate: () => void
}

export function OrderCard({ order, onStatusUpdate }: OrderCardProps) {
    const status = order.status?.toUpperCase();
    const isCompleted = status === "COMPLETED"
    const isProcessing = status === "PROCESSING"
    
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
    } catch (e) {
        console.error("Error parsing itemsJson", e);
    }

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
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
                        <div>
                            <h3 className="text-[22px] font-[800] text-[#0A2540] tracking-tight leading-none mb-1">
                                {itemDetails.name}
                            </h3>
                            <p className="text-[#697386] text-[15px] font-medium">
                                By {order.sellerName || "Green Valley Farms"}
                            </p>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                            isCompleted ? "bg-[#F0FDF4] border-[#DCFCE7] text-[#166534]" : "bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]"
                        }`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[13px] font-bold capitalize">
                                {order.status.toLowerCase()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-12 max-w-2xl">
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">Quantity</p>
                            <p className="text-[18px] font-[700] text-[#1A1F25]">{itemDetails.quantity} kg</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">Price per kg</p>
                            <p className="text-[18px] font-[700] text-[#1A1F25]">Rs. {itemDetails.pricePerKg}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] text-[#A3ACBA] font-bold uppercase tracking-[0.05em]">Total</p>
                            <p className="text-[18px] font-[700] text-[#1A1F25]">Rs. {(order.amount / 100).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-[13px] text-[#A3ACBA] font-medium">
                            Ordered on <span className="text-[#697386] font-semibold">{orderDate}</span>
                        </p>
                    </div>
                </div>
            </div>

            {!isCompleted && (
                <div className="bg-[#F8FAFC] px-8 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Critical: prevent click bubbling
                            onStatusUpdate();
                        }}
                        className="text-[13px] font-black uppercase tracking-widest text-[#03230F] hover:text-green-700 transition-colors"
                    >
                        {isProcessing ? "Complete Delivery" : "Accept This Order"}
                    </button>
                </div>
            )}
        </Card>
    )
}