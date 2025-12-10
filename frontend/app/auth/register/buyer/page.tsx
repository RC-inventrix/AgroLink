"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Linkedin, Twitter, Upload } from "lucide-react"

export default function FarmerRegistration() {
  const [formData, setFormData] = useState({
    businessName: "",
    deliveryAddress: "",
    district: "",
    zipCode: "",
    accountType: "individual",
    image: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.deliveryAddress || !formData.district || !formData.zipCode || !formData.image) {
      alert("Please fill in all required fields and upload an image")
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmittedData(formData)
    setIsLoading(false)

    setFormData({
      businessName: "",
      deliveryAddress: "",
      district: "",
      zipCode: "",
      accountType: "individual",
      image: null,
    })
    setImagePreview("")

    alert("Registration successful! Proceeding to next page")
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col relative bg-[#03230F] bg-opacity-90">
        <div className="relative z-10 flex flex-col px-8 pt-2 md:px-12 md:pt-3 max-w-md mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">Registration</h1>
            <p className="text-[#EEC044] text-sm font-medium">Creating a free account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
            <div>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name (Optional)"
                value={formData.businessName}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            <div>
              <input
                type="text"
                name="deliveryAddress"
                placeholder="Delivery Address"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            <div>
              <input
                type="text"
                name="district"
                placeholder="District / Province"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            <div>
              <input
                type="text"
                name="zipCode"
                placeholder="ZIP Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              />
            </div>

            <div>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm"
              >
                <option value="individual" className="bg-[#03230F] text-white">
                  Individual
                </option>
                <option value="business" className="bg-[#03230F] text-white">
                  Business
                </option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">Upload Verification Image</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="imageInput" />
                <label
                  htmlFor="imageInput"
                  className="w-full px-5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white/60 hover:text-white cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:border-transparent shadow-lg transition-all text-sm hover:bg-white/20"
                >
                  <Upload size={16} />
                  {imagePreview ? "Image Selected" : "Choose Image"}
                </label>
              </div>
              {imagePreview && (
                <div className="mt-2 relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg border border-white/20"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-6 mt-3 bg-[#EEC044] text-[#03230F] font-bold rounded-lg shadow-lg hover:bg-yellow-300 transition-colors active:scale-95 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Processing..." : "Register"}
            </button>
          </form>

          {submittedData && (
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 text-xs text-center">✓ Successfully registered</p>
            </div>
          )}

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
        <div className="absolute inset-0 bg-black/30"></div>

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
