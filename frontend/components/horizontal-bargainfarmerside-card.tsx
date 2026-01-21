"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Check, X } from "lucide-react"

interface BargainRequest {
  id: string
  name: string
  buyerName: string
  image: string
  pricePerHundredG: number
  pricePerKg: number
  requestedQuantityKg: number
  actualPrice: number
  offeredPrice: number
  discount: number
}

interface HorizontalBargainCardProps {
  item: BargainRequest
  status: "all" | "pending" | "accepted" | "rejected"
  onAccept?: () => void
  onReject?: () => void
  onDelete?: () => void
  onRemove?: () => void
  onRespondWithNewPrice?: () => void
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`
}

export function HorizontalBargainCard({
  item,
  status,
  onAccept,
  onReject,
  onDelete,
  onRemove,
  onRespondWithNewPrice,
}: HorizontalBargainCardProps) {
  const {
    name,
    buyerName,
    image,
    pricePerHundredG,
    pricePerKg,
    requestedQuantityKg,
    actualPrice,
    offeredPrice,
    discount,
  } = item

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return { text: "Pending", color: "text-blue-600" }
      case "accepted":
        return { text: "Accepted", color: "text-green-600" }
      case "rejected":
        return { text: "Rejected", color: "text-red-600" }
      default:
        return { text: "New", color: "text-amber-600" }
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
              <p className="text-sm text-muted-foreground">Bargain from {buyerName}</p>
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Price</p>
              <p className="text-sm font-semibold text-card-foreground">{formatCurrency(pricePerKg)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Total</p>
              <p className="text-sm font-semibold text-card-foreground">{formatCurrency(actualPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer's Offer</p>
              <p className="text-sm font-semibold text-green-600">{formatCurrency(offeredPrice)}</p>
            </div>
          </div>

          {/* Discount and Per 100g Price Row */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-muted">
            <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg">
              <span className="text-xs text-muted-foreground">Discount:</span>
              <span className="text-lg font-bold text-accent">{discount}%</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Per 100g</p>
              <p className="text-sm font-semibold text-card-foreground">{formatCurrency(pricePerHundredG)}</p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            {status === "pending" && (
              <>
                <Button onClick={onAccept} className="gap-2 bg-green-600 hover:bg-green-700 text-white" size="sm">
                  <Check className="w-4 h-4" />
                  Accept Deal
                </Button>
                <Button onClick={onReject} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white" size="sm">
                  <X className="w-4 h-4" />
                  Reject
                </Button>
                <Button onClick={onDelete} variant="outline" size="sm" className="gap-2 ml-auto bg-transparent">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}

            {status === "accepted" && (
              <>
                <span className="text-sm font-medium text-green-600">Deal Confirmed</span>
                <Button onClick={onRemove} variant="outline" size="sm" className="gap-2 ml-auto bg-transparent">
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </>
            )}

            {status === "rejected" && (
              <>
                {/* Removed the "Respond with New Price" button */}
                <Button onClick={onDelete} variant="outline" size="sm" className="gap-2 ml-auto bg-transparent">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
