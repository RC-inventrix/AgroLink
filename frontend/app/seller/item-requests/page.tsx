"use client"

import React, { useState, useEffect } from 'react'
import SellerHeader from '@/components/headers/BuyerHeader'
import SellerSidebar from '../dashboard/SellerSideBar'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    MessageCircle, CheckCircle, XCircle, Scale, 
    Banknote, Calendar, MapPin, FileText, Loader2, 
    User, Upload, X, Truck, Phone, Inbox, Send
} from "lucide-react"
import { useRouter } from "next/navigation"
import '../dashboard/SellerDashboard.css';

interface Requirement {
    id: number;
    buyerId: number;
    buyerName?: string;
    cropName: string;
    quantity: number;
    expectedUnitPrice: number;
    deliveryAddress: string;
    expectedDate: string;
    description: string;
    status: string;
}

const ItemRequestsPage = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<Requirement[]>([]);
    const [myRespondedIds, setMyRespondedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'new' | 'responded'>('new');

    // --- MODAL & FORM STATES ---
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [offerData, setOfferData] = useState({
        supplyQty: "",
        unitPrice: "",
        contactNumber: "",
        deliveryOption: "Seller Delivery",
        image: null as File | null,
        imagePreview: ""
    });

    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
    const sellerId = typeof window !== 'undefined' ? sessionStorage.getItem("id") : null;

    useEffect(() => { loadData(); }, [sellerId]);

    const loadData = async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            // 1. Fetch all requirements
            const res = await fetch(`http://localhost:8080/api/requirements/status/OPEN`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            // 2. Fetch my existing offers to identify responded ones
            const offerRes = await fetch(`http://localhost:8080/api/offers/seller/${sellerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok && offerRes.ok) {
                const reqData: Requirement[] = await res.json();
                const myOffers = await offerRes.json();
                
                // Map responded requirement IDs
                const respondedIds = new Set(myOffers.map((o: any) => o.requirementId));
                setMyRespondedIds(respondedIds as Set<number>);

                const uniqueBuyerIds = Array.from(new Set(reqData.map(r => r.buyerId)));
                if (uniqueBuyerIds.length > 0) {
                    const nameRes = await fetch(`http://localhost:8080/auth/fullnames?ids=${uniqueBuyerIds.join(',')}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (nameRes.ok) {
                        const nameMap: Record<number, string> = await nameRes.json();
                        setRequests(reqData.map(req => ({ ...req, buyerName: nameMap[req.buyerId] || "Unknown User" })));
                    } else { setRequests(reqData); }
                } else { setRequests(reqData); }
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    // Filter requests based on active tab
    const displayedRequests = requests.filter(req => 
        activeTab === 'new' ? !myRespondedIds.has(req.id) : myRespondedIds.has(req.id)
    );

    const handleOpenOffer = (req: Requirement) => {
        setSelectedReq(req);
        setOfferData({ ...offerData, unitPrice: req.expectedUnitPrice.toString(), supplyQty: "" });
        setIsOfferModalOpen(true);
    };

    const handleSubmitOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReq || !sellerId || !token) return;
        setSubmitting(true);

        const payload = {
            requirementId: Number(selectedReq.id),
            sellerId: Number(sellerId),
            supplyQty: parseFloat(offerData.supplyQty),
            unitPrice: parseFloat(offerData.unitPrice),
            contactNumber: offerData.contactNumber,
            deliveryOption: offerData.deliveryOption,
            imageUrl: null 
        };

        try {
            const res = await fetch(`http://localhost:8080/api/offers/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsOfferModalOpen(false);
                alert("Success! Your offer has been sent.");
                loadData(); // Refresh to move item to 'Responded' tab
            }
        } catch (err) { console.error(err); } finally { setSubmitting(false); }
    };

    const openChat = (buyerId: number) => {
        router.push(`/seller/chat?receiverId=${buyerId}`);
    };

    function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
        throw new Error('Function not implemented.')
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            <SellerHeader />
            <div className='flex'>
                <SellerSidebar unreadCount={0} activePage='item-requests' />
                
                <main className="flex-1 p-8">
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black text-[#03230F] uppercase">Buyer Crop Needs</h1>
                            <p className="text-gray-500 font-medium">Browse and respond to bulk buyer requirements</p>
                        </div>

                        {/* --- TAB SWITCHER --- */}
                        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            <button 
                                onClick={() => setActiveTab('new')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'new' ? 'bg-[#03230F] text-[#EEC044] shadow-lg' : 'text-gray-400 hover:text-[#03230F]'}`}
                            >
                                <Inbox className="w-4 h-4" /> New Requests
                            </button>
                            <button 
                                onClick={() => setActiveTab('responded')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'responded' ? 'bg-[#03230F] text-[#EEC044] shadow-lg' : 'text-gray-400 hover:text-[#03230F]'}`}
                            >
                                <Send className="w-4 h-4" /> Responded
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#EEC044] w-10 h-10" /></div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {displayedRequests.map((req) => (
                                <Card key={req.id} className="overflow-hidden border-none shadow-xl rounded-xl bg-white relative transition-all ">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 text-[#EEC044] mb-1">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                        Requester: <span className="text-[#03230F]">{req.buyerName || `User #${req.buyerId}`}</span>
                                                    </span>
                                                </div>
                                                <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tight">{req.cropName}</h2>
                                            </div>
                                            <Button variant="ghost" onClick={() => openChat(req.buyerId)} className="bg-gray-100 text-[#03230F] rounded-2xl hover:bg-[#EEC044]/20 gap-2 font-bold px-6 py-6">
                                                <MessageCircle className="w-5 h-5 text-[#EEC044]" /> Chat
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Volume</span><span className="flex items-center gap-2 text-xl font-black text-[#03230F]"><Scale className="w-5 h-5 text-[#EEC044]" /> {req.quantity} KG</span></div>
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Price</span><span className="flex items-center gap-2 text-xl font-black text-[#03230F]"><Banknote className="w-5 h-5 text-[#EEC044]" /> Rs. {req.expectedUnitPrice}/kg</span></div>
                                        </div>

                                        {/* --- CONDITIONAL BUTTONS --- */}
                                        <div className="flex gap-4">
                                            {activeTab === 'new' ? (
                                                <>
                                                    <Button onClick={() => handleOpenOffer(req)} className="flex bg-[#03230F] text-[#EEC044] py-3 rounded uppercase tracking-widest shadow-lg hover:bg-black gap-2 transition-all active:scale-95 flex-1">
                                                        <CheckCircle className="w-5 h-5" /> Send an Offer
                                                    </Button>
                                                    <Button variant="outline" className="border-2 border-gray-100 text-red-500 font-bold py-3 px-10 rounded uppercase tracking-widest hover:bg-red-50 gap-2 transition-all">
                                                        <XCircle className="w-5 h-5" /> Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="w-full py-4 bg-gray-50 border-2 border-dashed border-[#EEC044]/30 rounded-2xl flex items-center justify-center gap-3">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                    <span className="text-[#03230F] font-black uppercase text-xs tracking-widest">Offer Sent Successfully</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                    {!loading && displayedRequests.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-black text-lg uppercase tracking-widest">No {activeTab} requests found</p>
                        </div>
                    )}
                </main>
            </div>

            {/* --- OFFER MODAL --- */}
{isOfferModalOpen && selectedReq && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Card className="w-full max-w-2xl p-10 border-none shadow-2xl rounded-[2.5rem] bg-white relative overflow-hidden">
            {/* Themed Accent Line */}
            <div className="absolute top-0 left-0 w-full h-3 bg-[#EEC044]" />
            
            {/* Close Button */}
            <button 
                onClick={() => setIsOfferModalOpen(false)} 
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="w-6 h-6 text-gray-400" />
            </button>

            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tighter">Send Your Offer</h2>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                    For: {selectedReq.cropName} ({selectedReq.quantity}kg Required)
                </p>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-6">
                {/* Quantity and Price Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Scale className="w-4 h-4 text-[#EEC044]" /> Quantity (kg)
                        </Label>
                        <Input 
                            required type="number" 
                            placeholder={`Max ${selectedReq.quantity}kg`}
                            className="rounded-2xl border-gray-100 bg-gray-50 h-14 font-bold text-[#03230F] focus:border-[#EEC044] focus:ring-0"
                            value={offerData.supplyQty}
                            onChange={(e) => setOfferData({...offerData, supplyQty: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#EEC044]" /> Price (LKR/kg)
                        </Label>
                        <Input 
                            required type="number"
                            className="rounded-2xl border-gray-100 bg-gray-50 h-14 font-bold text-[#03230F] focus:border-[#EEC044] focus:ring-0"
                            value={offerData.unitPrice}
                            onChange={(e) => setOfferData({...offerData, unitPrice: e.target.value})}
                        />
                    </div>
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                    <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#EEC044]" /> Your Contact Number
                    </Label>
                    <Input 
                        required type="tel" 
                        placeholder="e.g. 077 123 4567"
                        className="rounded-2xl border-gray-100 bg-gray-50 h-14 font-bold text-[#03230F] focus:border-[#EEC044] focus:ring-0"
                        value={offerData.contactNumber}
                        onChange={(e) => setOfferData({...offerData, contactNumber: e.target.value})}
                    />
                </div>

                {/* Delivery Method Selection */}
                <div className="space-y-2">
                    <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#EEC044]" /> Delivery Method
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        {['Seller Delivery', 'Buyer Pickup'].map((option) => (
                            <button
                                key={option} 
                                type="button"
                                onClick={() => setOfferData({...offerData, deliveryOption: option})}
                                className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                                    offerData.deliveryOption === option 
                                    ? 'border-[#03230F] bg-[#03230F] text-[#EEC044]' 
                                    : 'border-gray-100 bg-gray-50 text-gray-400'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Styled Image Upload Box */}
                <div className="space-y-2">
                    <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#EEC044]" /> Product Image
                    </Label>
                    <div className="relative group cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id="offer-img" 
                            onChange={handleImageChange} 
                        />
                        <label 
                            htmlFor="offer-img" 
                            className="flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[2rem] p-8 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            {offerData.imagePreview ? (
                                <img src={offerData.imagePreview} alt="Preview" className="h-32 rounded-xl object-cover" />
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center px-4">
                                        Click to upload harvest photo
                                    </span>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="flex-1 bg-[#03230F] text-[#EEC044] font-black py-8 rounded-[2rem] uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : "Confirm Offer"}
                    </Button>
                    <Button 
                        type="button" 
                        onClick={() => setIsOfferModalOpen(false)} 
                        className="px-10 bg-gray-100 text-gray-400 font-black py-8 rounded-[2rem] uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    </div>
)}
        </div>
    )
}

export default ItemRequestsPage;