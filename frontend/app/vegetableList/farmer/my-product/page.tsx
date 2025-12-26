"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Plus, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Product {
    id: number
    vegetableName: string
    category: string
    quantity: number
    pricingType: "fixed" | "bidding"
    fixedPrice?: number
    biddingPrice?: number
    biddingStartDate?: string
    biddingEndDate?: string
    description: string
    images: string[]
}

export default function MyProductsPage() {
    const { toast } = useToast()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null)

    const [products, setProducts] = useState<Product[]>([
        {
            id: 1,
            vegetableName: "Carrot",
            category: "Root",
            quantity: 50,
            pricingType: "fixed",
            fixedPrice: 180,
            description: "Fresh organic carrots grown without pesticides. Perfect for salads and cooking.",
            images: ["/images/carrot.jpg"],
        },
        {
            id: 2,
            vegetableName: "Tomato",
            category: "Fruit",
            quantity: 180,
            pricingType: "fixed",
            fixedPrice: 180,
            description: "Ripe red tomatoes with rich flavor. Ideal for sauces, salads and sandwiches.",
            images: ["/images/tomato.jpg"],
        },
        {
            id: 3,
            vegetableName: "Cabbage",
            category: "Leafy",
            quantity: 40,
            pricingType: "bidding",
            biddingPrice: 120,
            biddingStartDate: "2025-12-20",
            biddingEndDate: "2025-12-30",
            description: "Fresh green cabbage, crisp and crunchy. Great for coleslaw and stir-fry dishes.",
            images: ["/images/cabbage.jpg"],
        },
        {
            id: 4,
            vegetableName: "Cabbage",
            category: "Leafy",
            quantity: 40,
            pricingType: "fixed",
            fixedPrice: 150,
            description: "Premium quality cabbage with tight leaves. Excellent for fermentation and cooking.",
            images: ["/images/cabbage.jpg"],
        },
        {
            id: 5,
            vegetableName: "Potato",
            category: "Root",
            quantity: 100,
            pricingType: "bidding",
            biddingPrice: 80,
            biddingStartDate: "2025-12-23",
            biddingEndDate: "2026-01-05",
            description: "High-quality potatoes perfect for baking, mashing, or frying. Versatile and delicious.",
            images: ["/images/potato.jpg"],
        },
        {
            id: 6,
            vegetableName: "Broccoli",
            category: "Leafy",
            quantity: 30,
            pricingType: "fixed",
            fixedPrice: 250,
            description: "Nutrient-rich broccoli florets. Fresh and tender, ideal for healthy meals.",
            images: ["/images/broccoli.jpg"],
        },
    ])

    const handleDelete = async (id: number) => {
        try {
            // Uncomment when backend is ready
            // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`, {
            //   method: "DELETE",
            // })
            // if (!response.ok) throw new Error("Failed to delete product")

            setProducts(products.filter((p) => p.id !== id))
            toast({
                title: "Product deleted",
                description: "The product has been removed successfully.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete product. Please try again.",
                variant: "destructive",
            })
        }
        setDeleteDialogOpen(false)
        setSelectedProduct(null)
    }

    const openDeleteDialog = (id: number) => {
        setSelectedProduct(id)
        setDeleteDialogOpen(true)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Listed Products</h1>
                    <Link href="/seller/add-product">
                        <Button className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
                            <Plus className="h-4 w-4" />
                            Add New Product
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={product.images[0] || "/placeholder.svg"}
                                    alt={product.vegetableName}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-4 space-y-3">
                                <h3 className="text-xl font-bold text-gray-900">{product.vegetableName}</h3>

                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Category:</span> {product.category}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Quantity:</span> {product.quantity} kg
                                    </p>

                                    {product.pricingType === "fixed" ? (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Price:</span> Starting at {product.fixedPrice} LKR
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Starting Bid:</span> {product.biddingPrice} LKR
                                            </p>
                                            <div className="flex items-start gap-1 text-gray-600">
                                                <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs">
                                                    <div>{formatDate(product.biddingStartDate!)} -</div>
                                                    <div>{formatDate(product.biddingEndDate!)}</div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <p className="text-gray-600 pt-2 border-t border-gray-100">
                                        <span className="font-medium">Description:</span>
                                        <span className="block mt-1 text-gray-500 leading-relaxed">{product.description}</span>
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-3">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                                        onClick={() => {
                                            toast({
                                                title: "Edit feature",
                                                description: "Edit functionality will be implemented soon.",
                                            })
                                        }}
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                                        onClick={() => openDeleteDialog(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg mb-4">No products listed yet</p>
                        <Link href="/seller/add-product">
                            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Product
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product from your listings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedProduct && handleDelete(selectedProduct)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
