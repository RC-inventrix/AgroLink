import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Trash2 } from "lucide-react" // Added icon

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
  onRemove: (id: string) => void // Added this prop
}

export default function CartItem({ item, onToggle, onRemove }: CartItemProps) {
  const totalPrice = item.pricePerKg * item.quantity

  return (
    <div
      className={`group flex gap-4 rounded-lg border p-4 transition-all ${
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
        <Image 
            src={item.image || "/placeholder.svg"} 
            alt={item.name} 
            fill 
            className="object-cover" 
        />
      </div>

      <div className="flex flex-1 justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.seller}</p>
          <p className="mt-2 text-sm text-gray-600">
            {item.quantity} kg <span className="text-gray-400">·</span> Rs. {item.pricePerKg}/kg
          </p>
        </div>

        <div className="flex flex-col justify-between items-end">
          <p className="font-semibold text-gray-900">Rs. {totalPrice.toFixed(2)}</p>
          
          {/* --- REMOVE BUTTON --- */}
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors"
            title="Remove from cart"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  )
}