"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation" // For redirection
import { Eye, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function VegetableForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // --- Form State ---
    const [formData, setFormData] = useState({
        vegetableName: "",
        category: "",
        quantity: "", // Added Quantity field state
        pricingType: "fixed",
        fixedPrice: "",
        biddingPrice: "",      // Added Bidding fields
        biddingStartDate: "",
        biddingEndDate: "",
        description: "",
        willDeliver: "no",
        deliveryCharge3km: "",
        deliveryChargePerKm: "",
    })

    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    // --- Handlers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (value: string, field: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleRadioChange = (value: string, field: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        setImages((prev) => [...prev, ...files])

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

    // --- Submit Logic (Connecting to Backend) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // 1. Prepare FormData
        const data = new FormData()
        data.append("vegetableName", formData.vegetableName)
        data.append("category", formData.category)
        data.append("quantity", formData.quantity)
        data.append("pricingType", formData.pricingType.toUpperCase())
        data.append("description", formData.description)

        // 2. Pricing Logic
        if (formData.pricingType === "fixed") {
            data.append("fixedPrice", formData.fixedPrice)
        } else {
            data.append("biddingPrice", formData.biddingPrice)
            if (formData.biddingStartDate) data.append("biddingStartDate", formData.biddingStartDate)
            if (formData.biddingEndDate) data.append("biddingEndDate", formData.biddingEndDate)
        }

        // 3. Delivery Logic
        if (formData.willDeliver === "yes") {
            data.append("deliveryAvailable", "true")
            data.append("deliveryFeeFirst3Km", formData.deliveryCharge3km)
            data.append("deliveryFeePerKm", formData.deliveryChargePerKm)
        } else {
            data.append("deliveryAvailable", "false")
        }

        // 4. Append Images
        images.forEach((image) => {
            data.append("images", image)
        })

        // 5. Send to API
        try {
            const res = await fetch("http://localhost:8080/products", {
                method: "POST",
                body: data,
            })

            if (res.ok) {
                alert("Product Added Successfully!")
                router.push("/seller/dashboard") // Redirect to dashboard
            } else {
                const errorText = await res.text()
                alert("Failed to add product: " + errorText)
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            alert("Error connecting to server.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Add Vegetable Item</h1>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Eye className="w-5 h-5" /> View My Products
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 border border-border">

                    {/* Vegetable Name */}
                    <div className="mb-8">
                        <Label htmlFor="vegetableName" className="text-base font-semibold mb-2 block">Vegetable Name</Label>
                        <Input
                            required
                            id="vegetableName"
                            name="vegetableName"
                            placeholder="e.g. Carrots"
                            value={formData.vegetableName}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-8">
                        <Label htmlFor="category" className="text-base font-semibold mb-2 block">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
                            <SelectTrigger id="category" className="w-full max-w-xs">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Leafy">Leafy Vegetables</SelectItem>
                                <SelectItem value="Root">Root Vegetables</SelectItem>
                                <SelectItem value="Fruit">Fruit Vegetables</SelectItem>
                                <SelectItem value="Organic">Organic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantity */}
                    <div className="mb-8">
                        <Label htmlFor="quantity" className="text-base font-semibold mb-2 block">Quantity (kg)</Label>
                        <Input
                            required
                            id="quantity"
                            name="quantity"
                            type="number"
                            placeholder="e.g. 50"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            className="w-full"
                        />
                    </div>

                    {/* Pricing Type */}
                    <div className="mb-8">
                        <Label className="text-base font-semibold mb-4 block">Pricing Type</Label>
                        <RadioGroup value={formData.pricingType} onValueChange={(value) => handleRadioChange(value, "pricingType")}>
                            <div className="flex items-center gap-2 mb-3">
                                <RadioGroupItem value="fixed" id="fixed" />
                                <Label htmlFor="fixed">Fixed Price</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="bidding" id="bidding" />
                                <Label htmlFor="bidding">Bidding</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional Pricing Fields */}
                    {formData.pricingType === "fixed" ? (
                        <div className="mb-8">
                            <Label htmlFor="fixedPrice" className="text-base font-semibold mb-2 block">Fixed Price (LKR)</Label>
                            <Input
                                required
                                id="fixedPrice"
                                name="fixedPrice"
                                type="number"
                                placeholder="Enter price"
                                value={formData.fixedPrice}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>
                    ) : (
                        <div className="mb-8 space-y-4 bg-muted/30 p-4 rounded-lg">
                            <div>
                                <Label htmlFor="biddingPrice" className="text-base font-semibold mb-2 block">Starting Bid (LKR)</Label>
                                <Input
                                    required
                                    id="biddingPrice"
                                    name="biddingPrice"
                                    type="number"
                                    value={formData.biddingPrice}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block">Start Date</Label>
                                    <Input
                                        type="datetime-local"
                                        name="biddingStartDate"
                                        value={formData.biddingStartDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block">End Date</Label>
                                    <Input
                                        type="datetime-local"
                                        name="biddingEndDate"
                                        value={formData.biddingEndDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                        <Label htmlFor="description" className="text-base font-semibold mb-2 block">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe your product..."
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
                                <Label htmlFor="deliver-yes">Yes, I will deliver</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id="deliver-no" />
                                <Label htmlFor="deliver-no">No, I won't deliver</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional Delivery Charges */}
                    {formData.willDeliver === "yes" && (
                        <div className="bg-muted/30 rounded-lg p-6 mb-8">
                            <h3 className="text-base font-semibold mb-6 text-foreground">Delivery Charges</h3>
                            <div className="mb-6">
                                <Label htmlFor="deliveryCharge3km" className="text-base font-semibold mb-2 block">Delivery Charge for First 3 km (LKR)</Label>
                                <Input
                                    required
                                    id="deliveryCharge3km"
                                    name="deliveryCharge3km"
                                    type="number"
                                    value={formData.deliveryCharge3km}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="deliveryChargePerKm" className="text-base font-semibold mb-2 block">Charge Per km (After 3 km)</Label>
                                <Input
                                    required
                                    id="deliveryChargePerKm"
                                    name="deliveryChargePerKm"
                                    type="number"
                                    value={formData.deliveryChargePerKm}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="mb-8">
                        <Label className="text-base font-semibold mb-4 block">Product Photos</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to select</p>
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

                        {/* Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img src={preview || "/placeholder.svg"} className="w-full h-24 object-cover rounded-lg border border-border" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <Button disabled={isLoading} type="submit" size="lg">
                            {isLoading ? "Adding Item..." : "Add Item"}
                        </Button>
                        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    )
}