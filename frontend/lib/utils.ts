import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//for feature/search-products
export async function fetchProducts(filters: any) {
    const params = new URLSearchParams(filters);
    const res = await fetch(`http://localhost:8080/api/products?${params.toString()}`);

    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

