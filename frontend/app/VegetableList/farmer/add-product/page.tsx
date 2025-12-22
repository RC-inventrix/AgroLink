"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("");
    const [pricingType, setPricingType] = useState("fixed");
    const [fixedPrice, setFixedPrice] = useState("");
    const [startingBid, setStartingBid] = useState("");
    const [bidStart, setBidStart] = useState("");
    const [bidEnd, setBidEnd] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newProduct = {
            id: Date.now(),
            name,
            category,
            quantity,
            pricingType,
            fixedPrice,
            startingBid,
            bidStart,
            bidEnd,
            image: "/carrot.jpg", // demo image
        };

        // 🔹 get existing products
        const existing = JSON.parse(localStorage.getItem("products") || "[]");

        // 🔹 save new product
        localStorage.setItem("products", JSON.stringify([...existing, newProduct]));

        // 🔹 go to listed products page
        router.push("/VegetableList/farmer");
    };

    return (
        <main className="flex justify-center p-6 bg-gray-100 min-h-screen">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl w-full max-w-xl space-y-4">

                <h2 className="text-2xl font-bold text-center">Add Vegetable</h2>

                <input
                    className="w-full border p-3 rounded"
                    placeholder="Vegetable Name"
                    onChange={(e) => setName(e.target.value)}
                />

                <select
                    className="w-full border p-3 rounded"
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    <option>Leafy</option>
                    <option>Root</option>
                    <option>Fruit</option>
                </select>

                <input
                    className="w-full border p-3 rounded"
                    placeholder="Quantity (kg)"
                    onChange={(e) => setQuantity(e.target.value)}
                />

                {/* Pricing type */}
                <div>
                    <p className="font-semibold">Pricing Type</p>
                    <label className="mr-4">
                        <input
                            type="radio"
                            checked={pricingType === "fixed"}
                            onChange={() => setPricingType("fixed")}
                        /> Fixed Price
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={pricingType === "bidding"}
                            onChange={() => setPricingType("bidding")}
                        /> Bidding
                    </label>
                </div>

                {/* Fixed Price */}
                {pricingType === "fixed" && (
                    <input
                        className="w-full border p-3 rounded"
                        placeholder="Fixed Price (LKR)"
                        onChange={(e) => setFixedPrice(e.target.value)}
                    />
                )}

                {/* Bidding */}
                {pricingType === "bidding" && (
                    <>
                        <input
                            className="w-full border p-3 rounded"
                            placeholder="Starting Bid (LKR)"
                            onChange={(e) => setStartingBid(e.target.value)}
                        />
                        <input type="date" className="w-full border p-3 rounded" onChange={(e) => setBidStart(e.target.value)} />
                        <input type="date" className="w-full border p-3 rounded" onChange={(e) => setBidEnd(e.target.value)} />
                    </>
                )}

                <button className="bg-black text-white w-full py-3 rounded">
                    Submit Product
                </button>
            </form>
        </main>
    );
}
