"use client";

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Footer from "@/components/Footer";
import Headerall from "@/components/Headerall";
import { motion, Variants } from "framer-motion";

export default function AboutPage() {
    // Animation settings for reuse
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
                            Empowering
                            <span className="text-[#EEC044] block my-2 sm:my-3">
                                Sustainable Agriculture
                            </span>
                            Through Technology
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed text-center max-w-2xl mx-auto">
                            AgroLink is revolutionizing the agricultural marketplace by connecting farmers directly with buyers, ensuring fair prices, transparency, and sustainable farming practices for a better tomorrow.
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
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-[#03230F] mb-6">{"Our Mission"}</h2>
                                <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                                    {
                                        "We believe in creating a direct connection between those who grow our food and those who consume it. By eliminating intermediaries, we ensure farmers receive fair compensation while buyers access fresh, quality produce."
                                    }
                                </p>
                                <p className="text-lg text-foreground/80 leading-relaxed">
                                    {
                                        "Our platform promotes sustainable agricultural practices, supports local farming communities, and contributes to food security for all."
                                    }
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
                            {"Our Core Values"}
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
                                        <h3 className="text-xl font-bold text-[#004d2b] mb-3">{"Fair Trade"}</h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {
                                                "We ensure transparent pricing and fair compensation for farmers, creating a sustainable ecosystem for all participants."
                                            }
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
                                        <h3 className="text-xl font-bold text-[#004d2b] mb-3">{"Sustainability"}</h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {
                                                "Supporting eco-friendly farming practices that protect our planet while delivering nutritious, quality produce."
                                            }
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
                                        <h3 className="text-xl font-bold text-[#004d2b] mb-3">{"Innovation"}</h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {
                                                "Leveraging technology to create efficient, user-friendly solutions that modernize agricultural commerce."
                                            }
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
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-[#EEC044] mb-6">{"Our Story"}</h2>
                                <p className="text-lg text-white/80 leading-relaxed mb-4">
                                    {
                                        "Founded by a team of agricultural enthusiasts and technology innovators, AgroLink emerged from a simple observation: the gap between farmers and consumers was hurting both parties."
                                    }
                                </p>
                                <p className="text-lg text-white/80 leading-relaxed mb-4">
                                    {
                                        "We set out to build a platform that would bridge this gap, creating a marketplace where quality meets fairness, and sustainability drives growth."
                                    }
                                </p>
                                <p className="text-lg text-white/80 leading-relaxed">
                                    {
                                        "Today, we're proud to serve thousands of farmers and buyers, facilitating transparent transactions that benefit everyone involved."
                                    }
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
                            {"Join the Future of Digital Agriculture Today!"}
                        </h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed text-pretty">
                            {
                                "Be part of a thriving community connecting farmers and buyers for sustainable, fair-trade agriculture. Start your journey now."
                            }
                        </p>
                    </motion.div>
                </div>
            </section>
            
            <Footer />
        </div>
    )
}