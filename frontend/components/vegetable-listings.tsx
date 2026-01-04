"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import VegetableCard from "./vegetable-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 1. Define the Interface (Matches your VegetableCard props)
interface Vegetable {
    id: string
    name: string
    image: string
    price100g: number // We will calculate this
    price1kg: number  // Maps to backend 'fixedPrice'
    seller: string    // Placeholder for now
    description: string
    category: string
    rating: number    // Placeholder for now
    pricingType: string // Added to check if it's FIXED or BIDDING
}

export default function VegetableListings() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 5000]) // Increased range for realistic prices

    // 2. New State for Real Data
    const [vegetables, setVegetables] = useState<Vegetable[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // 3. Fetch Data from Backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Calls API Gateway -> Product Service
                const res = await fetch("http://localhost:8080/products")

                if (!res.ok) {
                    throw new Error("Failed to fetch products")
                }

                const data = await res.json()

                // 4. Map Backend Data -> Frontend Structure
                const mappedData = data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.vegetableName,
                    // Use first image from S3, or a fallback placeholder
                    image: item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg",

                    // Pricing Logic
                    price1kg: item.fixedPrice || item.biddingPrice || 0,
                    price100g: (item.fixedPrice || item.biddingPrice || 0) / 10,

                    pricingType: item.pricingType,
                    description: item.description,
                    category: item.category,

                    // These fields don't exist in backend yet, so we hardcode them for UI
                    seller: "AgroLink Farmer",
                    rating: 4.5
                }))

                setVegetables(mappedData)
            } catch (err) {
                console.error("Error loading products:", err)
                setError("Could not load products. Please ensure the backend is running.")
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    // 5. Filter Logic (Updated to use 'vegetables' state)
    const filteredVegetables = useMemo(() => {
        return vegetables.filter((veg) => {
            const matchesSearch = veg.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory
            // Filter based on price per kg
            const matchesPrice = veg.price1kg >= priceRange[0] && veg.price1kg <= priceRange[1]
            return matchesSearch && matchesCategory && matchesPrice
        })
    }, [searchQuery, selectedCategory, priceRange, vegetables])

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-[#2d5016] text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Fresh Vegetables Marketplace</h1>
                    <p className="text-xl opacity-90">Discover fresh, locally sourced vegetables directly from farmers.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search vegetables..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
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

                {/* Filters Panel */}
                <div className="bg-card rounded-lg p-6 mb-8 border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Filters</h3>
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Price Range (per kg)</label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Min: Rs. {priceRange[0]}</span>
                                    <span className="text-sm text-muted-foreground">Max: Rs. {priceRange[1]}</span>
                                </div>
                                {/* Simple Range Inputs for Demo */}
                                <div className="flex gap-4">
                                    <input
                                        type="range"
                                        min="0" max="5000"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
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
                        {/* Results Count */}
                        <p className="text-muted-foreground mb-6">
                            Showing <span className="font-semibold text-foreground">{filteredVegetables.length}</span> results
                        </p>

                        {/* Vegetables Grid */}
                        {filteredVegetables.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredVegetables.map((veg) => (
                                    <VegetableCard key={veg.id} vegetable={veg} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">No vegetables found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}