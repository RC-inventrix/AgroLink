"use client";

import { useEffect, useState } from "react";
import React from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Link from "next/link";
import {
    Plus, TrendingUp, Package, Wallet, Carrot, Sparkles,
    Bell, ChevronRight, AlertCircle, LogOut, Mail, Phone, Megaphone, X, ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SellerHeader from "@/components/headers/SellerHeader";
import SellerSidebar from "./SellerSideBar";
import "./SellerDashboard.css";
import Footer from "@/components/footer/Footer";

export default function SellerDashboard() {
    const [navUnread, setNavUnread] = useState(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [isBanned, setIsBanned] = useState<boolean>(false);

    // States for Notices
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [warnings, setWarnings] = useState<any[]>([]);
    const [showAnnouncements, setShowAnnouncements] = useState(true);


    // State for Orders and Analytics
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState({
        totalCompletedIncome: 0,
        totalPendingOrders: 0,
        totalCompletedOrders: 0,
        activeListingsCount: 0
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const chatUrl = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8083";

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId) return;

        const fetchDashboardData = async () => {
            try {
                const headers = { "Authorization": `Bearer ${token}` };

                // 1. Fetch User Data / Ban Check
                const userRes = await fetch(`${baseUrl}/auth/me`, { headers });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.isBanned) {
                        setIsBanned(true);
                        return;
                    }
                    setUserName(userData.fullName?.split(' ')[0].toLowerCase() || "User");
                }

                // 2. Fetch Private Warnings (Report System)
                const warnRes = await fetch(`${baseUrl}/api/v1/moderation/user/notifications/${myId}`, { headers });
                if (warnRes.ok) {
                    const warnData = await warnRes.json();
                    // Filter out already read warnings
                    setWarnings(warnData.filter((w: any) => !w.read));
                }

                // 3. Fetch System Announcements (Communication System)
                const annRes = await fetch(`${baseUrl}/api/v1/announcements/my-announcements?role=FARMER`, { headers });
                if (annRes.ok) {
                    const annData = await annRes.json();
                    setAnnouncements(annData);
                }
                // 4. Fetch Stats, Orders, and Products
                const [statsRes, ordersRes, productsRes] = await Promise.all([
                    fetch(`${baseUrl}/api/seller/orders/${myId}/analytics`, { headers }),
                    fetch(`${baseUrl}/api/seller/orders/${myId}`, { headers }),
                    fetch(`${baseUrl}/products/farmer/${myId}`, { headers })
                ]);

                if (statsRes.ok && ordersRes.ok && productsRes.ok) {
                    const statsData = await statsRes.json();
                    const allOrders: any[] = await ordersRes.json();
                    const allProducts: any[] = await productsRes.json();

                    // Filter orders
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

        // WebSocket for real-time chat badges
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Restricted</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            Your account has been <strong>banned</strong> for policy violation. Please contact customer service for more information.
                        </p>
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-left border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Support Contact</p>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail size={18} className="text-red-500" />
                                <span className="text-sm font-medium">agrolinkcustomerservice@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone size={18} className="text-red-500" />
                                <span className="text-sm font-medium">+94 11 234 5678</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { sessionStorage.clear(); window.location.href = "/login"; }}
                            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
                        >
                            <LogOut size={18} /> Logout from System
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
                    <header className="bg-[#03230F] rounded-3xl p-8 mb-8 flex justify-between items-center shadow-lg">
                        <div>
                            <h1 className="text-white text-3xl font-bold flex items-center gap-2">
                                Welcome back, {userName} 👋
                            </h1>
                            <p className="text-gray-300 mt-2">Manage your orders, bargains, and requests in one place</p>
                        </div>
                        <Link href="/VegetableList/farmer/add-product">
                            <button className="bg-[#EEC044] text-[#03230F] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#d9af3d] transition-all shadow-md">
                                <Plus size={20} /> Add New Product
                            </button>
                        </Link>
                    </header>

                    {/* --- 1. PRIVATE WARNINGS SECTION --- */}
                    {warnings.length > 0 && (
                        <div className="space-y-3 mb-8">
                            {warnings.map((warn) => (
                                <div key={warn.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-left duration-300">
                                    <div className="flex items-center gap-4 text-red-800">
                                        <div className="bg-red-100 p-2 rounded-full">
                                            <ShieldAlert size={24} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs uppercase tracking-widest">Administrative Warning</p>
                                            <p className="text-sm font-medium">{warn.message}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100" onClick={() => handleDismissWarning(warn.id)}>
                                        Dismiss
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
                                    <Megaphone size={14} /> System Announcements ({announcements.length})
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
                                            <div className={`p-2.5 rounded-xl flex-shrink-0 ${ann.priority === 'URGENT' ? 'bg-red-100' : 'bg-[#03230F]/10'}`}>
                                                <Bell size={22} className={ann.priority === 'URGENT' ? 'text-red-600' : 'text-[#03230F]'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1 gap-2">
                                                    <h4 className={`font-bold text-base truncate ${ann.priority === 'URGENT' ? 'text-red-700' : 'text-[#03230F]'}`}>
                                                        {ann.title}
                                                    </h4>
                                                    <Badge variant="outline" className="text-[10px] bg-white/40 border-transparent whitespace-nowrap">
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
                        <StatCard label="Total Revenue" value={`Rs. ${(analytics.totalCompletedIncome / 100).toLocaleString()}`} Icon={Wallet} color="text-green-600" />
                        <StatCard label="Pending Orders" value={analytics.totalPendingOrders} Icon={Package} highlight />
                        <StatCard label="Active Listings" value={analytics.activeListingsCount} Icon={Carrot} color="text-orange-500" />
                        <StatCard label="Total Sold" value={analytics.totalCompletedOrders} Icon={TrendingUp} color="text-blue-500" />
                    </div>

                    {/* Main Content Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* AI Insights Card */}
                            
                            {/* Pending Orders List */}
                            {/* --- INTEGRATED AI CROP RECOMMENDATION COMPONENT --- */}
                            <CropRecommendationCard />

                            {/* Pending Orders Section */}
                            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">Current Pending Orders</h3>
                                    <Link href="/seller/orders" className="text-[#03230F] text-sm font-semibold flex items-center gap-1 hover:underline">
                                        View All Orders <ChevronRight size={16} />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {pendingOrders.length > 0 ? (
                                        pendingOrders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-50">
                                                        <Package className="text-[#03230F]" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">Order #{order.id}</p>
                                                        <p className="text-xs text-gray-500">{order.customerName || 'Standard Order'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#03230F] text-sm">Rs. {(order.amount / 100).toLocaleString()}</p>
                                                    <Badge className="bg-yellow-100 text-yellow-700 text-[10px] uppercase font-bold border-none">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                            <Package size={48} className="mb-2 opacity-20" />
                                            <p>No pending orders to display</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Notifications */}
                        <div className="space-y-8">
                            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Bell className="text-gray-400" size={20} />
                                    <h3 className="font-bold text-gray-800">Notifications</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <p className="text-sm font-medium text-gray-800">New question on 'Fresh Carrots'</p>
                                        <span className="text-[11px] text-gray-400">2 mins ago</span>
                                    </div>
                                    <div className="p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <p className="text-sm font-medium text-gray-800">Order #0026 was paid</p>
                                        <span className="text-[11px] text-gray-400">1 hour ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

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

// New AI Crop Recommendation Sub-component
function CropRecommendationCard() {
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [rainfall, setRainfall] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        if (!temperature || !humidity || !rainfall) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch(`${baseUrl}/api/crop/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    temperature: Number(temperature),
                    humidity: Number(humidity),
                    rainfall: Number(rainfall),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get crop prediction");
            }

            const data = await response.json();
            // Assuming your backend returns a field named 'crop'
            setResult(data.crop);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-[#EEC044]" size={20} />
                    <h3 className="font-bold text-gray-800">AI Smart Insight</h3>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Powered by ML</span>
            </div>

            {/* Input Form Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Temperature (°C)</label>
                    <input
                        type="number"
                        placeholder="e.g. 28"
                        value={temperature}
                        onChange={e => setTemperature(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:bg-white transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Humidity (%)</label>
                    <input
                        type="number"
                        placeholder="e.g. 70"
                        value={humidity}
                        onChange={e => setHumidity(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:bg-white transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rainfall (mm)</label>
                    <input
                        type="number"
                        placeholder="e.g. 120"
                        value={rainfall}
                        onChange={e => setRainfall(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EEC044] focus:bg-white transition-all"
                    />
                </div>
            </div>

            <div className="flex justify-end mb-6">
                <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="bg-[#03230F] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#03230f]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? "Analyzing Weather..." : "Recommend Crop"}
                </button>
            </div>

            {/* Results Display */}
            {(result || error) ? (
                <div className={`flex items-center gap-6 p-4 rounded-2xl transition-all ${error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="text-4xl">{error ? '⚠️' : '🌱'}</div>
                    <div>
                        <h4 className={`font-bold ${error ? 'text-red-700' : 'text-[#03230F]'}`}>
                            {error ? 'Analysis Error' : `Best to grow: ${result}`}
                        </h4>
                        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>
                            {error ? error : "Based on the weather conditions you provided."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
                    <div className="text-4xl opacity-50">☁️</div>
                    <div>
                        <h4 className="font-bold text-gray-500">Awaiting Data</h4>
                        <p className="text-sm text-gray-400">Enter your local weather conditions above to get an AI-powered recommendation.</p>
                    </div>
                </div>
            )}
        </div>
    );
}