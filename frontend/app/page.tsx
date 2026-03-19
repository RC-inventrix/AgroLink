"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
    Menu,
    X,
    Leaf,
    ShoppingCart,
    Users,
    MessageCircle,
    Lock,
    ChevronRight,

} from "lucide-react"
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function AgroLinkHome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { t, language } = useLanguage()

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
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-5 lg:gap-15">
                            <a href="#" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                {t("navHome")}
                            </a>
                            <a href="/about" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                {t("navAbout")}
                            </a>
                            <a
                                href="/features"
                                className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base"
                            >
                                {t("navFeatures")}
                            </a>
                            
                        </div>

                        {/* Auth Buttons - Desktop */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">

                           <Link href="/login">
                               <button className="px-3 lg:px-4 py-1.5 lg:py-2 border-2 border-[#EEC044] text-white text-sm lg:text-base rounded-full hover:bg-[#EEC044] hover:text-[#03230F] transition font-semibold">
                                   {t("login")}
                               </button>
                           </Link>
                            {/* Wrapped Register Button */}
                            <Link href="/register">
                                <button className="px-4 lg:px-6 py-1.5 lg:py-2 bg-[#EEC044] text-[#03230F] text-sm lg:text-base rounded-full hover:bg-[#d9a83d] transition font-semibold">
                                    {t("register")}
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
                                {t("navHome")}
                            </a>
                            <a href="#about" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                {t("navAbout")}
                            </a>
                            <a href="#features" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                {t("navFeatures")}
                            </a>
                            <a href="#contact" className="block text-white hover:text-[#EEC044] px-2 text-sm">
                                {t("navContact")}
                            </a>
                            <div className="flex gap-2 pt-2 px-2">
                                <button className="flex-1 px-3 py-2 border-2 border-[#EEC044] text-[#EEC044] rounded-full text-xs font-semibold">
                                    {t("login")}
                                </button>
                                {/* Wrapped Mobile Register Button */}
                                <Link href="/register" className="flex-1">
                                    <button className="w-full px-3 py-2 bg-[#EEC044] text-[#03230F] rounded-full text-xs font-semibold">
                                        {t("register")}
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
                            <h1
                                className={`font-bold text-white text-balance ${
                                    language === "si"
                                        ? "text-lg sm:text-xl md:text-3xl lg:text-4xl leading-snug"
                                        : "text-xl sm:text-2xl md:text-4xl lg:text-5xl leading-tight"
                                }`}
                            >
                                {t("heroTitle")} <span className="text-[#EEC044]">{t("heroHighlight")}</span>
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed max-w-xl">
                                {t("heroDesc")}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
                                {/* Wrapped Get Started Button */}
                                <Link href="/register">
                                    <button className="px-6 sm:px-8 py-2 sm:py-3 bg-[#EEC044] text-[#03230F] rounded-lg font-semibold hover:bg-[#d9a83d] transition shadow-lg w-fit text-sm sm:text-base">
                                        {t("getStarted")}
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
                            {t("featuresTitle")}
                        </h2>
                        <p className="text-sm sm:text-base md:text-xl text-gray-600">
                            {t("featuresSubtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Feature 1 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Leaf className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat1Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("feat1Desc")}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <ShoppingCart className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat2Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("feat2Desc")}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Users className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat3Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("feat3Desc")}
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <MessageCircle className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat4Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("feat4Desc")}
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Lock className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat5Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("feat5Desc")}
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <Leaf className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat6Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("feat6Desc")}
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
                            {t("howItWorksTitle")}
                        </h2>
                        <p className="text-sm sm:text-base md:text-xl text-gray-600">
                            {t("howItWorksSubtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">1</span>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">{t("step1Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("step1Desc")}
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
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">{t("step2Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("step2Desc")}
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
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">{t("step3Title")}</h3>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                {t("step3Desc")}
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
                        {t("ctaTitle")}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto">
                        {t("ctaDesc")}
                    </p>
                    {/* Wrapped Create Account Button */}
                    <Link href="/register">
                        <button className="px-6 sm:px-10 py-2.5 sm:py-4 bg-[#EEC044] text-[#03230F] rounded-lg font-semibold text-sm sm:text-base lg:text-lg hover:bg-[#d9a83d] transition inline-block">
                            {t("createAccount")}
                        </button>
                    </Link>
                </div>
            </section>
            <Footer/>
        </div>
    )
}