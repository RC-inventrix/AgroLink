"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
    Menu,
    X,
    Search,
    Leaf,
    ShoppingCart,
    Users,
    MessageCircle,
    Lock,
    ChevronRight,

} from "lucide-react"
import Footer from "@/components/Footer";

export default function AgroLinkHome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchTab, setSearchTab] = useState("products")

    useEffect(() => {
        const handleScroll = () => {
            // No longer needed with the new fixed navigation bar
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-white text-[#03230F]">
            <nav className="fixed top-0 w-full z-50 bg-[#03230F] shadow-md h-14 sm:h-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/Group-6.png"
                                alt="AgroLink Logo"
                                width={180}
                                height={64}
                                className="h-8 sm:h-12 w-auto"
                            />
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-5 lg:gap-15">
                            <a href="#" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                Home
                            </a>
                            <a href="/about" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                About
                            </a>
                            <a
                                href="/features"
                                className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base"
                            >
                                Features
                            </a>
                            
                        </div>

                        {/* Auth Buttons - Desktop */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">

                           <Link href="/login">
                               <button className="px-3 lg:px-4 py-1.5 lg:py-2 border-2 border-[#EEC044] text-white text-sm lg:text-base rounded-full hover:bg-[#EEC044] hover:text-[#03230F] transition font-semibold">
                                   Login
                               </button>
                           </Link>
                            {/* Wrapped Register Button */}
                            <Link href="/register">
                                <button className="px-4 lg:px-6 py-1.5 lg:py-2 bg-[#EEC044] text-[#03230F] text-sm lg:text-base rounded-full hover:bg-[#d9a83d] transition font-semibold">
                                    Register
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden pb-4 space-y-3 bg-[#03230F] border-t border-gray-700">
                            <a href="#" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                Home
                            </a>
                            <a href="#about" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                About
                            </a>
                            <a href="#features" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                Features
                            </a>
                            <a href="#contact" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                Contact
                            </a>
                            <div className="flex gap-2 pt-2 px-2">
                                <button className="flex-1 px-3 py-2 border-2 border-[#EEC044] text-[#EEC044] rounded-full text-xs font-semibold">
                                    Login
                                </button>
                                {/* Wrapped Mobile Register Button */}
                                <Link href="/register" className="flex-1">
                                    <button className="w-full px-3 py-2 bg-[#EEC044] text-[#03230F] rounded-full text-xs font-semibold">
                                        Register
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <section className="relative w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] mt-14 sm:mt-16 flex flex-col items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/tom-nicholson-ptw2xsseqxm.jpeg")',
                    }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/35"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 flex flex-col items-start justify-center h-full">
                    <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-8">
                        <div className="max-w-2xl space-y-3 sm:space-y-4">
                            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-white text-balance">
                                Connecting Farmers and Buyers for a Smarter <span className="text-[#EEC044]">Agro Marketplace</span>
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed max-w-xl">
                                Direct access to fresh produce, fair pricing, and secure transactions. AgroLink bridges the gap between
                                farmers and buyers for sustainable agriculture.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
                                {/* Wrapped Get Started Button */}
                                <Link href="/register">
                                    <button className="px-6 sm:px-8 py-2 sm:py-3 bg-[#EEC044] text-[#03230F] rounded-lg font-semibold hover:bg-[#d9a83d] transition shadow-lg w-fit text-sm sm:text-base">
                                        Get Started
                                    </button>
                                </Link>
                                
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            {/* Features Section */}
            <section id="features" className="py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#03230F] mb-2 sm:mb-4 text-balance">
                            Why Choose AgroLink?
                        </h2>
                        <p className="text-sm sm:text-base md:text-xl text-gray-600">
                            A complete platform designed for both farmers and buyers
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Feature 1 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Leaf className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">For Farmers</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Create listings, manage orders, get AI-powered price suggestions, and connect directly with buyers.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <ShoppingCart className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">For Buyers</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Search fresh products, post item requests, negotiate prices, and support local farmers directly.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Users className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">Dual Search System</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Search farmer products or create buyer requests. Find exactly what you need in our marketplace.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <MessageCircle className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">Chat & Reviews</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Real-time chat with buyers/farmers, ratings, reviews, and feedback to build trust and community.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Lock className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">Secure & Verified</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Role-based authentication, secure payments, and verified profiles for farmers, buyers, and admins.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Leaf className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">AI Price Insights</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Smart pricing suggestions based on market trends, demand, and product quality for fair deals.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#03230F] mb-2 sm:mb-4 text-balance">
                            How It Works
                        </h2>
                        <p className="text-sm sm:text-base md:text-xl text-gray-600">
                            Get started with AgroLink in three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">1</span>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">Sign Up</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Create your account as a Farmer, Buyer, or Admin. Verify your identity and set up your profile.
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center justify-center">
                            <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8 text-[#EEC044]" />
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">2</span>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">List or Search</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Farmers list vegetables with details. Buyers search products or post item requests.
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center justify-center">
                            <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8 text-[#EEC044]" />
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">3</span>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">Connect & Trade</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Chat, negotiate, place orders, and complete transactions securely. Leave reviews and build trust.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                id="about"
                className="py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-gradient-to-r from-[#03230F] to-[#03230F] text-white"
            >
                <div className="max-w-7xl mx-auto text-center space-y-4 sm:space-y-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
                        Join the Future of Digital Agriculture Today!
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto">
                        Be part of a thriving community connecting farmers and buyers for sustainable, fair-trade agriculture. Start
                        your journey now.
                    </p>
                    {/* Wrapped Create Account Button */}
                    <Link href="/register">
                        <button className="px-6 sm:px-10 py-2.5 sm:py-4 bg-[#EEC044] text-[#03230F] rounded-lg font-semibold text-sm sm:text-base lg:text-lg hover:bg-[#d9a83d] transition inline-block">
                            Create an Account
                        </button>
                    </Link>
                </div>
            </section>
            <Footer/>
        </div>
    )
}