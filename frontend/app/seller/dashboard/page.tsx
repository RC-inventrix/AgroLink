"use client";

import { useEffect, useState } from "react";
import React from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Link from "next/link";
import SellerHeader from "@/components/headers/SellerHeader";
import SellerSidebar from "./SellerSideBar";
import './SellerDashboard.css';

export default function SellerDashboard() {
    const [navUnread, setNavUnread] = useState(0);
    const [activeTab, setActiveTab] = useState('pending');
    const baseUrl = "http://localhost:8083";

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const myId = sessionStorage.getItem("id");
        if (!token || !myId) return;

        const syncGlobalUnread = async () => {
            try {
                const contactsRes = await fetch(`${baseUrl}/api/chat/contacts`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (contactsRes.ok) {
                    const ids: number[] = await contactsRes.json();
                    const unreadCounts = await Promise.all(ids.map(async (senderId) => {
                        const res = await fetch(`${baseUrl}/api/chat/unread-count/${senderId}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        return res.ok ? await res.json() : 0;
                    }));

                    setNavUnread(unreadCounts.reduce((acc, count) => acc + count, 0));
                }
            } catch (err) {
                console.error("Unread sync failed:", err);
            }
        };

        syncGlobalUnread();

        const socket = new SockJS(`${baseUrl}/ws`);
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

    return (
        <>
            <SellerHeader />
            <div className="dashboard-container">
                {/* Reusable Sidebar */}
                <SellerSidebar unreadCount={navUnread} activePage="dashboard" />

                <main className="main-content">
                    <header className="dashboard-header">
                        <div>
                            <h1 className="title">Welcome back, Farmer! 👨‍🌾</h1>
                            <p className="subtitle">Here is what’s happening with your store today.</p>
                        </div>
                        <Link href="/VegetableList/farmer/add-product">
                            <button className="create-btn">+ Add New Product</button>
                        </Link>
                    </header>

                    <div className="stats-grid">
                        <StatCard label="Total Revenue" value="Rs. 45,000" icon="💰" highlight={false} />
                        <StatCard label="Pending Orders" value={12} icon="📦" highlight={true} />
                        <StatCard label="Active Listings" value={8} icon="🥕" highlight={false} />
                        <StatCard label="Total Sold" value={150} icon="📈" highlight={false} />
                    </div>

                    <div className="widgets-grid">
                        <div className="left-col">
                            <div className="card">
                                <h3>AI Smart Insight ✨</h3>
                                <div className="ai-content">
                                    <span style={{ fontSize: '40px' }}>🌱</span>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0' }}>Best to grow: Red Onions</h4>
                                        <p style={{ margin: 0, fontSize: '14px' }}>Based on rainy weather.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ marginTop: '20px' }}>
                                <div className="dashboard-header" style={{ marginBottom: '10px' }}>
                                    <h3>Recent Orders</h3>
                                    <div className="tabs">
                                        <button className={activeTab === 'pending' ? 'active-tab' : 'tab'} onClick={() => setActiveTab('pending')}>To Do</button>
                                        <button className={activeTab === 'completed' ? 'active-tab' : 'tab'} onClick={() => setActiveTab('completed')}>Completed</button>
                                    </div>
                                </div>
                                {/* Order list logic remains the same... */}
                            </div>
                        </div>

                        <div className="right-col">
                            <div className="card">
                                <h3>Notifications 🔔</h3>
                                <div className="notif-item">
                                    <p>New question on 'Fresh Carrots'</p>
                                    <span style={{ fontSize: '11px', color: '#999' }}>2 mins ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

function StatCard({ label, value, icon, highlight }: { label: string, value: string | number, icon: string, highlight: boolean }) {
    return (
        <div className={`stat-card ${highlight ? 'highlight-card' : ''}`} style={{
            backgroundColor: highlight ? '#EEC044' : '#FFFFFF',
            color: highlight ? '#03230F' : '#04000B'
        }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>{icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{label}</div>
        </div>
    );
}