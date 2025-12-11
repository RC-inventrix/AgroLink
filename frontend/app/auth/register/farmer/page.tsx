"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FarmerRegistrationStepTwo() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        businessName: "",
        streetAddress: "",
        district: "",
        zipcode: "",
        nic: "", // Mapped to registrationNumber in backend
    })
    const [isLoading, setIsLoading] = useState(false)

    // Verify Step 1 data exists
    useEffect(() => {
        if (!sessionStorage.getItem("registerDataStep1")) {
            alert("Please complete Step 1 first.")
            router.push("/auth/register")
        }
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Get Step 1 Data
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            // 2. Prepare Payload
            const finalPayload = {
                ...step1Data, // fullname, email, phone, password, role="Farmer"
                businessName: formData.businessName,
                streetAddress: formData.streetAddress, // Will map to 'address' in Backend
                district: formData.district,
                zipcode: formData.zipcode,
                businessRegOrNic: formData.nic, // Will map to 'nic' in Backend DTO
            }

            // 3. Send to Backend
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalPayload),
            })

            if (response.ok) {
                alert("Registration Successful! Please Login.")
                sessionStorage.removeItem("registerDataStep1")
                router.push("/auth/login")
            } else {
                const errorText = await response.text()
                alert("Registration Failed: " + errorText)
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col relative overflow-hidden bg-[#03230F] bg-opacity-90">
                <div className="relative z-10 flex flex-col px-8 pt-4 md:px-12 md:pt-6 lg:pt-8 max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-white mb-1">Farmer Details</h1>
                        <p className="text-[#EEC044] text-sm font-medium">Step 2: Tell us about your farm</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                        <input type="text" name="businessName" placeholder="Business Name" onChange={handleInputChange} className="input-field" required />
                        <input type="text" name="streetAddress" placeholder="Street Address" onChange={handleInputChange} className="input-field" required />
                        <input type="text" name="district" placeholder="District" onChange={handleInputChange} className="input-field" required />
                        <input type="text" name="zipcode" placeholder="Zip Code" onChange={handleInputChange} className="input-field" required />
                        <input type="text" name="nic" placeholder="Business Reg / NIC" onChange={handleInputChange} className="input-field" required />

                        <button type="submit" disabled={isLoading} className="w-full py-4 px-5 bg-[#EEC044] text-[#03230F] font-bold rounded-xl mt-2 hover:bg-yellow-300">
                            {isLoading ? "Registering..." : "Complete Registration"}
                        </button>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 relative bg-gray-900">
                {/* Background Image */}
            </div>
        </div>
    )
}