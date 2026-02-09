import Image from "next/image";
import React from "react";

export default function Footer() {
    return (
        <footer className= "text-white" style={{ backgroundColor: "#03230F" }}>
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
                    <h3 className="font-bold mb-2">Explore</h3>
                    <p>About</p>
                    <p>Features</p>
                    <p>Meet the Farmers</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">News</h3>
                    <p>Bringing Food Production Back To Cities</p>
                    <p>The Future of Farming</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">Contact</h3>
                    <p>📞 +94 70 322 4356</p>
                    <p>✉️ Agrolink@gmail.com</p>
                    <p>📍 Matara, Srilanka</p>
                </div>
            </div>
        </footer>
    );
}
