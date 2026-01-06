"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"

// 1. Frontend Interface (Matches your ProductCard expectations)
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

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<Partial<Product>>({})

    // 2. Fetch Products from Backend on Load
    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            // Assuming Gateway is at 8080. If hitting service directly, check your specific port.
            const res = await fetch("http://localhost:8080/products")
            if (!res.ok) throw new Error("Failed to fetch products")

            const data = await res.json()

            // 3. Map Backend Data (Java) to Frontend Interface (React)
            const mappedProducts: Product[] = data.map((item: any) => ({
                id: item.id.toString(),
                name: item.vegetableName, // Backend: vegetableName -> Frontend: name
                description: item.description || "No description provided",
                // Use first image from list, or placeholder
                image: (item.images && item.images.length > 0) ? item.images[0] : "/placeholder.svg",
                rating: 0, // Backend doesn't have rating yet, default to 0
                pricePerHundred: (item.fixedPrice / 10) || 0, // Auto-calc per 100g
                pricePerKg: item.fixedPrice || 0,
                seller: "My Farm" // Backend 'Product' entity didn't show a seller field, defaulting for now
            }))

            setProducts(mappedProducts)
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (product: Product) => {
        setEditingId(product.id)
        setEditValues(product)
    }

    // 4. Update Product in Backend
    const handleSave = async (id: string) => {
        try {
            // Convert Frontend update back to Backend format
            const updatePayload = {
                vegetableName: editValues.name,
                description: editValues.description,
                fixedPrice: editValues.pricePerKg,
                // Add other fields required by your backend update DTO if necessary
            }

            const res = await fetch(`http://localhost:8080/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            })

            if (res.ok) {
                // Update local state to reflect changes immediately
                setProducts(products.map((p) => (p.id === id ? { ...p, ...editValues } : p)))
                setEditingId(null)
                alert("Product updated successfully!")
            } else {
                alert("Failed to update product")
            }
        } catch (error) {
            console.error("Error updating product:", error)
            alert("Error updating product")
        }
    }

    // 5. Delete Product from Backend
    const handleDelete = async (id: string) => {
        if(!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`http://localhost:8080/products/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                setProducts(products.filter((p) => p.id !== id))
            } else {
                alert("Failed to delete product")
            }
        } catch (error) {
            console.error("Error deleting product:", error)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditValues({})
    }

    if (loading) return <div className="text-center py-20">Loading your products...</div>

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">My Products</h2>
                <p className="text-muted-foreground">Manage your vegetable listings</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No products found.</p>
                </div>
            ) : (
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
            )}
        </section>
    )
}