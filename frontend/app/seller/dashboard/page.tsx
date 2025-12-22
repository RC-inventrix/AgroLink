"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// Project Colors
const theme = {
    primaryYellow: '#EEC044',
    darkGreen: '#03230F',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    cardBg: '#FFFFFF',
    textDark: '#04000B',
    textLight: '#666666'
};

export default function SellerDashboard() {
    // Mock Data
    const stats = {
        revenue: "Rs. 45,000",
        pendingOrders: 12,
        activeListings: 8,
        soldItems: 150
    };

    const aiInsight = {
        suggestion: "Best to grow: Red Onions",
        reason: "Based on upcoming rainy weather and high market demand in your area.",
        icon: "🌱"
    };

    const [activeTab, setActiveTab] = useState('pending');

    const orders = [
        { id: 'ORD-101', item: 'Carrots 5kg', price: 'Rs. 2,500', status: 'pending', buyer: 'Sunil Perera' },
        { id: 'ORD-102', item: 'Leeks 2kg', price: 'Rs. 800', status: 'pending', buyer: 'Nimali Silva' },
        { id: 'ORD-103', item: 'Potatoes 10kg', price: 'Rs. 4,000', status: 'completed', buyer: 'Kasun Raj' },
    ];

    const notifications = [
        { id: 1, text: "New question on 'Fresh Carrots'", time: "2 mins ago" },
        { id: 2, text: "Bargain request: Rs. 2000 for Potatoes", time: "1 hour ago" }
    ];

    const filteredOrders = orders.filter(order => order.status === activeTab);

    return (
        <div style={styles.container}>

            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <h2 style={styles.logo}>AgroLink<span style={{color: theme.primaryYellow}}>.</span></h2>
                <nav style={styles.nav}>
                    <a style={{...styles.navItem, ...styles.activeNav}} href="#">Dashboard</a>
                    <a style={styles.navItem} href="#">My Products</a>
                    <a style={styles.navItem} href="#">Orders</a>
                    <a style={styles.navItem} href="#">Bargains</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>

                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Welcome back, Farmer! 👨‍🌾</h1>
                        <p style={styles.subtitle}>Here is what’s happening with your store today.</p>
                    </div>
                    <Link href="/VegetableList/farmer/add-product">
                        <button style={styles.createBtn}>+ Add New Product</button>
                    </Link>

                </header>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    <StatCard label="Total Revenue" value={stats.revenue} icon="💰" highlight={false} />
                    <StatCard label="Pending Orders" value={stats.pendingOrders} icon="📦" highlight={true} />
                    <StatCard label="Active Listings" value={stats.activeListings} icon="🥕" highlight={false} />
                    <StatCard label="Total Sold" value={stats.soldItems} icon="📈" highlight={false} />
                </div>

                {/* Widgets Grid */}
                <div style={styles.widgetsGrid}>

                    {/* Left Column */}
                    <div style={styles.leftCol}>

                        {/* AI Insight */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3>AI Smart Insight ✨</h3>
                            </div>
                            <div style={styles.aiContent}>
                                <span style={{fontSize: '40px'}}>{aiInsight.icon}</span>
                                <div>
                                    <h4 style={{margin: '0 0 5px 0', color: theme.darkGreen}}>{aiInsight.suggestion}</h4>
                                    <p style={{margin: 0, fontSize: '14px', color: theme.textLight}}>{aiInsight.reason}</p>
                                </div>
                            </div>
                        </div>

                        {/* Orders */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3>Recent Orders</h3>
                                <div style={styles.tabs}>
                                    <button
                                        style={activeTab === 'pending' ? styles.activeTab : styles.tab}
                                        onClick={() => setActiveTab('pending')}
                                    >To Do</button>
                                    <button
                                        style={activeTab === 'completed' ? styles.activeTab : styles.tab}
                                        onClick={() => setActiveTab('completed')}
                                    >Completed</button>
                                </div>
                            </div>
                            <div style={styles.list}>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <div key={order.id} style={styles.listItem}>
                                            <div>
                                                <div style={{fontWeight: 'bold'}}>{order.item}</div>
                                                <div style={{fontSize: '12px', color: '#888'}}>{order.id} • {order.buyer}</div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontWeight: 'bold', color: theme.darkGreen}}>{order.price}</div>
                                                <button style={styles.actionBtn}>View</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{padding: '20px', textAlign: 'center', color: '#999'}}>No orders found.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div style={styles.rightCol}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3>Notifications 🔔</h3>
                            </div>
                            <div style={styles.list}>
                                {notifications.map(notif => (
                                    <div key={notif.id} style={styles.notifItem}>
                                        <p style={{margin: '0 0 5px 0', fontSize: '14px'}}>{notif.text}</p>
                                        <span style={{fontSize: '11px', color: '#999'}}>{notif.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

// Reusable Stat Card Component
function StatCard({ label, value, icon, highlight }: { label: string, value: string | number, icon: string, highlight: boolean }) {
    return (
        <div style={{
            ...styles.statCard,
            backgroundColor: highlight ? theme.primaryYellow : theme.white,
            color: highlight ? theme.darkGreen : theme.textDark
        }}>
            <div style={{fontSize: '30px', marginBottom: '10px'}}>{icon}</div>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{value}</div>
            <div style={{fontSize: '13px', opacity: 0.8}}>{label}</div>
        </div>
    );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        backgroundColor: theme.lightGray
    },
    sidebar: {
        width: '250px',
        backgroundColor: theme.darkGreen,
        color: theme.white,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
    },
    logo: {
        fontSize: '24px',
        marginBottom: '40px',
        color: theme.white
    },
    nav: { display: 'flex', flexDirection: 'column', gap: '10px' },
    navItem: {
        padding: '12px 15px',
        color: '#ccc',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        display: 'block'
    },
    activeNav: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: theme.primaryYellow,
        fontWeight: 'bold'
    },
    main: {
        flex: 1,
        padding: '30px',
        overflowY: 'auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    title: { margin: 0, fontSize: '28px', color: theme.darkGreen },
    subtitle: { margin: '5px 0 0 0', color: theme.textLight },
    createBtn: {
        backgroundColor: theme.primaryYellow,
        color: theme.darkGreen,
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    widgetsGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
    },
    leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
    rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: {
        backgroundColor: theme.white,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: `1px solid ${theme.lightGray}`,
        paddingBottom: '10px'
    },
    aiContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        backgroundColor: '#F0FFF4',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #C6F6D5'
    },
    tabs: { display: 'flex', gap: '10px' },
    tab: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#888',
        paddingBottom: '5px',
        fontSize: '14px'
    },
    activeTab: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: theme.darkGreen,
        fontWeight: 'bold',
        borderBottom: `2px solid ${theme.primaryYellow}`,
        paddingBottom: '5px',
        fontSize: '14px'
    },
    list: { display: 'flex', flexDirection: 'column', gap: '10px' },
    listItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0'
    },
    actionBtn: {
        fontSize: '12px',
        color: theme.darkGreen,
        backgroundColor: theme.primaryYellow,
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        marginTop: '5px',
        cursor: 'pointer'
    },
    notifItem: {
        padding: '10px',
        backgroundColor: '#FAFAFA',
        borderRadius: '6px',
        borderLeft: `4px solid ${theme.primaryYellow}`
    }
};