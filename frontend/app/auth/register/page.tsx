"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Linkedin, Twitter } from "lucide-react"

export default function RegistrationStepOne() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullname: "", // Changed to match Backend DTO
        email: "",
        phone: "",
        password: "",
        repeatPassword: "",
        role: "Farmer", // Default value
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, role: e.target.value }) // Value should be "Farmer" or "Buyer"
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.repeatPassword) {
            alert("Passwords do not match")
            return
        }

        // 1. Save data to Session Storage
        sessionStorage.setItem("registerDataStep1", JSON.stringify(formData))

        // 2. Redirect based on Role
        if (formData.role === "Farmer") {
            router.push("/auth/register/farmer")
        } else {
            router.push("/auth/register/buyer")
        }
    }

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
                <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">Registration</h1>
                        <p className="text-[#EEC044] text-sm font-medium">Step 1: Create your login credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
                        <input type="text" name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleInputChange} className="input-field" required />
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="input-field" required />
                        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="input-field" required />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="input-field" required />
                        <input type="password" name="repeatPassword" placeholder="Repeat Password" value={formData.repeatPassword} onChange={handleInputChange} className="input-field" required />

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

                        <button type="submit" className="w-full py-2.5 bg-[#EEC044] text-[#03230F] font-bold rounded-lg mt-3 hover:bg-yellow-300 transition">Next Page</button>
                    </form>
                </div>
            </div>
            {/* Side Image Section (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900">
                {/* Add your image here */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>
        </div>
    )
}