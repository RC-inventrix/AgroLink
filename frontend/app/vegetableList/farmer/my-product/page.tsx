"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getProducts, deleteProduct, updateProduct } from "@/lib/api"
import EditProductForm from "./EditProductForm"

export default function MyProductsPage() {
    const { toast } = useToast()
    const [products, setProducts] = useState<any[]>([
        { id: 1, vegetableName: "Carrot", category: "Root", quantity: 50, pricingType: "fixed", fixedPrice: 180, description: "Fresh organic carrots grown without pesticides.", images: ["/images/carrot.jpg"] },
        { id: 2, vegetableName: "Tomato", category: "Fruit", quantity: 180, pricingType: "fixed", fixedPrice: 180, description: "Ripe red tomatoes ideal for sauces.", images: ["/images/tomato.jpg"] },
        { id: 3, vegetableName: "Cabbage", category: "Leafy", quantity: 40, pricingType: "bidding", biddingPrice: 120, biddingStartDate: "2025-12-20", biddingEndDate: "2025-12-30", description: "Fresh green cabbage.", images: ["/images/cabbage.jpg"] },
    ])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)

    useEffect(() => {
        getProducts().then(setProducts).catch(() => toast({ title: "Failed to fetch products", variant: "destructive" }))
    }, [])

    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id)
            setProducts(products.filter(p => p.id !== id))
            toast({ title: "Product deleted" })
        } catch {
            toast({ title: "Failed to delete", variant: "destructive" })
        }
    }

    const openEditDialog = (product: any) => {
        setEditingProduct(product)
        setEditDialogOpen(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Listed Products</h1>
                    <Link href="/add-product">
                        <Button className="gap-2 bg-emerald-700 text-white">
                            <Plus className="h-4 w-4" /> Add New Product
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <div className="relative h-48 bg-gray-100">
                                <img src={p.images?.[0] || "/placeholder.svg"} alt={p.vegetableName} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 space-y-3">
                                <h3 className="text-xl font-bold">{p.vegetableName}</h3>
                                <p>Category: {p.category}</p>
                                <p>Quantity: {p.quantity} kg</p>
                                {p.pricingType === "fixed" ? <p>Price: {p.fixedPrice} LKR</p> :
                                    <p>Starting Bid: {p.biddingPrice} LKR ({p.biddingStartDate} - {p.biddingEndDate})</p>}
                                <p>{p.description}</p>
                                <div className="flex gap-2 pt-3">
                                    <Button onClick={() => openEditDialog(p)} className="flex-1 bg-emerald-700 text-white"><Pencil /> Edit</Button>
                                    <Button onClick={() => handleDelete(p.id)} className="flex-1 text-red-600 border-red-600"> <Trash2 /> Delete</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editDialogOpen && editingProduct && (
                <EditProductForm
                    product={editingProduct}
                    onClose={() => setEditDialogOpen(false)}
                    onSave={(updated) => {
                        updateProduct(updated.id, updated).then(() => {
                            setProducts(products.map(p => p.id === updated.id ? updated : p))
                            setEditDialogOpen(false)
                            toast({ title: "Updated successfully" })
                        }).catch(() => toast({ title: "Failed to update", variant: "destructive" }))
                    }}
                />
            )}
        </div>
    )
}
