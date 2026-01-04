"use client"

import { useState } from "react"
import ProductCard from "./product-card"

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

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    description: "Organic, farm-fresh red tomatoes. Perfect for salads and cooking. Harvested daily.",
    image: "/fresh-red-tomatoes.jpg",
    rating: 4.8,
    pricePerHundred: 12,
    pricePerKg: 120,
    seller: "Green Valley Farm",
  },
  {
    id: "2",
    name: "Organic Carrots",
    description: "Sweet and crunchy organic carrots. Rich in beta-carotene. No pesticides.",
    image: "/orange-organic-carrots.jpg",
    rating: 4.6,
    pricePerHundred: 8,
    pricePerKg: 80,
    seller: "Sunny Fields",
  },
  {
    id: "3",
    name: "Fresh Spinach",
    description: "Tender organic spinach leaves. Rich in iron and nutrients. Eat fresh or cook.",
    image: "/green-spinach-leaves.jpg",
    rating: 4.7,
    pricePerHundred: 10,
    pricePerKg: 100,
    seller: "Leaf Haven",
  },
  {
    id: "4",
    name: "Bell Peppers",
    description: "Colorful sweet bell peppers. Perfect for cooking and adding flavor to dishes.",
    image: "/colorful-bell-peppers.png",
    rating: 4.5,
    pricePerHundred: 15,
    pricePerKg: 150,
    seller: "Green Valley Farm",
  },
  {
    id: "5",
    name: "Broccoli",
    description: "Fresh, green broccoli florets. High in nutrients and vitamins.",
    image: "/green-broccoli-florets.jpg",
    rating: 4.6,
    pricePerHundred: 20,
    pricePerKg: 200,
    seller: "Sunny Fields",
  },
  {
    id: "6",
    name: "Potatoes",
    description: "Starchy potatoes perfect for all your cooking needs. Freshly harvested.",
    image: "/brown-potatoes.jpg",
    rating: 4.4,
    pricePerHundred: 6,
    pricePerKg: 60,
    seller: "Leaf Haven",
  },
]

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValues(product)
  }

  const handleSave = (id: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...editValues } : p)))
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValues({})
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">My Products</h2>
        <p className="text-muted-foreground">Manage your vegetable listings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isEditing={editingId === product.id}
            editValues={editValues}
            onEdit={handleEdit}
            onSave={() => handleSave(product.id)}
            onDelete={() => handleDelete(product.id)}
            onCancel={handleCancel}
            onEditChange={setEditValues}
          />
        ))}
      </div>
    </section>
  )
}
