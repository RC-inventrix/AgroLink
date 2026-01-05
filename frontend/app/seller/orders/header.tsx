import Image from "next/image";
import React from "react";

export default function Header() {
    return (
        <header className="text-white" style={{ backgroundColor: "#03230F" }}>
            <div className="container mx-auto flex justify-between items-center px-6 py-4">

                {/* Logo */}
                <Image
                    src="/images/Group-6.png"
                    alt="AgroLink Logo"
                    width={150}
                    height={50}
                    className="object-contain"
                    style={{ width: "150px" }}
                />

                {/* Navigation */}
                <nav className="space-x-6 text-sm">
                    <a href="/" className="hover:text-yellow-300 transition">Home</a>
                    <a href="#" className="hover:text-yellow-300 transition">About</a>
                    <a href="#" className="hover:text-yellow-300 transition">Services</a>
                    <a href="#" className="hover:text-yellow-300 transition">Projects</a>
                    <a href="#" className="hover:text-yellow-300 transition">News</a>
                    <a href="#" className="hover:text-yellow-300 transition">Shop</a>
                    <a href="#" className="hover:text-yellow-300 transition">Contact</a>
                </nav>

            </div>
        </header>
    );
}
