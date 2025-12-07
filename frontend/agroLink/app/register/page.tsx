"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Linkedin, Twitter } from "lucide-react"

export default function MainRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: "",
    role: "",
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allFieldsFilled = Object.values(formData).every((field) => field.trim() !== "")

    if (!allFieldsFilled) {
      alert("Please fill in all fields")
      return
    }

    if (formData.password !== formData.repeatPassword) {
      alert("Passwords do not match")
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmittedData(formData)
    setIsLoading(false)

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      repeatPassword: "",
      role: "",
    })

    alert(`Welcome to AgroLink! Proceeding to next page for ${formData.fullName}`)
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">Registration</h1>
            <p className="text-[#EEC044] text-sm font-medium">Creating a free account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            {/* Repeat Password */}
            <div>
              <input
                type="password"
                name="repeatPassword"
                placeholder="Repeat Password"
                value={formData.repeatPassword}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            {/* Select Role */}
            <div className="pt-1">
              <label className="text-white font-semibold text-sm mb-2 block">Select Role</label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="farmer"
                    checked={formData.role === "farmer"}
                    onChange={handleRoleChange}
                    className="w-4 h-4 accent-[#EEC044] cursor-pointer"
                  />
                  <span className="text-white ml-2 text-sm">Farmer</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === "buyer"}
                    onChange={handleRoleChange}
                    className="w-4 h-4 accent-[#EEC044] cursor-pointer"
                  />
                  <span className="text-white ml-2 text-sm">Buyer</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-6 mt-3 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300 transition-colors active:scale-95 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Processing..." : "Next Page"}
            </button>
          </form>

          {/* Success Message */}
          {submittedData && (
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 text-xs text-center">✓ Successfully registered: {submittedData.fullName}</p>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-3 text-center">
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
