import { Card } from "@/components/ui/card"
import { VegetableCard } from "./vegetable-cardfarmerside"

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

interface BargainColumnProps {
  title: string
  status: "all" | "in-progress" | "accepted" | "rejected"
  items: BargainItem[]
  onDelete?: (id: string) => void
  onAddToCart?: (id: string) => void
  onBargainAgain?: (id: string) => void
}

export function BargainColumn({ title, status, items, onDelete, onAddToCart, onBargainAgain }: BargainColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{items.length} items</p>
      </div>
      <div className="space-y-4 min-h-screen">
        {items.length === 0 ? (
          <Card className="p-8 text-center bg-muted/30">
            <p className="text-muted-foreground">No bargaining requests</p>
          </Card>
        ) : (
          items.map((item) => (
            <VegetableCard
              key={item.id}
              id={item.id}
              name={item.name}
              seller={item.seller}
              image={item.image}
              pricePerHundredG={item.pricePerHundredG}
              pricePerKg={item.pricePerKg}
              requestedQuantityKg={item.requestedQuantityKg}
              actualPrice={item.actualPrice}
              requestedPrice={item.requestedPrice}
              discount={item.discount}
              status={status}
              onDelete={() => onDelete?.(item.id)}
              onAddToCart={() => onAddToCart?.(item.id)}
              onBargainAgain={() => onBargainAgain?.(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
