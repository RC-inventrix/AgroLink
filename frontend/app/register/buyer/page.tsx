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
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            const payload = {
                ...step1Data,
                role: "Buyer",
                businessName: formData.businessName, // Optional
                streetAddress: formData.deliveryAddress, // Mapped to address
                district: formData.district,
                zipcode: formData.zipCode,
                businessRegOrNic: "" // Empty for buyers
            }

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                alert("Account Created!")
                sessionStorage.removeItem("registerDataStep1")
                router.push("/auth/login")
            } else {
                const msg = await response.text()
                alert("Failed: " + msg)
            }
        } catch (error) {
            alert("Error connecting to server")
        } finally {
            setIsLoading(false)
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