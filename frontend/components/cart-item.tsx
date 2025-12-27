import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

interface Vegetable {
  id: string
  name: string
  image: string
  pricePerKg: number
  quantity: number
  seller: string
  selected: boolean
}

interface CartItemProps {
  item: Vegetable
  onToggle: (id: string) => void
}

export default function CartItem({ item, onToggle }: CartItemProps) {
  const totalPrice = item.pricePerKg * item.quantity

  return (
    <div
      className={`flex gap-4 rounded-lg border p-4 transition-colors ${
        item.selected ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start pt-1">
        <Checkbox
          id={`item-${item.id}`}
          checked={item.selected}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1"
        />
      </div>

      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex flex-1 justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.seller}</p>
          <p className="mt-2 text-sm text-gray-600">
            {item.quantity} kg <span className="text-gray-400">·</span> Rs. {item.pricePerKg}/kg
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">Rs. {totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
