const API_URL = "http://localhost:5000/api/products" // change to your backend URL

export async function getProducts() {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
}

export async function createProduct(data: any) {
    const formData = new FormData()
    formData.append("vegetableName", data.vegetableName)
    formData.append("category", data.category)
    formData.append("quantity", data.quantity.toString())
    formData.append("pricingType", data.pricingType)
    if (data.fixedPrice) formData.append("fixedPrice", data.fixedPrice.toString())
    if (data.biddingPrice) formData.append("biddingPrice", data.biddingPrice.toString())
    if (data.biddingStartDate) formData.append("biddingStartDate", data.biddingStartDate)
    if (data.biddingEndDate) formData.append("biddingEndDate", data.biddingEndDate)
    formData.append("description", data.description)
    if (data.imageUrls) data.imageUrls.forEach((file: File) => formData.append("images", file))

    const res = await fetch(API_URL, { method: "POST", body: formData })
    if (!res.ok) throw new Error("Failed to create")
    return res.json()
}

export async function updateProduct(id: number, data: any) {
    const res = await fetch(`${API_URL}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error("Failed to update")
    return res.json()
}

export async function deleteProduct(id: number) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete")
    return res.json()
}
