"use client";

import Image from "next/image";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

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
                    <h3 className="font-bold mb-2">{t("footerExploreTitle")}</h3>
                    <p>{t("navAbout")}</p>
                    <p>{t("navFeatures")}</p>
                    <p>{t("footerMeetFarmers")}</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">{t("footerNewsTitle")}</h3>
                    <p>{t("footerNewsItem1")}</p>
                    <p>{t("footerNewsItem2")}</p>
                </div>

                <div>
                    <h3 className="font-bold mb-2">{t("footerContactTitle")}</h3>
                    <p>📞 +94 70 322 4356</p>
                    <p>✉️ Agrolink@gmail.com</p>
                    <p>📍 {t("footerAddress")}</p>
                </div>
            </div>
        </footer>
    );
}
