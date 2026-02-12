import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Footer from "@/components/Footer";
export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">


            <nav className="fixed top-0 w-full z-50 bg-[#03230F] shadow-md h-14 sm:h-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">

                        {/* Logo Section */}
                        <div className="flex items-center gap-2">
                            <Image
                                src="/images/Group-6.png"
                                alt="AgroLink Logo"
                                width={180}
                                height={64}
                                className="h-8 sm:h-12 w-auto"
                            />
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-5 lg:gap-15">
                            <Link href="/" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                Home
                            </Link>
                            <Link href="/about" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                About
                            </Link>
                            <Link href="/features" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                                Features
                            </Link>
                        </div>

                        {/* Auth Buttons - Desktop */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">
                            <Link href="/login">
                                <button className="px-3 lg:px-4 py-1.5 lg:py-2 border-2 border-[#EEC044] text-white text-sm lg:text-base rounded-full hover:bg-[#EEC044] hover:text-[#03230F] transition font-semibold">
                                    Login
                                </button>
                            </Link>

                            <Link href="/register">
                                <button className="px-4 lg:px-6 py-1.5 lg:py-2 bg-[#EEC044] text-[#03230F] text-sm lg:text-base rounded-full hover:bg-[#d9a83d] transition font-semibold">
                                    Register
                                </button>
                            </Link>
                        </div>

                    </div>
                </div>
            </nav>



            {/* Hero Section */}
            <section className="bg-[#03230F] text-white py-20 pt-24 md:pt-32">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
                            {"Empowering "}
                            <span className="text-[#EEC044]">{"Sustainable Agriculture"}</span>
                            {" Through Technology"}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed text-pretty">
                            {
                                "AgroLink is revolutionizing the agricultural marketplace by connecting farmers directly with buyers, ensuring fair prices, transparency, and sustainable farming practices for a better tomorrow."
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-[#03230F] mb-6">{"Our Mission"}</h2>
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
                            </div>
                            <div className="relative h-[400px] rounded-lg overflow-hidden bg-[#03230F]/10">
                                <img
                                    src="about-us/farmers-working-in-green-agricultural-fields.jpg"
                                    alt="Farmers working in fields"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#004d2b] text-center mb-12">{"Our Core Values"}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="border-2 border-[#D4A650]/20 hover:border-[#D4A650] transition-colors">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-[#D4A650] rounded-lg flex items-center justify-center mb-4">
                                        <span className="text-2xl">🤝</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#004d2b] mb-3">{"Fair Trade"}</h3>
                                    <p className="text-foreground/70 leading-relaxed">
                                        {
                                            "We ensure transparent pricing and fair compensation for farmers, creating a sustainable ecosystem for all participants."
                                        }
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-[#D4A650]/20 hover:border-[#D4A650] transition-colors">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-[#D4A650] rounded-lg flex items-center justify-center mb-4">
                                        <span className="text-2xl">🌱</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#004d2b] mb-3">{"Sustainability"}</h3>
                                    <p className="text-foreground/70 leading-relaxed">
                                        {
                                            "Supporting eco-friendly farming practices that protect our planet while delivering nutritious, quality produce."
                                        }
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-[#D4A650]/20 hover:border-[#D4A650] transition-colors">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-[#D4A650] rounded-lg flex items-center justify-center mb-4">
                                        <span className="text-2xl">💡</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#004d2b] mb-3">{"Innovation"}</h3>
                                    <p className="text-foreground/70 leading-relaxed">
                                        {
                                            "Leveraging technology to create efficient, user-friendly solutions that modernize agricultural commerce."
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1 relative h-[400px] rounded-lg overflow-hidden bg-[#004d2b]/10">
                                <img src="about-us/agricultural-marketplace-digital-platform-mobile-a.jpg" alt="AgroLink platform" className="w-full h-full object-cover" />
                            </div>
                            <div className="order-1 md:order-2">
                                <h2 className="text-3xl md:text-4xl font-bold text-[#004d2b] mb-6">{"Our Story"}</h2>
                                <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                                    {
                                        "Founded by a team of agricultural enthusiasts and technology innovators, AgroLink emerged from a simple observation: the gap between farmers and consumers was hurting both parties."
                                    }
                                </p>
                                <p className="text-lg text-foreground/80 leading-relaxed mb-4">
                                    {
                                        "We set out to build a platform that would bridge this gap, creating a marketplace where quality meets fairness, and sustainability drives growth."
                                    }
                                </p>
                                <p className="text-lg text-foreground/80 leading-relaxed">
                                    {
                                        "Today, we're proud to serve thousands of farmers and buyers, facilitating transparent transactions that benefit everyone involved."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#03230F]">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-balance">
                            {"Join the Future of Digital Agriculture Today!"}
                        </h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed text-pretty">
                            {
                                "Be part of a thriving community connecting farmers and buyers for sustainable, fair-trade agriculture. Start your journey now."
                            }
                        </p>

                    </div>
                </div>
            </section>
            <Footer />
            

        </div>
    )
}