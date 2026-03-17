import Image from "next/image";
import React from "react";

export default function Footer() {
    return (
        <footer
            className="text-white relative z-10 border-t border-[#EEC044]/10 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: "#03230F" }}
        >
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-10 text-sm">
                <div>
                    <Image
                        src="/images/Group-6.png"
                        alt="AgroLink Logo"
                        width={150}
                        height={50}
                        className="object-contain w-full h-auto"
                        style={{ width: "150px" }}
                    />
                </div>

                <div>
                    <h3 className="font-bold mb-2 text-[#EEC044]">Explore</h3>
                    <p className="hover:text-gray-300 cursor-pointer transition">About</p>
                    <p className="hover:text-gray-300 cursor-pointer transition mt-2">Features</p>
                    <p className="hover:text-gray-300 cursor-pointer transition mt-2">Meet the Farmers</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2 text-[#EEC044]">News</h3>
                    <p className="hover:text-gray-300 cursor-pointer transition">Bringing Food Production Back To Cities</p>
                    <p className="hover:text-gray-300 cursor-pointer transition mt-2">The Future of Farming</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2 text-[#EEC044]">Contact</h3>
                    <p className="mt-2">📞 +94 70 322 4356</p>
                    <p className="mt-2">✉️ Agrolink@gmail.com</p>
                    <p className="mt-2">📍 Matara, Sri Lanka</p>
                </div>
            </div>
        </footer>
    );
}