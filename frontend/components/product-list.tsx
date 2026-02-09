"use client"

import { useState, useEffect, useRef } from "react"
import ProductCard from "./product-card"
import { Loader2, AlertCircle, Upload, X, MapPin, Home, StopCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import LocationPicker from "@/components/LocationPicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
            const prodRes = await fetch(`http://localhost:8080/products/farmer/${farmerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            const userRes = await fetch(`http://localhost:8080/api/usersProducts/${farmerId}/address`, {
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
                    `http://localhost:8080/products/presigned-url?fileName=${encodeURIComponent(newImage.name)}&contentType=${encodeURIComponent(newImage.type)}`,
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

            const res = await fetch(`http://localhost:8080/products/${editingProduct.id}`, {
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
            const res = await fetch(`http://localhost:8080/products/${showDeleteConfirm}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                setProducts(products.filter(p => p.id !== showDeleteConfirm))
                setShowDeleteConfirm(null)
            }
        } catch (e) { console.error(e) }
    }

    if (loading) return <div className="text-center py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <section className="max-w-7xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">My Products</h2>
                <p className="text-muted-foreground">Manage your vegetable listings and locations</p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground">No products found. Start by adding one!</p>
                </div>
            ) : (
                // UPDATED: Changed from lg:grid-cols-4 to lg:grid-cols-3
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full border border-border animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
                        <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <Button variant="destructive" className="flex-1" onClick={executeDelete}>Delete</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL (Unchanged Logic, Same Layout) --- */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-card p-8 rounded-xl shadow-2xl max-w-2xl w-full border border-border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold">Edit Product</h2>
                            <button onClick={() => setEditingProduct(null)} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-6 items-start">
                                <img src={imagePreview || ""} className="w-24 h-24 object-cover rounded-lg border" alt="Preview"/>
                                <div className="flex-1">
                                    <Label>Product Image</Label>
                                    <Input type="file" className="mt-2" onChange={handleImageChange} accept="image/*" />
                                    {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                                <div>
                                    <Label>Category</Label>
                                    <Select value={editForm.category} onValueChange={v => setEditForm({...editForm, category: v})}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Leafy">Leafy</SelectItem>
                                            <SelectItem value="Root">Root</SelectItem>
                                            <SelectItem value="Fruit">Fruit</SelectItem>
                                            <SelectItem value="Organic">Organic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div><Label>Description</Label><Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <Label className="mb-2 block">Pricing</Label>
                                <RadioGroup value={editForm.pricingType} onValueChange={v => setEditForm({...editForm, pricingType: v})} className="flex gap-4 mb-3">
                                    <div className="flex items-center gap-2"><RadioGroupItem value="FIXED" id="e-fixed"/><Label htmlFor="e-fixed">Fixed</Label></div>
                                    <div className="flex items-center gap-2"><RadioGroupItem value="BIDDING" id="e-bid"/><Label htmlFor="e-bid">Bidding</Label></div>
                                </RadioGroup>
                                {editForm.pricingType === "FIXED" ? (
                                    <Input type="number" placeholder="Price per Kg" value={editForm.pricePerKg} onChange={e => setEditForm({...editForm, pricePerKg: parseFloat(e.target.value)})} />
                                ) : (
                                    <Input type="number" placeholder="Starting Bid" value={editForm.biddingPrice} onChange={e => setEditForm({...editForm, biddingPrice: parseFloat(e.target.value)})} />
                                )}
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <Label className="mb-3 block font-semibold">Pickup Location</Label>
                                <RadioGroup value={useCustomLocation ? "custom" : "default"} onValueChange={v => setUseCustomLocation(v === "custom")} className="grid gap-4">
                                    <div className="flex items-start gap-3 p-3 border rounded bg-background">
                                        <RadioGroupItem value="default" id="e-loc-def" className="mt-1"/>
                                        <div><Label htmlFor="e-loc-def">Registered Address</Label><div className="flex items-center gap-2 text-sm text-muted-foreground mt-1"><Home className="w-3 h-3"/> {userDefaultAddress || "Loading..."}</div></div>
                                    </div>
                                    <div className="border rounded bg-background overflow-hidden">
                                        <div className="flex items-center gap-3 p-3 border-b"><RadioGroupItem value="custom" id="e-loc-cus"/><Label htmlFor="e-loc-cus">Custom Location</Label></div>
                                        {useCustomLocation && (
                                            <div className="p-3 bg-muted/10">
                                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> Current: {editForm.pickupAddress || "Same as default"}</p>
                                                <LocationPicker value={editForm.pickupLocation} onChange={loc => setEditForm({...editForm, pickupLocation: loc})} variant="light" showStreetAddress label="Select New Location"/>
                                            </div>
                                        )}
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" id="e-del" checked={editForm.deliveryAvailable} onChange={e => setEditForm({...editForm, deliveryAvailable: e.target.checked})} className="w-4 h-4"/>
                                <Label htmlFor="e-del">Delivery Available?</Label>
                            </div>
                            {editForm.deliveryAvailable && (
                                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded">
                                    <div><Label>Base Charge</Label><Input type="number" value={editForm.baseCharge} onChange={e => setEditForm({...editForm, baseCharge: parseFloat(e.target.value)})}/></div>
                                    <div><Label>Extra /km</Label><Input type="number" value={editForm.extraRatePerKm} onChange={e => setEditForm({...editForm, extraRatePerKm: parseFloat(e.target.value)})}/></div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8 pt-4 border-t">
                            <Button size="lg" className="flex-1" onClick={() => setShowSaveConfirm(true)}>Save Changes</Button>
                            <Button size="lg" variant="outline" className="flex-1" onClick={() => setEditingProduct(null)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SAVE MODAL --- */}
            {showSaveConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full border border-border animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold mb-2">Confirm Updates?</h3>
                        <p className="text-sm text-muted-foreground mb-6">These changes will be visible to buyers immediately.</p>
                        <div className="flex gap-3">
                            <Button className="flex-1" onClick={executeSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                                {isSaving ? "Saving..." : "Confirm"}
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setShowSaveConfirm(false)} disabled={isSaving}>Back</Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}