"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Leaf } from "lucide-react"
import RoleSelect from "./role-select"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState("farmer")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      console.log("Login attempt:", { email, password, role: selectedRole })
    }, 1500)
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-white">AgroLink</h1>
        </div>
        <p className="text-sm" style={{ color: "#EEC044" }}>
          Agricultural Marketplace Platform
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full">
        <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
        <p className="text-sm mb-8" style={{ color: "#EEC044" }}>
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">I am a</label>
            <RoleSelect value={selectedRole} onChange={setSelectedRole} />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: "rgba(3, 35, 15, 0.5)",
                borderColor: "#03230F",
                border: "2px solid",
                color: "#FFFFFF",
              }}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-12"
                style={{
                  backgroundColor: "rgba(3, 35, 15, 0.5)",
                  borderColor: "#03230F",
                  border: "2px solid",
                  color: "#FFFFFF",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <a
              href="#forgot-password"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#EEC044" }}
            >
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-black"
            style={{ backgroundColor: "#EEC044" }}
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-gray-400">New to AgroLink?</span>
            </div>
          </div>

          {/* Registration Link */}
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Don't have an account?{" "}
              <a
                href="#register"
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: "#EEC044" }}
              >
                Create one
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Protected by industry-leading security</p>
      </div>
    </div>
  )
}
