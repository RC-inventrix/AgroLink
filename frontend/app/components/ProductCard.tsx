"use client";

import React from "react";

type Product = {
    id: number;
    name: string;
    description?: string;
    category: string;
    price: number;
    imageUrl?: string;
};

export default function ProductCard({ product }: { product: Product }) {
    return (
        <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
            <img
                src={product.imageUrl || "/file.svg"}
                alt={product.name}
                className="w-full h-40 object-cover rounded"
            />

            <h3 className="font-bold text-lg mt-2">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
            <p className="text-green-600 font-semibold">Rs. {product.price}</p>
        </div>
    );
}
