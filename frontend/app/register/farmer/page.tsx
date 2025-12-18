"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FarmerRegistration() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        businessName: "",
        streetAddress: "",
        district: "",
        zipCode: "",
        registrationNumber: "",
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!sessionStorage.getItem("registerDataStep1")) {
            alert("Please fill step 1 first.")
            router.push("/register")
        }
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Retrieve Step 1 Data
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            // 2. Create Payload for Backend
            const payload = {
                ...step1Data,
                role: "Farmer",
                businessName: formData.businessName,
                streetAddress: formData.streetAddress,
                district: formData.district,
                zipcode: formData.zipCode,
                businessRegOrNic: formData.registrationNumber,
            }

            // 3. API Call to Spring Boot Backend
            // FIX: Point directly to backend URL
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                // 4. Success! Redirect to FRONTEND Login Page
                alert("Registration Successful!")
                sessionStorage.removeItem("registerDataStep1")

                // This redirects to app/login/page.tsx
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
                <div className="relative z-10 flex flex-col px-8 pt-4 md:px-12 md:pt-6 lg:pt-8 max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 leading-tight">Registration</h1>
                        <p className="text-[#EEC044] text-sm font-medium">Step 2: Farm Details</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                        <input type="text" name="businessName" placeholder="Business Name" onChange={handleInputChange} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="text" name="streetAddress" placeholder="Street Address" onChange={handleInputChange} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="text" name="district" placeholder="District" onChange={handleInputChange} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="text" name="zipCode" placeholder="ZIP Code" onChange={handleInputChange} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="text" name="registrationNumber" placeholder="Business Reg / NIC" onChange={handleInputChange} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />

                        <button type="submit" disabled={isLoading} className="w-full py-4 px-5 mt-2 bg-[#EEC044] text-[#03230F] font-bold rounded-xl shadow-lg hover:bg-yellow-300 transition-colors">
                            {isLoading ? "Registering..." : "Complete Registration"}
                        </button>
                    </form>
                </div>
            </div>
            {/* Background Image */}
            <div className="hidden lg:flex w-1/2 relative">
                <img src="/farmer-background.png" alt="Farming background" className="w-full h-full object-cover" />
            </div>
        </div>
    )
}