"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Gavel, MessageSquare, Book, Timer } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface SellerSidebarProps {
    unreadCount: number; // This can now be treated as an initial value
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

    const CHAT_SERVICE_URL = "http://localhost:8083";
    const AUTH_SERVICE_URL = "http://localhost:8080";

    // 1. Polling for Chat Unread Count (Every 3 Seconds)
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

        fetchChatCount(); // Initial fetch
        const interval = setInterval(fetchChatCount, 3000);
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Item Requests (Every 60 Seconds)
    useEffect(() => {
        const fetchCounts = async () => {
            const token = sessionStorage.getItem("token");
            const sellerId = sessionStorage.getItem("id");

            if (!token || !sellerId) return;

            try {
                // 1. Fetch Open Requirements
                const reqRes = await fetch(`${API_URL}/api/requirements/status/OPEN`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                // 2. Fetch Seller's existing offers
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
        <aside className="sidebar flex flex-col border-r bg-white w-64 h-screen sticky top-20">
            <nav className="sidebar-nav flex flex-col gap-5 p-1 mx-0">

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
                        {/* Updated to use liveUnreadCount from polling */}
                        {liveUnreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {liveUnreadCount > 99 ? "99+" : liveUnreadCount}
                            </span>
                        )}
                    </div>
                </Link>

                <Link href="/seller/item-requests"
                      className={`nav-item flex items-center justify-between p-1 rounded-lg transition-colors ${activePage === 'item-requests' ? 'active bg-gray-100 font-semibold' : ''}`}>
                    <div className='flex items-center gap-3'>
                        <Book size={20} />
                        <span className='text-sm'>Item Requests</span>
                        {newRequestCount > 0 && (
                            <span className="bg-[#EEC044] text-[#03230F] text-sm rounded-full px-2 py-0.5 text-center shadow-sm">
                            {newRequestCount}
                        </span>
                        )}
                    </div>
                </Link>
            </nav>
        </aside>
    );
};

export default SellerSidebar;