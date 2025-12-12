"use client";

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "@/lib/utils";

export default function ProductsPage() {
    const [category, setCategory] = useState("");
    const [q, setQ] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [products, setProducts] = useState([]);

    const loadProducts = async () => {
        const data = await fetchProducts({
            category,
            minPrice,
            maxPrice,
            q,
            page: 0,
            size: 20
        });

        setProducts(data.content);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                <input
                    className="border p-2 rounded"
                    placeholder="Search products..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                <select
                    className="border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Tools">Tools</option>
                </select>

                <input
                    className="border p-2 rounded"
                    placeholder="Min Price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />

                <input
                    className="border p-2 rounded"
                    placeholder="Max Price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />
            </div>

            {/* Search Button */}
            <button
                onClick={loadProducts}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                Search
            </button>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {products.map((p: any) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}
