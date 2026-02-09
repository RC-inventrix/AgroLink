"use client"

import { Pencil, Trash2, MapPin, Home, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
    id: string
    name: string
    category: string
    description: string
    image: string
    pricePerKg: number
    quantity: number
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

    const isDefaultAddress = userDefaultAddress && product.pickupAddress
        ? product.pickupAddress.trim().toLowerCase() === userDefaultAddress.trim().toLowerCase()
        : false;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Product Image */}
            <div className="relative h-56 bg-muted overflow-hidden">
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
            </div>

            {/* Product Details - LINE BY LINE LAYOUT */}
            <div className="p-5 flex-1 flex flex-col space-y-3">

                {/* 1. Name */}
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-foreground line-clamp-1">{product.name}</h3>
                    {/* Category Badge */}
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">
                {product.category}
            </span>
                </div>

                {/* 2. Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {product.description || "No description provided."}
                </p>

                {/* 3. Price & Quantity Block */}
                <div className="bg-muted/20 p-3 rounded-md border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-muted-foreground">Price</span>
                        <span className="font-bold text-lg text-primary">
                    {product.pricingType === "FIXED"
                        ? `LKR ${product.pricePerKg}`
                        : `Bid: LKR ${product.biddingPrice}`}
                            <span className="text-xs font-normal text-muted-foreground">/kg</span>
                </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                    <Package className="w-3 h-3"/> Available Stock
                </span>
                        <span className="font-semibold text-foreground">{product.quantity} kg</span>
                    </div>
                </div>

                {/* Spacer to push delivery/address to bottom if content is short */}
                <div className="flex-1"></div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                    {/* 4. Delivery Info */}
                    <div className="text-xs flex items-start gap-2.5 text-muted-foreground">
                        <span className="text-base leading-none mt-0.5">🚚</span>
                        <div>
                            {product.deliveryAvailable ? (
                                <>
                                    <span className="font-medium text-foreground block">Delivery Available</span>
                                    <span className="opacity-80">Base: LKR {product.baseCharge} (+{product.extraRatePerKm}/km)</span>
                                </>
                            ) : (
                                <span className="font-medium text-foreground">Pickup Only</span>
                            )}
                        </div>
                    </div>

                    {/* 5. Address Info */}
                    <div className="text-xs flex items-start gap-2.5 text-muted-foreground">
                        {isDefaultAddress ? (
                            <Home className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        )}
                        <div className="overflow-hidden">
                   <span className="font-medium text-foreground block">
                      {isDefaultAddress ? "Home Location" : "Custom Location"}
                   </span>
                            <span className="opacity-80 truncate block w-full" title={product.pickupAddress}>
                       {product.pickupAddress || "No address set"}
                   </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}