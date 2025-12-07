"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Linkedin, Twitter, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      email: "",
      password: "",
    })

    alert(`Welcome back! Login successful for ${formData.email}`)
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">Login</h1>
            <p className="text-[#EEC044] text-sm font-medium">Welcome back to AgroLink</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
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

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#EEC044] cursor-pointer rounded"
                />
                <span className="text-white/80 ml-2">Remember me</span>
              </label>
              <a href="#" className="text-[#EEC044] hover:underline font-semibold">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-6 mt-3 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300 transition-colors active:scale-95 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Success Message */}
          {submittedData && (
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 text-xs text-center">✓ Successfully logged in: {submittedData.email}</p>
            </div>
          )}

          {/* Register Link */}
          <div className="mt-4 text-center">
            <span className="text-white/80 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#EEC044] font-semibold hover:underline">
                Register
              </Link>
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
