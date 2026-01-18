"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Edit3, Trash2, MapPin, Calendar, Scale, Banknote, 
    Loader2, CheckCircle, XCircle, ChevronRight, AlertTriangle, X, FileText,
    ChevronDown, MessageCircle, Truck, Phone, User
} from "lucide-react"
import DashboardHeader from "@/components/header"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Requirement {
    id: number;
    cropName: string;
    quantity: number;
    expectedUnitPrice: number;
    deliveryAddress: string;
    expectedDate: string;
    status: string;
    description: string;
}

interface Offer {
    id: number;
    requirementId: number;
    sellerId: number;
    sellerName?: string;
    supplyQty: number;
    unitPrice: number;
    contactNumber: string;
    deliveryOption: string;
    status: string;
}

export default function MyRequirementsPage() {
    const router = useRouter();
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [offers, setOffers] = useState<Record<number, Offer[]>>({}) // Stores offers mapped by requirementId
    const [loading, setLoading] = useState(true)
    const [expandedReqId, setExpandedReqId] = useState<number | null>(null)
    
    // ... Existing states for editing and deleting
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Requirement>>({})
    const [showDeletePopup, setShowDeletePopup] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const userId = typeof window !== 'undefined' ? sessionStorage.getItem("id") : null;
    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;

    useEffect(() => { fetchMyRequirements(); }, []);

    const fetchMyRequirements = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/requirements/buyer/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data: Requirement[] = await res.json();
                setRequirements(data);
                // Fetch offers for each requirement to show counts
                data.forEach(req => fetchOffersForRequirement(req.id));
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchOffersForRequirement = async (reqId: number) => {
        try {
            // 1. Fetch offers from Order Service
            const res = await fetch(`http://localhost:8080/api/offers/requirement/${reqId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const offerData: Offer[] = await res.json();
                
                if (offerData.length > 0) {
                    // 2. Fetch seller names from Identity Service
                    const sellerIds = offerData.map(o => o.sellerId).join(',');
                    const nameRes = await fetch(`http://localhost:8080/auth/fullnames?ids=${sellerIds}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    
                    if (nameRes.ok) {
                        const nameMap = await nameRes.json();
                        const enrichedOffers = offerData.map(o => ({
                            ...o,
                            sellerName: nameMap[o.sellerId] || `Seller #${o.sellerId}`
                        }));
                        setOffers(prev => ({ ...prev, [reqId]: enrichedOffers }));
                    } else {
                        setOffers(prev => ({ ...prev, [reqId]: offerData }));
                    }
                }
            }
        } catch (err) { console.error("Error fetching offers", err); }
    };

    const handleChat = (sellerId: number) => {
        router.push(`/buyer/chat/?userId=${sellerId}`);
    };

    // ... handleUpdate and handleConfirmDelete logic stays the same

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#EEC044]" /></div>

    return (
        <div className="relative min-h-screen bg-gray-50">
            <DashboardHeader/>
            
            {/* ... Delete Popup Modal stays same */}

            <div className="max-w-5xl mx-auto py-10 px-4">
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-[#03230F] uppercase">My Item Requests</h1>
                        <p className="text-gray-500 font-medium">Track responses from farmers and bulk suppliers</p>
                    </div>
                    <Link href="/buyer/requests/new-request">
                        <button className="bg-[#EEC044] rounded-2xl px-6 py-3 font-semibold uppercase text-sm shadow-xl hover:bg-[#d4b43a] transition-all active:scale-95">New Request + </button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {requirements.map((req) => {
                        const reqOffers = offers[req.id] || [];
                        const isExpanded = expandedReqId === req.id;

                        function triggerDeletePopup(id: number): void {
                            throw new Error("Function not implemented.")
                        }

                        return (
                            <Card key={req.id} className="p-0 overflow-hidden border-none shadow-xl rounded-3xl bg-white relative">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#EEC044]" />
                                
                                <div className="p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex-1 space-y-2">
                                            <h2 className="text-2xl font-black text-[#03230F] uppercase">{req.cropName}</h2>
                                            <div className="flex flex-wrap gap-4 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Scale className="w-4 h-4 text-[#EEC044]" /> {req.quantity}kg</span>
                                                <span className="flex items-center gap-1"><Banknote className="w-4 h-4 text-[#EEC044]" /> Rs.{req.expectedUnitPrice}/kg</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-[#EEC044]" /> {req.expectedDate}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            {/* Offer Count Indicator */}
                                            <button 
                                                onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                                                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                                    reqOffers.length > 0 ? 'bg-green-50 text-green-700 border-2 border-green-100' : 'bg-gray-50 text-gray-400 border-2 border-transparent'
                                                }`}
                                            >
                                                {reqOffers.length} Responses {isExpanded ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
                                            </button>

                                            <Button variant="ghost" onClick={() => { setEditingId(req.id); setEditData(req); }} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100"><Edit3 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" onClick={() => triggerDeletePopup(req.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>

                                    {/* --- EXPANDABLE OFFERS SECTION --- */}
                                    {isExpanded && (
                                        <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Seller Proposals</h3>
                                            
                                            {reqOffers.length === 0 ? (
                                                <p className="text-center py-6 text-gray-400 italic text-sm">No sellers have responded to this request yet.</p>
                                            ) : (
                                                reqOffers.map((offer) => (
                                                    <div key={offer.id} className="bg-gray-50 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-100">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                                                <User className="text-[#EEC044]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-[#03230F] uppercase text-sm">{offer.sellerName}</h4>
                                                                <div className="flex gap-3 mt-1">
                                                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3 text-[#EEC044]"/> {offer.contactNumber}</span>
                                                                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Truck className="w-3 h-3 text-[#EEC044]"/> {offer.deliveryOption}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-8">
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Supply Price</p>
                                                                <p className="text-lg font-black text-[#03230F]">Rs. {offer.unitPrice}<span className="text-xs font-medium">/kg</span></p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Supply Qty</p>
                                                                <p className="text-lg font-black text-[#03230F]">{offer.supplyQty}kg</p>
                                                            </div>
                                                            <Button 
                                                                onClick={() => handleChat(offer.sellerId)}
                                                                className="bg-[#03230F] text-[#EEC044] rounded-xl px-6 py-6 font-black uppercase text-[10px] tracking-widest hover:bg-black shadow-lg"
                                                            >
                                                                <MessageCircle className="w-4 h-4 mr-2" /> Chat
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}