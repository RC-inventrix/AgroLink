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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturesPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
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
                            {t("navHome")}
                        </Link>
                        <Link href="/about" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                            {t("navAbout")}
                        </Link>
                        <Link href="/features" className="text-white hover:text-[#EEC044] transition font-medium text-sm lg:text-base">
                            {t("navFeatures")}
                        </Link>
                    </div>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <Link href="/login">
                            <button className="px-3 lg:px-4 py-1.5 lg:py-2 border-2 border-[#EEC044] text-white text-sm lg:text-base rounded-full hover:bg-[#EEC044] hover:text-[#03230F] transition font-semibold">
                                {t("login")}
                            </button>
                        </Link>

                        <Link href="/register">
                            <button className="px-4 lg:px-6 py-1.5 lg:py-2 bg-[#EEC044] text-[#03230F] text-sm lg:text-base rounded-full hover:bg-[#d9a83d] transition font-semibold">
                                {t("register")}
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#03230F] to-[#03230F] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-balance">{t("featuresPageHeroTitle")}</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto text-balance">
            {t("featuresPageHeroDesc")}
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4">{t("featuresPageCoreTitle")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("featuresPageCoreSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Farmer Features */}
          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Sprout className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardProductTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardProductSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardProductItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardProductItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardProductItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardProductItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardMarketplaceTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardMarketplaceSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardMarketplaceItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardMarketplaceItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardMarketplaceItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardMarketplaceItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Gavel className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardBiddingTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardBiddingSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardBiddingItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardBiddingItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardBiddingItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardBiddingItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardReverseTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardReverseSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardReverseItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardReverseItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardReverseItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardReverseItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardCommsTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardCommsSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardCommsItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardCommsItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardCommsItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardCommsItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardDeliveryTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardDeliverySubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDeliveryItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDeliveryItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDeliveryItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDeliveryItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardRatingTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardRatingSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardRatingItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardRatingItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardRatingItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardRatingItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardLocationTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardLocationSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardLocationItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardLocationItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardLocationItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardLocationItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageCardDashboardTitle")}</CardTitle>
              <CardDescription>{t("featuresPageCardDashboardSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDashboardItem1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDashboardItem2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDashboardItem3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageCardDashboardItem4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-emerald-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4">{t("featuresPageAiTitle")}</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {t("featuresPageAiSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">{t("featuresPageAiCard1Title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {t("featuresPageAiCard1Desc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <Cloud className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">{t("featuresPageAiCard2Title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {t("featuresPageAiCard2Desc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <Bot className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">{t("featuresPageAiCard3Title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {t("featuresPageAiCard3Desc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">{t("featuresPageAiCard4Title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {t("featuresPageAiCard4Desc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4">{t("featuresPageSecurityTitle")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("featuresPageSecuritySubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageSecurityCard1Title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard1Item1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard1Item2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard1Item3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard1Item4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageSecurityCard2Title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard2Item1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard2Item2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard2Item3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard2Item4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">{t("featuresPageSecurityCard3Title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard3Item1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard3Item2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard3Item3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>{t("featuresPageSecurityCard3Item4")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Payment Options Section */}
      <section className="bg-[#03230F] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t("featuresPagePaymentTitle")}</h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              {t("featuresPagePaymentSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-[#d4a340]/30">
              <h3 className="text-2xl font-bold text-[#d4a340] mb-4">{t("featuresPagePaymentCard1Title")}</h3>
              <p className="text-emerald-100 mb-4">
                {t("featuresPagePaymentCard1Desc")}
              </p>
              <ul className="space-y-2 text-emerald-50">
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> {t("featuresPagePaymentCard1Item1")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> {t("featuresPagePaymentCard1Item2")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> {t("featuresPagePaymentCard1Item3")}
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-[#d4a340]/30">
              <h3 className="text-2xl font-bold text-[#d4a340] mb-4">{t("featuresPagePaymentCard2Title")}</h3>
              <p className="text-emerald-100 mb-4">
                {t("featuresPagePaymentCard2Desc")}
              </p>
              <ul className="space-y-2 text-emerald-50">
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> {t("featuresPagePaymentCard2Item1")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> {t("featuresPagePaymentCard2Item2")}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> {t("featuresPagePaymentCard2Item3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4 text-balance">
            {t("featuresPageCtaTitle")}
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto text-balance">
            {t("featuresPageCtaDesc")}
          </p>
          
        </div>
      </section>
    <Footer/>
      
    </div>
  )
}
