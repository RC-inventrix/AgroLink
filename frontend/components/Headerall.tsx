"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function Headerall() {

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#03230F] shadow-md h-14 sm:h-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">

                    {/* Logo Section */}
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
                        <Link href="/" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                            Home
                        </Link>
                        <Link href="/about" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                            About
                        </Link>
                        <Link href="/features" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                            Features
                        </Link>
                    </div>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <Link href="/login">
                            <button className="px-3 lg:px-4 py-1.5 lg:py-2 border-2 border-[#EEC044] text-white text-sm lg:text-base rounded-lg hover:bg-[#EEC044] hover:text-[#03230F] transition font-semibold">
                                Login
                            </button>
                        </Link>

                        <Link href="/register">
                            <button className="px-4 lg:px-6 py-1.5 lg:py-2 bg-[#EEC044] text-[#03230F] text-sm lg:text-base rounded-lg hover:bg-[#d9a83d] transition font-semibold">
                                Register
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-3 bg-[#03230F] border-t border-gray-700">
                        <Link href="/" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                            Home
                        </Link>
                        <Link href="/about" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                            About
                        </Link>
                        <Link href="/features" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                            Features
                        </Link>
                        <div className="flex gap-2 pt-2 px-2">
                            <Link href="/login" className="flex-1">
                                <button className="w-full px-3 py-2 border-2 border-[#EEC044] text-[#EEC044] rounded-lg text-xs font-semibold">
                                    Login
                                </button>
                            </Link>
                            <Link href="/register" className="flex-1">
                                <button className="w-full px-3 py-2 bg-[#EEC044] text-[#03230F] rounded-lg text-xs font-semibold">
                                    Register
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}