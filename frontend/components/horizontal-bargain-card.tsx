"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, ShoppingCart, RotateCcw } from "lucide-react"

interface BargainItem {
    id: string
    name: string
    seller: string
    image: string
    pricePerHundredG: number
    pricePerKg: number
    requestedQuantityKg: number
    actualPrice: number
    requestedPrice: number
    discount: number
}

// Updated Props Interface
interface HorizontalBargainCardProps {
    item: BargainItem
    // Status now determines the Badge color/text
    status: "in-progress" | "accepted" | "rejected" | "added-to-cart" | "all"
    // New prop to explicitly hide buttons regardless of status
    hideActions?: boolean
    onDelete?: () => void
    onAddToCart?: () => void
    onBargainAgain?: () => void
}

function formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString("en-IN")}`
}

export function HorizontalBargainCard({
                                          item,
                                          status,
                                          hideActions = false, // Default to false
                                          onDelete,
                                          onAddToCart,
                                          onBargainAgain,
                                      }: HorizontalBargainCardProps) {
    const {
        name,
        seller,
        image,
        pricePerHundredG,
        pricePerKg,
        requestedQuantityKg,
        actualPrice,
        requestedPrice,
        discount,
    } = item

    // Helper to render the badge based on status
    const getStatusBadge = () => {
        switch (status) {
            case "in-progress":
                return <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium border border-yellow-200">Pending</span>
            case "accepted":
                return <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200">Accepted</span>
            case "rejected":
                return <span className="px-2.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium border border-red-200">Rejected</span>
            case "added-to-cart":
                return <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200">Added to Cart</span>
            default:
                return null
        }
    }

    return (
        <Card className="flex flex-col sm:flex-row overflow-hidden border-border h-full sm:h-auto transition-all hover:shadow-md">
            {/* Image Section */}
            <div className="w-full sm:w-48 h-48 sm:h-auto relative shrink-0 bg-muted">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-foreground">{name}</h3>
                            {getStatusBadge()}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Seller: Farmer {seller}</p>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{formatCurrency(requestedPrice)}</div>
                        {actualPrice > 0 && (
                            <div className="text-sm text-muted-foreground line-through">{formatCurrency(actualPrice)}</div>
                        )}
                        {discount > 0 && (
                            <div className="text-xs font-medium text-green-600">Save {Math.round(discount)}%</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4 bg-muted/30 p-3 rounded-lg">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Rate:</span>
                        <span className="font-medium">{formatCurrency(pricePerKg)}/kg</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Offer:</span>
                        <span className="font-medium">{formatCurrency(requestedPrice / (requestedQuantityKg || 1))}/kg</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{requestedQuantityKg} kg</span>
                    </div>
                </div>

                {/* Actions Footer - Only render if hideActions is FALSE */}
                {!hideActions && status !== "all" && (
                    <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-border/50">
                        {status === "in-progress" && (
                            <Button onClick={onDelete} variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                <Trash2 className="w-4 h-4" />
                                Cancel Request
                            </Button>
                        )}

                        {status === "accepted" && (
                            <>
                                <Button
                                    onClick={onAddToCart}
                                    className="gap-2 bg-[#2d5016] hover:bg-[#1f3810] text-white"
                                    size="sm"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </Button>
                                <Button onClick={onDelete} variant="outline" size="sm" className="gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                            </>
                        )}

                        {status === "rejected" && (
                            <>
                                <Button
                                    onClick={onBargainAgain}
                                    className="gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                                    size="sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Bargain Again
                                </Button>
                                <Button onClick={onDelete} variant="outline" size="sm" className="gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                            </>
                        )}

                        {status === "added-to-cart" && (
                            <div className="text-sm font-medium text-primary flex items-center px-3">
                                Item in Cart
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}