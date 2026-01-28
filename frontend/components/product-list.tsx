"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"

// 1. Frontend Interface
interface Product {
    id: string
    name: string
    description: string
    image: string
    rating: number
    pricePerHundred: number
    pricePerKg: number
    seller: string
    // New delivery fields
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupLatitude?: number
    pickupLongitude?: number
    pickupAddress?: string
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
            // --- CHANGE START: Get ID and Token from Session ---
            const farmerId = sessionStorage.getItem("id")
            const token = sessionStorage.getItem("token")

            if (!farmerId) {
                console.warn("No farmer ID found. User might not be logged in.")
                setLoading(false)
                return
            }

            // --- CHANGE: Call the specific endpoint for this farmer ---
            const res = await fetch(`http://localhost:8080/products/farmer/${farmerId}`, {
                method: "GET",
                headers: {
                    // Include token if your backend security requires it
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            // --- CHANGE END ---

            if (!res.ok) throw new Error("Failed to fetch products")

            const data = await res.json()

            // 3. Map Backend Data (Java) to Frontend Interface (React)
            const mappedProducts: Product[] = data.map((item: any) => ({
                id: item.id.toString(),
                name: item.vegetableName,
                description: item.description || "No description provided",
                image: (item.images && item.images.length > 0) ? item.images[0] : "/placeholder.svg",
                rating: 0,
                pricePerHundred: (item.fixedPrice / 10) || 0,
                pricePerKg: item.fixedPrice || 0,
                seller: "My Farm",
                deliveryAvailable: item.deliveryAvailable || false,
                baseCharge: item.deliveryFeeFirst3Km || undefined,
                extraRatePerKm: item.deliveryFeePerKm || undefined,
                pickupLatitude: item.pickupLatitude || undefined,
                pickupLongitude: item.pickupLongitude || undefined,
                pickupAddress: item.pickupAddress || undefined,
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
            const token = sessionStorage.getItem("token") // Good practice to include token here too

            const updatePayload = {
                vegetableName: editValues.name,
                description: editValues.description,
                fixedPrice: editValues.pricePerKg,
            }

            const res = await fetch(`http://localhost:8080/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatePayload),
            })

            if (res.ok) {
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
            const token = sessionStorage.getItem("token")

            const res = await fetch(`http://localhost:8080/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
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
        <section className="max-w-7xl ml-10 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">My Products</h2>
                <p className="text-muted-foreground">Manage your vegetable listings</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No products found in your account.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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