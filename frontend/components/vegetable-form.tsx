"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Upload, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import LocationPicker from "@/components/LocationPicker"

export default function VegetableForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // --- Custom Notification State ---
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Auto-hide notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- Form State ---
    const [formData, setFormData] = useState({
        vegetableName: "",
        category: "",
        quantity: "",
        pricingType: "fixed",
        fixedPrice: "",
        biddingPrice: "",
        biddingStartDate: "",
        biddingEndDate: "",
        description: "",
        willDeliver: "no",
        baseCharge: "",  // Renamed from deliveryCharge3km
        extraRatePerKm: "",  // Renamed from deliveryChargePerKm
        useCustomPickupLocation: false,
        pickupLocation: {
            province: "",
            district: "",
            city: "",
            streetAddress: "",
            latitude: null as number | null,
            longitude: null as number | null,
        },
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

    const handleLocationChange = (location: typeof formData.pickupLocation) => {
        setFormData((prev) => ({ ...prev, pickupLocation: location }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, useCustomPickupLocation: checked }))
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

   // --- Submit Logic ---
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNotification(null)

    // 1. Retrieve the Farmer ID and Token from session storage
    const myId = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("token");

    // Basic Validation: Ensure the user is logged in
    if (!myId) {
        setNotification({ message: "User session not found. Please log in again.", type: 'error' });
        setIsLoading(false);
        return;
    }

    if (images.length === 0) {
        setNotification({ message: "Please upload at least one image.", type: 'error' });
        setIsLoading(false);
        return;
    }

    const data = new FormData()
    
    // 2. Append the farmerId to the FormData
    data.append("farmerId", myId) 
    
    data.append("vegetableName", formData.vegetableName)
    data.append("category", formData.category)
    data.append("quantity", formData.quantity)
    data.append("pricingType", formData.pricingType.toUpperCase())
    data.append("description", formData.description)

    if (formData.pricingType === "fixed") {
        data.append("fixedPrice", formData.fixedPrice)
    } else {
        data.append("biddingPrice", formData.biddingPrice)
        if (formData.biddingStartDate) data.append("biddingStartDate", formData.biddingStartDate)
        if (formData.biddingEndDate) data.append("biddingEndDate", formData.biddingEndDate)
    }

    if (formData.willDeliver === "yes") {
        data.append("deliveryAvailable", "true")
        data.append("deliveryFeeFirst3Km", formData.baseCharge)
        data.append("deliveryFeePerKm", formData.extraRatePerKm)
    } else {
        data.append("deliveryAvailable", "false")
    }

    // Append pickup location if custom location is used
    if (formData.useCustomPickupLocation && formData.pickupLocation.latitude && formData.pickupLocation.longitude) {
        data.append("pickupLatitude", formData.pickupLocation.latitude.toString())
        data.append("pickupLongitude", formData.pickupLocation.longitude.toString())
        data.append("pickupAddress", `${formData.pickupLocation.streetAddress}, ${formData.pickupLocation.city}, ${formData.pickupLocation.district}`)
    }

    images.forEach((image) => {
        data.append("images", image)
    })

    try {
        const res = await fetch("http://localhost:8080/products", {
            method: "POST",
            headers: {
                // Include the token for authentication if your backend requires it
                "Authorization": `Bearer ${token}` 
            },
            body: data,
        })

        if (res.ok) {
            setNotification({ message: "Product listed successfully!", type: 'success' });
            setTimeout(() => router.push("/seller/dashboard"), 2000);
        } else {
            const errorData = await res.json().catch(() => null);
            const message = errorData?.message || "Failed to add product.";
            setNotification({ message, type: 'error' });
        }
    } catch (error) {
        setNotification({ message: "Connection error. Is the server running?", type: 'error' });
    } finally {
        setIsLoading(false)
    }
}

    return (
        <main className="min-h-screen bg-background relative overflow-x-hidden">
            
            {/* CUSTOM NOTIFICATION COMPONENT */}
            {notification && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
                    notification.type === 'success' 
                    ? "bg-[#03230F] border-green-500 text-white" 
                    : "bg-red-950 border-red-500 text-white"
                }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' ? (
                            <Check className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <p className="font-medium pr-4">{notification.message}</p>
                    </div>
                    <button 
                        onClick={() => setNotification(null)} 
                        className="ml-auto hover:bg-white/10 p-1 rounded transition-colors"
                    >
                        <X className="w-4 h-4 opacity-70" />
                    </button>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Add Vegetable Item</h1>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent" onClick={() => router.push('/seller/products')}>
                        <Eye className="w-5 h-5" /> View My Products
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 border border-border shadow-sm">

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
                                <Label htmlFor="fixed" className="cursor-pointer">Fixed Price</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="bidding" id="bidding" />
                                <Label htmlFor="bidding" className="cursor-pointer">Bidding</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional Pricing Fields */}
                    {formData.pricingType === "fixed" ? (
                        <div className="mb-8 animate-in fade-in duration-300">
                            <Label htmlFor="fixedPrice" className="text-base font-semibold mb-2 block">Fixed Price (LKR)</Label>
                            <Input
                                required
                                id="fixedPrice"
                                name="fixedPrice"
                                type="number"
                                placeholder="Enter price per kg"
                                value={formData.fixedPrice}
                                onChange={handleInputChange}
                                className="w-full"
                            />
                        </div>
                    ) : (
                        <div className="mb-8 space-y-4 bg-muted/30 p-4 rounded-lg animate-in slide-in-from-left-2 duration-300">
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
                                    <Label className="mb-2 block text-sm">Start Date</Label>
                                    <Input
                                        type="datetime-local"
                                        name="biddingStartDate"
                                        value={formData.biddingStartDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm">End Date</Label>
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
                            placeholder="Describe freshness, origin, etc..."
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full min-h-24"
                        />
                    </div>

                    {/* Pickup Location Section */}
                    <div className="mb-8 pb-8 border-b border-border">
                        <Label className="text-base font-semibold mb-4 block">Pickup Location</Label>
                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.useCustomPickupLocation}
                                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-primary"
                                />
                                <span className="text-sm text-muted-foreground">Use a different pickup location for this product</span>
                            </label>
                        </div>
                        {formData.useCustomPickupLocation && (
                            <div className="mt-4 animate-in fade-in duration-300">
                                <LocationPicker
                                    value={formData.pickupLocation}
                                    onChange={handleLocationChange}
                                    variant="light"
                                    showStreetAddress={true}
                                    required={false}
                                    label="Custom Pickup Location"
                                />
                            </div>
                        )}
                    </div>

                    {/* Delivery Option */}
                    <div className="mb-8 pb-8 border-b border-border">
                        <Label className="text-base font-semibold mb-4 block">Will You Deliver?</Label>
                        <RadioGroup value={formData.willDeliver} onValueChange={(value) => handleRadioChange(value, "willDeliver")}>
                            <div className="flex items-center gap-2 mb-3">
                                <RadioGroupItem value="yes" id="deliver-yes" />
                                <Label htmlFor="deliver-yes" className="cursor-pointer">Yes, I will deliver</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id="deliver-no" />
                                <Label htmlFor="deliver-no" className="cursor-pointer">No, I won't deliver</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Conditional Delivery Charges */}
                    {formData.willDeliver === "yes" && (
                        <div className="bg-muted/30 rounded-lg p-6 mb-8 animate-in zoom-in-95 duration-300">
                            <h3 className="text-base font-semibold mb-6 text-foreground">Delivery Charges</h3>
                            <div className="mb-6">
                                <Label htmlFor="baseCharge" className="text-base font-semibold mb-2 block">Base Charge - First 5km (LKR)</Label>
                                <Input
                                    required
                                    id="baseCharge"
                                    name="baseCharge"
                                    type="number"
                                    value={formData.baseCharge}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 200"
                                />
                            </div>
                            <div>
                                <Label htmlFor="extraRatePerKm" className="text-base font-semibold mb-2 block">Extra Rate per km (After 5km)</Label>
                                <Input
                                    required
                                    id="extraRatePerKm"
                                    name="extraRatePerKm"
                                    type="number"
                                    value={formData.extraRatePerKm}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="mb-8">
                        <Label className="text-base font-semibold mb-4 block">Product Photos</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors bg-muted/10">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Upload clear photos of your vegetables</p>
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
                                    <div key={index} className="relative group aspect-square">
                                        <img 
                                            src={preview} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover rounded-lg border border-border" 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button 
                            disabled={isLoading} 
                            type="submit" 
                            size="lg" 
                            className="flex-1 sm:flex-none min-w-[150px]"
                        >
                            {isLoading ? "Adding Item..." : "Add Item"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="lg" 
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    )
}