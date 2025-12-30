"use client"

import { Star, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Vegetable {
  id: string
  name: string
  image: string
  price100g: number
  price1kg: number
  seller: string
  description: string
  rating: number
}

export default function VegetableCard({ vegetable }: { vegetable: Vegetable }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative h-48 bg-muted overflow-hidden rounded-t-lg">
        <img
          src={vegetable.image || "/placeholder.svg"}
          alt={vegetable.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-6">
        {/* Name and Rating */}
        <div className="mb-3">
          <CardTitle className="text-xl mb-1">{vegetable.name}</CardTitle>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">{vegetable.rating}</span>
          </div>
        </div>

        {/* Description */}
        <CardDescription className="mb-4 line-clamp-2">{vegetable.description}</CardDescription>

        {/* Seller */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Seller: </span>
            {vegetable.seller}
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-muted p-3 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Per 100g</p>
              <p className="text-lg font-bold text-primary">Rs. {vegetable.price100g}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Per 1kg</p>
              <p className="text-lg font-bold text-primary">Rs. {vegetable.price1kg}</p>
            </div>
          </div>
        </div>

        {/* Buy Button */}
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Buy Now
        </Button>
      </CardContent>
    </Card>
  )
}
