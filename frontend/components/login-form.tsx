"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image";

export default function LoginForm() {
    const router = useRouter()
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            
            // Logic updated to use the /auth/login endpoint from AuthController.java
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    identifier: identifier, // Matches LoginRequest DTO
                    password: password 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend returns specific error messages in a Map
                if (response.status === 401) {
                    throw new Error(data.message || "Incorrect email or password.");
                } else if (response.status === 403) {
                    throw new Error(data.message || "Your account is temporarily disabled.");
                } else if (response.status === 500) {
                    throw new Error("Server is currently down. Please try again later.");
                }
                throw new Error(data.message || "Login failed.");
            }

            // SUCCESS LOGIC: Store user data based on AuthResponse
            sessionStorage.setItem("token", data.token); 
            sessionStorage.setItem("userRole", data.role);
            sessionStorage.setItem("userEmail", data.email);
            sessionStorage.setItem("id", data.id); // userId from backend response

            // REDIRECTION LOGIC
            const role = data.role.toLowerCase();
            if (role === "buyer") {
                router.push("/buyer/dashboard");
            } else if (role === "farmer") {
                router.push("/seller/dashboard");
            } else {
                router.push("/dashboard");
            }
        
        } catch (err: any) {
            if (err.message === "Failed to fetch") {
                setError("Unable to connect to the server. Please check your internet.");
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Logo Section */}
            <div className="mb-8 text-center">
                <div className="mb-8 flex justify-center items-center">
                    <Image
                        src="/images/Group-6.png"
                        alt="AgroLink Logo"
                        width={280}
                        height={64}
                        className="h-8 sm:h-12 w-auto"
                    />
                </div>
            </div>

            {/* Login Card */}
            <div className="w-full">
                <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
                <p className="text-sm mb-8" style={{ color: "#EEC044" }}>
                    Enter your credentials to continue
                </p>

                {/* ERROR ALERT BOX */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                            Email Address / Username
                        </label>
                        <input
                            id="email"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="text-right">
                        <a
                            href="/forgot-password"
                            className="text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color: "#EEC044" }}
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-black"
                        style={{ backgroundColor: "#EEC044" }}
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </button>

                    <div className="relative my-6">
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2 text-gray-400">New to AgroLink?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-300">
                            Don't have an account?{" "}
                            <a
                                href="/register"
                                className="font-semibold transition-colors hover:opacity-80"
                                style={{ color: "#EEC044" }}
                            >
                                Create one
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}