"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link" // Import Link for navigation
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
    Facebook,
    Twitter,
    Instagram,
} from "lucide-react"

export default function AgroLinkHome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white text-[#03230F]">
            <nav className="fixed top-0 w-full z-50 bg-[#03230F] shadow-md h-14 sm:h-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center gap-2">
                            {/* Ensure image is in public/images/ */}
                            <Image
                                src="/images/group-206.png"
                                alt="AgroLink Logo"
                                width={180}
                                height={64}
                                className="h-8 sm:h-12 w-auto"
                            />
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6 lg:gap-8">
                            <a href="#" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                Home
                            </a>
                            <a href="#about" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                About
                            </a>
                            <a href="#features" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                Features
                            </a>
                            <a href="#contact" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                Contact
                            </a>
                        </div>

                        {/* Auth Buttons - Desktop */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">
                            <Link href="/auth/login">
                                <button className="px-3 lg:px-4 py-1.5 lg:py-2 border-2 border-[#EEC044] text-white text-sm lg:text-base rounded-full hover:bg-[#EEC044] hover:text-[#03230F] transition font-semibold">
                                    Login
                                </button>
                            </Link>
                            <Link href="/auth/register">
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
                            <Link href="/auth/login" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                Login
                            </Link>
                            <Link href="/auth/register" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ... (Rest of the Home Page Content remains exactly the same) ... */}
            {/* Just ensure image paths like "/images/tom-nicholson..." match your public folder */}

            <section className="relative w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] mt-14 sm:mt-16 flex flex-col items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/tom-nicholson-ptw2xsseqxm.jpeg")',
                    }}
                >
                    <div className="absolute inset-0 bg-black/35"></div>
                </div>
                {/* ... (Keep existing content) ... */}
            </section>

            {/* ... (Keep Features, How It Works, Footer sections) ... */}
        </div>
    )
}