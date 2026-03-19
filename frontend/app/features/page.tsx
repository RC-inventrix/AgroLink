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
import { useLanguage } from "@/context/LanguageContext" // Added Context Hook

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
    // Initialize the translation hook
    const { t } = useLanguage()

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
                            {t("featHeroPrefix")}
                            <span className="text-[#EEC044] block my-2 sm:my-3">
                                {t("featHeroHighlight")}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed text-center max-w-3xl mx-auto text-balance">
                            {t("featHeroDesc")}
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
                        {t("featCoreTitle")}
                    </h2>
                    <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                        {t("featCoreSubtitle")}
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                >
                    {/* Feature 1 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Sprout className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featProductTitle")}</CardTitle>
                                <CardDescription>{t("featProductDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featProductItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featProductItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featProductItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featProductItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <ShoppingCart className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featMarketTitle")}</CardTitle>
                                <CardDescription>{t("featMarketDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featMarketItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featMarketItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featMarketItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featMarketItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Gavel className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featBiddingTitle")}</CardTitle>
                                <CardDescription>{t("featBiddingDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featBiddingItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featBiddingItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featBiddingItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featBiddingItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 4 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Search className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featReverseTitle")}</CardTitle>
                                <CardDescription>{t("featReverseDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featReverseItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featReverseItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featReverseItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featReverseItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 5 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <MessageSquare className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featCommsTitle")}</CardTitle>
                                <CardDescription>{t("featCommsDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featCommsItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featCommsItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featCommsItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featCommsItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 6 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Truck className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featDeliveryTitle")}</CardTitle>
                                <CardDescription>{t("featDeliveryDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDeliveryItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDeliveryItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDeliveryItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDeliveryItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 7 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <Star className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featRatingTitle")}</CardTitle>
                                <CardDescription>{t("featRatingDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featRatingItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featRatingItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featRatingItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featRatingItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 8 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <MapPin className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featLocationTitle")}</CardTitle>
                                <CardDescription>{t("featLocationDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featLocationItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featLocationItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featLocationItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featLocationItem4")}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 9 */}
                    <motion.div variants={fadeUpVariant}>
                        <Card className="border-2 border-[#EEC044] transition-colors hover:shadow-lg h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-[#004d2b] rounded-lg flex items-center justify-center mb-3">
                                    <BarChart3 className="h-6 w-6 text-[#EEC044]" />
                                </div>
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featDashboardTitle")}</CardTitle>
                                <CardDescription>{t("featDashboardDesc")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDashboardItem1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDashboardItem2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDashboardItem3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featDashboardItem4")}</span>
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
                            {t("featAiTitle")}
                        </h2>
                        <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                            {t("featAiSubtitle")}
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
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featAiCard1Title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        {t("featAiCard1Desc")}
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
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featAiCard2Title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        {t("featAiCard2Desc")}
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
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featAiCard3Title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        {t("featAiCard3Desc")}
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
                                    <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featAiCard4Title")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/70 leading-relaxed">
                                        {t("featAiCard4Desc")}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Security Features Section */}
            <section className="container mx-auto px-4 py-16 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase max-w-4xl mx-auto leading-tight text-center text-[#03230F] mb-4">
                        {t("featSecTitle")}
                    </h2>
                    <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                        {t("featSecSubtitle")}
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
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featSecCard1Title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard1Item1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard1Item2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard1Item3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard1Item4")}</span>
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
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featSecCard2Title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard2Item1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard2Item2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard2Item3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard2Item4")}</span>
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
                                <CardTitle className="text-xl font-bold text-[#004d2b]">{t("featSecCard3Title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-foreground/70">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard3Item1")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard3Item2")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard3Item3")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#EEC044] mt-1 font-bold">✓</span>
                                        <span>{t("featSecCard3Item4")}</span>
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
                            {t("featPayTitle")}
                        </h2>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            {t("featPaySubtitle")}
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
                                <h3 className="text-2xl font-bold text-[#EEC044] mb-4">{t("featPayCard1Title")}</h3>
                                <p className="text-white/80 mb-4 leading-relaxed">
                                    {t("featPayCard1Desc")}
                                </p>
                                <ul className="space-y-2 text-white/90">
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> {t("featPayCard1Item1")}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> {t("featPayCard1Item2")}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> {t("featPayCard1Item3")}
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUpVariant}>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-[#EEC044]/30 h-full">
                                <h3 className="text-2xl font-bold text-[#EEC044] mb-4">{t("featPayCard2Title")}</h3>
                                <p className="text-white/80 mb-4 leading-relaxed">
                                    {t("featPayCard2Desc")}
                                </p>
                                <ul className="space-y-2 text-white/90">
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> {t("featPayCard2Item1")}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> {t("featPayCard2Item2")}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-[#EEC044]">✓</span> {t("featPayCard2Item3")}
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