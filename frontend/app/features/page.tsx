"use client"

import {
    Sprout,
    ShoppingCart,
    TrendingUp,
    MessageSquare,
    Shield,
    MapPin,
    Bell,
    Star,
    Gavel,
    Search,
    BarChart3,
    Cloud,
    Bot,
    Truck,
} from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Headerall from "@/components/Headerall"
import Footer from "@/components/Footer"

const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
        },
    },
}

const staggerContainer: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
}

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background">
            <Headerall />

            {/* Hero Section */}
            <section className="bg-[#03230F] text-white py-20 pt-24 md:pt-32">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <motion.div
                        className="max-w-4xl mx-auto flex flex-col items-center justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-white text-center mb-6">
                            Powerful Features for
                            <span className="text-[#EEC044] block my-2 sm:my-3">
                                Modern Agriculture
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed text-center max-w-3xl mx-auto text-balance">
                            AgroLink connects farmers and buyers with cutting-edge technology, AI-powered insights, and seamless
                            marketplace functionality for sustainable, fair-trade agriculture.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-center text-[#03230F] mb-4">
                        Core Platform Features
                    </h2>
                    <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                        Everything you need to buy, sell, and manage agricultural products in one platform
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Sprout className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Product Management</CardTitle>
                                <CardDescription>Complete control over your listings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Create, edit, and delete product listings with ease</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Upload multiple images with prices and quantities</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Track availability and inventory in real-time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Set custom delivery options and pricing</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <ShoppingCart className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Smart Marketplace</CardTitle>
                                <CardDescription>Browse and purchase with confidence</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Browse products by category, price, and location</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Advanced filters for precise product search</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Shopping cart with multiple payment options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>View farmer profiles for transparency</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Gavel className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Bidding System</CardTitle>
                                <CardDescription>Dynamic pricing for better deals</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Real-time bidding on agricultural products</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Live updates using WebSocket technology</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Transparent bid history and status tracking</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Automatic notifications for bid updates</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Search className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Reverse Marketplace</CardTitle>
                                <CardDescription>Buyers list what they need</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Buyers post crop requirements and quantities</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Farmers respond with supply offers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Smart matching between demand and supply</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Automated notifications for matches</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <MessageSquare className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Direct Communication</CardTitle>
                                <CardDescription>Connect buyers and farmers instantly</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Real-time chat between buyers and farmers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Direct negotiation and inquiry system</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Q&A section under each product listing</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Message history and notification system</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Truck className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Smart Delivery</CardTitle>
                                <CardDescription>Distance-based delivery calculation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Free delivery within specified radius</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Per-kilometer charge for extra distance</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Automatic delivery cost calculation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>GPS-based distance measurement</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Star className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Ratings & Reviews</CardTitle>
                                <CardDescription>Build trust and credibility</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Two-way rating system for buyers and farmers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Detailed reviews with product feedback</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Review moderation and report system</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Average rating display on profiles</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <MapPin className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Location-Based Filtering</CardTitle>
                                <CardDescription>Find nearby farmers and products</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>GPS-based farmer and product discovery</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Search within custom radius settings</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Reduce delivery time with local sellers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Map view of available products nearby</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <BarChart3 className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Dashboard & Analytics</CardTitle>
                                <CardDescription>Comprehensive sales insights</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Visual sales dashboard with graphs and charts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Track total sales and earnings in real-time</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Product performance and top-selling items</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Historical data and trend analysis</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </section>

            {/* AI Features Section */}
            <section className="bg-[#EBEFEA] py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-center text-[#03230F] mb-4">
                            AI-Powered Intelligence
                        </h2>
                        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                            Cutting-edge artificial intelligence to help you make better farming and business decisions
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.div variants={fadeUpVariant}>
                            <Card className="border-2 border-[#EEC044] bg-white h-full transition-colors hover:shadow-lg">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                        <TrendingUp className="h-6 w-6 text-[#EEC044]" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">AI Price Prediction</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Machine learning models analyze market trends and historical data to predict optimal pricing for your
                                        crops.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeUpVariant}>
                            <Card className="border-2 border-[#EEC044] bg-white h-full transition-colors hover:shadow-lg">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                        <Cloud className="h-6 w-6 text-[#EEC044]" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">Crop Recommendation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Weather-based AI suggests which crops to grow based on soil conditions, climate data, and market
                                        demand.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeUpVariant}>
                            <Card className="border-2 border-[#EEC044] bg-white h-full transition-colors hover:shadow-lg">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                        <Bot className="h-6 w-6 text-[#EEC044]" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">Intelligent Chatbot</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        24/7 AI assistant helps farmers with common queries, platform navigation, and agricultural advice.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={fadeUpVariant}>
                            <Card className="border-2 border-[#EEC044] bg-white h-full transition-colors hover:shadow-lg">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                        <BarChart3 className="h-6 w-6 text-[#EEC044]" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">Price Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        Visualize price changes over time with interactive charts and receive insights on market fluctuations.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Additional Features Section */}
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-center text-[#03230F] mb-4">
                        Security & Management
                    </h2>
                    <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                        Enterprise-grade security and comprehensive management tools
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Shield className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Security & Protection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Secure authentication with JWT tokens</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Data encryption for sensitive information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Role-based access control</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Secure payment processing</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Bell className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Notifications & Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Real-time order notifications</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Bid status updates and alerts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Message and chat notifications</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Weather alerts and farming tips</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Shield className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">Admin Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Manage farmer and buyer accounts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Post announcements and updates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>Monitor transactions and reports</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>System-wide analytics and insights</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </section>

            {/* Payment Options Section */}
            <section className="bg-[#03230F] text-white py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-center text-white mb-4">
                            Flexible Payment Options
                        </h2>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Multiple payment methods to suit every transaction
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.div variants={fadeUpVariant}>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-[#EEC044]/30 h-full">
                                <h3 className="text-2xl font-bold text-[#EEC044] mb-4">Cash on Delivery</h3>
                                <p className="text-white/80 mb-4 leading-relaxed">
                                    Pay when you receive your products. Perfect for building trust in new transactions.
                                </p>
                                <ul className="space-y-2 text-white/90">
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> No upfront payment required
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> Inspect products before paying
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> Secure and trustworthy
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUpVariant}>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-[#EEC044]/30 h-full">
                                <h3 className="text-2xl font-bold text-[#EEC044] mb-4">Online Payment</h3>
                                <p className="text-white/80 mb-4 leading-relaxed">
                                    Fast and secure online transactions through trusted payment gateways.
                                </p>
                                <ul className="space-y-2 text-white/90">
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> Instant payment confirmation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> Bank transfer support
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> Encrypted and secure
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}