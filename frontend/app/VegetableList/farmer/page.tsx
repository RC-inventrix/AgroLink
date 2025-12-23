"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function FarmerProductsPage() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("products") || "[]");
        setProducts(saved);
    }, []);

    return (
        <main className="p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-center mb-8">My Listed Products</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl shadow p-4">
                        <Image src={p.image} alt={p.name} width={300} height={200} className="rounded" />

                        <h3 className="text-xl font-semibold mt-3">{p.name}</h3>
                        <p>Category: {p.category}</p>
                        <p>Quantity: {p.quantity}</p>

                        {p.pricingType === "fixed" && (
                            <p className="font-bold">Price: {p.fixedPrice} LKR</p>
                        )}

                        {p.pricingType === "bidding" && (
                            <>
                                <p>Starting Bid: {p.startingBid} LKR</p>
                                <p className="text-sm text-gray-500">
                                    {p.bidStart} → {p.bidEnd}
                                </p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
}
