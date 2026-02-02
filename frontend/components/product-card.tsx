"use client"

import { Pencil, Trash2, MapPin, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
    id: string
    name: string
    category: string
    description: string
    image: string
    pricePerKg: number
    quantity: number // <--- ADDED THIS LINE TO FIX THE ERROR
    // Bidding
    biddingPrice?: number
    pricingType: "FIXED" | "BIDDING"
    // Delivery
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    // Location
    pickupLatitude?: number
    pickupLongitude?: number
    pickupAddress?: string
}

interface ProductCardProps {
    product: Product
    userDefaultAddress: string | null
    onEdit: (product: Product) => void
    onDelete: (id: string) => void
}

export default function ProductCard({
                                        product,
                                        userDefaultAddress,
                                        onEdit,
                                        onDelete,
                                    }: ProductCardProps) {

    // Logic to determine icon: If product address matches user default address, show Home icon
    const isDefaultAddress = userDefaultAddress && product.pickupAddress
        ? product.pickupAddress.trim().toLowerCase() === userDefaultAddress.trim().toLowerCase()
        : false;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Product Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
                <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                    <button
                        onClick={() => onEdit(product)}
                        className="p-2 bg-white/90 text-primary rounded-full hover:bg-white shadow-sm transition-colors backdrop-blur-sm"
                        aria-label="Edit product"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="p-2 bg-white/90 text-destructive rounded-full hover:bg-white shadow-sm transition-colors backdrop-blur-sm"
                        aria-label="Delete product"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {product.category}
                </div>
            </div>

            {/* Product Details */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.name}</h3>
                    <div className="text-right">
                        <div className="font-bold text-accent whitespace-nowrap">
                            {product.pricingType === "FIXED"
                                ? `LKR ${product.pricePerKg}`
                                : `Bid: LKR ${product.biddingPrice}`}
                            <span className="text-xs text-muted-foreground font-normal ml-1">/kg</span>
                        </div>
                        {/* Display Quantity */}
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Qty: {product.quantity}kg
                        </div>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{product.description}</p>

                <div className="space-y-3 mt-auto">
                    {/* Delivery Info */}
                    <div className="text-xs flex items-start gap-2 text-muted-foreground bg-muted/30 p-2 rounded">
                        <span className="text-base">🚚</span>
                        <div>
                            {product.deliveryAvailable ? (
                                <>
                                    <span className="font-medium text-foreground">Delivery Available</span>
                                    <div className="opacity-80 mt-0.5">Base: LKR {product.baseCharge} (+{product.extraRatePerKm}/km)</div>
                                </>
                            ) : (
                                <span className="font-medium text-foreground">Pickup Only</span>
                            )}
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="text-xs flex items-start gap-2 text-muted-foreground bg-muted/30 p-2 rounded">
                        {isDefaultAddress ? (
                            <Home className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                        )}
                        <div>
                   <span className="font-medium text-foreground">
                      {isDefaultAddress ? "Home Location" : "Custom Location"}
                   </span>
                            <div className="opacity-80 mt-0.5 line-clamp-1">{product.pickupAddress || "No address set"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}