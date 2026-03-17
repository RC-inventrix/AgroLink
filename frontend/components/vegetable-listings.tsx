"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, Loader2 } from "lucide-react"
import VegetableCard from "./vegetable-card"
import AuctionBidPopup from "./auction-bid-popup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardNav } from "@/components/dashboard-nav"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083";

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
    isAuction?: boolean
    currentBid?: number
    startingPrice?: number
    endTime?: string
    bidCount?: number
}

export default function VegetableListings() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [priceRange, setPriceRange] = useState([0, 50000])

    const [vegetables, setVegetables] = useState<Vegetable[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [navUnread, setNavUnread] = useState(0) 

    const [selectedAuction, setSelectedAuction] = useState<Vegetable | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const headers: HeadersInit = token ? { "Authorization": `Bearer ${token}` } : {};

                const [productsRes, auctionsRes] = await Promise.all([
                    fetch(`${API_URL}/products`),
                    fetch(`${API_URL}/api/auctions/active`, { headers })
                ]);

                const productsData = productsRes.ok ? await productsRes.json() : [];
                const auctionsData = auctionsRes.ok ? await auctionsRes.json() : [];

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
                    isAuction: true,
                    currentBid: item.currentHighestBidAmount,
                    startingPrice: item.startingPrice,
                    endTime: item.endTime,
                    bidCount: item.bidCount
                }));

                setVegetables([...mappedAuctions, ...mappedProducts]);

            } catch (err) {
                console.error("Error loading data:", err);
                setError("Could not load marketplace items. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        const fetchUnreadCount = async () => {
            try {
                const token = sessionStorage.getItem("token");
                if (!token) return;
                const contactsRes = await fetch(`${CHAT_URL}/api/chat/contacts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (contactsRes.ok) {
                    const ids: number[] = await contactsRes.json();
                    const counts = await Promise.all(ids.map(async (id) => {
                        const res = await fetch(`${CHAT_URL}/api/chat/unread-count/${id}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        return res.ok ? await res.json() : 0;
                    }));
                    setNavUnread(counts.reduce((a, b) => a + b, 0));
                }
            } catch (e) {
                console.warn("Could not fetch unread count", e);
            }
        };

        fetchData();
        fetchUnreadCount();
    }, []);

    const filteredVegetables = useMemo(() => {
        return vegetables.filter((veg) => {
            const matchesSearch = veg.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory || (veg.isAuction && selectedCategory === "All")
            const matchesPrice = veg.price1kg >= priceRange[0] && veg.price1kg <= priceRange[1]
            return matchesSearch && matchesCategory && matchesPrice
        })
    }, [searchQuery, selectedCategory, priceRange, vegetables])

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <DashboardNav unreadCount={navUnread} />
            
            <main className="flex-1 w-full overflow-x-hidden flex flex-col">
                <div className="mb-8 p-8">
                    <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">Fresh Vegetables Marketplace</h1>
                    <p className="text-[#A3ACBA] font-medium">Discover fresh, locally sourced vegetables and live auctions directly from farmers.</p>
                </div>

                <div className="max-w-6xl mx-auto px-6 lg:px-8 py-2 w-full">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search vegetables or auctions..."
                                className="pl-12 w-full h-12 bg-white border-gray-200 focus:ring-[#EEC044] rounded-xl shadow-sm text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                            {["All", "Leafy", "Root", "Fruit", "Organic"].map((cat) => (
                                <Button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`whitespace-nowrap h-12 px-6 rounded-xl font-bold transition-all ${
                                        selectedCategory === cat 
                                        ? "bg-[#03230F] text-[#EEC044] shadow-md hover:bg-black" 
                                        : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-[#03230F]"
                                    }`}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Filters Panel */}
                    <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg text-[#03230F] uppercase tracking-widest">Filters</h3>
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Price Range</label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-[#03230F]">Min: Rs. {priceRange[0]}</span>
                                        <span className="text-sm font-bold text-[#03230F]">Max: Rs. {priceRange[1]}</span>
                                    </div>
                                    
                                    {/* --- UPDATED CUSTOM SLIDER --- */}
                                    <div className="flex gap-4 relative py-2">
                                        <div className="relative w-full h-2 bg-gray-200 rounded-lg flex items-center">
                                            {/* Filled left side track */}
                                            <div 
                                                className="absolute left-0 h-2 bg-[#EEC044] rounded-lg pointer-events-none" 
                                                style={{ width: `${(priceRange[1] / 50000) * 100}%` }}
                                            />
                                            {/* Invisible native input for dragging */}
                                            <input
                                                type="range"
                                                min="0" max="50000"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-10 m-0 p-0"
                                            />
                                            {/* Custom Thumb / Dot */}
                                            <div 
                                                className="absolute w-4 h-4 bg-[#EEC044] rounded-full shadow-md pointer-events-none z-0"
                                                style={{ left: `calc(${(priceRange[1] / 50000) * 100}% - 8px)` }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading / Error / Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-[#EEC044] mb-4" />
                            <p className="text-[#03230F] font-bold">Loading Marketplace...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-200 shadow-sm">
                            <p className="font-bold">{error}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 font-medium mb-6">
                                Showing <span className="font-black text-[#03230F]">{filteredVegetables.length}</span> results
                            </p>

                            {filteredVegetables.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {filteredVegetables.map((veg) => (
                                        <VegetableCard
                                            key={`${veg.isAuction ? 'auction' : 'product'}-${veg.id}`}
                                            vegetable={veg}
                                            onPlaceBid={(auctionItem) => setSelectedAuction(auctionItem)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                                    <p className="text-[#03230F] font-bold text-lg">No vegetables found</p>
                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {selectedAuction && (
                    <AuctionBidPopup
                        isOpen={!!selectedAuction}
                        onClose={() => setSelectedAuction(null)}
                        vegetable={selectedAuction}
                    />
                )}
            </main>
        </div>
    )
}