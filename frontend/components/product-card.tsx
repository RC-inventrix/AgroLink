/* fileName: product-card.tsx */
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
    baseCharge?: number | null
    extraRatePerKm?: number | null
    // Location
    pickupLatitude?: number | null
    pickupLongitude?: number | null
    pickupAddress?: string | null
}

interface ProductCardProps {
    product: Product
    userDefaultAddress: string | null
    onEdit: (product: Product) => void
    onDelete: (id: string) => void
    onUpdateQuantity: (product: Product) => void
}

export default function ProductCard({
                                        product,
                                        userDefaultAddress,
                                        onEdit,
                                        onDelete,
                                        onUpdateQuantity,
                                    }: ProductCardProps) {

    const isDefaultAddress = userDefaultAddress && product.pickupAddress
        ? product.pickupAddress.trim().toLowerCase() === userDefaultAddress.trim().toLowerCase()
        : false;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Product Image */}
            <div className="relative h-56 bg-muted overflow-hidden border-b border-border">
                <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 shadow-sm hover:bg-white" onClick={() => onEdit(product)}>
                        <Pencil className="w-4 h-4 text-foreground" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8 shadow-sm" onClick={() => onDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-xs font-bold rounded shadow-sm border border-border">
                        {product.pricingType}
                    </span>
                </div>
            </div>

            {/* Product Details */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-foreground mb-1 leading-tight">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                </div>

                <div className="space-y-4 mt-auto">
                    {/* 1. Category */}
                    <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium text-foreground">{product.category}</span>
                    </div>

                    {/* 2. Quantity */}
                    <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium text-foreground">{product.quantity} kg</span>
                    </div>

                    {/* 3. Price */}
                    <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-bold text-primary">
                            {product.pricingType === "FIXED" ? `LKR ${product.pricePerKg}/kg` : "Auction Based"}
                        </span>
                    </div>

                    {/* 4. Delivery Info */}
                    <div className="flex items-start gap-2.5 text-sm text-muted-foreground border-b border-border/50 pb-2">
                        <Package className="w-4 h-4 text-primary shrink-0 mt-0.5" />
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
                    <div className="text-xs flex items-start gap-2.5 text-muted-foreground mb-4">
                        {isDefaultAddress ? (
                            <Home className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                            <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        )}
                        <div className="overflow-hidden">
                            <span className="font-medium text-foreground block">
                                {isDefaultAddress ? "Home Location" : "Custom Location"}
                            </span>
                            <span className="opacity-80 truncate block w-full" title={product.pickupAddress || ""}>
                                {product.pickupAddress || "No address set"}
                            </span>
                        </div>
                    </div>

                    {/* NEW: Visually striking, perfectly fitted Quantity Update Button */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <Button
                            className="w-full bg-[#03230F] hover:bg-[#03230F]/90 text-[#EEC044] font-bold shadow-md transition-all text-sm h-11 rounded-lg"
                            onClick={() => onUpdateQuantity(product)}
                        >
                            Update Quantity
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}