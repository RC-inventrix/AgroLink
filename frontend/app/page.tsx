"use client"
import Link from "next/link"
import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
    Leaf,
    ShoppingCart,
    Users,
    MessageCircle,
    Lock,
    ChevronRight,
} from "lucide-react"
import Footer from "@/components/Footer";
import Headerall from "@/components/Headerall";
import { useLanguage } from "@/context/LanguageContext";

// Component for the counting animation
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number, suffix?: string, duration?: number }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasAnimated]);

    useEffect(() => {
        if (hasAnimated) {
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                setCount(Math.floor(progress * end));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    setCount(end);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [hasAnimated, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

// Scroll Animation Wrapper Component
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (ref.current) observer.unobserve(ref.current);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default function AgroLinkHome() {
    const { t, language } = useLanguage()

    return (
        <div className="min-h-screen bg-white text-[#03230F]">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 25s linear infinite;
                }
            `}</style>
            
            {/* The new central Header component */}
            <Headerall />

            {/* Hero Section */}
            <section className="relative w-full h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] mt-14 sm:mt-16 flex flex-col items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/tom-nicholson-ptw2xsseqxm.jpeg")',
                    }}
                >
                    <div className="absolute inset-0 bg-black/35"></div>
                </div>

                <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 flex flex-col items-start justify-center h-full">
                    <div className="max-w-7xl mx-auto w-full space-y-4 sm:space-y-8">
                        <FadeIn>
                            <div className="max-w-2xl space-y-3 sm:space-y-4">
                                <h1
                                    className={`font-bold uppercase text-balance text-white ${
                                        language === "si"
                                            ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-snug"
                                            : "text-3xl sm:text-4xl md:text-5xl leading-tight"
                                    }`}
                                >
                                    {t("heroTitle")} <span className="text-[#EEC044]"><br/>{t("heroHighlight")}</span>
                                </h1>
                                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed max-w-xl">
                                    {t("heroDesc")}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
                                    <Link href="/register">
                                        <button className="px-6 sm:px-8 py-2 sm:py-3 bg-[#EEC044] text-[#03230F] rounded-lg font-semibold hover:bg-[#d9a83d] transition shadow-lg w-fit text-sm sm:text-base">
                                            {t("getStarted")}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Innovation Section */}
            <section className="bg-[#03230F] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-[#EEC044]/10">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12 lg:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-2xl leading-tight">
                                {t("homeInnovationTitle1")} <span className="text-[#EEC044]">{t("homeInnovationTitle2")}</span>
                            </h2>
                            <p className="text-gray-300 max-w-md text-sm sm:text-base leading-relaxed lg:mt-2">
                                {t("homeInnovationDesc")}
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <FadeIn delay={200}>
                            <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] relative flex items-center justify-center">
                                <Image
                                    src="/images/Art.png"
                                    alt="Farming Innovation Art"
                                    layout="fill"
                                    objectFit="contain"
                                />
                            </div>
                        </FadeIn>

                        <div className="flex flex-col space-y-10 lg:pl-12">
                            <FadeIn delay={300}>
                                <div className="space-y-2">
                                    <h3 className="text-5xl sm:text-7xl font-light tracking-tight text-[#EEC044]">
                                        <AnimatedCounter end={100} suffix="%" duration={2000} />
                                    </h3>
                                    <h4 className="text-xl sm:text-2xl font-medium text-white/90">{t("homeStat1Title")}</h4>
                                    <p className="text-gray-400 text-sm sm:text-base">{t("homeStat1Desc")}</p>
                                </div>
                            </FadeIn>

                            <FadeIn delay={400}>
                                <div className="space-y-2">
                                    <h3 className="text-5xl sm:text-7xl font-light tracking-tight text-[#EEC044]">
                                        <AnimatedCounter end={100} suffix="%" duration={2000} />
                                    </h3>
                                    <h4 className="text-xl sm:text-2xl font-medium text-white/90">{t("homeStat2Title")}</h4>
                                    <p className="text-gray-400 text-sm sm:text-base">{t("homeStat2Desc")}</p>
                                </div>
                            </FadeIn>

                            <FadeIn delay={500}>
                                <div className="space-y-2">
                                    <h3 className="text-5xl sm:text-7xl font-light tracking-tight text-[#EEC044]">
                                        <AnimatedCounter end={100} suffix="%" duration={2000} />
                                    </h3>
                                    <h4 className="text-xl sm:text-2xl font-medium text-white/90">{t("homeStat3Title")}</h4>
                                    <p className="text-gray-400 text-sm sm:text-base">{t("homeStat3Desc")}</p>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee Section */}
            <div className="w-full py-4 sm:py-5 overflow-hidden bg-[#03230F] text-white relative z-10 border-y-2 border-[#EEC044]/20">
                <div className="flex gap-8 sm:gap-12 w-max animate-marquee">
                    {/* Rendered twice for seamless loop */}
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-8 sm:gap-12 text-sm sm:text-base lg:text-lg tracking-widest whitespace-nowrap uppercase font-medium">
                            <div className="flex items-center">{t("homeMarquee1")} <span className="text-[#EEC044] ml-8 sm:ml-12">✦</span></div>
                            <div className="flex items-center">{t("homeMarquee2")} <span className="text-[#EEC044] ml-8 sm:ml-12">✦</span></div>
                            <div className="flex items-center">{t("homeMarquee3")} <span className="text-[#EEC044] ml-8 sm:ml-12">✦</span></div>
                            <div className="flex items-center">{t("homeMarquee4")} <span className="text-[#EEC044] ml-8 sm:ml-12">✦</span></div>
                            <div className="flex items-center">{t("homeMarquee5")} <span className="text-[#EEC044] ml-8 sm:ml-12">✦</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-2xl leading-tight text-center mx-auto text-[#03230F]">
                                {t("featuresTitle")}
                            </h2>
                            <p className="text-sm sm:text-base md:text-xl text-gray-600 mt-2">
                                {t("featuresSubtitle")}
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <FadeIn delay={100}>
                            <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition h-full">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Leaf className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat1Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("feat1Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={200}>
                            <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition h-full">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <ShoppingCart className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat2Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("feat2Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={300}>
                            <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition h-full">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Users className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat3Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("feat3Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={400}>
                            <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition h-full">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <MessageCircle className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat4Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("feat4Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={500}>
                            <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition h-full">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Lock className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat5Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("feat5Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={600}>
                            <div className="p-4 sm:p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-[#EEC044] hover:shadow-lg transition h-full">
                                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#EEC044] rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <Leaf className="text-[#03230F] w-5 sm:w-6 h-5 sm:h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#03230F] mb-2">{t("feat6Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("feat6Desc")}
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-8 sm:mb-12">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-2xl leading-tight text-center mx-auto text-[#03230F]">
                                {t("howItWorksTitle")}
                            </h2>
                            <p className="text-sm sm:text-base md:text-xl text-gray-600 mt-2">
                                {t("howItWorksSubtitle")}
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8">
                        <FadeIn delay={100}>
                            <div className="text-center h-full">
                                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                                    <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">1</span>
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">{t("step1Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("step1Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={300}>
                            <div className="text-center h-full relative">
                                <div className="hidden sm:flex absolute -left-8 top-8 items-center justify-center">
                                    <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8 text-[#EEC044]" />
                                </div>
                                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                                    <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">2</span>
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">{t("step2Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("step2Desc")}
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={500}>
                            <div className="text-center h-full relative">
                                <div className="hidden sm:flex absolute -left-8 top-8 items-center justify-center">
                                    <ChevronRight className="w-6 sm:w-8 h-6 sm:h-8 text-[#EEC044]" />
                                </div>
                                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#EEC044] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                                    <span className="text-2xl sm:text-3xl font-bold text-[#03230F]">3</span>
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#03230F] mb-2 sm:mb-3">{t("step3Title")}</h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                    {t("step3Desc")}
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                id="about"
                className="py-12 sm:py-16 md:py-20 px-3 sm:px-6 lg:px-8 bg-gradient-to-r from-[#03230F] to-[#03230F] text-white"
            >
                <div className="max-w-7xl mx-auto text-center space-y-4 sm:space-y-6">
                    <FadeIn delay={100}>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
                            {t("ctaTitle")}
                        </h2>
                    </FadeIn>
                    <FadeIn delay={300}>
                        <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto">
                            {t("ctaDesc")}
                        </p>
                    </FadeIn>
                    <FadeIn delay={500}>
                        <Link href="/register">
                            <button className="mt-4 px-6 sm:px-10 py-2.5 sm:py-4 bg-[#EEC044] text-[#03230F] rounded-lg font-semibold text-sm sm:text-base lg:text-lg hover:bg-[#d9a83d] transition inline-block">
                                {t("createAccount")}
                            </button>
                        </Link>
                    </FadeIn>
                </div>
            </section>
            
            <Footer/>
        </div>
    )
}