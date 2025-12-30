"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown } from "lucide-react"
import VegetableCard from "./vegetable-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Vegetable {
  id: string
  name: string
  image: string
  price100g: number
  price1kg: number
  seller: string
  description: string
  category: string
  rating: number
}

const mockVegetables: Vegetable[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    image: "/fresh-red-tomatoes.jpg",
    price100g: 12,
    price1kg: 120,
    seller: "Green Valley Farm",
    description: "Organic, farm-fresh red tomatoes. Perfect for salads and cooking. Harvested daily.",
    category: "Vegetables",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Organic Carrots",
    image: "/fresh-orange-carrots.jpg",
    price100g: 8,
    price1kg: 80,
    seller: "Sunny Fields",
    description: "Sweet and crunchy organic carrots. Rich in beta-carotene. No pesticides.",
    category: "Vegetables",
    rating: 4.6,
  },
  {
    id: "3",
    name: "Fresh Spinach",
    image: "/fresh-green-spinach-leaves.jpg",
    price100g: 10,
    price1kg: 100,
    seller: "Leaf Haven",
    description: "Tender organic spinach leaves. Rich in iron and nutrients. Eat fresh or cook.",
    category: "Leafy Greens",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Bell Peppers Mix",
    image: "/colorful-bell-peppers-red-yellow-green.jpg",
    price100g: 15,
    price1kg: 150,
    seller: "Rainbow Farm",
    description: "Assorted bell peppers - red, yellow, and green. Sweet and vibrant. Fresh daily.",
    category: "Vegetables",
    rating: 4.9,
  },
  {
    id: "5",
    name: "Broccoli Florets",
    image: "/fresh-green-broccoli.jpg",
    price100g: 14,
    price1kg: 140,
    seller: "Green Valley Farm",
    description: "Fresh broccoli florets. Rich in vitamins. Organic and pesticide-free.",
    category: "Vegetables",
    rating: 4.5,
  },
  {
    id: "6",
    name: "Cucumber",
    image: "/fresh-green-cucumber.jpg",
    price100g: 6,
    price1kg: 60,
    seller: "Sunny Fields",
    description: "Crisp and refreshing cucumbers. Perfect for salads. Hydrating and healthy.",
    category: "Vegetables",
    rating: 4.4,
  },
]

const categories = ["All", "Vegetables", "Leafy Greens"]

export default function VegetableListings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [showFilters, setShowFilters] = useState(false)

  const filteredVegetables = useMemo(() => {
    return mockVegetables.filter((veg) => {
      const matchesSearch =
        veg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        veg.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || veg.category === selectedCategory
      const matchesPrice = veg.price1kg >= priceRange[0] && veg.price1kg <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [searchQuery, selectedCategory, priceRange])

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">Fresh Vegetables</h2>
          <p className="text-muted-foreground">Handpicked vegetables from local farmers</p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search vegetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Filter Button */}
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="flex items-center gap-2">
            Filter <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Category</h3>
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={selectedCategory === cat}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-foreground">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Price Range (per 1kg)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Min: Rs. {priceRange[0]}</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Max: Rs. {priceRange[1]}</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </div>
  )
}
