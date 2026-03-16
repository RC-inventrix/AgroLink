"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-12 h-12 bg-[#EEC044] text-[#03230F] font-bold text-lg rounded-full shadow-lg hover:bg-[#d9a83d] transition-transform hover:scale-110"
            aria-label="Toggle Language"
        >
            {/* Show 'EN' if currently in Sinhala, and 'සි' if currently in English, prompting what they will switch to */}
            {language === 'en' ? 'සි' : 'EN'}
        </button>
    );
}