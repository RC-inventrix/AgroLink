"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Edit3, Trash2, Calendar, Scale, Banknote, 
    Loader2, CheckCircle, ChevronDown, MessageCircle, Truck, Phone, User, AlertTriangle
} from "lucide-react"
import DashboardHeader from "@/components/header"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"

interface Requirement {
    id: number;
    cropName: string;
    quantity: number;
    expectedUnitPrice: number;
    deliveryAddress: string;
    expectedDate: string;
    status: string; // OPEN, CLOSED
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
    status: string; // PENDING, ACCEPTED
}

export default function MyRequirementsPage() {
    const router = useRouter();
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [offers, setOffers] = useState<Record<number, Offer[]>>({}) 
    const [loading, setLoading] = useState(true)
    const [expandedReqId, setExpandedReqId] = useState<number | null>(null)
    
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Requirement>>({})
    const [showDeletePopup, setShowDeletePopup] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Auth state
    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Initialize session data
    useEffect(() => {
        const storedId = sessionStorage.getItem("id");
        const storedToken = sessionStorage.getItem("token");
        setUserId(storedId);
        setToken(storedToken);
    }, []);

    const fetchOffersForRequirement = useCallback(async (reqId: number, currentToken: string) => {
        try {
            const res = await fetch(`http://localhost:8080/api/offers/requirement/${reqId}`, {
                headers: { "Authorization": `Bearer ${currentToken}` }
            });
            
            if (res.ok) {
                const offerData: Offer[] = await res.json();
                if (offerData.length > 0) {
                    const sellerIds = Array.from(new Set(offerData.map(o => o.sellerId))).join(',');
                    const nameRes = await fetch(`http://localhost:8080/auth/fullnames?ids=${sellerIds}`, {
                        headers: { "Authorization": `Bearer ${currentToken}` }
                    });
                    
                    const nameMap = nameRes.ok ? await nameRes.json() : {};
                    const enrichedOffers = offerData.map(o => ({
                        ...o,
                        sellerName: nameMap[o.sellerId] || `Seller #${o.sellerId}`
                    }));
                    setOffers(prev => ({ ...prev, [reqId]: enrichedOffers }));
                }
            }
        } catch (err) { 
            console.error("Error fetching offers", err); 
        }
    }, []);

    const fetchMyRequirements = useCallback(async () => {
        if (!userId || !token) return;
        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8080/api/requirements/buyer/${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data: Requirement[] = await res.json();
                setRequirements(data);
                data.forEach(req => fetchOffersForRequirement(req.id, token));
            }
        } catch (err) { 
            console.error("Fetch requirements failed", err); 
        } finally { 
            setLoading(false); 
        }
    }, [userId, token, fetchOffersForRequirement]);

    useEffect(() => { 
        if (userId && token) fetchMyRequirements(); 
    }, [userId, token, fetchMyRequirements]);

    /**
     * UPDATED: Handles both Offer Acceptance and Requirement Closing
     */
    const handleAcceptOffer = async (reqId: number, offerId: number) => {
        const reqToUpdate = requirements.find(r => r.id === reqId);
        if (!reqToUpdate || !token) return;

        try {
            // 1. Update the Specific Offer to "ACCEPTED"
            const offerRes = await fetch(`http://localhost:8080/api/offers/${offerId}/status`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: "ACCEPTED" })
            });

            if (!offerRes.ok) throw new Error("Failed to update offer status");

            // 2. Update the Requirement to "CLOSED"
            const reqPayload = { ...reqToUpdate, status: "CLOSED" };
            const reqRes = await fetch(`http://localhost:8080/api/requirements/${reqId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(reqPayload)
            });

            if (reqRes.ok) {
                alert("Deal Confirmed! This request is now closed and the offer is accepted.");
                fetchMyRequirements(); // Refresh UI
            }
        } catch (err) {
            console.error("Transaction failed:", err);
            alert("Could not accept offer. Please try again.");
        }
    };

    const handleUpdate = async (id: number) => {
        if (!token) return;
        try {
            const payload = { ...editData, id, quantity: Number(editData.quantity), expectedUnitPrice: Number(editData.expectedUnitPrice) };
            const res = await fetch(`http://localhost:8080/api/requirements/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) { setEditingId(null); fetchMyRequirements(); }
        } catch (err) { console.error("Update failed", err); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete || !token) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`http://localhost:8080/api/requirements/${itemToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) { setShowDeletePopup(false); fetchMyRequirements(); }
        } catch (err) { console.error("Delete failed", err); } finally { setIsDeleting(false); setItemToDelete(null); }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#EEC044]" /></div>

    return (
        <div className="relative min-h-screen bg-gray-50">
            <DashboardHeader/>

            {/* DELETE POPUP */}
            {showDeletePopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-8 border-none shadow-2xl rounded-[2rem] bg-white text-center">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-red-500" /></div>
                        <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2">Delete Request?</h2>
                        <div className="flex flex-col gap-3 mt-8">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-[#03230F] text-[#EEC044] font-black py-7 rounded-2xl uppercase shadow-xl">{isDeleting ? <Loader2 className="animate-spin" /> : "Yes, Delete"}</Button>
                            <button onClick={() => setShowDeletePopup(false)} className="w-full font-bold text-gray-400 py-4 uppercase text-[10px]">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}
            
            <div className="max-w-5xl mx-auto py-10 px-4">
               
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-[#03230F] uppercase">My Item Requests</h1>
                        <p className="text-gray-500 font-medium">Manage your requirements and accept seller proposals</p>
                    </div>
                    <Link href="/buyer/requests/new-request">
                        <button className="bg-[#EEC044] rounded-2xl px-6 py-3 font-semibold uppercase text-sm shadow-xl hover:bg-[#d4b43a]">New Request + </button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {requirements.map((req) => {
                        const reqOffers = offers[req.id] || [];
                        const isExpanded = expandedReqId === req.id;

                        return (
                            <Card key={req.id} className="p-0 overflow-hidden border-none shadow-xl rounded-3xl bg-white relative">
                                <div className={`absolute top-0 left-0 w-2 h-full ${req.status === 'CLOSED' ? 'bg-gray-400' : 'bg-[#EEC044]'}`} />
                                
                                {editingId === req.id ? (
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-400">Crop Name</Label>
                                                <Input value={editData.cropName || ""} onChange={e => setEditData({...editData, cropName: e.target.value})} className="rounded-xl font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-400">Quantity (kg)</Label>
                                                <Input type="number" value={editData.quantity || ""} onChange={e => setEditData({...editData, quantity: parseFloat(e.target.value) || 0})} className="rounded-xl font-bold" />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button onClick={() => handleUpdate(req.id)} className="flex-1 bg-[#03230F] text-[#EEC044] font-black rounded-xl py-6">Save</Button>
                                            <Button variant="ghost" onClick={() => setEditingId(null)} className="bg-gray-100 rounded-xl font-bold">Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl font-black text-[#03230F] uppercase">{req.cropName}</h2>
                                                    {req.status === 'CLOSED' && <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase border">Closed</span>}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-gray-500 font-bold text-xs">
                                                    <span className="flex items-center gap-1"><Scale className="w-4 h-4 text-[#EEC044]" />Expected Qty. <p className="text-gray-900 font-extrabold ">{req.quantity}kg</p></span>
                                                    <span className="flex items-center gap-1"><Banknote className="w-4 h-4 text-[#EEC044]" />Expected Price <p className="text-gray-900 font-extrabold ">Rs.{req.expectedUnitPrice}/kg</p></span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                                                    className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 ${reqOffers.length > 0 ? 'bg-green-50 text-green-700 border-2 border-green-100' : 'bg-gray-50 text-gray-400'}`}
                                                >
                                                    {reqOffers.length} Responses <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                                {req.status === 'OPEN' && (
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" onClick={() => { setEditingId(req.id); setEditData(req); }} className="p-3 bg-gray-50"><Edit3 className="w-4 h-4" /></Button>
                                                        <Button variant="ghost" onClick={() => { setItemToDelete(req.id); setShowDeletePopup(true); }} className="p-3 bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100 space-y-4">
                                                {reqOffers.length === 0 ? (
                                                    <p className="text-center py-6 text-gray-400 italic">No responses yet.</p>
                                                ) : (
                                                    reqOffers.map((offer) => (
                                                        <div key={offer.id} className="bg-gray-50 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center gap-6 border">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><User className="text-[#68D391]" /></div>
                                                                <div>
                                                                    <h4 className="font-black text-[#03230F] uppercase text-sm">{offer.sellerName}</h4>
                                                                    <div className="flex gap-3 text-[10px] text-gray-500 font-bold">
                                                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#EEC044]"/> {offer.contactNumber}</span>
                                                                        <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-[#EEC044]"/> {offer.deliveryOption}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-8">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-gray-400">Supply Quantity</p>
                                                                    <p className="text-lg font-black text-[#03230F]">{offer.supplyQty} kg</p>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-bold text-gray-400">Offer Price</p>
                                                                    <p className="text-lg font-black text-[#03230F]">Rs. {offer.unitPrice}/kg</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {req.status === 'OPEN' ? (
                                                                        <Button onClick={() => handleAcceptOffer(req.id, offer.id)} className="bg-[#EEC044] text-[#03230F] rounded-xl px-6 font-black uppercase text-[10px] shadow-lg flex items-center gap-2">
                                                                            <CheckCircle className="w-4 h-4" /> Accept Offer
                                                                        </Button>
                                                                    ) : (
                                                                        <div className={`px-6 py-3 border rounded-xl font-bold text-[10px] uppercase tracking-widest ${offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-400'}`}>
                                                                            {offer.status === 'ACCEPTED' ? 'Accepted Offer' : 'Request Closed'}
                                                                        </div>
                                                                    )}
                                                                    <Button onClick={() => router.push(`/buyer/chat/?receiverId=${offer.sellerId}`)} className="bg-[#03230F] text-[#EEC044] rounded-xl px-6 font-black uppercase text-[10px]">
                                                                        <MessageCircle className="w-4 h-4 mr-2" /> Chat
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}