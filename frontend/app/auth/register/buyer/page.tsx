"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BuyerRegistrationStepTwo() {
    const router = useRouter()
    // Buyers might not have extra fields required by your backend yet,
    // but we can collect address here if needed.
    const [address, setAddress] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!sessionStorage.getItem("registerDataStep1")) {
            router.push("/auth/register")
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            const finalPayload = {
                ...step1Data, // role="Buyer"
                // Buyers usually don't have businessName, etc.
                // We can pass address if the backend User entity supports it
                streetAddress: address
            }

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
            alert("Error submitting form")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
                <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-white mb-2">Buyer Details</h1>
                        <p className="text-[#EEC044] text-sm">Step 2: Finish your profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                        <input
                            type="text"
                            placeholder="Delivery Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="input-field"
                            required
                        />

                        <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-[#EEC044] text-[#03230F] font-bold rounded-lg mt-3">
                            {isLoading ? "Processing..." : "Complete Registration"}
                        </button>
                    </form>
                </div>
            </div>
            <div className="hidden lg:flex w-1/2 relative bg-gray-900"></div>
        </div>
    )
}