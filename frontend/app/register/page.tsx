"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Linkedin, Twitter, X, Check, AlertCircle } from "lucide-react"

export default function RegistrationStep1() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        repeatPassword: "",
        role: "Farmer",
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Phone number validation: Only allow numbers and max 10 digits
        if (name === "phone") {
            const onlyNums = value.replace(/[^0-9]/g, "");
            if (onlyNums.length <= 10) {
                setFormData({ ...formData, [name]: onlyNums });
            }
            return;
        }

        setFormData({ ...formData, [name]: value })
    }

    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, role: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setNotification(null)

        // 1. Client-Side Validation Logic
        if (Object.values(formData).some((x) => x.trim() === "")) {
            setNotification({ message: "Please fill in all fields", type: 'error' });
            return
        }

        // Phone Validation (Exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            setNotification({ message: "Phone number must be exactly 10 digits", type: 'error' });
            return
        }

        // Strong Password Validation
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setNotification({ 
                message: "Password must have 8+ chars, include uppercase, lowercase, number & special character", 
                type: 'error' 
            });
            return
        }

        if (formData.password !== formData.repeatPassword) {
            setNotification({ message: "Passwords do not match", type: 'error' });
            return
        }

        setIsLoading(true)

        // 2. Backend Email Uniqueness Check
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            
            const checkResponse = await fetch(`${baseUrl}/auth/check-email?email=${formData.email}`);
            
            if (checkResponse.status === 409 || checkResponse.status === 400) {
                const errorMsg = await checkResponse.text();
                throw new Error(errorMsg || "This email is already registered.");
            }

            if (!checkResponse.ok) {
                throw new Error("Connection failed. Please try again.");
            }

            // 3. Save Data & Redirect Logic (Only if unique)
            sessionStorage.setItem("registerDataStep1", JSON.stringify(formData))
            
            setNotification({ message: "Step 1 complete! Moving to next step...", type: 'success' });

            setTimeout(() => {
                if (formData.role === "Farmer") {
                    router.push("/register/farmer")
                } else {
                    router.push("/register/buyer")
                }
            }, 1000)

        } catch (err: any) {
            setNotification({ 
                message: err.message || "An unexpected error occurred.", 
                type: 'error' 
            });
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
                        <p className="font-medium pr-4 text-sm">{notification.message}</p>
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
                    <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 max-w-md mx-auto w-full h-full justify-center">
                        <div className="mb-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">Registration</h1>
                            <p className="text-[#EEC044] text-sm font-medium">Step 1: Create your account</p>
                        </div>

                        {/* Reduced space-y to 3 to keep it in one frame */}
                        <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-full">
                            
                            <div>
                                <label className="text-white/80 text-xs font-semibold mb-1 block">Full Name</label>
                                <input type="text" name="fullname" value={formData.fullname} placeholder="John Doe" onChange={handleInputChange} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <div>
                                <label className="text-white/80 text-xs font-semibold mb-1 block">Email Address</label>
                                <input type="email" name="email" value={formData.email} placeholder="johndoe@example.com" onChange={handleInputChange} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <div>
                                <label className="text-white/80 text-xs font-semibold mb-1 block">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} placeholder="07XXXXXXXX" onChange={handleInputChange} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <div>
                                <label className="text-white/80 text-xs font-semibold mb-1 block">Password</label>
                                <input type="password" name="password" value={formData.password} placeholder="••••••••" onChange={handleInputChange} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <div>
                                <label className="text-white/80 text-xs font-semibold mb-1 block">Repeat Password</label>
                                <input type="password" name="repeatPassword" value={formData.repeatPassword} placeholder="••••••••" onChange={handleInputChange} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044] transition-all" required />
                            </div>

                            <div className="pt-1">
                                <label className="text-white font-semibold text-xs mb-2 block">Select Role</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center cursor-pointer text-white text-sm">
                                        <input type="radio" name="role" value="Farmer" checked={formData.role === "Farmer"} onChange={handleRoleChange} className="accent-[#EEC044] h-4 w-4 mr-2" /> Farmer
                                    </label>
                                    <label className="flex items-center cursor-pointer text-white text-sm">
                                        <input type="radio" name="role" value="Buyer" checked={formData.role === "Buyer"} onChange={handleRoleChange} className="accent-[#EEC044] h-4 w-4 mr-2" /> Buyer
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full py-2.5 px-6 mt-2 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300 transition-all active:scale-[0.98] disabled:opacity-50">
                                {isLoading ? "Processing..." : "Next Page"}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <span className="text-white/80 text-sm">
                                Do you have an account? <Link href="/login" className="text-[#EEC044] font-semibold hover:underline">Login</Link>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex w-1/2 relative">
                    <img src="/farmer-background.png" alt="Farming background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
            </div>
        </main>
    )
}