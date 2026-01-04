"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface Vegetable {
  id: string
  name: string
  selected: boolean
  pricePerKg: number
  quantity: number
}

interface CartSummaryProps {
  selectedItems: Vegetable[]
  totalPrice: number
  onCheckout: () => void
}

export default function CartSummary({ selectedItems, totalPrice, onCheckout }: CartSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 h-fit">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <CheckCircle2 className="h-5 w-5 text-green-700" />
        Order Summary
      </h2>

      {selectedItems.length > 0 ? (
        <>
          <div className="mb-6 space-y-3 border-b border-gray-200 pb-6">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name}</span>
                <span>Rs. {(item.pricePerKg * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rs. {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>Rs. 30.00</span>
            </div>
          </div>

          <div className="mb-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>Rs. {(totalPrice + 30).toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={onCheckout}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Proceed to Checkout
          </Button>

          <p className="mt-4 text-center text-xs text-gray-500">Items selected: {selectedItems.length}</p>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No items selected</p>
          <p className="text-sm text-gray-400">Select items to proceed to checkout</p>
        </div>
      )}
    </div>
  )
}
