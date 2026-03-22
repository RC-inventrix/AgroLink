"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ChevronDown, Loader2, AlertCircle, MapPin, Filter, RotateCcw } from "lucide-react"
import VegetableCard from "./vegetable-card"
import AuctionBidPopup from "./auction-bid-popup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardNav } from "@/components/dashboard-nav"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/context/LanguageContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083";

interface Vegetable {
    id: string
    name: string
    image: string
    images?: string[] // Added to hold multiple images
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
    const { t } = useLanguage()

    // Basic Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    // New Sale Type Filter
    const [saleType, setSaleType] = useState("All")

    // Separate Price Filters
    const [fixedPriceMax, setFixedPriceMax] = useState(2000)
    const [auctionPriceMax, setAuctionPriceMax] = useState(500000)

    // Location Filters
    const [selectedProvince, setSelectedProvince] = useState("All")
    const [selectedDistrict, setSelectedDistrict] = useState("All")
    const [selectedCity, setSelectedCity] = useState("All")

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
                    // Fetch all image URLs from the product images table
                    images: item.images && item.images.length > 0 ? item.images.map((img: any) => img.imageUrl) : ["/placeholder.svg"],
                    price1kg: item.fixedPrice || item.biddingPrice || 0,
                    price100g: (item.fixedPrice || item.biddingPrice || 0) / 10,
                    pricingType: item.pricingType,
                    description: item.description,
                    category: item.category,
                    sellerId: item.farmerId?.toString() || "",
                    seller: fullNameMap[item.farmerId] || `${t("browseFarmerHash")}${item.farmerId}`,
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

                const mappedAuctions: Vegetable[] = auctionsData.map((item: any) => ({
                    id: item.id?.toString(),
                    name: item.productName,
                    image: item.productImageUrl || "/placeholder.svg",
                    // Map the auction image into an array to keep the type consistent
                    images: [item.productImageUrl || "/placeholder.svg"],
                    price1kg: item.currentHighestBidAmount || item.startingPrice,
                    price100g: 0,
                    seller: item.farmerName || t("browseUnknownFarmer"),
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
                setError("browseErrorDesc");
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
    }, [t]);

    const filteredVegetables = useMemo(() => {
        return vegetables.filter((veg) => {
            const matchesSearch = veg.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory || (veg.isAuction && selectedCategory === "All")

            // --- New Sale Type Filter Match ---
            const matchesSaleType = saleType === "All" ||
                (saleType === "Fixed" && !veg.isAuction) ||
                (saleType === "Auction" && veg.isAuction);

            // --- Dynamic Price Filter Logic ---
            let matchesPrice = true;
            if (saleType === "Fixed" && !veg.isAuction) {
                matchesPrice = veg.price1kg <= fixedPriceMax;
            } else if (saleType === "Auction" && veg.isAuction) {
                matchesPrice = veg.price1kg <= auctionPriceMax;
            }
            // If saleType === "All", matchesPrice stays true (unfiltered)

            // --- Enhanced Nested Location Match Logic ---
            const address = veg.pickupAddress?.toLowerCase() || "";

            let matchesProvince = selectedProvince === "All";
            if (!matchesProvince) {
                const districts = Object.keys(SRI_LANKA_LOCATIONS[selectedProvince] || {});
                const citiesInProvince = districts.flatMap(d => SRI_LANKA_LOCATIONS[selectedProvince][d] || []);

                matchesProvince = address.includes(selectedProvince.toLowerCase()) ||
                    districts.some(d => address.includes(d.toLowerCase())) ||
                    citiesInProvince.some(c => address.includes(c.toLowerCase()));
            }

            let matchesDistrict = selectedDistrict === "All";
            if (!matchesDistrict) {
                const citiesInDistrict = SRI_LANKA_LOCATIONS[selectedProvince]?.[selectedDistrict] || [];

                matchesDistrict = address.includes(selectedDistrict.toLowerCase()) ||
                    citiesInDistrict.some(c => address.includes(c.toLowerCase()));
            }

            let matchesCity = selectedCity === "All";
            if (!matchesCity) {
                matchesCity = address.includes(selectedCity.toLowerCase());
            }

            return matchesSearch && matchesCategory && matchesSaleType && matchesPrice && matchesProvince && matchesDistrict && matchesCity
        })
    }, [searchQuery, selectedCategory, saleType, fixedPriceMax, auctionPriceMax, selectedProvince, selectedDistrict, selectedCity, vegetables])

    // Reset Filters Function
    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("All");
        setSaleType("All");
        setSelectedProvince("All");
        setSelectedDistrict("All");
        setSelectedCity("All");
        setFixedPriceMax(2000);
        setAuctionPriceMax(500000);
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            <DashboardNav unreadCount={navUnread} />

            <main className="flex-1 w-full overflow-x-hidden flex flex-col">
                <div className="p-8">
                    <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">{t("browseTitle")}</h1>
                    <p className="text-[#A3ACBA] font-medium">{t("browseSubtitle")}</p>
                </div>

                <div className="container mx-auto px-4 py-0">
                    <div className="bg-card rounded-xl p-6 mb-10 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <Filter className="w-5 h-5 text-[#2d5016] shrink-0" />
                            <h3 className="font-bold text-lg text-foreground">{t("browseSearchFilters")}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Row 1 */}

                            {/* 1. Search */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold">{t("browseSearchName")}</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 shrink-0" />
                                    <Input
                                        type="text"
                                        placeholder={t("browseSearchPlaceholder")}
                                        className="pl-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 2. Category */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold">{t("browseCategory")}</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger><SelectValue placeholder={t("browseAllCategories")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">{t("browseAllCategories")}</SelectItem>
                                        <SelectItem value="Leafy">{t("browseCatLeafy")}</SelectItem>
                                        <SelectItem value="Root">{t("browseCatRoot")}</SelectItem>
                                        <SelectItem value="Fruit">{t("browseCatFruit")}</SelectItem>
                                        <SelectItem value="Organic">{t("browseCatOrganic")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 3. Sale Type (New) */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold">Sale Type</Label>
                                <Select value={saleType} onValueChange={setSaleType}>
                                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Types</SelectItem>
                                        <SelectItem value="Fixed">Fixed Price</SelectItem>
                                        <SelectItem value="Auction">Auction</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 4. Dynamic Price Range */}
                            <div className="space-y-2">
                                {saleType === "All" ? (
                                    <div className="flex flex-col justify-center h-full pt-6 pb-2">
                                        <span className="text-xs text-muted-foreground italic text-center">
                                            Select 'Fixed Price' or 'Auction' to unlock price filters.
                                        </span>
                                    </div>
                                ) : saleType === "Fixed" ? (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-muted-foreground font-semibold text-xs">Price per kg (LKR)</Label>
                                            <span className="text-xs font-bold text-[#2d5016] bg-[#2d5016]/10 px-2 py-1 rounded-full">
                                                Up to {fixedPriceMax.toLocaleString()}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="2000" step="10"
                                            value={fixedPriceMax}
                                            onChange={(e) => setFixedPriceMax(parseInt(e.target.value))}
                                            className="w-full accent-[#2d5016]"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label className="text-muted-foreground font-semibold text-xs">Auction Price (LKR)</Label>
                                            <span className="text-xs font-bold text-[#2d5016] bg-[#2d5016]/10 px-2 py-1 rounded-full">
                                                Up to {auctionPriceMax.toLocaleString()}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="500000" step="5000"
                                            value={auctionPriceMax}
                                            onChange={(e) => setAuctionPriceMax(parseInt(e.target.value))}
                                            className="w-full accent-[#2d5016]"
                                        />
                                    </>
                                )}
                            </div>

                            {/* Row 2 */}

                            {/* 5. Province */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold">{t("browseProv")}</Label>
                                <Select
                                    value={selectedProvince}
                                    onValueChange={(val) => {
                                        setSelectedProvince(val);
                                        setSelectedDistrict("All");
                                        setSelectedCity("All");
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder={t("browseAllProv")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">{t("browseAllProv")}</SelectItem>
                                        {Object.keys(SRI_LANKA_LOCATIONS).map(prov => (
                                            <SelectItem key={prov} value={prov}>{prov} {t("browseProvSuffix")}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 6. District */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold">{t("browseDist")}</Label>
                                <Select
                                    disabled={selectedProvince === "All"}
                                    value={selectedDistrict}
                                    onValueChange={(val) => {
                                        setSelectedDistrict(val);
                                        setSelectedCity("All");
                                    }}
                                >
                                    <SelectTrigger><SelectValue placeholder={t("browseAllDist")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">{t("browseAllDist")}</SelectItem>
                                        {selectedProvince !== "All" && Object.keys(SRI_LANKA_LOCATIONS[selectedProvince]).map(dist => (
                                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 7. City */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground font-semibold">{t("browseCity")}</Label>
                                <Select
                                    disabled={selectedDistrict === "All"}
                                    value={selectedCity}
                                    onValueChange={setSelectedCity}
                                >
                                    <SelectTrigger><SelectValue placeholder={t("browseAllCities")} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">{t("browseAllCities")}</SelectItem>
                                        {selectedDistrict !== "All" && SRI_LANKA_LOCATIONS[selectedProvince][selectedDistrict].map(city => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 8. Reset Filters Button */}
                            <div className="space-y-2 flex items-end">
                                <Button
                                    onClick={resetFilters}
                                    variant="outline"
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2 shrink-0" />
                                    {t("browseClearFilters") || "Reset Filters"}
                                </Button>
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
                                <AlertCircle className="w-10 h-10 text-red-500 shrink-0" />
                            </div>
                            <h3 className="text-xl font-bold text-red-900 mb-2">{t("browseErrorTitle")}</h3>
                            <p className="text-red-600 text-center max-w-md">{t(error)}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="mt-6 border-red-200 text-red-700 hover:bg-red-100 h-auto py-2 px-6"
                            >
                                {t("browseTryAgain")}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted-foreground mb-6 flex items-center gap-2">
                                {t("browseShowing")} <span className="font-bold text-foreground px-2 py-0.5 bg-muted rounded">{filteredVegetables.length}</span> {t("browseResults")}
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
                                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-xl px-4 text-center">
                                    <MapPin className="w-12 h-12 text-muted-foreground/50 mb-4 shrink-0" />
                                    <h3 className="text-lg font-bold text-foreground">{t("browseNoVeg")}</h3>
                                    <p className="text-muted-foreground mt-1">{t("browseNoVegDesc")}</p>
                                    <Button
                                        variant="outline"
                                        className="mt-6 h-auto py-2.5 px-6"
                                        onClick={resetFilters}
                                    >
                                        {t("browseClearFilters")}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

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