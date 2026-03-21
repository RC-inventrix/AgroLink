"use client";

import Image from "next/image";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

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

                <div className="md:col-start-4">
                    <h3 className="font-bold mb-2 text-[#EEC044]">{t("footerContactTitle")}</h3>
                    {/* Phone and Email are kept hardcoded as they don't need translation */}
                    <p className="mt-2">📞 +94 70 322 4356</p>
                    <p className="mt-2">✉️ Agrolink@gmail.com</p>
                    <p className="mt-2">📍 {t("footerAddress")}</p>
                </div>
            </div>
        </footer>
    );
}