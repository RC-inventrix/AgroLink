"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, ShoppingCart, RotateCcw, MapPin, Truck, Store, User } from "lucide-react"
import Link from "next/link" // Import Link for navigation

// Updated Interface to include sellerId
interface BargainItem {
    id: string
    name: string
    seller: string
    sellerId: string | number // Added sellerId for the link
    image: string
    pricePerHundredG: number
    pricePerKg: number
    requestedQuantityKg: number
    actualPrice: number
    requestedPrice: number
    discount: number
    deliveryRequired: boolean
    buyerAddress: string
    deliveryFee: number
    buyerLatitude: number | null
    buyerLongitude: number | null
}

interface HorizontalBargainCardProps {
    item: BargainItem
    status: "in-progress" | "accepted" | "rejected" | "added-to-cart" | "all"
    hideActions?: boolean
    onDelete?: () => void
    onAddToCart?: () => void
    onBargainAgain?: () => void
}

function formatCurrency(amount: number): string {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function HorizontalBargainCard({
    item,
    status,
    hideActions = false,
    onDelete,
    onAddToCart,
    onBargainAgain,
}: HorizontalBargainCardProps) {
    const {
        name,
        seller,
        sellerId, // Destructure sellerId
        image,
        pricePerKg,
        requestedQuantityKg,
        actualPrice,
        requestedPrice,
        discount,
        deliveryRequired,
        buyerAddress,
        deliveryFee
    } = item

    const getStatusBadge = () => {
        switch (status) {
            case "in-progress":
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-bold uppercase tracking-wider border border-yellow-200 shadow-sm">Pending</span>
            case "accepted":
                return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold uppercase tracking-wider border border-green-200 shadow-sm">Accepted</span>
            case "rejected":
                return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-bold uppercase tracking-wider border border-red-200 shadow-sm">Rejected</span>
            case "added-to-cart":
                return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold uppercase tracking-wider border border-blue-200 shadow-sm">In Cart</span>
            default:
                return null
        }
    }

    const finalTotal = requestedPrice + (deliveryRequired ? deliveryFee : 0);

    return (
        <Card className="flex flex-col sm:flex-row overflow-hidden border-green-100 bg-white rounded-2xl h-full sm:h-auto transition-all hover:shadow-lg shadow-sm">
            {/* Image Section */}
            <div className="w-full sm:w-56 h-56 sm:h-auto relative shrink-0 bg-green-50 border-r border-green-100/50">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">

                {/* Header & Pricing Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-2xl text-green-900">{name}</h3>
                            {getStatusBadge()}
                        </div>
                        
                        {/* Seller Link Section */}
                        <div className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1.5">
                            <User className="w-4 h-4 opacity-70" />
                            <span>Sold by: </span>
                            <Link 
                                href={`/user/${sellerId}`} 
                                className="font-bold text-green-900 hover:text-green-600 hover:underline transition-all decoration-green-600"
                            >
                                {seller}
                            </Link>
                        </div>
                    </div>

                    <div className="text-left sm:text-right bg-green-50/50 px-4 py-3 rounded-xl border border-green-100">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Your Total Cost</p>
                        <div className="text-2xl font-black text-green-800">Rs. {formatCurrency(finalTotal)}</div>
                        <div className="flex items-center gap-2 mt-1 sm:justify-end">
                            {actualPrice > 0 && (
                                <div className="text-xs text-gray-400 line-through">Rs. {formatCurrency(actualPrice)}</div>
                            )}
                            {discount > 0 && (
                                <div className="text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                                    {Math.round(discount)}% OFF
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Information Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Offer Details */}
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Offer Details</h4>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Original Rate:</span>
                            <span className="font-semibold text-gray-900">Rs. {formatCurrency(pricePerKg)} /kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Your Offer Rate:</span>
                            <span className="font-semibold text-green-700">Rs. {formatCurrency(requestedPrice / (requestedQuantityKg || 1))} /kg</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-600 font-medium">Quantity requested:</span>
                            <span className="font-bold text-gray-900">{requestedQuantityKg} kg</span>
                        </div>
                        <div className="flex justify-between text-sm bg-green-100/50 px-2 py-1 rounded">
                            <span className="text-green-800 font-medium">Product Total:</span>
                            <span className="font-bold text-green-800">Rs. {formatCurrency(requestedPrice)}</span>
                        </div>
                    </div>

                    {/* Logistics & Delivery Block */}
                    <div className={`p-4 rounded-xl border space-y-3 ${deliveryRequired ? 'bg-blue-50/30 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            {deliveryRequired ? <Truck className="w-3.5 h-3.5 text-blue-600"/> : <Store className="w-3.5 h-3.5 text-orange-600"/>}
                            <span className={deliveryRequired ? "text-blue-800" : "text-orange-800"}>Logistics</span>
                        </h4>

                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${deliveryRequired ? "text-blue-500" : "text-orange-500"}`} />
                            <span className="text-gray-700 font-medium leading-tight">
                                {buyerAddress}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-sm border-t pt-2 mt-2 border-white/60">
                            <span className="text-gray-600">Delivery Fee:</span>
                            <span className={`font-bold ${deliveryRequired ? "text-blue-700" : "text-orange-700"}`}>
                                {deliveryRequired ? `Rs. ${formatCurrency(deliveryFee)}` : "Pickup (Free)"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                {!hideActions && status !== "all" && (
                    <div className="flex justify-end gap-3 mt-auto pt-5 border-t border-green-100">
                        {status === "in-progress" && (
                            <Button onClick={onDelete} variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-semibold rounded-lg">
                                <Trash2 className="w-4 h-4" />
                                Cancel Request
                            </Button>
                        )}

                        {status === "accepted" && (
                            <>
                                <Button onClick={onDelete} variant="outline" className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                                <Button
                                    onClick={onAddToCart}
                                    className="gap-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg px-6 shadow-sm"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </Button>
                            </>
                        )}

                        {status === "rejected" && (
                            <>
                                <Button onClick={onDelete} variant="outline" className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                                <Button
                                    onClick={onBargainAgain}
                                    className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg px-6 shadow-sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Bargain Again
                                </Button>
                            </>
                        )}

                        {status === "added-to-cart" && (
                            <div className="text-sm font-bold text-green-700 flex items-center px-4 bg-green-50 rounded-lg border border-green-200">
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Saved to Cart
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}