"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import VegetableCard from "./vegetable-card"
import AuctionBidPopup from "./auction-bid-popup" // Import the new component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 1. Updated Interface to include Auction fields
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
    quantity: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupAddress?: string
    pickupLatitude?: number
    pickupLongitude?: number

    // --- AUCTION SPECIFIC FIELDS ---
    isAuction?: boolean
    currentBid?: number
    startingPrice?: number
    endTime?: string
    bidCount?: number
}

export default function VegetableListings() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 50000]) // Increased max range for auctions

    const [vegetables, setVegetables] = useState<Vegetable[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Popup state
    const [selectedAuction, setSelectedAuction] = useState<Vegetable | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};

                // 1. Run fetches in parallel
                const [productsRes, auctionsRes] = await Promise.all([
                    fetch(`${API_URL}/products`),
                    // Assuming API Gateway routes /api/auctions to the Auction Service
                    fetch(`${API_URL}/api/auctions/active`, { headers })
                ]);

                // handle responses
                const productsData = productsRes.ok ? await productsRes.json() : [];
                const auctionsData = auctionsRes.ok ? await auctionsRes.json() : [];

                // 2. Handle Farmer Names for Products (Auctions already have farmerName)
                const uniqueProductFarmerIds = [...new Set(productsData.map((item: any) => item.farmerId))];
                let fullNameMap: Record<string, string> = {};

                if (uniqueProductFarmerIds.length > 0) {
                    try {
                        const nameRes = await fetch(`${API_URL}/auth/fullnames?ids=${uniqueProductFarmerIds.join(',')}`, {
                            method: "GET",
                            headers
                        });
                        fullNameMap = nameRes.ok ? await nameRes.json() : {};
                    } catch (e) {
                        console.warn("Could not fetch farmer names", e);
                    }
                }

                // 3. Map Products
                const mappedProducts: Vegetable[] = productsData.map((item: any) => ({
                    id: item.id?.toString() || "unique-id",
                    name: item.vegetableName,
                    image: item.images && item.images.length > 0 ? item.images[0].imageUrl : "/placeholder.svg",
                    price1kg: item.fixedPrice || item.biddingPrice || 0,
                    price100g: (item.fixedPrice || item.biddingPrice || 0) / 10,
                    pricingType: item.pricingType,
                    description: item.description,
                    category: item.category,
                    sellerId: item.farmerId?.toString() || "",
                    seller: fullNameMap[item.farmerId] || `Farmer #${item.farmerId}`,
                    rating: 4.5,
                    quantity: item.quantity || 0,
                    deliveryAvailable: item.deliveryAvailable || false,
                    baseCharge: item.deliveryFeeFirst3Km,
                    extraRatePerKm: item.deliveryFeePerKm,
                    pickupAddress: item.pickupAddress,
                    pickupLatitude: item.pickupLatitude,
                    pickupLongitude: item.pickupLongitude,
                    isAuction: false
                }));

                // 4. Map Auctions
                const mappedAuctions: Vegetable[] = auctionsData.map((item: any) => ({
                    id: item.id?.toString(),
                    name: item.productName,
                    image: item.productImageUrl || "/placeholder.svg",
                    // Use current highest bid or starting price for sorting/filtering logic
                    price1kg: item.currentHighestBidAmount || item.startingPrice,
                    price100g: 0, // Not applicable for auctions usually
                    seller: item.farmerName || "Unknown Farmer",
                    sellerId: item.farmerId?.toString(),
                    description: item.description,
                    category: "Auction", // Or specific category if available
                    rating: 4.5, // Default or fetch real rating
                    pricingType: "AUCTION",
                    quantity: item.productQuantity || 1,
                    deliveryAvailable: item.isDeliveryAvailable,
                    baseCharge: 0, // Add to DTO if needed, or assume default
                    pickupAddress: item.pickupAddress,
                    pickupLatitude: item.pickupLatitude, // Added mappings
                    pickupLongitude: item.pickupLongitude, // Added mappings

                    // Auction Specifics
                    isAuction: true,
                    currentBid: item.currentHighestBidAmount,
                    startingPrice: item.startingPrice,
                    endTime: item.endTime,
                    bidCount: item.bidCount
                }));

                // 5. Merge Data
                setVegetables([...mappedAuctions, ...mappedProducts]);

            } catch (err) {
                console.error("Error loading data:", err);
                setError("Could not load marketplace items. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredVegetables = useMemo(() => {
        return vegetables.filter((veg) => {
            const matchesSearch = veg.name.toLowerCase().includes(searchQuery.toLowerCase())
            // Include Auctions in "All" or if a specific Auction category existed
            const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory || (veg.isAuction && selectedCategory === "All")
            const matchesPrice = veg.price1kg >= priceRange[0] && veg.price1kg <= priceRange[1]
            return matchesSearch && matchesCategory && matchesPrice
        })
    }, [searchQuery, selectedCategory, priceRange, vegetables])

    return (
        <div className="min-h-screen bg-background relative">
            {/* Header Section */}
            <div className="bg-[#f8f8f8] py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Fresh Vegetables Marketplace</h1>
                    <p className="text-xl opacity-90">Discover fresh, locally sourced vegetables and live auctions directly from farmers.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search vegetables or auctions..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

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
                            <label className="text-sm font-medium mb-2 block">Price Range</label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Min: Rs. {priceRange[0]}</span>
                                    <span className="text-sm text-muted-foreground">Max: Rs. {priceRange[1]}</span>
                                </div>
                                <div className="flex gap-4">
                                    <input
                                        type="range"
                                        min="0" max="50000"
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
                        <p className="text-muted-foreground mb-6">
                            Showing <span className="font-semibold text-foreground">{filteredVegetables.length}</span> results
                        </p>

                        {filteredVegetables.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredVegetables.map((veg) => (
                                    <VegetableCard
                                        // FIX: Use a composite key (type + id) to ensure uniqueness
                                        key={`${veg.isAuction ? 'auction' : 'product'}-${veg.id}`}
                                        vegetable={veg}
                                        // Pass the handler to open the popup
                                        onPlaceBid={(auctionItem) => setSelectedAuction(auctionItem)}
                                    />
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

            {/* Auction Popup */}
            {selectedAuction && (
                <AuctionBidPopup
                    isOpen={!!selectedAuction}
                    onClose={() => setSelectedAuction(null)}
                    vegetable={selectedAuction}
                />
            )}
        </div>
    )
}