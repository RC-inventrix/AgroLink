"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AddVegetableItemPage() {
    const { toast } = useToast()
    const [vegetableName, setVegetableName] = useState("")
    const [category, setCategory] = useState("")
    const [quantity, setQuantity] = useState("")
    const [pricingType, setPricingType] = useState("fixed")
    const [fixedPrice, setFixedPrice] = useState("")
    const [biddingPrice, setBiddingPrice] = useState("")
    const [biddingStartDate, setBiddingStartDate] = useState("")
    const [biddingEndDate, setBiddingEndDate] = useState("")
    const [description, setDescription] = useState("")
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (images.length + files.length > 5) {
            toast({
                title: "Maximum 5 images allowed",
                description: "Please remove some images before adding more.",
                variant: "destructive",
            })
            return
        }

        const newImages = [...images, ...files].slice(0, 5)
        setImages(newImages)

        const newPreviews = newImages.map((file) => URL.createObjectURL(file))
        setImagePreviews(newPreviews)
    }

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        const newPreviews = imagePreviews.filter((_, i) => i !== index)
        setImages(newImages)
        setImagePreviews(newPreviews)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!vegetableName || !category || !quantity) {
            toast({
                title: "Missing fields",
                description: "Please fill in all required fields.",
                variant: "destructive",
            })
            return
        }

        if (pricingType === "fixed" && !fixedPrice) {
            toast({
                title: "Fixed price required",
                description: "Please enter a fixed price.",
                variant: "destructive",
            })
            return
        }

        if (pricingType === "bidding" && (!biddingPrice || !biddingStartDate || !biddingEndDate)) {
            toast({
                title: "Bidding details required",
                description: "Please enter bidding price, start date, and end date.",
                variant: "destructive",
            })
            return
        }

        const formData = new FormData()
        formData.append("vegetableName", vegetableName)
        formData.append("category", category)
        formData.append("quantity", quantity)
        formData.append("pricingType", pricingType)
        formData.append("description", description)

        if (pricingType === "fixed") {
            formData.append("fixedPrice", fixedPrice)
        } else {
            formData.append("biddingPrice", biddingPrice)
            formData.append("biddingStartDate", biddingStartDate)
            formData.append("biddingEndDate", biddingEndDate)
        }

        images.forEach((image) => {
            formData.append("images", image)
        })

        try {
            // Uncomment when backend is ready
            // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`, {
            //   method: "POST",
            //   body: formData,
            // })
            // if (!response.ok) throw new Error("Failed to create product")

            toast({
                title: "Product listed successfully!",
                description: "Your vegetable item has been added to the marketplace.",
            })

            // Reset form
            setVegetableName("")
            setCategory("")
            setQuantity("")
            setPricingType("fixed")
            setFixedPrice("")
            setBiddingPrice("")
            setBiddingStartDate("")
            setBiddingEndDate("")
            setDescription("")
            setImages([])
            setImagePreviews([])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create product. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleReset = () => {
        setVegetableName("")
        setCategory("")
        setQuantity("")
        setPricingType("fixed")
        setFixedPrice("")
        setBiddingPrice("")
        setBiddingStartDate("")
        setBiddingEndDate("")
        setDescription("")
        setImages([])
        setImagePreviews([])
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Add Vegetable Item</h1>
                    <Link href="/seller/my-products">
                        <Button variant="outline" className="gap-2 bg-transparent">
                            <Eye className="h-4 w-4" />
                            View My Products
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="vegetableName">Vegetable Name</Label>
                            <Input
                                id="vegetableName"
                                value={vegetableName}
                                onChange={(e) => setVegetableName(e.target.value)}
                                placeholder="Enter vegetable name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">Root</SelectItem>
                                    <SelectItem value="fruit">Fruit</SelectItem>
                                    <SelectItem value="leafy">Leafy</SelectItem>
                                    <SelectItem value="legume">Legume</SelectItem>
                                    <SelectItem value="bulb">Bulb</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity (kg)</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Enter quantity"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Pricing Type</Label>
                            <RadioGroup value={pricingType} onValueChange={setPricingType}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed" id="fixed" />
                                    <Label htmlFor="fixed" className="font-normal">
                                        Fixed Price
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bidding" id="bidding" />
                                    <Label htmlFor="bidding" className="font-normal">
                                        Bidding
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {pricingType === "fixed" ? (
                            <div className="space-y-2">
                                <Label htmlFor="fixedPrice">Fixed Price (LKR)</Label>
                                <Input
                                    id="fixedPrice"
                                    type="number"
                                    value={fixedPrice}
                                    onChange={(e) => setFixedPrice(e.target.value)}
                                    placeholder="Enter fixed price"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="biddingPrice">Starting Bid Price (LKR)</Label>
                                    <Input
                                        id="biddingPrice"
                                        type="number"
                                        value={biddingPrice}
                                        onChange={(e) => setBiddingPrice(e.target.value)}
                                        placeholder="Enter starting bid price"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Bidding Start Date</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={biddingStartDate}
                                            onChange={(e) => setBiddingStartDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">Bidding End Date</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={biddingEndDate}
                                            onChange={(e) => setBiddingEndDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter product description"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Upload Images (Maximum 5)</Label>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview || "/placeholder.svg"}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length < 5 && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="images"
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md cursor-pointer transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Choose Files
                                    </Label>
                                    <span className="text-sm text-gray-500">{images.length} / 5 images selected</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white">
                                Submit Listing
                            </Button>
                            <Button type="button" variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
                                Reset
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}