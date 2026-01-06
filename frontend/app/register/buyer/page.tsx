"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import { X, Check, AlertCircle } from "lucide-react"

export default function BuyerRegistration() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        businessName: "",
        deliveryAddress: "",
        district: "",
        zipCode: "",
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
        setNotification(null)

        try {
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            const payload = {
                ...step1Data,
                role: "Buyer",
                businessName: formData.businessName,
                streetAddress: formData.deliveryAddress,
                district: formData.district,
                zipcode: formData.zipCode,
                businessRegOrNic: "" 
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                setNotification({ message: "Account Created Successfully!", type: 'success' });
                sessionStorage.removeItem("registerDataStep1")
                
                // Delay redirect to allow user to see success message
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
                    message: "Connection Error: Backend server is unreachable.", 
                    type: 'error' 
                });
            } else {
                setNotification({ message: "Error: " + error.message, type: 'error' });
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ProtectedRoute>
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
                        <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full h-full justify-center">
                            <div className="mb-6">
                                <h1 className="text-4xl font-bold text-white mb-2">Buyer Registration</h1>
                                <p className="text-[#EEC044] text-sm font-medium">Step 2: Finish Profile</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                                <div className="space-y-1">
                                    <label className="text-white text-xs font-semibold ml-1">Business Name</label>
                                    <input 
                                        name="businessName" 
                                        placeholder="Company Name (Optional)" 
                                        onChange={handleInputChange} 
                                        className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044]/50 transition-all" 
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-white text-xs font-semibold ml-1">Delivery Address</label>
                                    <input 
                                        name="deliveryAddress" 
                                        placeholder="Street, City" 
                                        onChange={handleInputChange} 
                                        className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044]/50 transition-all" 
                                        required 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-white text-xs font-semibold ml-1">District</label>
                                        <input 
                                            name="district" 
                                            placeholder="e.g. Colombo" 
                                            onChange={handleInputChange} 
                                            className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044]/50 transition-all" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-white text-xs font-semibold ml-1">Zip Code</label>
                                        <input 
                                            name="zipCode" 
                                            placeholder="12345" 
                                            onChange={handleInputChange} 
                                            className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044]/50 transition-all" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full py-3 px-6 mt-6 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#03230F] border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </span>
                                    ) : "Register"}
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    {/* Background Image */}
                    <div className="hidden lg:flex w-1/2 relative">
                        <img src="/farmer-background.png" alt="Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    )
}