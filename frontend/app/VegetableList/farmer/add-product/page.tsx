"use client";

import { useState } from "react";

// ✅ This file is ONLY the UI part (MAIN CONTENT)
// Path: app/farmer/add-product/page.tsx
// Header & Footer are already handled in app/layout.tsx

export default function AddProductPage() {
    const [pricingType, setPricingType] = useState("fixed");
    const [images, setImages] = useState<File[]>([]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <main className="flex justify-center items-center px-4 py-12 bg-gray-100">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Add Vegetable Item
                </h2>

                <form className="space-y-4">
                    {/* Vegetable Name */}
                    <input
                        type="text"
                        placeholder="Vegetable Name"
                        className="w-full border p-3 rounded"
                    />

                    {/* Category */}
                    <select className="w-full border p-3 rounded">
                        <option>All Categories</option>
                        <option>Leafy</option>
                        <option>Root</option>
                        <option>Fruit</option>
                        <option>Organic</option>
                    </select>

                    {/* Quantity */}
                    <input
                        type="number"
                        placeholder="Quantity (kg)"
                        className="w-full border p-3 rounded"
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
                            type="number"
                            placeholder="Fixed Price (LKR)"
                            className="w-full border p-3 rounded"
                        />
                    )}

                    {/* Bidding */}
                    {pricingType === "bidding" && (
                        <div className="space-y-3">
                            <input
                                type="number"
                                placeholder="Starting Bid Price (LKR)"
                                className="w-full border p-3 rounded"
                            />
                            <input type="date" className="w-full border p-3 rounded" />
                            <input type="time" className="w-full border p-3 rounded" />
                        </div>
                    )}

                    {/* Description */}
                    <textarea
                        rows={4}
                        placeholder="Description"
                        className="w-full border p-3 rounded"
                    />

                    {/* Image Upload */}
                    <div>
                        <label className="font-semibold">Upload Images</label>
                        <input
                            type="file"
                            multiple
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
                            type="submit"
                            className="bg-black text-white px-6 py-3 rounded w-full"
                        >
                            Submit Listing
                        </button>
                        <button
                            type="reset"
                            className="border border-black px-6 py-3 rounded w-full"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
