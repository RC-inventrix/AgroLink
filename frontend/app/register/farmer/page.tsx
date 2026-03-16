/* fileName: page.tsx */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Check, AlertCircle, ShieldCheck } from "lucide-react"
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
        }
    })

    const [isLoading, setIsLoading] = useState(false)
    const [showGuidelinesModal, setShowGuidelinesModal] = useState(false)

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

    // 1. Intercept the form submission to show the modal first
    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation before showing modal
        if (!formData.businessName || !formData.location.streetAddress) {
            setNotification({ message: "Please fill in all required fields.", type: 'error' });
            return;
        }

        setShowGuidelinesModal(true);
    }

    // 2. Execute the actual API call only AFTER they acknowledge the rules
    const confirmRegistration = async () => {
        setIsLoading(true)
        setNotification(null)

        try {
            const step1Data = JSON.parse(sessionStorage.getItem("registerDataStep1") || "{}")

            const payload = {
                ...step1Data,
                role: "Farmer",
                businessName: formData.businessName,
                streetAddress: formData.location.streetAddress,
                city: formData.location.city,
                district: formData.location.district,
                province: formData.location.province,
                latitude: formData.location.latitude,
                longitude: formData.location.longitude,
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                setNotification({ message: "Registration completed successfully! Welcome to AgroLink.", type: 'success' });
                sessionStorage.removeItem("registerDataStep1")
                setShowGuidelinesModal(false)

                setTimeout(() => {
                    router.push("/login")
                }, 2000);
            } else {
                const msg = await response.text()
                setNotification({ message: "Registration failed: " + msg, type: 'error' });
                setShowGuidelinesModal(false)
            }
        } catch (error: any) {
            console.error("Full Registration Error:", error);

            if (error.message === "Failed to fetch") {
                setNotification({
                    message: "Server error occurred. Cannot reach server. Please check your connection.",
                    type: 'error'
                });
            } else {
                setNotification({ message: "Invalid input data: " + error.message, type: 'error' });
            }
            setShowGuidelinesModal(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-white relative overflow-hidden">

            {/* --- CUSTOM NOTIFICATION UI --- */}
            {notification && (
                <div className={`fixed top-5 right-5 z-[9999] flex items-center p-4 rounded-lg shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
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

            {/* --- COMMUNITY GUIDELINES INTERCEPT MODAL --- */}
            {showGuidelinesModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-3 shrink-0">
                            <div className="p-2 bg-[#03230F]/10 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-[#03230F]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#03230F]">AgroLink Community Guidelines</h2>
                                <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">Safety & Trust Rules</p>
                            </div>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <p className="text-sm text-gray-600 mb-6 font-medium bg-blue-50 p-3 rounded-lg border border-blue-100">
                                To ensure a safe and profitable environment for everyone, please read and acknowledge our community rules before finalizing your account.
                            </p>

                            <ul className="space-y-5">
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🛡️</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">1. Get Verified</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Build trust within the community by completing your profile verification. Farmers and buyers are more likely to trade with verified accounts.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🤝</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">2. Trade with Verified Users</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">For your safety, prioritize contacting and dealing with users who have the "Verified" badge.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">💬</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">3. Communicate & Request Proof</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Always use the in-app chat to communicate. Ask for real-time images and confirm product details before finalizing any orders.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">📍</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">4. Shop Local to Save</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">You and the buyer are responsible for coordinating delivery. Deal locally to minimize travel time and delivery costs!</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">💵</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">5. Cash on Delivery (COD) Only</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">While we are developing a highly secure online payment gateway, <strong>all platform transactions are strictly Cash on Delivery</strong>. Do not send money online.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">⭐</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">6. Check Ratings</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Always review the ratings and feedback of a buyer before agreeing to a trade.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🚩</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">7. Report Suspicious Activity</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Help us keep AgroLink safe! Use the "Report" button immediately if you encounter fraud, fake items, or unfair behavior.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowGuidelinesModal(false)}
                                disabled={isLoading}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmRegistration}
                                disabled={isLoading}
                                className="px-6 py-3 bg-[#03230F] text-[#EEC044] font-bold rounded-xl shadow-lg hover:bg-[#03230F]/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center min-w-[200px]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-[#EEC044] border-t-transparent rounded-full animate-spin"></div>
                                        Registering...
                                    </span>
                                ) : (
                                    "I Acknowledge & Register"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-screen flex">
                <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
                    <div className="relative z-10 flex flex-col px-8 py-10 md:px-12 max-w-md mx-auto w-full h-full overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#EEC044] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-yellow-400">
                        <div className="mb-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 leading-tight">Registration</h1>
                            <p className="text-[#EEC044] text-sm font-medium tracking-wide">Step 2: Farm Details</p>
                        </div>

                        {/* Note: handleSubmit now intercepts the form via handleInitialSubmit */}
                        <form onSubmit={handleInitialSubmit} className="flex flex-col space-y-4 w-full">
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

                            <button
                                type="submit"
                                disabled={isLoading || showGuidelinesModal}
                                className="w-full py-4 px-5 mt-4 bg-[#EEC044] text-[#03230F] font-bold rounded-xl shadow-lg hover:bg-yellow-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Complete Registration
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