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
import Header from "@/components/header"
import Image from "next/image";
import Link from "next/link";

export default function FeaturesPage() {
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
      <section className="bg-gradient-to-r from-[#03230F] to-[#03230F] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-balance">Powerful Features for Modern Agriculture</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto text-balance">
            AgroLink connects farmers and buyers with cutting-edge technology, AI-powered insights, and seamless
            marketplace functionality for sustainable, fair-trade agriculture.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4">Core Platform Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to buy, sell, and manage agricultural products in one platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Farmer Features */}
          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Sprout className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Product Management</CardTitle>
              <CardDescription>Complete control over your listings</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Create, edit, and delete product listings with ease</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Upload multiple images with prices and quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Track availability and inventory in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Set custom delivery options and pricing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Smart Marketplace</CardTitle>
              <CardDescription>Browse and purchase with confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Browse products by category, price, and location</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Advanced filters for precise product search</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Shopping cart with multiple payment options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>View farmer profiles for transparency</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Gavel className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Bidding System</CardTitle>
              <CardDescription>Dynamic pricing for better deals</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Real-time bidding on agricultural products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Live updates using WebSocket technology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Transparent bid history and status tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Automatic notifications for bid updates</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Reverse Marketplace</CardTitle>
              <CardDescription>Buyers list what they need</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Buyers post crop requirements and quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Farmers respond with supply offers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Smart matching between demand and supply</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Automated notifications for matches</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Direct Communication</CardTitle>
              <CardDescription>Connect buyers and farmers instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Real-time chat between buyers and farmers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Direct negotiation and inquiry system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Q&A section under each product listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Message history and notification system</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Smart Delivery</CardTitle>
              <CardDescription>Distance-based delivery calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Free delivery within specified radius</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Per-kilometer charge for extra distance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Automatic delivery cost calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>GPS-based distance measurement</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Ratings & Reviews</CardTitle>
              <CardDescription>Build trust and credibility</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Two-way rating system for buyers and farmers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Detailed reviews with product feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Review moderation and report system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Average rating display on profiles</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Location-Based Filtering</CardTitle>
              <CardDescription>Find nearby farmers and products</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>GPS-based farmer and product discovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Search within custom radius settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Reduce delivery time with local sellers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Map view of available products nearby</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Dashboard & Analytics</CardTitle>
              <CardDescription>Comprehensive sales insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Visual sales dashboard with graphs and charts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Track total sales and earnings in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Product performance and top-selling items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Historical data and trend analysis</span>
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
            <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4">AI-Powered Intelligence</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Cutting-edge artificial intelligence to help you make better farming and business decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">AI Price Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Machine learning models analyze market trends and historical data to predict optimal pricing for your
                  crops.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <Cloud className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">Crop Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Weather-based AI suggests which crops to grow based on soil conditions, climate data, and market
                  demand.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <Bot className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">Intelligent Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  24/7 AI assistant helps farmers with common queries, platform navigation, and agricultural advice.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#d4a340] bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-[#0d3b2e] to-[#165a42] rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-[#d4a340]" />
                </div>
                <CardTitle className="text-[#0d3b2e]">Price Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Visualize price changes over time with interactive charts and receive insights on market fluctuations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#0d3b2e] mb-4">Security & Management</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enterprise-grade security and comprehensive management tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Security & Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Secure authentication with JWT tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Data encryption for sensitive information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Secure payment processing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Notifications & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Real-time order notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Bid status updates and alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Message and chat notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Weather alerts and farming tips</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 hover:border-[#d4a340] transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[#0d3b2e] rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-[#d4a340]" />
              </div>
              <CardTitle className="text-[#0d3b2e]">Admin Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Manage farmer and buyer accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Post announcements and updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>Monitor transactions and reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4a340] mt-1">✓</span>
                  <span>System-wide analytics and insights</span>
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
            <h2 className="text-4xl font-bold mb-4">Flexible Payment Options</h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Multiple payment methods to suit every transaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-[#d4a340]/30">
              <h3 className="text-2xl font-bold text-[#d4a340] mb-4">Cash on Delivery</h3>
              <p className="text-emerald-100 mb-4">
                Pay when you receive your products. Perfect for building trust in new transactions.
              </p>
              <ul className="space-y-2 text-emerald-50">
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> No upfront payment required
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> Inspect products before paying
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> Secure and trustworthy
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-[#d4a340]/30">
              <h3 className="text-2xl font-bold text-[#d4a340] mb-4">Online Payment</h3>
              <p className="text-emerald-100 mb-4">
                Fast and secure online transactions through trusted payment gateways.
              </p>
              <ul className="space-y-2 text-emerald-50">
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> Instant payment confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> Bank transfer support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4a340]">✓</span> Encrypted and secure
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
            Ready to Transform Your Agricultural Business?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto text-balance">
            Join thousands of farmers and buyers already benefiting from AgroLink's powerful features.
          </p>
          
        </div>
      </section>

      
    </div>
  )
}
