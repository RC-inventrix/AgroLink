// app/page.tsx
import React from "react";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Navigation Bar */}
            <nav className="bg-black text-white flex items-center justify-between px-8 py-4">
                <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="Agrolink Logo" className="h-8 w-8" />
                    <span className="font-bold text-xl">Agrolink</span>
                </div>
                <ul className="hidden md:flex space-x-6">
                    <li className="hover:text-yellow-400"><Link href="/">Home</Link></li>
                    <li className="hover:text-yellow-400"><Link href="/about">About</Link></li>
                    <li className="hover:text-yellow-400"><Link href="/services">Services</Link></li>
                    <li className="hover:text-yellow-400"><Link href="/projects">Projects</Link></li>
                    <li className="hover:text-yellow-400"><Link href="/news">News</Link></li>
                    <li className="hover:text-yellow-400"><Link href="/shop">Shop</Link></li>
                    <li className="hover:text-yellow-400"><Link href="/contact">Contact</Link></li>
                </ul>
                <div className="flex items-center space-x-4 text-sm">
                    <span>Call anytime: +98 (000) 9630</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center py-16 space-y-12 px-4">
                {/* Search Products Form */}
                <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6">Search Products</h2>
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full border border-gray-300 p-2 rounded col-span-1 sm:col-span-2"
                        />
                        <select className="w-full border border-gray-300 p-2 rounded">
                            <option value="">All Categories</option>
                            <option value="fruits">Fruits</option>
                            <option value="vegetables">Vegetables</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Min Price"
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 col-span-1 sm:col-span-2"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </main>


            {/* Footer */}
            <footer className="bg-black text-gray-300 px-8 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white font-bold mb-4">Agrolink</h3>
                        <p className="text-gray-400 text-sm">
                            There are many variations of passages of lorem ipsum available, but the majority
                            suffer.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Explore</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about">About</Link></li>
                            <li><Link href="/services">Services</Link></li>
                            <li><Link href="/projects">Our Projects</Link></li>
                            <li><Link href="/meet-the-farmers">Meet the Farmers</Link></li>
                            <li><Link href="/news">Latest News</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">News</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li>Bringing Food Production Back To Cities - July 5, 2022</li>
                            <li>The Future of Farming, Smart Irrigation Solutions - July 5, 2022</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Contact</h4>
                        <p>📞 666 888 0000</p>
                        <p>📧 needhelp@company.com</p>
                        <p>📍 80 Brooklyn Golden Street, New York, USA</p>
                        <input
                            type="email"
                            placeholder="Your Email Address"
                            className="mt-2 w-full p-2 rounded text-black"
                        />
                    </div>
                </div>
                <p className="text-gray-500 text-center mt-8 text-sm">
                    © All Copyright 2025 by shamonez Themes | Terms of Use | Privacy Policy
                </p>
            </footer>
        </div>
    );
}
