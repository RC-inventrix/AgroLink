import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface VegetableItemProps {
  item: {
    id: number
    name: string
    quantity: number
    pricePerKg: number
    deliveryFee: number
    image: string
  }
}

export function VegetableItem({ item }: VegetableItemProps) {
  const itemTotal = item.quantity * item.pricePerKg

  return (
    <Card className="p-4 hover:shadow-md transition-shadow border-2">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1">{item.name}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">
                  {item.quantity} kg
                </Badge>
                <span className="text-sm text-muted-foreground">Rs. {item.pricePerKg}/kg</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">Rs. {itemTotal.toFixed(2)}</div>
            </div>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Delivery Fee</span>
            <span className="text-sm font-semibold text-foreground">Rs. {item.deliveryFee.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
