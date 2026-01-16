"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trash2, ShoppingCart, RotateCcw } from "lucide-react"

interface VegetableCardProps {
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
  status: "all" | "in-progress" | "accepted" | "rejected"
  onDelete?: () => void
  onAddToCart?: () => void
  onBargainAgain?: () => void
}

export function VegetableCard({
  name,
  seller,
  image,
  pricePerHundredG,
  pricePerKg,
  requestedQuantityKg,
  actualPrice,
  requestedPrice,
  discount,
  status,
  onDelete,
  onAddToCart,
  onBargainAgain,
}: VegetableCardProps) {
  const statusPercentage = status === "all" ? 25 : status === "in-progress" ? 50 : status === "accepted" ? 100 : 0

  return (
    <Card className="overflow-hidden bg-card shadow-md hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="relative w-full h-40 bg-muted overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Name and Seller */}
        <div>
          <h3 className="font-bold text-lg text-card-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">Seller: {seller}</p>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Per 100g</p>
            <p className="font-semibold text-card-foreground">₹{pricePerHundredG}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Per 1kg</p>
            <p className="font-semibold text-card-foreground">₹{pricePerKg}</p>
          </div>
        </div>

        {/* Quantity and Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-semibold text-card-foreground">{requestedQuantityKg} kg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Actual Price:</span>
            <span className="font-semibold text-card-foreground">₹{actualPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Offer:</span>
            <span className="font-semibold text-card-foreground">₹{requestedPrice}</span>
          </div>
        </div>

        {/* Discount Badge */}
        <div className="flex items-center justify-between bg-accent/10 p-2 rounded-lg">
          <span className="text-sm text-muted-foreground">Discount</span>
          <span className="text-lg font-bold text-accent">{discount}%</span>
        </div>

        {/* Status Progress Bar */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Status</p>
          <Progress value={statusPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 capitalize">{status}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {status === "in-progress" && (
            <Button onClick={onDelete} variant="destructive" size="sm" className="flex-1 gap-1">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}

          {status === "accepted" && (
            <>
              <Button
                onClick={onAddToCart}
                className="flex-1 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
              <Button onClick={onDelete} variant="outline" size="sm" className="gap-1 bg-transparent">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}

          {status === "rejected" && (
            <>
              <Button
                onClick={onBargainAgain}
                className="flex-1 gap-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
                Bargain Again
              </Button>
              <Button onClick={onDelete} variant="outline" size="sm" className="gap-1 bg-transparent">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
