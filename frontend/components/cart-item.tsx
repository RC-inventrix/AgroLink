import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Truck, Store, MapPin } from "lucide-react"
import Image from "next/image"

interface Vegetable {
    id: string
    name: string
    image: string
    pricePerKg: number
    quantity: number
    seller: string
    selected: boolean
    deliveryFee?: number | null
    deliveryAddress?: string
}

interface CartItemProps {
    item: Vegetable
    onToggle: (id: string) => void
    onDelete: (id: string) => void
}

export default function CartItem({ item, onToggle, onDelete }: CartItemProps) {
    const goodsPrice = item.pricePerKg * item.quantity

    // Check if it's delivery (fee exists and is greater than 0)
    const isDelivery = item.deliveryFee != null && item.deliveryFee > 0;
    const finalPrice = isDelivery ? goodsPrice + item.deliveryFee! : goodsPrice;

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

                    <div className="mt-2 text-sm text-gray-600 flex flex-col gap-2">
                        <span>{item.quantity} kg <span className="text-gray-400">·</span> Rs. {item.pricePerKg}/kg</span>

                        {/* --- NEW: Delivery vs Pickup UI --- */}
                        {isDelivery ? (
                            <div className="flex items-center gap-1.5 text-blue-700 bg-blue-100 w-fit px-2.5 py-1 rounded-md">
                                <Truck className="w-4 h-4" />
                                <span className="font-bold text-xs tracking-tight">Delivery (Rs. {item.deliveryFee})</span>
                                {item.deliveryAddress && (
                                    <>
                                        <MapPin className="w-3 h-3 ml-1 text-blue-500" />
                                        <span className="text-[11px] font-medium truncate max-w-[120px]">{item.deliveryAddress}</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 w-fit px-2.5 py-1 rounded-md">
                                <Store className="w-4 h-4" />
                                <span className="font-bold text-xs tracking-tight">Pickup Order</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-gray-900 text-lg">Rs. {finalPrice.toFixed(2)}</p>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5 px-3 py-1.5 h-auto"
                        aria-label={`Remove ${item.name} from cart`}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Remove</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}