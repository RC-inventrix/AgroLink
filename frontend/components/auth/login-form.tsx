"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Leaf } from "lucide-react"
import { useRouter } from "next/navigation" // Use Next.js Router

// If you had a RoleSelect component, ensure it's imported correctly.
// For simplicity, I've replaced it with a simple select here, or import it if you have it.
// import RoleSelect from "./role-select"

export default function LoginForm() {
    const router = useRouter()
    const [identifier, setIdentifier] = useState("") // Renamed email to identifier (matches backend DTO)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Backend expects "identifier" (email/username) and "password"
                body: JSON.stringify({ identifier, password }),
            })

            if (response.ok) {
                const token = await response.text() // Or .json() if your backend returns JSON
                localStorage.setItem("token", token) // Save JWT
                alert("Login Successful!")
                router.push("/") // Redirect to Home or Dashboard
            } else {
                alert("Login Failed. Please check your credentials.")
            }
        } catch (error) {
            console.error("Login error:", error)
            alert("Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-[#EEC044] rounded-lg flex items-center justify-center shadow-md">
                        <Leaf className="w-6 h-6 text-[#03230F]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">AgroLink</h1>
                </div>
                <p className="text-sm text-[#EEC044]">Agricultural Marketplace Platform</p>
            </div>

            {/* Login Card */}
            <div className="w-full">
                <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Email/Identifier Input */}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg text-white bg-[rgba(3,35,15,0.5)] border-2 border-[#03230F] focus:outline-none focus:ring-2 focus:ring-[#EEC044]"
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-white mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg text-white bg-[rgba(3,35,15,0.5)] border-2 border-[#03230F] focus:outline-none focus:ring-2 focus:ring-[#EEC044] pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full font-semibold py-3 rounded-lg bg-[#EEC044] text-[#03230F] hover:bg-[#d9a83d] transition-all disabled:opacity-75"
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    )
}