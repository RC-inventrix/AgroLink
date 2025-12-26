"use client"

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
import { createProduct } from "@/lib/api"

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
            toast({ title: "Maximum 5 images allowed", variant: "destructive" })
            return
        }
        const newImages = [...images, ...files].slice(0, 5)
        setImages(newImages)
        setImagePreviews(newImages.map(f => URL.createObjectURL(f)))
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
        setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!vegetableName || !category || !quantity) {
            toast({ title: "Missing fields", variant: "destructive" })
            return
        }
        if (pricingType === "fixed" && !fixedPrice) {
            toast({ title: "Fixed price required", variant: "destructive" })
            return
        }
        if (pricingType === "bidding" && (!biddingPrice || !biddingStartDate || !biddingEndDate)) {
            toast({ title: "Bidding details required", variant: "destructive" })
            return
        }

        try {
            await createProduct({
                vegetableName,
                category,
                quantity: Number(quantity),
                pricingType,
                fixedPrice: pricingType === "fixed" ? Number(fixedPrice) : undefined,
                biddingPrice: pricingType === "bidding" ? Number(biddingPrice) : undefined,
                biddingStartDate,
                biddingEndDate,
                description,
                imageUrls: images, // send File[] to backend
            })
            toast({ title: "Product listed successfully!" })
            handleReset()
        } catch {
            toast({ title: "Failed to create product", variant: "destructive" })
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
                    <Link href="/farmer/my-products">
                        <Button variant="outline" className="gap-2 bg-transparent">
                            <Eye className="h-4 w-4" />
                            View My Products
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Vegetable Name</Label>
                            <Input value={vegetableName} onChange={(e) => setVegetableName(e.target.value)} placeholder="Enter vegetable name" />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
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
                            <Label>Quantity (kg)</Label>
                            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" />
                        </div>

                        <div className="space-y-3">
                            <Label>Pricing Type</Label>
                            <RadioGroup value={pricingType} onValueChange={setPricingType}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed" id="fixed" /><Label htmlFor="fixed" className="font-normal">Fixed Price</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bidding" id="bidding" /><Label htmlFor="bidding" className="font-normal">Bidding</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {pricingType === "fixed" ? (
                            <div className="space-y-2">
                                <Label>Fixed Price (LKR)</Label>
                                <Input type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} placeholder="Enter fixed price" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Bidding Start Date</Label><Input type="date" value={biddingStartDate} onChange={(e) => setBiddingStartDate(e.target.value)} /></div>
                                <div><Label>Bidding End Date</Label><Input type="date" value={biddingEndDate} onChange={(e) => setBiddingEndDate(e.target.value)} /></div>
                                <div className="col-span-2">
                                    <Label>Starting Bid Price (LKR)</Label>
                                    <Input type="number" value={biddingPrice} onChange={(e) => setBiddingPrice(e.target.value)} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                        </div>

                        <div className="space-y-3">
                            <Label>Upload Images (Max 5)</Label>
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-5 gap-2 mb-3">
                                    {imagePreviews.map((preview, i) => (
                                        <div key={i} className="relative group">
                                            <img src={preview} className="w-full h-20 object-cover rounded-lg border-2 border-gray-200" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {images.length < 5 && (
                                <div className="flex items-center gap-2">
                                    <Input id="images" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                    <Label htmlFor="images" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer"><Upload className="h-4 w-4" /> Choose Files</Label>
                                    <span className="text-sm text-gray-500">{images.length} / 5 selected</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1 bg-emerald-700 text-white">Submit Listing</Button>
                            <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
