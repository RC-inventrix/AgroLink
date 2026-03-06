"use client";

import { useEffect, useState } from "react";
import React from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Link from "next/link";
import { 
    Plus, TrendingUp, Package, Wallet, Carrot, Sparkles, 
    Bell, ChevronRight, AlertCircle, LogOut, Mail, Phone 
} from "lucide-react";
import SellerHeader from "@/components/headers/SellerHeader";
import SellerSidebar from "./SellerSideBar";
import "./SellerDashboard.css";
import Footer from "@/components/footer/Footer";

export default function SellerDashboard() {
    const [navUnread, setNavUnread] = useState(0);
    const [userName, setUserName] = useState<string | null>(null);
    const [isBanned, setIsBanned] = useState<boolean>(false); // Ban state
    
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState({
        totalCompletedIncome: 0,
        totalPendingOrders: 0,
        totalCompletedOrders: 0,
        activeListingsCount: 0
    });

    const baseUrl = "http://localhost:8080";
    const chatUrl = "http://localhost:8083";

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId) return;

        const fetchDashboardData = async () => {
            try {
                // A. Fetch User Data and check for Ban Status
                const userRes = await fetch(`${baseUrl}/auth/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (userRes.ok) {
                    const userData = await userRes.json();
                    
                    // Check the isBanned flag from the User model
                    if (userData.isBanned) {
                        setIsBanned(true);
                        return; // Halt further data fetching for security
                    }

                    setUserName(userData.fullName?.split(' ')[0].toLowerCase() || "User");
                }

                // B. Fetch Analytics
                const statsRes = await fetch(`${baseUrl}/api/seller/orders/${myId}/analytics`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                // C. Fetch Orders
                const ordersRes = await fetch(`${baseUrl}/api/seller/orders/${myId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                // D. Fetch Products
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
                }
            } catch (err) {
                console.error("Dashboard data sync error:", err);
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

    // --- RENDER BANNED VIEW IF NECESSARY ---
    if (isBanned) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-red-100">
                    <div className="bg-red-600 p-6 flex justify-center">
                        <AlertCircle size={64} className="text-white animate-pulse" />
                    </div>
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Restricted</h2>
                        <p className="text-gray-600 mb-6">
                            Your account has been <strong>banned</strong> for policy violation. Please contact customer service for more information.
                        </p>
                        
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-left border border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Support Contact</p>
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
                            onClick={() => {
                                sessionStorage.clear();
                                window.location.href = "/login";
                            }}
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

                <main className="flex-1 p-8">
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            label="Total Revenue"
                            value={`Rs. ${(analytics.totalCompletedIncome / 100).toLocaleString()}`}
                            Icon={Wallet}
                            color="text-green-600"
                        />
                        <StatCard
                            label="Pending Orders"
                            value={analytics.totalPendingOrders}
                            Icon={Package}
                            highlight
                        />
                        <StatCard
                            label="Active Listed Products"
                            value={analytics.activeListingsCount}
                            Icon={Carrot}
                            color="text-orange-500"
                        />
                        <StatCard
                            label="Total Sold"
                            value={analytics.totalCompletedOrders}
                            Icon={TrendingUp}
                            color="text-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="text-[#EEC044]" size={20} />
                                    <h3 className="font-bold text-gray-800">AI Smart Insight</h3>
                                </div>
                                <div className="flex items-center gap-6 bg-green-50 p-4 rounded-2xl">
                                    <div className="text-4xl">🌱</div>
                                    <div>
                                        <h4 className="font-bold text-[#03230F]">Best to grow: Red Onions</h4>
                                        <p className="text-sm text-gray-600">Based on upcoming rainy weather patterns in your region.</p>
                                    </div>
                                </div>
                            </div>

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
                                                    <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-bold uppercase tracking-wider">
                                                        {order.status}
                                                    </span>
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