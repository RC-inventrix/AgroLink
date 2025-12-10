"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Linkedin, Twitter } from "lucide-react"

export default function FarmerRegistration() {
  const [formData, setFormData] = useState({
    businessName: "",
    streetAddress: "",
    district: "",
    zipCode: "",
    registrationNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allFieldsFilled = Object.values(formData).every((field) => field.trim() !== "")

    if (!allFieldsFilled) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmittedData(formData)
    setIsLoading(false)

    setFormData({
      businessName: "",
      streetAddress: "",
      district: "",
      zipCode: "",
      registrationNumber: "",
    })

    alert(`Welcome to AgroLink! Registration successful for ${formData.businessName}`)
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-hidden bg-[#03230F] bg-opacity-90">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col px-8 pt-4 md:px-12 md:pt-6 lg:pt-8 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 leading-tight">Registration</h1>
            <p className="text-[#EEC044] text-sm font-medium">Creating a free account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
            {/* Business Name */}
            <div>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all"
              />
            </div>

            {/* Street Address */}
            <div>
              <input
                type="text"
                name="streetAddress"
                placeholder="Street Address"
                value={formData.streetAddress}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all"
              />
            </div>

            {/* District / Province */}
            <div>
              <input
                type="text"
                name="district"
                placeholder="District / Province"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <input
                type="text"
                name="zipCode"
                placeholder="ZIP Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all"
              />
            </div>

            {/* Registration Number */}
            <div>
              <input
                type="text"
                name="registrationNumber"
                placeholder="Business Registration / NIC Number"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-5 mt-2 bg-[#EEC044] text-[#03230F] font-bold rounded-xl shadow-lg hover:bg-yellow-300 transition-colors active:scale-95 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Success Message */}
          {submittedData && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
              <p className="text-green-200 text-sm text-center">
                ✓ Successfully registered: {submittedData.businessName}
              </p>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-4 text-center">
            <span className="text-white/80 text-sm">
              Do you have an account?{" "}
              <a href="#" className="text-[#EEC044] font-semibold hover:underline">
                Login
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 relative">
        <img src="/farmer-background.png" alt="Farming background" className="w-full h-full object-cover" />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Social Icons */}
        <div className="absolute bottom-8 right-8 flex gap-4">
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20"
          >
            <Mail size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20"
          >
            <Linkedin size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/20"
          >
            <Twitter size={18} />
          </a>
        </div>
      </div>
    </div>
  )
}
