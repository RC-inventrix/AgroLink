"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye, Upload, X, Check, AlertCircle, MapPin, Home, Loader2, StopCircle, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import LocationPicker from "@/components/LocationPicker"

// --- UTILITY: Image Compression ---
// Resizes images to max 1920px and compresses quality to 0.7
const compressImage = async (file: File): Promise<File> => {
    // If file is already small (e.g. < 1MB), return as is
    if (file.size <= 1024 * 1024) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1920;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Compression failed"));
                        return;
                    }
                    // Create new file as JPEG with 0.7 quality
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                }, 'image/jpeg', 0.7);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

// Helper to clean S3 URL
const getCleanS3Url = (presignedUrl: string) => {
    try {
        const urlObj = new URL(presignedUrl);
        return `${urlObj.origin}${urlObj.pathname}`;
    } catch (e) {
        return presignedUrl;
    }
};

export default function VegetableForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false) // New state for compression
    const [defaultAddress, setDefaultAddress] = useState<string | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null);

    // --- Custom Notification State ---
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    // --- Validation Error State ---
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- Fetch User Address ---
    useEffect(() => {
        const fetchUserAddress = async () => {
            const myId = sessionStorage.getItem("id");
            const token = sessionStorage.getItem("token");
            if (myId) {
                try {
                    const res = await fetch(`http://localhost:8080/api/users/${myId}/address`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        const parts = [userData.address, userData.city, userData.district].filter(Boolean);
                        setDefaultAddress(parts.join(", "));
                    }
                } catch (error) { console.error(error); }
            }
        };
        fetchUserAddress();
    }, []);

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
        baseCharge: "",
        extraRatePerKm: "",
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

    const handleLocationTypeChange = (value: string) => {
        setFormData((prev) => ({ ...prev, useCustomPickupLocation: value === "custom" }))
    }

    // --- UPDATED IMAGE HANDLER ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        setUploadError(null); // Clear previous errors
        const files = Array.from(e.target.files);
        const validImages: File[] = [];
        const validPreviews: string[] = [];

        setIsCompressing(true); // Show UI feedback

        try {
            for (const file of files) {
                // 1. Check Format
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
                if (!validTypes.includes(file.type)) {
                    setUploadError(`File "${file.name}" is not a supported image. Please use JPG, PNG, or WEBP.`);
                    continue;
                }

                // 2. Compress Logic
                try {
                    const compressedFile = await compressImage(file);

                    // 3. Final Size Check (Hard Limit 5MB even after compression)
                    if (compressedFile.size > 5 * 1024 * 1024) {
                        setUploadError(`Image "${file.name}" is too large even after compression. Please try a smaller image.`);
                        continue;
                    }

                    validImages.push(compressedFile);
                    validPreviews.push(URL.createObjectURL(compressedFile));

                } catch (err) {
                    console.error("Compression error", err);
                    setUploadError(`Failed to process "${file.name}". Try another image.`);
                }
            }

            setImages((prev) => [...prev, ...validImages]);
            setImagePreviews((prev) => [...prev, ...validPreviews]);

        } finally {
            setIsCompressing(false);
        }
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
        setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const handleCancelUpload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            setNotification({ message: "Upload cancelled.", type: 'info' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setNotification(null)
        setUploadError(null)

        const myId = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");

        if (!myId) {
            setNotification({ message: "User session not found.", type: 'error' });
            return;
        }

        if (images.length === 0) {
            setNotification({ message: "Please upload at least one image.", type: 'error' });
            return;
        }

        setIsLoading(true);
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            // STEP 1: UPLOAD IMAGES TO S3
            const uploadPromises = images.map(async (file) => {
                const presignRes = await fetch(
                    `http://localhost:8080/products/presigned-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
                    { headers: { "Authorization": `Bearer ${token}` }, signal }
                );

                if (!presignRes.ok) throw new Error("Permission denied for upload");
                const { uploadUrl } = await presignRes.json();

                const uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type },
                    signal
                });

                if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`);
                return getCleanS3Url(uploadUrl);
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // STEP 2: SUBMIT PRODUCT DATA
            const payload = {
                farmerId: myId,
                vegetableName: formData.vegetableName,
                category: formData.category,
                quantity: parseFloat(formData.quantity),
                pricingType: formData.pricingType.toUpperCase(),
                description: formData.description,

                fixedPrice: formData.fixedPrice ? parseFloat(formData.fixedPrice) : null,
                biddingPrice: formData.biddingPrice ? parseFloat(formData.biddingPrice) : null,
                biddingStartDate: formData.biddingStartDate || null,
                biddingEndDate: formData.biddingEndDate || null,

                deliveryAvailable: formData.willDeliver === "yes",
                deliveryFeeFirst3Km: formData.baseCharge ? parseFloat(formData.baseCharge) : null,
                deliveryFeePerKm: formData.extraRatePerKm ? parseFloat(formData.extraRatePerKm) : null,

                pickupAddress: formData.useCustomPickupLocation && formData.pickupLocation.streetAddress
                    ? `${formData.pickupLocation.streetAddress}, ${formData.pickupLocation.city}, ${formData.pickupLocation.district}`
                    : null,
                pickupLatitude: formData.useCustomPickupLocation ? formData.pickupLocation.latitude : null,
                pickupLongitude: formData.useCustomPickupLocation ? formData.pickupLocation.longitude : null,

                imageUrls: uploadedUrls
            };

            const res = await fetch("http://localhost:8080/products", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
                signal
            })

            if (res.ok) {
                setNotification({ message: "Product listed successfully!", type: 'success' });
                setTimeout(() => router.push("/seller/dashboard"), 2000);
            } else {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to save product details.");
            }

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setNotification({ message: `Error: ${error.message}`, type: 'error' });
            }
        } finally {
            if (abortControllerRef.current) {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    }

    return (
        <main className="min-h-screen bg-background relative overflow-x-hidden">
            {/* ... Loading & Notification Components (Same as before) ... */}
            {isLoading && (
                <div className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-card border border-border p-8 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-6">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">Uploading...</h3>
                            <p className="text-muted-foreground text-sm">Please wait while we secure your product data.</p>
                        </div>
                        <Button variant="destructive" onClick={handleCancelUpload} className="w-full gap-2">
                            <StopCircle className="w-4 h-4" /> Cancel Upload
                        </Button>
                    </div>
                </div>
            )}

            {notification && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
                    notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" : "bg-red-950 border-red-500 text-white"
                }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                        <p className="font-medium pr-4">{notification.message}</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Add Vegetable Item</h1>
                    <Button variant="outline" onClick={() => router.push('/seller/products')}>
                        <Eye className="w-4 h-4 mr-2" /> My Products
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 border border-border shadow-sm">
                    {/* ... (Standard Fields: Name, Category, etc. - UNCHANGED) ... */}
                    <div className="mb-8">
                        <Label htmlFor="vegetableName" className="text-base font-semibold mb-2 block">Vegetable Name</Label>
                        <Input required id="vegetableName" name="vegetableName" placeholder="e.g. Carrots" value={formData.vegetableName} onChange={handleInputChange} className="w-full" />
                    </div>

                    <div className="mb-8">
                        <Label htmlFor="category" className="text-base font-semibold mb-2 block">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
                            <SelectTrigger id="category" className="w-full max-w-xs"><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Leafy">Leafy Vegetables</SelectItem>
                                <SelectItem value="Root">Root Vegetables</SelectItem>
                                <SelectItem value="Fruit">Fruit Vegetables</SelectItem>
                                <SelectItem value="Organic">Organic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mb-8">
                        <Label htmlFor="quantity" className="text-base font-semibold mb-2 block">Quantity (kg)</Label>
                        <Input required id="quantity" name="quantity" type="number" placeholder="e.g. 50" value={formData.quantity} onChange={handleInputChange} className="w-full" />
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
                            <Input required id="fixedPrice" name="fixedPrice" type="number" placeholder="Enter price per kg" value={formData.fixedPrice} onChange={handleInputChange} className="w-full" />
                        </div>
                    ) : (
                        <div className="mb-8 space-y-4 bg-muted/30 p-4 rounded-lg animate-in slide-in-from-left-2 duration-300">
                            <div>
                                <Label htmlFor="biddingPrice" className="text-base font-semibold mb-2 block">Starting Bid (LKR)</Label>
                                <Input required id="biddingPrice" name="biddingPrice" type="number" value={formData.biddingPrice} onChange={handleInputChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-2 block text-sm">Start Date</Label>
                                    <Input type="datetime-local" name="biddingStartDate" value={formData.biddingStartDate} onChange={handleInputChange} />
                                </div>
                                <div>
                                    <Label className="mb-2 block text-sm">End Date</Label>
                                    <Input type="datetime-local" name="biddingEndDate" value={formData.biddingEndDate} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <Label htmlFor="description" className="text-base font-semibold mb-2 block">Description</Label>
                        <Textarea id="description" name="description" placeholder="Describe freshness..." value={formData.description} onChange={handleInputChange} className="w-full min-h-24" />
                    </div>

                    {/* Pickup Location Section */}
                    <div className="mb-8 pb-8 border-b border-border">
                        <Label className="text-base font-semibold mb-4 block">Pickup Location</Label>
                        <RadioGroup value={formData.useCustomPickupLocation ? "custom" : "default"} onValueChange={handleLocationTypeChange} className="grid gap-4">
                            <div>
                                <div className="flex items-start space-x-3 space-y-0">
                                    <RadioGroupItem value="default" id="loc-default" className="mt-1" />
                                    <div className="grid gap-1.5 leading-none w-full">
                                        <Label htmlFor="loc-default" className="cursor-pointer font-medium">Use My Registered Address</Label>
                                        <div className={`mt-2 p-3 rounded-md border text-sm flex items-start gap-3 transition-colors ${!formData.useCustomPickupLocation ? "bg-primary/5 border-primary text-foreground" : "bg-muted/40 border-transparent text-muted-foreground"}`}>
                                            <Home className="w-4 h-4 mt-0.5 shrink-0" />
                                            {defaultAddress ? <span>{defaultAddress}</span> : <span className="italic opacity-70">Loading...</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 space-y-0 mb-3">
                                    <RadioGroupItem value="custom" id="loc-custom" />
                                    <Label htmlFor="loc-custom" className="cursor-pointer font-medium">Use a Different Pickup Location</Label>
                                </div>
                                {formData.useCustomPickupLocation && (
                                    <div className="pl-7 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="bg-muted/10 p-4 rounded-lg border border-border">
                                            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                <span>Select location on map</span>
                                            </div>
                                            <LocationPicker value={formData.pickupLocation} onChange={handleLocationChange} variant="light" showStreetAddress={true} required={true} label="Custom Pickup Location" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="mb-8 pb-8 border-b border-border">
                        <Label className="text-base font-semibold mb-4 block">Will You Deliver?</Label>
                        <RadioGroup value={formData.willDeliver} onValueChange={(value) => handleRadioChange(value, "willDeliver")}>
                            <div className="flex items-center gap-2 mb-3"><RadioGroupItem value="yes" id="yes" /><Label htmlFor="yes">Yes</Label></div>
                            <div className="flex items-center gap-2"><RadioGroupItem value="no" id="no" /><Label htmlFor="no">No</Label></div>
                        </RadioGroup>
                    </div>

                    {formData.willDeliver === "yes" && (
                        <div className="bg-muted/30 rounded-lg p-6 mb-8 animate-in zoom-in-95 duration-300">
                            <h3 className="text-base font-semibold mb-6 text-foreground">Delivery Charges</h3>
                            <div className="mb-6">
                                <Label htmlFor="baseCharge" className="text-base font-semibold mb-2 block">Base Charge - First 5 km (LKR)</Label>
                                <Input required id="baseCharge" name="baseCharge" type="number" value={formData.baseCharge} onChange={handleInputChange} placeholder="e.g. 200" />
                            </div>
                            <div>
                                <Label htmlFor="extraRatePerKm" className="text-base font-semibold mb-2 block">Extra Rate per km - After 5 km (LKR)</Label>
                                <Input required id="extraRatePerKm" name="extraRatePerKm" type="number" value={formData.extraRatePerKm} onChange={handleInputChange} placeholder="e.g. 50" />
                            </div>
                        </div>
                    )}

                    {/* --- UPDATED IMAGE UPLOAD SECTION --- */}
                    <div className="mb-8">
                        <Label className="text-base font-semibold mb-4 block">Product Photos</Label>

                        {/* WARNING UI */}
                        {uploadError && (
                            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold">Upload Issue</p>
                                    <p>{uploadError}</p>
                                </div>
                            </div>
                        )}

                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors bg-muted/10 relative">
                            {isCompressing ? (
                                <div className="py-8 flex flex-col items-center justify-center animate-in fade-in">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                    <p className="text-sm text-muted-foreground">Optimizing images...</p>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Upload clear photos (JPG, PNG, WEBP)
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-4 opacity-70">
                                        Max 5MB per file • We automatically optimize large images
                                    </p>
                                    <Input type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} className="hidden" id="imageUpload" />
                                    <Label htmlFor="imageUpload" className="cursor-pointer">
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <span>Select Images</span>
                                        </Button>
                                    </Label>
                                </>
                            )}
                        </div>

                        {imagePreviews.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-border" />
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button disabled={isLoading || isCompressing} type="submit" size="lg" className="flex-1 sm:flex-none min-w-[150px]">
                            {isLoading ? "Adding Item..." : "Add Item"}
                        </Button>
                        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
                    </div>
                </form>
            </div>
        </main>
    )
}