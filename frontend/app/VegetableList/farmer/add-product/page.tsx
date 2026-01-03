"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [vegetableName, setVegetableName] = useState("");
    const [category, setCategory] = useState("Leafy");
    const [quantity, setQuantity] = useState("");
    const [pricingType, setPricingType] = useState("fixed");
    const [fixedPrice, setFixedPrice] = useState("");
    const [biddingPrice, setBiddingPrice] = useState("");
    const [biddingStartDate, setBiddingStartDate] = useState("");
    const [biddingEndDate, setBiddingEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<File[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("vegetableName", vegetableName);
        formData.append("category", category);
        formData.append("quantity", quantity);
        formData.append("pricingType", pricingType.toUpperCase());
        formData.append("description", description);

        if (pricingType === "fixed") {
            formData.append("fixedPrice", fixedPrice);
        } else {
            formData.append("biddingPrice", biddingPrice);
            if(biddingStartDate) formData.append("biddingStartDate", biddingStartDate);
            if(biddingEndDate) formData.append("biddingEndDate", biddingEndDate);
        }

        // Append all images
        images.forEach((image) => {
            formData.append("images", image);
        });

        try {
            // Point to API Gateway (8080) -> which routes to Product Service
            const res = await fetch("http://localhost:8082/products", {
                method: "POST",
                body: formData,
                // Note: Do NOT set Content-Type header when sending FormData
                // The browser sets it automatically with the boundary
            });

            if (res.ok) {
                alert("Product Added Successfully!");
                router.push("/seller/dashboard"); // Redirect after success
            } else {
                const error = await res.text();
                alert("Failed: " + error);
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex justify-center items-center px-4 py-12 bg-gray-100">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">Add Vegetable Item</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Vegetable Name */}
                    <input
                        required
                        type="text"
                        placeholder="Vegetable Name"
                        className="w-full border p-3 rounded"
                        value={vegetableName}
                        onChange={(e) => setVegetableName(e.target.value)}
                    />

                    {/* Category */}
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border p-3 rounded"
                    >
                        <option value="Leafy">Leafy</option>
                        <option value="Root">Root</option>
                        <option value="Fruit">Fruit</option>
                        <option value="Organic">Organic</option>
                    </select>

                    {/* Quantity */}
                    <input
                        required
                        type="number"
                        placeholder="Quantity (kg)"
                        className="w-full border p-3 rounded"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />

                    {/* Pricing Type */}
                    <div>
                        <label className="font-semibold">Pricing Type</label>
                        <div className="flex gap-6 mt-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={pricingType === "fixed"}
                                    onChange={() => setPricingType("fixed")}
                                />
                                Fixed Price
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={pricingType === "bidding"}
                                    onChange={() => setPricingType("bidding")}
                                />
                                Bidding
                            </label>
                        </div>
                    </div>

                    {/* Fixed Price */}
                    {pricingType === "fixed" && (
                        <input
                            required
                            type="number"
                            placeholder="Fixed Price (LKR)"
                            className="w-full border p-3 rounded"
                            value={fixedPrice}
                            onChange={(e) => setFixedPrice(e.target.value)}
                        />
                    )}

                    {/* Bidding */}
                    {pricingType === "bidding" && (
                        <div className="space-y-3">
                            <input
                                required
                                type="number"
                                placeholder="Starting Bid Price (LKR)"
                                className="w-full border p-3 rounded"
                                value={biddingPrice}
                                onChange={(e) => setBiddingPrice(e.target.value)}
                            />
                            <input
                                type="datetime-local"
                                className="w-full border p-3 rounded"
                                value={biddingStartDate}
                                onChange={(e) => setBiddingStartDate(e.target.value)}
                            />
                            <input
                                type="datetime-local"
                                className="w-full border p-3 rounded"
                                value={biddingEndDate}
                                onChange={(e) => setBiddingEndDate(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Description */}
                    <textarea
                        rows={4}
                        placeholder="Description"
                        className="w-full border p-3 rounded"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {/* Image Upload */}
                    <div>
                        <label className="font-semibold">Upload Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block mt-2"
                        />
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        className="h-24 w-full object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black text-white rounded-full px-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="bg-black text-white px-6 py-3 rounded w-full disabled:bg-gray-400"
                        >
                            {isLoading ? "Uploading..." : "Submit Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}