"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import VegetableCard from "./vegetable-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Interface (Unchanged)
interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number
    price1kg: number
    seller: string
    sellerId: string
    description: string
    category: string
    rating: number
    pricingType: string
}

export default function VegetableListings() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 5000])

    const [vegetables, setVegetables] = useState<Vegetable[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // UPDATED: Fetch logic to use Farmer ID
    useEffect(() => {
        const fetchFarmerProducts = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const farmerId = sessionStorage.getItem("id"); // Retrieve Farmer ID

                // 1. Check if user is logged in
                if (!farmerId) {
                    setError("User ID not found. Please log in.");
                    setLoading(false);
                    return;
                }

                // 2. Fetch products ONLY for this farmer using the NEW endpoint
                const res = await fetch(`http://localhost:8080/products/farmer/${farmerId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                        // Add Content-Type if necessary, though GET usually doesn't need it
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();

                // 3. Map Backend Data to UI Interface
                // Since these are the farmer's own products, we can set seller to "Me" or fetch name if preferred.
                const mappedData = data.map((item: any) => ({
                    id: item.id?.toString() || "unique-id",
                    name: item.vegetableName,
                    image: item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg",
                    price1kg: item.fixedPrice || item.biddingPrice || 0,
                    price100g: (item.fixedPrice || item.biddingPrice || 0) / 10,
                    pricingType: item.pricingType,
                    description: item.description,
                    category: item.category,
                    sellerId: item.farmerId?.toString() || "",
                    seller: "Me", // Logic changed: You are viewing your own profile
                    rating: 4.5
                }));

                setVegetables(mappedData);
            } catch (err) {
                console.error("Error loading products:", err);
                setError("Could not load products. Please ensure the backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchFarmerProducts();
    }, []);

    const filteredVegetables = useMemo(() => {
        return vegetables.filter((veg) => {
            const matchesSearch = veg.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory
            const matchesPrice = veg.price1kg >= priceRange[0] && veg.price1kg <= priceRange[1]
            return matchesSearch && matchesCategory && matchesPrice
        })
    }, [searchQuery, selectedCategory, priceRange, vegetables])

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-[#f8f8f8] py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">My Product Listings</h1>
                    <p className="text-xl opacity-90">Manage the vegetables you are selling.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search your vegetables..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* ... (Categories Buttons remain the same) ... */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {["All", "Leafy", "Root", "Fruit", "Organic"].map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "default" : "outline"}
                                onClick={() => setSelectedCategory(cat)}
                                className="whitespace-nowrap"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Loading / Error / Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[#2d5016]" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg border border-red-200">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-6">
                            You have <span className="font-semibold text-foreground">{filteredVegetables.length}</span> active listings
                        </p>
                        {filteredVegetables.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredVegetables.map((veg) => (
                                    <VegetableCard key={veg.id} vegetable={veg} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">You haven't uploaded any products yet.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}