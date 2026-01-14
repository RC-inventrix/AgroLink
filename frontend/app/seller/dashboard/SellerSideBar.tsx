// SellerSidebar.tsx
import React from 'react';
import Link from 'next/link';
// Importing icons from Lucide React to match your UI
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Gavel, 
  MessageSquare 
} from 'lucide-react';

interface SellerSidebarProps {
    unreadCount: number;
    activePage: string;
}

const SellerSidebar: React.FC<SellerSidebarProps> = ({ unreadCount, activePage }) => {
    return (
        // Added flex-col and h-screen to ensure full height
        <aside className="sidebar flex flex-col border-r bg-white w-64">
            <nav className="sidebar-nav flex flex-col gap-5 p-4">
                
                <Link href="/seller/dashboard" 
                    className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'dashboard' ? 'active bg-gray-100 font-semibold' : '' }`}>
                    <div className='flex items-center gap-3'>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span></div>
                </Link>

                <Link href="/seller/my-products" 
                    className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'products' ? 'active bg-gray-100 font-semibold' : ''}`}>
                    <div className='flex items-center gap-3'>
                    <Package size={20} />
                    <span>My Products</span></div>
                </Link>

                <Link href="/seller/orders" 
                    className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'orders' ? 'active bg-gray-100 font-semibold' : ''}`}>
                    
                    <div className='flex items-center gap-3'>
                    <ShoppingBag size={20} />
                    <span>Orders</span></div>
                </Link>

                <Link href="/seller/bargains" 
                    className={`nav-item flex items-center gap-3 p-3 rounded-lg transition-colors ${activePage === 'bargains' ? 'active bg-gray-100 font-semibold' : ''}`}>
                    <div className='flex items-center gap-3'>
                    <Gavel size={20} />
                    <span>Bargains</span></div>
                </Link>

                <Link href="/seller/chat" 
                    className={`nav-item flex items-center justify-between p-3 rounded-lg transition-colors ${activePage === 'chat' ? 'active bg-[#D4A017] text-black font-semibold shadow-sm' : ''}`}>
                    <div className="flex items-center gap-3">
                        <MessageSquare size={20} />
                        <span>Chat</span>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}</div>
                    
                </Link>
                
            </nav>
        </aside>
    );
};

export default SellerSidebar;