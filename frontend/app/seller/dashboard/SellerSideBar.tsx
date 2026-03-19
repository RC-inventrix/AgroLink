/* Updated SellerSidebar Component */
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Gavel, MessageSquare, Book, Timer, BookOpen, ShieldCheck, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface SellerSidebarProps {
    unreadCount: number; 
    orderCount?: number;
    activePage: string;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({
                                                         unreadCount: initialUnreadCount,
                                                         orderCount = 0,
                                                         activePage
                                                     }) => {
    const [newRequestCount, setNewRequestCount] = useState(0);
    const [liveUnreadCount, setLiveUnreadCount] = useState(initialUnreadCount);
    const [showInstructions, setShowInstructions] = useState(false);

    const CHAT_SERVICE_URL = "http://localhost:8083";

    useEffect(() => {
        const fetchChatCount = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) return;
            try {
                const res = await fetch(`${CHAT_SERVICE_URL}/api/chat/total-unread`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const count = await res.json();
                    setLiveUnreadCount(count);
                }
            } catch (err) {
                console.error("Chat count polling failed:", err);
            }
        };

        fetchChatCount();
        const interval = setInterval(fetchChatCount, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchCounts = async () => {
            const token = sessionStorage.getItem("token");
            const sellerId = sessionStorage.getItem("id");
            if (!token || !sellerId) return;

            try {
                const reqRes = await fetch(`${API_URL}/api/requirements/status/OPEN`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const offerRes = await fetch(`${API_URL}/api/offers/seller/${sellerId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (reqRes.ok && offerRes.ok) {
                    const requirements = await reqRes.json();
                    const myOffers = await offerRes.json();
                    const respondedIds = new Set(myOffers.map((o: any) => o.requirementId));
                    const count = requirements.filter((req: any) => !respondedIds.has(req.id)).length;
                    setNewRequestCount(count);
                }
            } catch (err) {
                console.error("Sidebar request count fetch failed:", err);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <aside className="sidebar flex flex-col border-r bg-white w-64 h-screen sticky top-20 pb-24">
                <nav className="sidebar-nav flex flex-col gap-5 p-1 mx-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200">

                    <Link href="/seller/dashboard"
                          className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'dashboard' ? 'active bg-gray-100 font-semibold' : '' }`}>
                        <div className='flex items-center gap-3'>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </div>
                    </Link>

                    <Link href="/seller/my-products"
                          className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'products' ? 'active bg-gray-100 font-semibold' : ''}`}>
                        <div className='flex items-center gap-3'>
                            <Package size={20} />
                            <span>My Products</span>
                        </div>
                    </Link>

                    <Link href="/seller/auctions"
                          className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'auctions' ? 'active bg-gray-100 font-semibold' : ''}`}>
                        <div className='flex items-center gap-3'>
                            <Timer size={20} />
                            <span>My Auctions</span>
                        </div>
                    </Link>

                    <Link href="/seller/orders"
                          className={`nav-item flex items-center justify-between p-3 rounded-lg transition-colors ${activePage === 'orders' ? 'active bg-gray-100 font-semibold' : ''}`}>
                        <div className='flex items-center gap-3'>
                            <ShoppingBag size={20} />
                            <span>Orders</span>
                        </div>
                        {orderCount > 0 && (
                            <span className="bg-[#03230F] text-white text-[10px] font-bold p-1 rounded-full min-w-[20px] text-center">
                            {orderCount}
                        </span>
                        )}
                    </Link>

                    <Link href="/seller/bargains"
                          className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'bargains' ? 'active bg-gray-100 font-semibold' : ''}`}>
                        <div className='flex items-center gap-3'>
                            <Gavel size={20} />
                            <span>Bargains</span>
                        </div>
                    </Link>

                    <Link href="/seller/chat"
                          className={`nav-item flex items-center justify-between p-3 rounded-lg transition-colors ${activePage === 'chat' ? 'active bg-[#D4A017] text-black font-semibold shadow-sm' : ''}`}>
                        <div className="flex items-center gap-3">
                            <MessageSquare size={20} />
                            <span>Chat</span>
                            {liveUnreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                    {liveUnreadCount > 99 ? "99+" : liveUnreadCount}
                                </span>
                            )}
                        </div>
                    </Link>

                    <Link href="/seller/item-requests"
                          className={`nav-item flex items-center justify-between p-3 rounded-lg transition-colors ${activePage === 'item-requests' ? 'active bg-gray-100 font-semibold' : ''}`}>
                        <div className='flex items-center gap-3'>
                            <Book size={20} />
                            <span>Item Requests</span>
                        </div>
                        {newRequestCount > 0 && (
                            <span className="bg-[#EEC044] text-[#03230F] text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                                {newRequestCount}
                            </span>
                        )}
                    </Link>

                    {/* MOVED: Instructions Tab inside navigation list */}
                    <button
                        onClick={() => setShowInstructions(true)}
                        className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors text-left w-full ${showInstructions ? 'active bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                        <div className='flex items-center gap-3'>
                            <BookOpen size={20} />
                            <span>Instructions</span>
                        </div>
                    </button>

                </nav>
            </aside>

            {/* Modal Logic Remains the Same */}
            {showInstructions && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-3 shrink-0">
                            <div className="p-2 bg-[#03230F]/10 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-[#03230F]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#03230F]">AgroLink Community Guidelines</h2>
                                <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">Safety & Trust Rules</p>
                            </div>
                            <button onClick={() => setShowInstructions(false)} className="ml-auto p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <p className="text-sm text-gray-600 mb-6 font-medium bg-blue-50 p-3 rounded-lg border border-blue-100">
                                To ensure a safe and profitable environment for everyone, please review our community rules.
                            </p>
                            <ul className="space-y-5">

                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🤝</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">1. Trade with Verified Users</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">For your safety, prioritize contacting and dealing with users who have good reputation among the community while we are developing our highly accurate user verification system.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">💬</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">2. Communicate & Request Proof</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Always use the in-app chat to communicate. Ask for real-time images and confirm product details before finalizing any orders.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">📍</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">3. Shop Local to Save</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">You and the seller/buyer are responsible for coordinating delivery. Deal locally to minimize travel time and delivery costs!</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">💵</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">4. Cash on Delivery (COD) Only</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">While we are developing a highly secure online payment gateway, <strong>all platform transactions are strictly Cash on Delivery</strong>. Do not send money online.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">⭐</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">5. Check Ratings</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Always review the ratings and feedback of a user before agreeing to a trade.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-2xl leading-none">🚩</span>
                                    <div>
                                        <strong className="text-gray-900 block mb-0.5">6. Report Suspicious Activity</strong>
                                        <span className="text-gray-600 text-sm leading-relaxed">Help us keep AgroLink safe! Use the "Report" button immediately if you encounter fraud, fake items, or unfair behavior.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowInstructions(false)}
                                className="px-8 py-2.5 bg-[#03230F] text-[#EEC044] font-bold rounded-xl shadow-md hover:bg-[#03230F]/90 active:scale-[0.98] transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellerSidebar;