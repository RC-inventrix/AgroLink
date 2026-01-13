// SellerSidebar.tsx
import React from 'react';
import Link from 'next/link';

interface SellerSidebarProps {
    unreadCount: number;
    activePage: string;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ unreadCount, activePage }) => {
    return (
        <aside className="sidebar h-auto">
            <nav className="sidebar-nav">
                <Link href="/seller/dashboard" className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}>
                    Dashboard
                </Link>
                <Link href="/seller/my-products" className={`nav-item ${activePage === 'products' ? 'active' : ''}`}>
                    My Products
                </Link>
                <Link href="/seller/orders" className={`nav-item ${activePage === 'orders' ? 'active' : ''}`}>
                    Orders
                </Link>
                <Link href="/seller/bargains" className={`nav-item ${activePage === 'bargains' ? 'active' : ''}`}>
                    Bargains
                </Link>

                <Link href="/seller/chat" className={`nav-item ${activePage === 'chat' ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Chat</span>
                    {unreadCount > 0 && (
                        <span className="badge">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Link>
            </nav>
        </aside>
    );
};

export default SellerSidebar;