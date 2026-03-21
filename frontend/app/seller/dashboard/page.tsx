"use client";

import { useEffect, useState } from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Link from "next/link";
import {
    Plus,
    TrendingUp,
    Package,
    Wallet,
    Carrot,
    Sparkles,
    Bell,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    LogOut,
    Mail,
    Phone,
    ShieldAlert as Shield,
    Megaphone,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SellerHeader from "@/components/headers/SellerHeader";
import SellerSidebar from "./SellerSideBar";
import Footer2 from "@/components/footer/Footer";
import { useLanguage } from "@/context/LanguageContext"; // Added Translation Hook



const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const chatUrl = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083";


export default function SellerDashboard() {
    const { t } = useLanguage(); // Initialize hook
    const [navUnread, setNavUnread] = useState(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [isBanned, setIsBanned] = useState<boolean>(false);

    // States for Notices
    const [warnings, setWarnings] = useState<any[]>([]);
    const [showAnnouncements, setShowAnnouncements] = useState(true);
    const [announcements] = useState<any[]>([]);

    // State for Orders, Analytics, and Banner Logic
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState({
        totalCompletedIncome: 0,
        totalPendingOrders: 0,
        totalCompletedOrders: 0,
        activeListingsCount: 0
    });

    // --- INVENTORY BANNER STATES ---
    const [hasFixedPriceProducts, setHasFixedPriceProducts] = useState(false);
    const [bannerState, setBannerState] = useState<"ALERT" | "CLICKED">("ALERT");

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId) return;

        const fetchDashboardData = async () => {
            try {
                const userRes = await fetch(`${baseUrl}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.isBanned) {
                        setIsBanned(true);
                        return;
                    }
                    setUserName(userData.fullName?.split(' ')[0].toLowerCase() || "User");
                }

                const statsRes = await fetch(`${baseUrl}/api/seller/orders/${myId}/analytics`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const ordersRes = await fetch(`${baseUrl}/api/seller/orders/${myId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const productsRes = await fetch(`${baseUrl}/products/farmer/${myId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (statsRes.ok && ordersRes.ok && productsRes.ok) {
                    const statsData = await statsRes.json();
                    const allOrders: any[] = await ordersRes.json();
                    const allProducts: any[] = await productsRes.json();

                    const filteredPending = allOrders.filter((o) =>
                        ["PAID", "COD_CONFIRMED", "CREATED", "PENDING"].includes(o.status?.toUpperCase())
                    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                    setPendingOrders(filteredPending);
                    setAnalytics({
                        totalCompletedIncome: statsData.totalCompletedIncome || 0,
                        totalCompletedOrders: statsData.totalCompletedOrders || 0,
                        totalPendingOrders: filteredPending.length,
                        activeListingsCount: allProducts.length
                    });

                    // Logic: Check if user has FIXED price items to trigger the banner
                    const hasFixed = allProducts.some(p => p.pricingType === "FIXED");
                    setHasFixedPriceProducts(hasFixed);
                }
            } catch (err) {
                console.error("Dashboard primary sync error:", err);
            }
        };

        const syncGlobalUnread = async () => {
            try {
                const contactsRes = await fetch(`${chatUrl}/api/chat/contacts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (contactsRes.ok) {
                    const ids: number[] = await contactsRes.json();
                    const unreadCounts = await Promise.all(ids.map(async (senderId) => {
                        const res = await fetch(`${chatUrl}/api/chat/unread-count/${senderId}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        return res.ok ? await res.json() : 0;
                    }));
                    setNavUnread(unreadCounts.reduce((acc, count) => acc + count, 0));
                }
            } catch (err) { console.error("Unread sync failed:", err); }
        };

        fetchDashboardData();
        syncGlobalUnread();

        const socket = new SockJS(`${chatUrl}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/user/${myId}/queue/messages`, () => {
                    setNavUnread((prev) => prev + 1);
                });
            },
        });

        client.activate();
        return () => { void client.deactivate(); };
    }, []);

    // --- PROTECTED BANNER TIMER LOGIC ---
    useEffect(() => {
        const clickedAtStr = localStorage.getItem("inventoryBannerClickedAt");
        if (clickedAtStr) {
            const clickedAtTime = parseInt(clickedAtStr, 10);
            const timeDiff = Date.now() - clickedAtTime;
            const TWELVE_HOURS = 12 * 60 * 60 * 1000;

            if (timeDiff < TWELVE_HOURS) {
                setBannerState("CLICKED");
            } else {
                localStorage.removeItem("inventoryBannerClickedAt");
                setBannerState("ALERT");
            }
        }
    }, []);

    const handleBannerClick = () => {
        localStorage.setItem("inventoryBannerClickedAt", Date.now().toString());
        setBannerState("CLICKED");
    };

    // Function to dismiss private warning
    const handleDismissWarning = async (id: number) => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await fetch(`${baseUrl}/api/v1/moderation/notifications/mark-read/${id}`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setWarnings(prev => prev.filter(w => w.id !== id));
            }
        } catch (error) {
            console.error("Dismissal failed:", error);
        }
    };

    if (isBanned) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-red-100 text-center">
                    <div className="bg-red-600 p-6 flex justify-center">
                        <AlertCircle size={64} className="text-white animate-pulse" />
                    </div>
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("sellerDashBannedTitle")}</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            {t("sellerDashBannedDesc")}
                        </p>
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-left border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{t("sellerDashSupportContact")}</p>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail size={18} className="text-red-500 shrink-0" />
                                <span className="text-sm font-medium">agrolinkcustomerservice@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone size={18} className="text-red-500 shrink-0" />
                                <span className="text-sm font-medium">+94 11 234 5678</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { sessionStorage.clear(); window.location.href = "/login"; }}
                            className="w-full h-auto py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
                        >
                            <LogOut size={18} /> {t("sellerDashLogout")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <SellerHeader />
            <div className="flex">
                <SellerSidebar unreadCount={navUnread} activePage="dashboard" />

                <main className="flex-1 p-8 overflow-hidden">
                    {/* Welcome Header */}
                    <header className="bg-[#03230F] rounded-3xl p-8 mb-6 flex justify-between items-center shadow-lg">
                        <div>
                            <h1 className="text-white text-3xl font-bold flex items-center gap-2">
                                {t("sellerDashWelcome")} {userName} 👋
                            </h1>
                            <p className="text-gray-300 mt-2">{t("sellerDashSubtitle")}</p>
                        </div>
                        <Link href="/VegetableList/farmer/add-product">
                            <button className="bg-[#EEC044] text-[#03230F] h-auto px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#d9af3d] transition-all shadow-md">
                                <Plus size={20} className="shrink-0" /> {t("sellerDashAddProduct")}
                            </button>
                        </Link>
                    </header>

                    {/* BEAUTIFIED CONDITIONAL INVENTORY REMINDER BANNER */}
                    {hasFixedPriceProducts && (
                        <Link href="/seller/my-products" onClick={handleBannerClick}>
                            <div className={`mb-8 p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between shadow-md cursor-pointer hover:shadow-xl group relative overflow-hidden ${
                                bannerState === "ALERT"
                                    ? "bg-[#03230F] border-[#EEC044]/40 hover:border-[#EEC044]"
                                    : "bg-white border-green-200 hover:border-green-300"
                            }`}>

                                {/* Decorative background blob for ALERT state */}
                                {bannerState === "ALERT" && (
                                    <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#EEC044]/10 blur-3xl pointer-events-none"></div>
                                )}

                                <div className="flex items-start md:items-center gap-5 relative z-10">
                                    <div className={`p-4 rounded-2xl shrink-0 ${
                                        bannerState === "ALERT"
                                            ? "bg-[#EEC044]/10 text-[#EEC044]"
                                            : "bg-green-50 text-green-600"
                                    }`}>
                                        {bannerState === "ALERT" ? (
                                            <Package className="w-8 h-8" />
                                        ) : (
                                            <CheckCircle2 className="w-8 h-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-black text-xl mb-1.5 tracking-tight ${
                                            bannerState === "ALERT" ? "text-white" : "text-[#03230F]"
                                        }`}>
                                            {bannerState === "ALERT" ? t("sellerDashStockAlertTitle") : t("sellerDashStockOkTitle")}
                                        </h4>
                                        <p className={`text-sm font-medium leading-relaxed max-w-3xl ${
                                            bannerState === "ALERT" ? "text-gray-300" : "text-gray-500"
                                        }`}>
                                            {bannerState === "ALERT"
                                                ? t("sellerDashStockAlertDesc")
                                                : t("sellerDashStockOkDesc")}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 md:mt-0 relative z-10 shrink-0">
                                    <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl h-auto text-sm font-bold transition-all group-hover:scale-105 shadow-sm ${
                                        bannerState === "ALERT"
                                            ? "bg-[#EEC044] text-[#03230F]"
                                            : "bg-green-50 text-green-700 border border-green-200"
                                    }`}>
                                        {bannerState === "ALERT" ? t("sellerDashUpdateQuantities") : t("sellerDashManageStock")}
                                        <ChevronRight className="w-4 h-4 shrink-0" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* --- 1. PRIVATE WARNINGS SECTION --- */}
                    {warnings.length > 0 && (
                        <div className="space-y-3 mb-8">
                            {warnings.map((warn) => (
                                <div key={warn.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-left duration-300">
                                    <div className="flex items-center gap-4 text-red-800">
                                        <div className="bg-red-100 p-2 rounded-full shrink-0">
                                            <Shield size={24} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs uppercase tracking-widest">{t("sellerDashAdminWarning")}</p>
                                            <p className="text-sm font-medium">{warn.message}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 h-auto py-2" onClick={() => handleDismissWarning(warn.id)}>
                                        {t("sellerDashDismiss")}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- 2. SWIPEABLE SYSTEM ANNOUNCEMENTS (SINGLE VIEW) --- */}
                    {showAnnouncements && announcements.length > 0 && (
                        <div className="relative mb-8 max-w-full">
                            <div className="flex items-center justify-between mb-3 px-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Megaphone size={14} className="shrink-0" /> {t("sellerDashAnnouncements")} ({announcements.length})
                                </h3>
                                <button onClick={() => setShowAnnouncements(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory w-full">
                                {announcements.map((ann) => (
                                    <div
                                        key={ann.id}
                                        className={`flex-none w-full snap-center p-6 rounded-2xl shadow-sm border-l-4 transition-all duration-300 ${
                                            ann.priority === 'URGENT'
                                                ? 'bg-red-50 border-red-500'
                                                : 'bg-[#EEC044] border-[#03230F]'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-xl shrink-0 ${ann.priority === 'URGENT' ? 'bg-red-100' : 'bg-[#03230F]/10'}`}>
                                                <Bell size={22} className={ann.priority === 'URGENT' ? 'text-red-600' : 'text-[#03230F]'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <h4 className={`font-bold text-base truncate ${ann.priority === 'URGENT' ? 'text-red-700' : 'text-[#03230F]'}`}>
                                                        {ann.title}
                                                    </h4>
                                                    <Badge variant="outline" className="text-[10px] bg-white/40 border-transparent whitespace-nowrap px-2 h-auto py-0.5">
                                                        {new Date(ann.createdAt).toLocaleDateString()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-[#03230F]/80 line-clamp-2 leading-relaxed">
                                                    {ann.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {announcements.length > 1 && (
                                <div className="flex justify-center gap-1.5 mt-4">
                                    {announcements.map((_, i) => (
                                        <div key={i} className="h-1 w-4 rounded-full bg-gray-300" />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard label={t("sellerDashTotalRevenue")} value={`Rs. ${(analytics.totalCompletedIncome / 100).toLocaleString()}`} Icon={Wallet} color="text-green-600" />
                        <StatCard label={t("sellerDashPendingOrders")} value={analytics.totalPendingOrders} Icon={Package} highlight />
                        <StatCard label={t("sellerDashActiveListings")} value={analytics.activeListingsCount} Icon={Carrot} color="text-orange-500" />
                        <StatCard label={t("sellerDashTotalSold")} value={analytics.totalCompletedOrders} Icon={TrendingUp} color="text-blue-500" />
                    </div>

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <CropRecommendationCard />

                            {/* Pending Orders Section */}
                            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">{t("sellerDashCurrentPendingOrders")}</h3>
                                    <Link href="/seller/orders" className="text-[#03230F] text-sm font-semibold flex items-center gap-1 hover:underline">
                                        {t("sellerDashViewAllOrders")} <ChevronRight size={16} />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {pendingOrders.length > 0 ? (
                                        pendingOrders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-50 shrink-0">
                                                        <Package className="text-[#03230F]" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{t("sellerDashOrderHash")}{order.id}</p>
                                                        <p className="text-xs text-gray-500">{order.customerName || t("sellerDashStandardOrder")}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#03230F] text-sm">Rs. {(order.amount / 100).toLocaleString()}</p>
                                                    <Badge className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 h-auto uppercase font-bold border-none">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                            <Package size={48} className="mb-2 opacity-20" />
                                            <p>{t("sellerDashNoPendingOrders")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Notifications */}
                        <div className="space-y-8">
                            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Bell className="text-gray-400 shrink-0" size={20} />
                                    <h3 className="font-bold text-gray-800">{t("sellerDashNotifications")}</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <p className="text-sm font-medium text-gray-800">{t("sellerDashMockNotif1")}</p>
                                        <span className="text-[11px] text-gray-400">{t("sellerDashMockTime1")}</span>
                                    </div>
                                    <div className="p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <p className="text-sm font-medium text-gray-800">{t("sellerDashMockNotif2")}</p>
                                        <span className="text-[11px] text-gray-400">{t("sellerDashMockTime2")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer2 />
        </div>
    );
}

// Helper Components
function StatCard({ label, value, Icon, highlight, color }: { label: string, value: string | number, Icon: any, highlight?: boolean, color?: string }) {
    return (
        <div className={`p-6 rounded-4xl shadow-sm border transition-transform hover:scale-[1.02] ${highlight ? 'bg-[#EEC044] border-[#EEC044]' : 'bg-white border-gray-100'}`}>
            <div className={`mb-4 p-3 rounded-2xl inline-block ${highlight ? 'bg-[#03230F]/10' : 'bg-gray-50'}`}>
                <Icon size={24} className={highlight ? 'text-[#03230F]' : color} />
            </div>
            <div className={`text-2xl font-bold ${highlight ? 'text-[#03230F]' : 'text-gray-800'}`}>{value}</div>
            <div className={`text-sm ${highlight ? 'text-[#03230F]/70' : 'text-gray-500'}`}>{label}</div>
        </div>
    );
}

// Helper Component: Updated CropRecommendationCard
function CropRecommendationCard() {
    const { t } = useLanguage(); // Translation Hook for Child Component
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<any>(null);

    // Ensure we use the environment variable for Google Cloud compatibility, falling back to localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // 1. Fetch user location automatically on component mount
    useEffect(() => {
        const fetchLocation = async () => {
            const token = sessionStorage.getItem("token");
            const myId = sessionStorage.getItem("id");
            if (!token || !myId) return;

            try {
                // Call the existing Identity Service endpoint to get location
                const res = await fetch(`${baseUrl}/users/${myId}/address`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUserLocation(data);
                }
            } catch (err) {
                console.error("Failed to fetch user location", err);
            }
        };

        fetchLocation();
    }, [baseUrl]);

    const handlePredict = async () => {
        if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
            setError(t("sellerDashErrNoLocation"));
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            // 2. Call the Java Backend (Product Catalog Service)
            // This safely routes through your API, working for both Localhost and Google Cloud
            const response = await fetch(`${baseUrl}/api/crop/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    city: userLocation.city,
                    province: userLocation.district // Mapping district to province
                }),
            });

            if (!response.ok) {
                setError(t("sellerDashErrPredictFail"));
                return;
            }

            const data = await response.json();
            // Assuming the Python API returns { "recommended_crop": "Rice" }
            setResult(data.recommended_crop || data.crop || "Unknown Crop");
        } catch (err: any) {
            setError(err.message || t("sellerDashErrUnknown"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-[#EEC044] shrink-0" size={20} />
                    <h3 className="font-bold text-gray-800">{t("sellerDashAiInsight")}</h3>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 h-auto rounded-md">{t("sellerDashPoweredByMl")}</span>
            </div>

            {/* Displaying detected location instead of input fields */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100 flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{t("sellerDashDetectedLocation")}</p>
                    {userLocation ? (
                        <p className="text-sm font-semibold text-[#03230F]">
                            {userLocation.city}, {userLocation.district} <br/>
                            <span className="text-xs font-normal text-gray-400">
                                {t("sellerDashLat")} {userLocation.latitude} | {t("sellerDashLon")} {userLocation.longitude}
                            </span>
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400">{t("sellerDashLoadingLocation")}</p>
                    )}
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                    📍
                </div>
            </div>

            <div className="flex justify-end mb-6">
                <button
                    onClick={handlePredict}
                    disabled={loading || !userLocation}
                    className="bg-[#03230F] h-auto text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#03230f]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? t("sellerDashAnalyzing") : t("sellerDashAutoRecommend")}
                </button>
            </div>

            {(result || error) ? (
                <div className={`flex items-center gap-6 p-4 rounded-2xl transition-all ${error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="text-4xl">{error ? '⚠️' : '🌱'}</div>
                    <div>
                        <h4 className={`font-bold ${error ? 'text-red-700' : 'text-[#03230F]'}`}>{error ? t("sellerDashAnalysisError") : `${t("sellerDashBestToGrow")} ${result}`}</h4>
                        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>{error ? error : t("sellerDashBasedOnLocation")}</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                    <div className="text-4xl opacity-50">🤖</div>
                    <div>
                        <h4 className="font-bold text-gray-500">{t("sellerDashReadyToAnalyze")}</h4>
                        <p className="text-sm text-gray-400">{t("sellerDashClickToAnalyze")}</p>
                    </div>
                </div>
            )}
        </div>
    );
}