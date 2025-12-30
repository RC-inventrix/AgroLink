"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import CartItem from "@/components/cart-item"
import CartSummary from "@/components/cart-summary"

interface Vegetable {
  id: string
  name: string
  image: string
  pricePerKg: number
  quantity: number
  seller: string
  selected: boolean
}

const vegetables: Vegetable[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    image: "/fresh-red-tomatoes.jpg",
    pricePerKg: 120,
    quantity: 2.5,
    seller: "Green Valley Farms",
    selected: false,
  },
  {
    id: "2",
    name: "Organic Carrots",
    image: "/fresh-orange-carrots.jpg",
    pricePerKg: 80,
    quantity: 1.8,
    seller: "Nature's Harvest",
    selected: false,
  },
  {
    id: "3",
    name: "Fresh Spinach",
    image: "/fresh-green-spinach-leaves.jpg",
    pricePerKg: 150,
    quantity: 1.2,
    seller: "Organic Greens Co.",
    selected: false,
  },
  {
    id: "4",
    name: "Bell Peppers",
    image: "/fresh-colorful-bell-peppers.jpg",
    pricePerKg: 200,
    quantity: 2.0,
    seller: "Farm Fresh Direct",
    selected: false,
  },
  {
    id: "5",
    name: "Broccoli",
    image: "/fresh-green-broccoli.jpg",
    pricePerKg: 110,
    quantity: 1.5,
    seller: "Green Valley Farms",
    selected: false,
  },
  {
    id: "6",
    name: "Onions",
    image: "/fresh-yellow-onions.jpg",
    pricePerKg: 60,
    quantity: 3.0,
    seller: "Nature's Harvest",
    selected: false,
  },
]

export default function Cart() {
  const [items, setItems] = useState<Vegetable[]>(vegetables)

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  const selectedItems = items.filter((item) => item.selected)
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0)

  const handleSelectAll = (checked: boolean) => {
    setItems(items.map((item) => ({ ...item, selected: checked })))
  }

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item")
      return
    }
    alert(`Proceeding to checkout with Rs. ${totalPrice.toFixed(2)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Your Cart</h1>
        <p className="mb-8 text-gray-600">Select items and review your order</p>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              {/* Select All */}
              <div className="mb-6 flex items-center gap-3 pb-6 border-b border-gray-200">
                <Checkbox
                  id="select-all"
                  checked={items.length > 0 && selectedItems.length === items.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="cursor-pointer font-semibold text-gray-900">
                  Select All Items ({items.length})
                </label>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} onToggle={toggleItem} />
                ))}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <CartSummary selectedItems={selectedItems} totalPrice={totalPrice} onCheckout={handleCheckout} />
        </div>
      </main>
    </div>
  )
}
