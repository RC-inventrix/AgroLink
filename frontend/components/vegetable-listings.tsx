/* fileName: vegetable-listings.tsx */
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, Loader2, AlertCircle, MapPin, Filter } from "lucide-react"
import VegetableCard from "./vegetable-card"
import AuctionBidPopup from "./auction-bid-popup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    handlingTime?: number;

    // --- AUCTION SPECIFIC FIELDS ---
    isAuction?: boolean
    currentBid?: number
    startingPrice?: number
    endTime?: string
    bidCount?: number
}

// Hierarchical Location Data
type DistrictMap = Record<string, string[]>;
type ProvinceMap = Record<string, DistrictMap>;

const SRI_LANKA_LOCATIONS: ProvinceMap = {
    "Western": {
        "Colombo": ["Colombo 01", "Colombo 02", "Colombo 03", "Colombo 04", "Colombo 05", "Colombo 06", "Dehiwala", "Moratuwa", "Maharagama", "Nugegoda", "Malabe", "Kottawa", "Homagama", "Padukka"],
        "Gampaha": ["Gampaha", "Negombo", "Kelaniya", "Kadawatha", "Wattala", "Ja-Ela", "Minuwangoda", "Nittambuwa"],
        "Kalutara": ["Kalutara", "Panadura", "Horana", "Bandaragama", "Matugama", "Aluthgama"]
    },
    "Central": {
        "Kandy": ["Kandy", "Peradeniya", "Gampola", "Nawalapitiya", "Katugastota", "Kadugannawa"],
        "Matale": ["Matale", "Dambulla", "Sigiriya", "Galewela"],
        "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Nanu Oya"]
    },
    "Southern": {
        "Galle": ["Galle", "Ambalangoda", "Hikkaduwa", "Elpitiya", "Karapitiya"],
        "Matara": ["Matara", "Weligama", "Dikwella", "Hakmana", "Akuressa"],
        "Hambantota": ["Hambantota", "Tangalle", "Beliatta", "Ambalantota", "Tissamaharama"]
    },
    "North Western": {
        "Kurunegala": ["Kurunegala", "Kuliyapitiya", "Polgahawela", "Pannala", "Mawathagama"],
        "Puttalam": ["Puttalam", "Chilaw", "Nattandiya", "Wennappuwa", "Marawila"]
    },
    "North Central": {
        "Anuradhapura": ["Anuradhapura", "Kekirawa", "Tambuttegama", "Eppawala", "Nochchiyagama"],
        "Polonnaruwa": ["Polonnaruwa", "Kaduruwela", "Hingurakgoda", "Medirigiriya"]
    },
    "Uva": {
        "Badulla": ["Badulla", "Bandarawela", "Welimada", "Haputale", "Mahiyanganaya", "Passara"],
        "Moneragala": ["Moneragala", "Bibile", "Wellawaya", "Kataragama", "Buttala"]
    },
    "Sabaragamuwa": {
        "Ratnapura": ["Ratnapura", "Pelmadulla", "Balangoda", "Embilipitiya", "Kuruwita"],
        "Kegalle": ["Kegalle", "Mawanella", "Warakapola", "Rambukkana", "Deraniyagala"]
    },
    "Eastern": {
        "Trincomalee": ["Trincomalee", "Kinniya", "Mutur", "Kantale"],
        "Batticaloa": ["Batticaloa", "Kattankudy", "Valaichchenai", "Kalkudah"],
        "Ampara": ["Ampara", "Akkaraipattu", "Kalmunai", "Samanthurai", "Pottuvil"]
    },
    "Northern": {
        "Jaffna": ["Jaffna", "Chavakachcheri", "Point Pedro", "Nallur"],
        "Kilinochchi": ["Kilinochchi", "Pallai"],
        "Mannar": ["Mannar", "Murunkan"],
        "Vavuniya": ["Vavuniya", "Nedunkeni"],
        "Mullaitivu": ["Mullaitivu", "Puthukkudiyiruppu"]
    }
};

export default function VegetableListings() {
    // Basic Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 50000])

    // Location Filters
    const [selectedProvince, setSelectedProvince] = useState("All")
    const [selectedDistrict, setSelectedDistrict] = useState("All")
    const [selectedCity, setSelectedCity] = useState("All")

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
                    handlingTime: item.handlingTime,
                    isAuction: false
                }));

                // 4. Map Auctions
                const mappedAuctions: Vegetable[] = auctionsData.map((item: any) => ({
                    id: item.id?.toString(),
                    name: item.productName,
                    image: item.productImageUrl || "/placeholder.svg",
                    price1kg: item.currentHighestBidAmount || item.startingPrice,
                    price100g: 0,
                    seller: item.farmerName || "Unknown Farmer",
                    sellerId: item.farmerId?.toString(),
                    description: item.description,
                    category: "Auction",
                    rating: 4.5,
                    pricingType: "AUCTION",
                    quantity: item.productQuantity || 1,
                    deliveryAvailable: item.isDeliveryAvailable,
                    baseCharge: 0,
                    pickupAddress: item.pickupAddress,
                    pickupLatitude: item.pickupLatitude,
                    pickupLongitude: item.pickupLongitude,

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
            const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory || (veg.isAuction && selectedCategory === "All")
            const matchesPrice = veg.price1kg >= priceRange[0] && veg.price1kg <= priceRange[1]

            // Location Match Logic (Gracefully checks string inclusion if the address exists)
            const address = veg.pickupAddress?.toLowerCase() || "";
            const matchesProvince = selectedProvince === "All" || address.includes(selectedProvince.toLowerCase())
            const matchesDistrict = selectedDistrict === "All" || address.includes(selectedDistrict.toLowerCase())
            const matchesCity = selectedCity === "All" || address.includes(selectedCity.toLowerCase())

            return matchesSearch && matchesCategory && matchesPrice && matchesProvince && matchesDistrict && matchesCity
        })
    }, [searchQuery, selectedCategory, priceRange, selectedProvince, selectedDistrict, selectedCity, vegetables])

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

                {/* --- UNIFIED SEARCH & FILTERS SECTION --- */}
                <div className="bg-card rounded-xl p-6 mb-10 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                        <Filter className="w-5 h-5 text-[#2d5016]" />
                        <h3 className="font-bold text-lg text-foreground">Search & Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* 1. Search */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground font-semibold">Search Name</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="e.g. Carrots, Auction..."
                                    className="pl-9 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 2. Category */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground font-semibold">Category</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Categories</SelectItem>
                                    <SelectItem value="Leafy">Leafy Vegetables</SelectItem>
                                    <SelectItem value="Root">Root Vegetables</SelectItem>
                                    <SelectItem value="Fruit">Fruit Vegetables</SelectItem>
                                    <SelectItem value="Organic">Organic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 3. Province */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground font-semibold">Province</Label>
                            <Select
                                value={selectedProvince}
                                onValueChange={(val) => {
                                    setSelectedProvince(val);
                                    setSelectedDistrict("All");
                                    setSelectedCity("All");
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="All Provinces" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Provinces</SelectItem>
                                    {Object.keys(SRI_LANKA_LOCATIONS).map(prov => (
                                        <SelectItem key={prov} value={prov}>{prov} Province</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 4. District */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground font-semibold">District</Label>
                            <Select
                                disabled={selectedProvince === "All"}
                                value={selectedDistrict}
                                onValueChange={(val) => {
                                    setSelectedDistrict(val);
                                    setSelectedCity("All");
                                }}
                            >
                                <SelectTrigger><SelectValue placeholder="All Districts" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Districts</SelectItem>
                                    {selectedProvince !== "All" && Object.keys(SRI_LANKA_LOCATIONS[selectedProvince]).map(dist => (
                                        <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 5. City */}
                        <div className="space-y-2">
                            <Label className="text-muted-foreground font-semibold">City</Label>
                            <Select
                                disabled={selectedDistrict === "All"}
                                value={selectedCity}
                                onValueChange={setSelectedCity}
                            >
                                <SelectTrigger><SelectValue placeholder="All Cities" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Cities</SelectItem>
                                    {selectedDistrict !== "All" && SRI_LANKA_LOCATIONS[selectedProvince][selectedDistrict].map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 6. Price Range */}
                        <div className="space-y-2 lg:col-span-3">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-muted-foreground font-semibold">Price Range (LKR per kg)</Label>
                                <span className="text-sm font-bold text-[#2d5016] bg-[#2d5016]/10 px-3 py-1 rounded-full">
                                    Up to Rs. {priceRange[1].toLocaleString()}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0" max="50000" step="100"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                className="w-full accent-[#2d5016]"
                            />
                        </div>
                    </div>
                </div>

                {/* --- DISPLAY SECTION --- */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[#2d5016]" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto my-12 shadow-sm">
                        <div className="bg-red-100 p-4 rounded-full mb-4">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-red-900 mb-2">Oops! Something went wrong</h3>
                        <p className="text-red-600 text-center max-w-md">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="mt-6 border-red-200 text-red-700 hover:bg-red-100"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-6 flex items-center gap-2">
                            Showing <span className="font-bold text-foreground px-2 py-0.5 bg-muted rounded">{filteredVegetables.length}</span> results
                        </p>

                        {filteredVegetables.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredVegetables.map((veg) => (
                                    <VegetableCard
                                        key={`${veg.isAuction ? 'auction' : 'product'}-${veg.id}`}
                                        vegetable={veg}
                                        onPlaceBid={(auctionItem) => setSelectedAuction(auctionItem)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-xl">
                                <MapPin className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">No vegetables found</h3>
                                <p className="text-muted-foreground mt-1">Try adjusting your location, price, or search criteria.</p>
                                <Button
                                    variant="outline"
                                    className="mt-6"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("All");
                                        setSelectedProvince("All");
                                        setSelectedDistrict("All");
                                        setSelectedCity("All");
                                        setPriceRange([0, 50000]);
                                    }}
                                >
                                    Clear all filters
                                </Button>
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