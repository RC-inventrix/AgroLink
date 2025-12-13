"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // Added for navigation
import { Mail, Linkedin, Twitter } from "lucide-react"

export default function RegistrationStep1() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullname: "", // Changed to match Backend DTO (fullname)
        email: "",
        phone: "",
        password: "",
        repeatPassword: "",
        role: "Farmer", // Default
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, role: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // 1. Validation Logic
        if (Object.values(formData).some((x) => x.trim() === "")) {
            alert("Please fill in all fields")
            return
        }
        if (formData.password !== formData.repeatPassword) {
            alert("Passwords do not match")
            return
        }

        setIsLoading(true)

        // 2. Save Data & Redirect Logic
        sessionStorage.setItem("registerDataStep1", JSON.stringify(formData))

        if (formData.role === "Farmer") {
            router.push("/register/farmer")
        } else {
            router.push("/register/buyer")
        }
        setIsLoading(false)
    }

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
                <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">Registration</h1>
                        <p className="text-[#EEC044] text-sm font-medium">Step 1: Create your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                        <input type="text" name="fullname" placeholder="Full Name" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="email" name="email" placeholder="Email" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="password" name="password" placeholder="Password" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />
                        <input type="password" name="repeatPassword" placeholder="Repeat Password" onChange={handleInputChange} className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044]" required />

                        <div className="pt-1">
                            <label className="text-white font-semibold text-sm mb-2 block">Select Role</label>
                            <div className="flex gap-6">
                                <label className="flex items-center cursor-pointer text-white">
                                    <input type="radio" name="role" value="Farmer" checked={formData.role === "Farmer"} onChange={handleRoleChange} className="accent-[#EEC044] mr-2" /> Farmer
                                </label>
                                <label className="flex items-center cursor-pointer text-white">
                                    <input type="radio" name="role" value="Buyer" checked={formData.role === "Buyer"} onChange={handleRoleChange} className="accent-[#EEC044] mr-2" /> Buyer
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full py-2.5 px-6 mt-3 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300 transition-colors">
                            {isLoading ? "Processing..." : "Next Page"}
                        </button>
                    </form>

                    <div className="mt-3 text-center">
            <span className="text-white/80 text-sm">
              Do you have an account? <Link href="/auth/login" className="text-[#EEC044] font-semibold hover:underline">Login</Link>
            </span>
                    </div>
                </div>
            </div>

            {/* Right Side Image (Keep your existing image logic here) */}
            <div className="hidden lg:flex w-1/2 relative">
                <img src="/farmer-background.png" alt="Farming background" className="w-full h-full object-cover" />
            </div>
        </div>
    )
}