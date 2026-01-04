"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  description: string
  image: string
  rating: number
  pricePerHundred: number
  pricePerKg: number
  seller: string
}

interface ProductCardProps {
  product: Product
  isEditing: boolean
  editValues: Partial<Product>
  onEdit: (product: Product) => void
  onSave: () => void
  onDelete: () => void
  onCancel: () => void
  onEditChange: (values: Partial<Product>) => void
}

export default function ProductCard({
  product,
  isEditing,
  editValues,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onEditChange,
}: ProductCardProps) {
  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Product Name</label>
            <input
              type="text"
              value={editValues.name || ""}
              onChange={(e) => onEditChange({ ...editValues, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={editValues.description || ""}
              onChange={(e) => onEditChange({ ...editValues, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price per 100g</label>
              <input
                type="number"
                value={editValues.pricePerHundred || 0}
                onChange={(e) =>
                  onEditChange({
                    ...editValues,
                    pricePerHundred: Number.parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price per kg</label>
              <input
                type="number"
                value={editValues.pricePerKg || 0}
                onChange={(e) =>
                  onEditChange({
                    ...editValues,
                    pricePerKg: Number.parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSave} className="flex-1 bg-accent text-accent-foreground hover:opacity-90">
              Save
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity shadow-sm"
            aria-label="Edit product"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity shadow-sm"
            aria-label="Delete product"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-3">{product.name}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

        {/* Seller */}
        <p className="text-xs text-muted-foreground mb-3">
          <span className="font-semibold">Seller:</span> {product.seller}
        </p>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Per 100g</p>
            <p className="font-bold text-accent text-lg">Rs.{product.pricePerHundred}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Per kg</p>
            <p className="font-bold text-accent text-lg">Rs.{product.pricePerKg}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
