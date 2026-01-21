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

interface HorizontalBargainCardProps {
    item: BargainItem
    status: "all" | "in-progress" | "accepted" | "rejected"
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

    const getStatusBadge = () => {
        switch (status) {
            case "in-progress":
                return { text: "In Progress", color: "text-blue-600" }
            case "accepted":
                return { text: "Accepted", color: "text-green-600" }
            case "rejected":
                return { text: "Rejected", color: "text-red-600" }
            default:
                return { text: "Pending", color: "text-amber-600" }
        }
    }

    const statusBadge = getStatusBadge()

    return (
        <Card className="overflow-hidden bg-card shadow-md hover:shadow-lg transition-shadow border border-muted">
            <div className="flex gap-6 p-6">
                <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                        <img
                            src={image || "/placeholder.svg?height=128&width=128"}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="flex-1 min-w-0">
                    {/* Header: Name and Status */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-card-foreground">{name}</h3>
                            <p className="text-sm text-muted-foreground">Sold by {seller}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p>
                            <p className="text-sm font-semibold text-card-foreground">{requestedQuantityKg} kg</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Price per kg</p>
                            <p className="text-sm font-semibold text-card-foreground">{formatCurrency(pricePerKg)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Actual Total</p>
                            <p className="text-sm font-semibold text-card-foreground">{formatCurrency(actualPrice)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Offer</p>
                            <p className="text-sm font-semibold text-green-600">{formatCurrency(requestedPrice)}</p>
                        </div>
                    </div>

                    {/* Discount and Per 100g Price Row */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-muted">
                        <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg">
                            <span className="text-xs text-muted-foreground">Discount:</span>
                            {/* UPDATED: Added .toFixed(2) here */}
                            <span className="text-lg font-bold text-accent">{discount.toFixed(2)}%</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Per 100g</p>
                            <p className="text-sm font-semibold text-card-foreground">{formatCurrency(pricePerHundredG)}</p>
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2">
                        {status === "in-progress" && (
                            <Button onClick={onDelete} variant="destructive" size="sm" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete Request
                            </Button>
                        )}

                        {status === "accepted" && (
                            <>
                                <Button
                                    onClick={onAddToCart}
                                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    size="sm"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                </Button>
                                <Button onClick={onDelete} variant="outline" size="sm" className="gap-2 bg-transparent">
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                            </>
                        )}

                        {status === "rejected" && (
                            <>
                                <Button
                                    onClick={onBargainAgain}
                                    className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                                    size="sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Bargain Again
                                </Button>
                                <Button onClick={onDelete} variant="outline" size="sm" className="gap-2 bg-transparent">
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}