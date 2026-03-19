"use client"

import { Card, CardContent } from "@/components/ui/card"
import Footer from "@/components/Footer";
import Headerall from "@/components/Headerall";
import { motion, Variants } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
    // 1. Initialize translation hook
    const { t } = useLanguage()

    // 2. Animation settings for reuse
    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-background">
            <Headerall />

            {/* Hero Section */}
            <section className="bg-[#03230F] text-white py-20 pt-24 md:pt-32 overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div 
                        className="max-w-4xl mx-auto flex flex-col items-center justify-center"
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-white text-center">
                            {t("aboutHeroPrefix")}
                            <span className="text-[#EEC044] block my-2 sm:my-3">
                                {t("aboutHeroHighlight")}
                            </span>
                            {t("aboutHeroSuffix")}
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed text-center max-w-2xl mx-auto">
                            {t("aboutHeroDesc")}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-[#03230F] mb-6">
                                    {t("aboutMissionTitle")}
                                </h2>
                                <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                                    {t("aboutMissionDesc1")}
                                </p>
                                <p className="text-lg text-foreground/80 leading-relaxed">
                                    {t("aboutMissionDesc2")}
                                </p>
                            </motion.div>
                            
                            <motion.div 
                                className="relative flex justify-center items-center min-h-[500px]"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            >
                                <img
                                    src="/images/3.png"
                                    alt="Farmers working in fields"
                                    className="w-full h-full object-contain scale-110 lg:scale-125 transform transition-transform" 
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-background overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <motion.h2 
                            className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-center text-[#03230F] mb-10"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={fadeInUp}
                        >
                            {t("aboutValuesTitle")}
                        </motion.h2>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="border-2 border-[#EEC044] transition-colors h-full">
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <span className="text-4xl">🤝</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-[#004d2b] mb-3">{t("aboutValue1Title")}</h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {t("aboutValue1Desc")}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Card 2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card className="border-2 border-[#EEC044] transition-colors h-full">
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <span className="text-4xl">🌱</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-[#004d2b] mb-3">{t("aboutValue2Title")}</h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {t("aboutValue2Desc")}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Card 3 */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <Card className="border-2 border-[#EEC044] transition-colors h-full">
                                    <CardContent className="p-6">
                                        <div className="mb-4">
                                            <span className="text-4xl">💡</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-[#004d2b] mb-3">{t("aboutValue3Title")}</h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {t("aboutValue3Desc")}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 bg-[#03230F] overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <motion.div 
                                className="order-2 md:order-1 relative flex justify-center items-center h-[400px]"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <img src="/images/2.png" alt="AgroLink platform" className="w-full h-full object-contain" />
                            </motion.div>
                            
                            <motion.div 
                                className="order-1 md:order-2"
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                            >
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-[#EEC044] mb-6">
                                    {t("aboutStoryTitle")}
                                </h2>
                                <p className="text-lg text-white/80 leading-relaxed mb-4">
                                    {t("aboutStoryDesc1")}
                                </p>
                                <p className="text-lg text-white/80 leading-relaxed mb-4">
                                    {t("aboutStoryDesc2")}
                                </p>
                                <p className="text-lg text-white/80 leading-relaxed">
                                    {t("aboutStoryDesc3")}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#03230F] overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div 
                        className="max-w-3xl mx-auto text-center border-t border-white/10 pt-10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-balance text-white mb-4">
                            {t("ctaTitle")}
                        </h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed text-pretty">
                            {t("ctaDesc")}
                        </p>
                    </motion.div>
                </div>
            </section>
            
            <Footer />
        </div>
    )
}