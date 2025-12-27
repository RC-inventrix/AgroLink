"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from "lucide-react"

interface Props {
    product: any
    onClose: () => void
    onSave: (product: any) => void
}

export default function EditProductForm({ product, onClose, onSave }: Props) {
    const [vegetableName, setVegetableName] = useState(product.vegetableName)
    const [category, setCategory] = useState(product.category)
    const [quantity, setQuantity] = useState(product.quantity.toString())
    const [pricingType, setPricingType] = useState(product.pricingType)
    const [fixedPrice, setFixedPrice] = useState(product.fixedPrice || "")
    const [biddingPrice, setBiddingPrice] = useState(product.biddingPrice || "")
    const [biddingStartDate, setBiddingStartDate] = useState(product.biddingStartDate || "")
    const [biddingEndDate, setBiddingEndDate] = useState(product.biddingEndDate || "")
    const [description, setDescription] = useState(product.description)
    const [images, setImages] = useState<any[]>(product.images || [])
    const [imagePreviews, setImagePreviews] = useState<string[]>(product.images || [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            ...product,
            vegetableName,
            category,
            quantity: Number(quantity),
            pricingType,
            fixedPrice: pricingType === "fixed" ? Number(fixedPrice) : undefined,
            biddingPrice: pricingType === "bidding" ? Number(biddingPrice) : undefined,
            biddingStartDate,
            biddingEndDate,
            description,
            images: imagePreviews,
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><Label>Vegetable Name</Label><Input value={vegetableName} onChange={(e) => setVegetableName(e.target.value)} /></div>
                    <div><Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="root">Root</SelectItem>
                                <SelectItem value="fruit">Fruit</SelectItem>
                                <SelectItem value="leafy">Leafy</SelectItem>
                                <SelectItem value="legume">Legume</SelectItem>
                                <SelectItem value="bulb">Bulb</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div><Label>Quantity</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
                    <div>
                        <Label>Pricing Type</Label>
                        <RadioGroup value={pricingType} onValueChange={setPricingType}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="fixed" id="fixed"/><Label htmlFor="fixed">Fixed</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="bidding" id="bidding"/><Label htmlFor="bidding">Bidding</Label></div>
                        </RadioGroup>
                    </div>
                    {pricingType === "fixed" ? (
                        <div><Label>Fixed Price</Label><Input type="number" value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} /></div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <div><Label>Start Date</Label><Input type="date" value={biddingStartDate} onChange={(e) => setBiddingStartDate(e.target.value)} /></div>
                            <div><Label>End Date</Label><Input type="date" value={biddingEndDate} onChange={(e) => setBiddingEndDate(e.target.value)} /></div>
                            <div className="col-span-2"><Label>Bidding Price</Label><Input type="number" value={biddingPrice} onChange={(e) => setBiddingPrice(e.target.value)} /></div>
                        </div>
                    )}
                    <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>

                    <div className="flex gap-2 pt-3">
                        <Button type="submit" className="bg-emerald-700 text-white">Save</Button>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
