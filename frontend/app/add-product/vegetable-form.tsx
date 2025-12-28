"use client"

import type React from "react"

import { useState } from "react"
import { Eye, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function VegetableForm() {
  const [formData, setFormData] = useState({
    vegetableName: "",
    category: "",
    pricingType: "fixed",
    fixedPrice: "",
    description: "",
    willDeliver: "no",
    deliveryCharge3km: "",
    deliveryChargePerKm: "",
  })

  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRadioChange = (value: string, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files])

    // Generate previews for new images
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreviews((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form Data:", formData)
    console.log("Images:", images)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Add Vegetable Item</h1>
          </div>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Eye className="w-5 h-5" />
            View My Products
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 border border-border">
          {/* Vegetable Name */}
          <div className="mb-8">
            <Label htmlFor="vegetableName" className="text-base font-semibold mb-2 block">
              Vegetable Name
            </Label>
            <Input
              id="vegetableName"
              name="vegetableName"
              placeholder="Enter vegetable name"
              value={formData.vegetableName}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="mb-8">
            <Label htmlFor="category" className="text-base font-semibold mb-2 block">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
              <SelectTrigger id="category" className="w-full max-w-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leafy">Leafy Vegetables</SelectItem>
                <SelectItem value="root">Root Vegetables</SelectItem>
                <SelectItem value="cruciferous">Cruciferous Vegetables</SelectItem>
                <SelectItem value="solanaceae">Solanaceae</SelectItem>
                <SelectItem value="legumes">Legumes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Type */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-4 block">Pricing Type</Label>
            <RadioGroup value={formData.pricingType} onValueChange={(value) => handleRadioChange(value, "pricingType")}>
              <div className="flex items-center gap-2 mb-3">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="font-normal cursor-pointer">
                  Fixed Price
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bidding" id="bidding" />
                <Label htmlFor="bidding" className="font-normal cursor-pointer">
                  Bidding
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Fixed Price */}
          <div className="mb-8">
            <Label htmlFor="fixedPrice" className="text-base font-semibold mb-2 block">
              Fixed Price (LKR)
            </Label>
            <Input
              id="fixedPrice"
              name="fixedPrice"
              placeholder="Enter fixed price"
              type="number"
              value={formData.fixedPrice}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="mb-8">
            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full min-h-24"
            />
          </div>

          {/* Delivery Option */}
          <div className="mb-8 pb-8 border-b border-border">
            <Label className="text-base font-semibold mb-4 block">Will You Deliver?</Label>
            <RadioGroup value={formData.willDeliver} onValueChange={(value) => handleRadioChange(value, "willDeliver")}>
              <div className="flex items-center gap-2 mb-3">
                <RadioGroupItem value="yes" id="deliver-yes" />
                <Label htmlFor="deliver-yes" className="font-normal cursor-pointer">
                  Yes, I will deliver
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="deliver-no" />
                <Label htmlFor="deliver-no" className="font-normal cursor-pointer">
                  No, I won't deliver
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Delivery Charge Fields - Conditional */}
          {formData.willDeliver === "yes" && (
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <h3 className="text-base font-semibold mb-6 text-foreground">Delivery Charges</h3>

              {/* Delivery Charge for First 3km */}
              <div className="mb-6">
                <Label htmlFor="deliveryCharge3km" className="text-base font-semibold mb-2 block">
                  Delivery Charge for First 3 km (LKR)
                </Label>
                <Input
                  id="deliveryCharge3km"
                  name="deliveryCharge3km"
                  placeholder="Enter delivery charge for first 3 km"
                  type="number"
                  value={formData.deliveryCharge3km}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Delivery Charge Per Km After 3km */}
              <div>
                <Label htmlFor="deliveryChargePerKm" className="text-base font-semibold mb-2 block">
                  Delivery Charge Per km (After 3 km) (LKR)
                </Label>
                <Input
                  id="deliveryChargePerKm"
                  name="deliveryChargePerKm"
                  placeholder="Enter charge per km after 3 km"
                  type="number"
                  value={formData.deliveryChargePerKm}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="mb-8">
            <Label className="text-base font-semibold mb-4 block">Product Photos</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your images here, or click to select</p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
              />
              <Label htmlFor="imageUpload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>Select Images</span>
                </Button>
              </Label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-foreground mb-4">Selected Images ({imagePreviews.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" size="lg">
              Add Item
            </Button>
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
