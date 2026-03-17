/* fileName: product-list.tsx */
"use client"

import { useState, useEffect, useRef } from "react"
import ProductCard from "./product-card"
import {Loader2, AlertCircle, Upload, X, MapPin, Home, StopCircle, Check, Package} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import LocationPicker from "@/components/LocationPicker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, Toaster } from "sonner"

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
    baseCharge?: number | null
    extraRatePerKm?: number | null
    pickupLatitude?: number | null
    pickupLongitude?: number | null
    pickupAddress?: string | null
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [showSaveConfirm, setShowSaveConfirm] = useState(false)

    // --- NEW STATES FOR QUICK QUANTITY UPDATE ---
    const [quantityUpdateProduct, setQuantityUpdateProduct] = useState<Product | null>(null)
    const [newQuantity, setNewQuantity] = useState<string>("")
    const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false)

    const [userDefaultAddress, setUserDefaultAddress] = useState<{
        address: string;
        latitude: number | null;
        longitude: number | null;
    } | null>(null)

    const [addressOption, setAddressOption] = useState<"keep" | "default" | "custom">("keep")
    const [customLocation, setCustomLocation] = useState({
        province: "",
        district: "",
        city: "",
        streetAddress: "",
        latitude: null as number | null,
        longitude: null as number | null,
    })

    useEffect(() => {
        const fetchUserAddress = async () => {
            const myId = sessionStorage.getItem("id");
            const token = sessionStorage.getItem("token");
            if (myId) {
                try {
                    const res = await fetch(`${API_URL}/users/${myId}/address`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        const parts = [userData.address, userData.city, userData.district].filter(Boolean);
                        setUserDefaultAddress({
                            address: parts.join(", "),
                            latitude: userData.latitude || null,
                            longitude: userData.longitude || null
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch address", error);
                }
            }
        };
        fetchUserAddress();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const farmerId = sessionStorage.getItem("id");

            if (!farmerId || !token) return;

            const res = await fetch(`${API_URL}/products/farmer/${farmerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();

                const mappedProducts = data.map((p: any) => {
                    let displayImage = "/placeholder.svg";
                    const imgArray = p.imageUrls || p.images || [];
                    if (Array.isArray(imgArray) && imgArray.length > 0) {
                        const firstImg = imgArray[0];
                        displayImage = typeof firstImg === 'string' ? firstImg : (firstImg.imageUrl || "/placeholder.svg");
                    } else if (typeof p.imageUrl === 'string') {
                        displayImage = p.imageUrl;
                    } else if (typeof p.productImageUrl === 'string') {
                        displayImage = p.productImageUrl;
                    }

                    return {
                        id: p.id.toString(),
                        name: p.vegetableName,
                        category: p.category || "General",
                        description: p.description,
                        image: displayImage,
                        pricePerKg: p.fixedPrice || 0,
                        quantity: p.quantity || 0,
                        pricingType: p.pricingType || "FIXED",
                        biddingPrice: p.biddingPrice || 0,
                        deliveryAvailable: p.deliveryAvailable || false,
                        baseCharge: p.deliveryFeeFirst3Km || null,
                        extraRatePerKm: p.deliveryFeePerKm || null,
                        pickupLatitude: p.pickupLatitude,
                        pickupLongitude: p.pickupLongitude,
                        pickupAddress: p.pickupAddress,
                    };
                });
                setProducts(mappedProducts);
            }
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Product deleted successfully");
                fetchProducts();
            } else {
                toast.error("Failed to delete product");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setAddressOption("keep");
        setCustomLocation({
            province: "", district: "", city: "", streetAddress: "",
            latitude: null, longitude: null,
        });
    };

    // --- NEW: Setup state for quick quantity update ---
    const handleUpdateQuantityClick = (product: Product) => {
        setQuantityUpdateProduct(product);
        setNewQuantity(product.quantity.toString());
    };

    // --- NEW: Process the quick quantity update logic ---
    const executeQuantityUpdate = async () => {
        if (!quantityUpdateProduct || !newQuantity) return;
        setIsUpdatingQuantity(true);
        try {
            const token = sessionStorage.getItem("token");
            const farmerId = sessionStorage.getItem("id");

            // Construct payload mirroring the full DTO, but substituting ONLY the new quantity
            const payload = {
                farmerId: parseInt(farmerId || "0"),
                vegetableName: quantityUpdateProduct.name,
                category: quantityUpdateProduct.category,
                quantity: Number(newQuantity),
                pricingType: quantityUpdateProduct.pricingType,
                fixedPrice: quantityUpdateProduct.pricingType === "FIXED" ? Number(quantityUpdateProduct.pricePerKg) : null,
                biddingPrice: quantityUpdateProduct.pricingType === "BIDDING" ? Number(quantityUpdateProduct.biddingPrice) : null,
                description: quantityUpdateProduct.description,
                deliveryAvailable: quantityUpdateProduct.deliveryAvailable,
                deliveryFeeFirst3Km: quantityUpdateProduct.deliveryAvailable ? Number(quantityUpdateProduct.baseCharge) : null,
                deliveryFeePerKm: quantityUpdateProduct.deliveryAvailable ? Number(quantityUpdateProduct.extraRatePerKm) : null,
                pickupAddress: quantityUpdateProduct.pickupAddress,
                pickupLatitude: quantityUpdateProduct.pickupLatitude,
                pickupLongitude: quantityUpdateProduct.pickupLongitude,
            };

            const res = await fetch(`${API_URL}/products/${quantityUpdateProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Quantity updated successfully!");
                setQuantityUpdateProduct(null);
                fetchProducts();
            } else {
                const err = await res.text();
                toast.error(`Failed to update quantity: ${err}`);
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setIsUpdatingQuantity(false);
        }
    };

    const executeSave = async () => {
        if (!editingProduct) return;
        setIsSaving(true);
        try {
            const token = sessionStorage.getItem("token");
            const farmerId = sessionStorage.getItem("id");

            let finalAddress = editingProduct.pickupAddress;
            let finalLat = editingProduct.pickupLatitude;
            let finalLng = editingProduct.pickupLongitude;

            if (addressOption === "custom" && customLocation.latitude) {
                finalAddress = [customLocation.streetAddress, customLocation.city, customLocation.district].filter(Boolean).join(", ");
                finalLat = customLocation.latitude;
                finalLng = customLocation.longitude;
            } else if (addressOption === "default" && userDefaultAddress) {
                finalAddress = userDefaultAddress.address;
                finalLat = userDefaultAddress.latitude;
                finalLng = userDefaultAddress.longitude;
            }

            const payload = {
                farmerId: parseInt(farmerId || "0"),
                vegetableName: editingProduct.name,
                category: editingProduct.category,
                quantity: Number(editingProduct.quantity),
                pricingType: editingProduct.pricingType,
                fixedPrice: editingProduct.pricingType === "FIXED" ? Number(editingProduct.pricePerKg) : null,
                biddingPrice: editingProduct.pricingType === "BIDDING" ? Number(editingProduct.biddingPrice) : null,
                description: editingProduct.description,
                deliveryAvailable: editingProduct.deliveryAvailable,
                deliveryFeeFirst3Km: editingProduct.deliveryAvailable ? Number(editingProduct.baseCharge) : null,
                deliveryFeePerKm: editingProduct.deliveryAvailable ? Number(editingProduct.extraRatePerKm) : null,
                pickupAddress: finalAddress,
                pickupLatitude: finalLat,
                pickupLongitude: finalLng,
            };

            const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Product updated successfully!");
                setShowSaveConfirm(false);
                setEditingProduct(null);
                fetchProducts();
            } else {
                const err = await res.text();
                toast.error(`Update failed: ${err}`);
            }
        } catch (error) {
            toast.error("Network error during update");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="flex-1 p-8 overflow-y-auto w-full relative">
            <Toaster position="top-center" richColors />
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">My Products</h1>
                    <p className="text-[#A3ACBA] font-medium">Manage and update your currently listed inventory.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-muted/10 border border-border rounded-xl">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
                        <p className="text-muted-foreground mt-2">You haven't listed any products yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                userDefaultAddress={userDefaultAddress?.address || null}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onUpdateQuantity={handleUpdateQuantityClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- NEW: QUICK QUANTITY UPDATE MODAL --- */}
            {quantityUpdateProduct && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl border border-border animate-in fade-in zoom-in-95">
                        <div className="p-5 border-b flex justify-between items-center bg-muted/20">
                            <h2 className="text-lg font-bold">Update Quantity</h2>
                            <Button variant="ghost" size="icon" onClick={() => setQuantityUpdateProduct(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground">Adjust the available stock for <strong>{quantityUpdateProduct.name}</strong>.</p>
                            <div className="space-y-2">
                                <Label>New Quantity (kg)</Label>
                                <Input
                                    type="number"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button
                                className="w-full mt-2 bg-[#03230F] hover:bg-[#03230F]/90 text-[#EEC044] font-bold h-11"
                                onClick={executeQuantityUpdate}
                                disabled={isUpdatingQuantity || !newQuantity}
                            >
                                {isUpdatingQuantity ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                                Update Quantity
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {editingProduct && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border my-8 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-muted/20 sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Edit Product</h2>
                                <p className="text-xs text-muted-foreground mt-1">Update details for {editingProduct.name}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            <div className="flex gap-6 items-start">
                                <img src={editingProduct.image || "/placeholder.svg"} className="w-24 h-24 object-cover rounded-lg border shadow-sm" alt="Preview"/>
                                <div className="flex-1 space-y-2">
                                    <Label className="text-muted-foreground text-xs">Note</Label>
                                    <p className="text-sm">To change the product image, please delete this listing and create a new one.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Vegetable Name</Label>
                                    <Input
                                        value={editingProduct.name ?? ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={editingProduct.category ?? ""}
                                        onValueChange={(val) => setEditingProduct({ ...editingProduct, category: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent className="z-[10000]">
                                            <SelectItem value="Leafy">Leafy Vegetables</SelectItem>
                                            <SelectItem value="Root">Root Vegetables</SelectItem>
                                            <SelectItem value="Fruit">Fruit Vegetables</SelectItem>
                                            <SelectItem value="Organic">Organic</SelectItem>
                                            <SelectItem value="Vegetable">General Vegetable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quantity (kg)</Label>
                                    <Input
                                        type="number"
                                        value={editingProduct.quantity ?? ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <Label className="mb-3 block font-semibold text-base border-b pb-2">
                                    Pricing ({editingProduct.pricingType === "FIXED" ? "Fixed Price" : "Auction Based"})
                                </Label>

                                {editingProduct.pricingType === "FIXED" ? (
                                    <div className="space-y-2 mt-3">
                                        <Label className="text-xs text-muted-foreground">Price per Kg (LKR)</Label>
                                        <Input
                                            type="number"
                                            value={editingProduct.pricePerKg ?? ""}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, pricePerKg: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2 mt-3">
                                        <Label className="text-xs text-muted-foreground">Starting Bid (LKR)</Label>
                                        <Input
                                            type="number"
                                            value={editingProduct.biddingPrice ?? ""}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, biddingPrice: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    rows={3}
                                    value={editingProduct.description ?? ""}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label className="text-base">Pickup Location Update</Label>
                                <RadioGroup value={addressOption} onValueChange={(v: any) => setAddressOption(v)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="keep" id="keep" />
                                        <Label htmlFor="keep">Keep Current Address ({editingProduct.pickupAddress})</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="default" id="default" />
                                        <Label htmlFor="default">Use My Registration Address ({userDefaultAddress?.address || "Loading..."})</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="custom" id="custom" />
                                        <Label htmlFor="custom">Select New Custom Location on Map</Label>
                                    </div>
                                </RadioGroup>

                                {addressOption === "custom" && (
                                    <div className="p-4 bg-muted/30 rounded-lg border">
                                        <LocationPicker
                                            value={customLocation}
                                            onChange={setCustomLocation}
                                            variant="light"
                                            showStreetAddress={true}
                                            required={true}
                                            label="Select New Location"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <Label className="text-base">Delivery Options</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="deliveryToggle"
                                        className="w-4 h-4 rounded border-gray-300"
                                        checked={editingProduct.deliveryAvailable}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, deliveryAvailable: e.target.checked })}
                                    />
                                    <Label htmlFor="deliveryToggle" className="cursor-pointer font-normal">Yes, I provide delivery</Label>
                                </div>

                                {editingProduct.deliveryAvailable && (
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Base Charge (First 3km)</Label>
                                            <Input
                                                type="number"
                                                value={editingProduct.baseCharge ?? ""}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, baseCharge: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Extra Rate (Per km)</Label>
                                            <Input
                                                type="number"
                                                value={editingProduct.extraRatePerKm ?? ""}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, extraRatePerKm: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
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