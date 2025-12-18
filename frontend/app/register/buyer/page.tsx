"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BuyerRegistration() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        businessName: "",
        deliveryAddress: "",
        district: "",
        zipCode: "",
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Ensure user didn't skip step 1
        if (!sessionStorage.getItem("registerDataStep1")) {
            router.push("/register")
        }
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Retrieve Step 1 Data (Name, Email, Password, etc.)
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            // 2. Create Payload matching Backend DTO
            const payload = {
                ...step1Data,
                role: "Buyer",
                businessName: formData.businessName,
                streetAddress: formData.deliveryAddress, // Maps to 'streetAddress' in backend
                district: formData.district,
                zipcode: formData.zipCode,
                businessRegOrNic: "" // Empty for buyers
            }

            // 3. API Call to Spring Boot Backend
            // FIX: Point directly to backend URL, not relative path
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                // 4. Success! Clear data and redirect to FRONTEND Login Page
                alert("Account Created Successfully!")
                sessionStorage.removeItem("registerDataStep1")

                // This redirects to your Next.js app/login/page.tsx
                router.push("/login")
            } else {
                const msg = await response.text()
                alert("Registration Failed: " + msg)
            }
        } catch (error: any) {
            console.error("Full Registration Error:", error);

            // FIX: Detailed error reporting
            if (error.message === "Failed to fetch") {
                alert("CONNECTION ERROR: Browser cannot reach http://localhost:8080. \n\n1. Check if Docker 'api-gateway' is running.\n2. Open http://localhost:8080/auth/login in your browser to test connectivity.");
            } else {
                alert("ERROR: " + error.message);
            }
        }
    }

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
                <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-white mb-2">Buyer Registration</h1>
                        <p className="text-[#EEC044] text-sm">Step 2: Finish Profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                        <input name="businessName" placeholder="Business Name (Optional)" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white" />
                        <input name="deliveryAddress" placeholder="Delivery Address" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white" required />
                        <input name="district" placeholder="District" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white" required />
                        <input name="zipCode" placeholder="Zip Code" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white" required />

                        <button type="submit" disabled={isLoading} className="w-full py-2.5 px-6 mt-3 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300">
                            {isLoading ? "Processing..." : "Register"}
                        </button>
                    </form>
                </div>
            </div>
            {/* Background Image */}
            <div className="hidden lg:flex w-1/2 relative">
                <img src="/farmer-background.png" alt="Background" className="w-full h-full object-cover" />
            </div>
        </div>
    )
}