"use client"

import { useState, useEffect, useRef } from "react"
import ProductCard from "./product-card"
import { Loader2, AlertCircle, Upload, X, MapPin, Home, StopCircle, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import LocationPicker from "@/components/LocationPicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- UTILITY: Image Compression ---
const compressImage = async (file: File): Promise<File> => {
    if (file.size <= 1024 * 1024) return file;
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                const MAX_WIDTH = 1920; const MAX_HEIGHT = 1920;
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (!blob) { reject(new Error("Compression failed")); return; }
                    resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg', lastModified: Date.now() }));
                }, 'image/jpeg', 0.7);
            };
        };
    });
};

const getCleanS3Url = (presignedUrl: string) => {
    try { const urlObj = new URL(presignedUrl); return `${urlObj.origin}${urlObj.pathname}`; }
    catch (e) { return presignedUrl; }
};

interface Product {
    id: string
    name: string
    category: string
    description: string
    image: string
    quantity: number
    pricePerKg: number
    pricingType: "FIXED" | "BIDDING"
    biddingPrice?: number
    deliveryAvailable: boolean
    baseCharge?: number
    extraRatePerKm?: number
    pickupLatitude?: number
    pickupLongitude?: number
    pickupAddress?: string
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [userDefaultAddress, setUserDefaultAddress] = useState<string | null>(null)
    const [defaultCoords, setDefaultCoords] = useState<{lat: number|null, lng: number|null}>({lat: null, lng: null})

    // --- MODAL STATES ---
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [showSaveConfirm, setShowSaveConfirm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Edit Form State
    const [editForm, setEditForm] = useState<any>({})
    const [newImage, setNewImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [useCustomLocation, setUseCustomLocation] = useState(false)
    const [uploadError, setUploadError] = useState<string|null>(null)

    // --- 1. Fetch Data ---
    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        const farmerId = sessionStorage.getItem("id")
        const token = sessionStorage.getItem("token")
        if (!farmerId) return setLoading(false);

        try {
            const prodRes = await fetch(`${API_URL}/products/farmer/${farmerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            const userRes = await fetch(`${API_URL}/api/usersProducts/${farmerId}/address`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (prodRes.ok) {
                const data = await prodRes.json()
                const mapped = data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.vegetableName,
                    category: item.category || "Vegetable",
                    description: item.description || "",
                    image: (item.images && item.images.length > 0) ? item.images[0].imageUrl : "/placeholder.svg",
                    quantity: item.quantity,
                    pricePerKg: item.fixedPrice || 0,
                    pricingType: item.pricingType,
                    biddingPrice: item.biddingPrice,
                    deliveryAvailable: item.deliveryAvailable || false,
                    baseCharge: item.deliveryFeeFirst3Km,
                    extraRatePerKm: item.deliveryFeePerKm,
                    pickupLatitude: item.pickupLatitude,
                    pickupLongitude: item.pickupLongitude,
                    pickupAddress: item.pickupAddress,
                }))
                setProducts(mapped)
            }

            if (userRes.ok) {
                const userData = await userRes.json()
                const parts = [userData.address, userData.city, userData.district].filter(Boolean)
                setUserDefaultAddress(parts.join(", "))
                setDefaultCoords({lat: userData.latitude, lng: userData.longitude})
            }

        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    // --- 2. Edit Handlers ---
    const handleEditClick = (product: Product) => {
        setEditingProduct(product)
        setNewImage(null)
        setImagePreview(product.image)
        setUploadError(null)

        const isCustom = product.pickupAddress !== userDefaultAddress;
        setUseCustomLocation(isCustom)

        setEditForm({
            ...product,
            pickupLocation: {
                streetAddress: "",
                city: "",
                district: "",
                latitude: product.pickupLatitude,
                longitude: product.pickupLongitude
            }
        })
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await compressImage(file);
                if (compressed.size > 5*1024*1024) {
                    setUploadError("Image too large (>5MB)"); return;
                }
                setNewImage(compressed);
                setImagePreview(URL.createObjectURL(compressed));
                setUploadError(null);
            } catch (err) { setUploadError("Image processing failed"); }
        }
    }

    // --- 3. Save Logic ---
    const executeSave = async () => {
        if (!editingProduct) return;
        setIsSaving(true);
        const token = sessionStorage.getItem("token")

        try {
            let finalImageUrl = editForm.image;

            if (newImage) {
                const presignRes = await fetch(
                    `${API_URL}/products/presigned-url?fileName=${encodeURIComponent(newImage.name)}&contentType=${encodeURIComponent(newImage.type)}`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                );
                const { uploadUrl } = await presignRes.json();
                await fetch(uploadUrl, { method: "PUT", body: newImage, headers: { "Content-Type": newImage.type } });
                finalImageUrl = getCleanS3Url(uploadUrl);
            }

            let finalAddr = userDefaultAddress;
            let finalLat = defaultCoords.lat;
            let finalLng = defaultCoords.lng;

            if (useCustomLocation) {
                if (editForm.pickupLocation.streetAddress) {
                    finalAddr = `${editForm.pickupLocation.streetAddress}, ${editForm.pickupLocation.city}, ${editForm.pickupLocation.district}`;
                    finalLat = editForm.pickupLocation.latitude;
                    finalLng = editForm.pickupLocation.longitude;
                } else {
                    finalAddr = editForm.pickupAddress;
                    finalLat = editForm.pickupLatitude;
                    finalLng = editForm.pickupLongitude;
                }
            }

            const payload = {
                farmerId: sessionStorage.getItem("id"),
                vegetableName: editForm.name,
                category: editForm.category,
                quantity: editForm.quantity,
                pricingType: editForm.pricingType,
                fixedPrice: editForm.pricingType === "FIXED" ? editForm.pricePerKg : null,
                biddingPrice: editForm.pricingType === "BIDDING" ? editForm.biddingPrice : null,
                description: editForm.description,
                deliveryAvailable: editForm.deliveryAvailable,
                deliveryFeeFirst3Km: editForm.deliveryAvailable ? editForm.baseCharge : null,
                deliveryFeePerKm: editForm.deliveryAvailable ? editForm.extraRatePerKm : null,
                pickupAddress: finalAddr,
                pickupLatitude: finalLat,
                pickupLongitude: finalLng,
                imageUrls: [finalImageUrl]
            }

            const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setEditingProduct(null);
                setShowSaveConfirm(false);
                fetchData();
            } else {
                alert("Failed to update product");
            }
        } catch (e) { console.error(e); alert("Update failed"); }
        finally { setIsSaving(false); }
    }

    const executeDelete = async () => {
        if (!showDeleteConfirm) return;
        const token = sessionStorage.getItem("token")
        try {
            const res = await fetch(`${API_URL}/products/${showDeleteConfirm}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                setProducts(products.filter(p => p.id !== showDeleteConfirm))
                setShowDeleteConfirm(null)
            }
        } catch (e) { console.error(e) }
    }

    if (loading) return <div className="flex h-full items-center justify-center p-20"><Loader2 className="animate-spin text-[#EEC044] w-12 h-12" /></div>

    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
            <div className="mb-8">
                <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">My Products</h1>
                <p className="text-[#A3ACBA] font-medium">Manage your vegetable listings and locations</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-[#03230F] font-bold text-lg">No products found</p>
                    <p className="text-gray-500 text-sm mt-1">Start by adding your first product to the marketplace!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            userDefaultAddress={userDefaultAddress}
                            onEdit={handleEditClick}
                            onDelete={setShowDeleteConfirm}
                        />
                    ))}
                </div>
            )}

            {/* --- DELETE MODAL --- */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-[#03230F] uppercase mb-2 tracking-tight">Delete Product?</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">This action cannot be undone. Are you sure you want to remove this item?</p>
                        <div className="flex flex-col gap-3">
                            <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-6 uppercase tracking-widest text-xs shadow-lg" onClick={executeDelete}>
                                Yes, Delete
                            </Button>
                            <button className="w-full font-bold text-gray-400 py-3 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors" onClick={() => setShowDeleteConfirm(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {editingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full border-none max-h-[90vh] overflow-y-auto relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />
                        
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                            <h2 className="text-2xl font-black text-[#03230F] uppercase tracking-tight">Edit Product</h2>
                            <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500"/>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Image Section */}
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <img src={imagePreview || ""} className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm" alt="Preview"/>
                                <div className="flex-1 w-full">
                                    <Label className="text-[#03230F] font-bold text-[11px] uppercase tracking-widest mb-2 block">Product Image</Label>
                                    <Input type="file" className="bg-gray-50 border-gray-200 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                                    {uploadError && <p className="text-red-500 text-xs mt-2 font-bold">{uploadError}</p>}
                                </div>
                            </div>

                            {/* Basic Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label className="text-[#03230F] font-bold text-[11px] uppercase tracking-widest mb-2 block">Product Name</Label>
                                    <Input className="bg-gray-50 border-gray-200 focus:ring-[#EEC044]" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <Label className="text-[#03230F] font-bold text-[11px] uppercase tracking-widest mb-2 block">Category</Label>
                                    <Select value={editForm.category} onValueChange={v => setEditForm({...editForm, category: v})}>
                                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#EEC044]"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Leafy">Leafy</SelectItem>
                                            <SelectItem value="Root">Root</SelectItem>
                                            <SelectItem value="Fruit">Fruit</SelectItem>
                                            <SelectItem value="Organic">Organic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-[#03230F] font-bold text-[11px] uppercase tracking-widest mb-2 block">Description</Label>
                                <Textarea className="bg-gray-50 border-gray-200 focus:ring-[#EEC044] resize-none" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                            </div>

                            {/* Pricing Section */}
                            <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
                                <Label className="text-[#03230F] font-bold text-[11px] uppercase tracking-widest mb-4 block flex items-center gap-2">Pricing Setup</Label>
                                <RadioGroup value={editForm.pricingType} onValueChange={v => setEditForm({...editForm, pricingType: v})} className="flex gap-6 mb-4">
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="FIXED" id="e-fixed" className="text-[#EEC044] border-[#03230F]"/>
                                        <Label htmlFor="e-fixed" className="font-bold text-[#03230F]">Fixed Price</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem value="BIDDING" id="e-bid" className="text-[#EEC044] border-[#03230F]"/>
                                        <Label htmlFor="e-bid" className="font-bold text-[#03230F]">Bidding</Label>
                                    </div>
                                </RadioGroup>
                                
                                {editForm.pricingType === "FIXED" ? (
                                    <Input type="number" placeholder="Price per Kg (LKR)" className="bg-white border-gray-200 focus:ring-[#EEC044]" value={editForm.pricePerKg} onChange={e => setEditForm({...editForm, pricePerKg: parseFloat(e.target.value)})} />
                                ) : (
                                    <Input type="number" placeholder="Starting Bid (LKR)" className="bg-white border-gray-200 focus:ring-[#EEC044]" value={editForm.biddingPrice} onChange={e => setEditForm({...editForm, biddingPrice: parseFloat(e.target.value)})} />
                                )}
                            </div>

                            {/* Location Section */}
                            <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
                                <Label className="text-[#03230F] font-bold text-[11px] uppercase tracking-widest mb-4 block">Pickup Location</Label>
                                <RadioGroup value={useCustomLocation ? "custom" : "default"} onValueChange={v => setUseCustomLocation(v === "custom")} className="grid gap-4">
                                    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm cursor-pointer hover:border-[#EEC044]/50 transition-all">
                                        <RadioGroupItem value="default" id="e-loc-def" className="mt-1 text-[#EEC044] border-[#03230F]"/>
                                        <div>
                                            <Label htmlFor="e-loc-def" className="font-bold text-[#03230F] cursor-pointer">Registered Address</Label>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1.5"><Home className="w-4 h-4 text-[#EEC044]"/> {userDefaultAddress || "Loading..."}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden transition-all hover:border-[#EEC044]/50">
                                        <div className="flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer">
                                            <RadioGroupItem value="custom" id="e-loc-cus" className="text-[#EEC044] border-[#03230F]"/>
                                            <Label htmlFor="e-loc-cus" className="font-bold text-[#03230F] cursor-pointer">Custom Location</Label>
                                        </div>
                                        {useCustomLocation && (
                                            <div className="p-4 bg-gray-50">
                                                <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#EEC044]"/> Current: {editForm.pickupAddress || "Same as default"}</p>
                                                <LocationPicker value={editForm.pickupLocation} onChange={loc => setEditForm({...editForm, pickupLocation: loc})} variant="light" showStreetAddress label="Select New Location"/>
                                            </div>
                                        )}
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Delivery Section */}
                            <div className="flex items-center gap-3 mb-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                <input type="checkbox" id="e-del" checked={editForm.deliveryAvailable} onChange={e => setEditForm({...editForm, deliveryAvailable: e.target.checked})} className="w-4 h-4 accent-[#EEC044] cursor-pointer"/>
                                <Label htmlFor="e-del" className="font-bold text-[#03230F] cursor-pointer">Delivery Available?</Label>
                            </div>
                            
                            {editForm.deliveryAvailable && (
                                <div className="grid grid-cols-2 gap-5 bg-gray-50 border border-gray-100 p-5 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <Label className="text-[#03230F] font-bold text-[10px] uppercase tracking-widest mb-2 block">Base Charge (LKR)</Label>
                                        <Input type="number" className="bg-white border-gray-200 focus:ring-[#EEC044]" value={editForm.baseCharge} onChange={e => setEditForm({...editForm, baseCharge: parseFloat(e.target.value)})}/>
                                    </div>
                                    <div>
                                        <Label className="text-[#03230F] font-bold text-[10px] uppercase tracking-widest mb-2 block">Extra /km (LKR)</Label>
                                        <Input type="number" className="bg-white border-gray-200 focus:ring-[#EEC044]" value={editForm.extraRatePerKm} onChange={e => setEditForm({...editForm, extraRatePerKm: parseFloat(e.target.value)})}/>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                            <Button size="lg" className="flex-1 bg-[#03230F] text-[#EEC044] font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg" onClick={() => setShowSaveConfirm(true)}>
                                Save Changes
                            </Button>
                            <Button size="lg" variant="outline" className="flex-1 border-gray-200 text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-gray-50" onClick={() => setEditingProduct(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SAVE CONFIRM MODAL --- */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />
                        <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-[#EEC044]" />
                        </div>
                        <h3 className="text-2xl font-black text-[#03230F] uppercase mb-2 tracking-tight">Confirm Updates?</h3>
                        <p className="text-sm text-gray-500 mb-8 font-medium">These changes will be visible to buyers immediately.</p>
                        <div className="flex flex-col gap-3">
                            <Button className="w-full bg-[#03230F] text-[#EEC044] font-bold py-6 uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all" onClick={executeSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                                {isSaving ? "Saving..." : "Confirm"}
                            </Button>
                            <button className="w-full font-bold text-gray-400 py-3 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors" onClick={() => setShowSaveConfirm(false)} disabled={isSaving}>
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}