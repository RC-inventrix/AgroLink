/* fileName: page.tsx */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Check, AlertCircle } from "lucide-react"
import LocationPicker from "@/components/LocationPicker"

export default function FarmerRegistration() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        businessName: "",
        location: {
            province: "",
            district: "",
            city: "",
            streetAddress: "",
            latitude: null as number | null,
            longitude: null as number | null,
        },
        zipCode: "",
        registrationNumber: "",
    })
    const [isLoading, setIsLoading] = useState(false)

    // --- Custom Notification State ---
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Auto-hide notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        if (!sessionStorage.getItem("registerDataStep1")) {
            setNotification({ message: "Please fill step 1 first.", type: 'error' });
            setTimeout(() => router.push("/register"), 1500);
        }
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleLocationChange = (location: typeof formData.location) => {
        setFormData({ ...formData, location })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setNotification(null)

        try {
            // 1. Retrieve Step 1 Data
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            // 2. Create Payload for Backend
            const payload = {
                ...step1Data,
                role: "Farmer",
                businessName: formData.businessName,
                // Send street and city separately for better data structure
                streetAddress: formData.location.streetAddress,
                city: formData.location.city,
                district: formData.location.district,
                province: formData.location.province,
                latitude: formData.location.latitude,
                longitude: formData.location.longitude,
                zipcode: formData.zipCode,
                businessRegOrNic: formData.registrationNumber,
            }

            // 3. API Call to Spring Boot Backend
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                // 4. Success Logic
                setNotification({ message: "Registration Successful! Welcome to AgroLink.", type: 'success' });
                sessionStorage.removeItem("registerDataStep1")

                // Redirect to Login after a short delay to show the message
                setTimeout(() => {
                    router.push("/login")
                }, 2000);
            } else {
                const msg = await response.text()
                setNotification({ message: "Registration Failed: " + msg, type: 'error' });
            }
        } catch (error: any) {
            console.error("Full Registration Error:", error);

            if (error.message === "Failed to fetch") {
                setNotification({
                    message: "CONNECTION ERROR: Cannot reach server. Please check your connection.",
                    type: 'error'
                });
            } else {
                setNotification({ message: "ERROR: " + error.message, type: 'error' });
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-white relative overflow-hidden">

            {/* --- CUSTOM NOTIFICATION UI --- */}
            {notification && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
                    notification.type === 'success'
                        ? "bg-[#03230F] border-green-500 text-white"
                        : "bg-red-950 border-red-500 text-white"
                }`}>
                    <div className="flex items-center gap-3">
                        {notification.type === 'success' ? (
                            <Check className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <p className="font-medium pr-4">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-auto hover:bg-white/10 p-1 rounded transition-colors"
                    >
                        <X className="w-4 h-4 opacity-70" />
                    </button>
                </div>
            )}

            <div className="h-screen flex">
                <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
                    <div className="relative z-10 flex flex-col px-8 py-10 md:px-12 max-w-md mx-auto w-full h-full overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#EEC044] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-yellow-400">
                        <div className="mb-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 leading-tight">Registration</h1>
                            <p className="text-[#EEC044] text-sm font-medium tracking-wide">Step 2: Farm Details</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                            <div className="space-y-1">
                                <label className="text-white/70 text-xs font-semibold ml-1">Farm/Business Name</label>
                                <input type="text" name="businessName" placeholder="e.g. Green Valley Farm" onChange={handleInputChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            {/* Location Picker */}
                            <LocationPicker
                                value={formData.location}
                                onChange={handleLocationChange}
                                variant="dark"
                                showStreetAddress={true}
                                required={true}
                                label="Farm Location"
                            />

                            <div className="space-y-1">
                                <label className="text-white/70 text-xs font-semibold ml-1">ZIP Code</label>
                                <input type="text" name="zipCode" placeholder="ZIP Code" onChange={handleInputChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <div className="space-y-1">
                                <label className="text-white/70 text-xs font-semibold ml-1">Identification Number</label>
                                <input type="text" name="registrationNumber" placeholder="Business Reg No / NIC" onChange={handleInputChange} className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-5 mt-4 bg-[#EEC044] text-[#03230F] font-bold rounded-xl shadow-lg hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-[#03230F] border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : "Complete Registration"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Background Image */}
                <div className="hidden lg:flex w-1/2 relative">
                    <img src="/farmer-background.png" alt="Farming background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
            </div>
        </main>
    )
}