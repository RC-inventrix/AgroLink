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
import Link from "next/link"
import { useRouter } from "next/navigation"
import BuyerHeader from "@/components/headers/BuyerHeader"


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

    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

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

    const handleAcceptOffer = async (reqId: number, offerId: number) => {
        const reqToUpdate = requirements.find(r => r.id === reqId);
        if (!reqToUpdate || !token) return;

        try {
            const offerRes = await fetch(`http://localhost:8080/api/offers/${offerId}/status`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: "ACCEPTED" })
            });

            if (!offerRes.ok) throw new Error("Failed to update offer status");

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
                fetchMyRequirements(); 
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
        <div className=" relative min-h-screen bg-gray-50">
            <BuyerHeader />

            {/* DELETE POPUP */}
            {showDeletePopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-8 border-none shadow-2xl rounded-lg bg-white text-center">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-red-500" /></div>
                        <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2">Delete Request?</h2>
                        <div className="flex flex-col gap-3 mt-8">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-[#03230F] text-[#EEC044] font-black py-7 rounded-md uppercase shadow-xl">{isDeleting ? <Loader2 className="animate-spin" /> : "Yes, Delete"}</Button>
                            <button onClick={() => setShowDeletePopup(false)} className="w-full font-bold text-gray-400 py-4 uppercase text-[10px]">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}
            
            <div className="max-w-5xl mx-auto py-10 px-4">
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-[#03230F] uppercase">My Item Requests</h1>
                        <p className="text-gray-500 font-medium text-sm">Manage your requirements and accept seller proposals</p>
                    </div>
                    <Link href="/buyer/requests/new-request">
                        <button className="bg-[#EEC044] rounded-md px-6 py-4 font-bold uppercase text-xs shadow-xl hover:bg-[#d4b43a] transition-all">New Request + </button>
                    </Link>
                </div>

                <div className="grid gap-8">
                    {requirements.map((req) => {
                        const reqOffers = offers[req.id] || [];
                        const isExpanded = expandedReqId === req.id;

                        return (
                            <Card key={req.id} className="p-0 overflow-hidden border border-gray-200 shadow-md rounded-lg bg-white relative min-h-[260px] flex flex-col justify-center">
                                <div className={`absolute top-0 left-0 w-2 h-full ${req.status === 'CLOSED' ? 'bg-gray-400' : 'bg-[#EEC044]'}`} />
                                
                                {editingId === req.id ? (
                                    <div className="p-10 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Crop Name</Label>
                                                <Input value={editData.cropName || ""} onChange={e => setEditData({...editData, cropName: e.target.value})} className="rounded-md font-bold h-12" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity (kg)</Label>
                                                <Input type="number" value={editData.quantity || ""} onChange={e => setEditData({...editData, quantity: parseFloat(e.target.value) || 0})} className="rounded-md font-bold h-12" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button onClick={() => handleUpdate(req.id)} className="flex-1 bg-[#03230F] text-[#EEC044] font-black rounded-md py-7 uppercase text-xs tracking-widest">Save Changes</Button>
                                            <Button variant="ghost" onClick={() => setEditingId(null)} className="bg-gray-100 rounded-md font-bold px-8">Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                                            <div className="flex-1 space-y-5">
                                                <div className="flex items-center gap-4">
                                                    <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tight">{req.cropName}</h2>
                                                    {req.status === 'CLOSED' && (
                                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase border border-gray-200 tracking-tighter">
                                                            Closed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-10 text-gray-500 font-bold text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                                                            <Scale className="w-4 h-4 text-[#EEC044]" /> Expected Qty
                                                        </span>
                                                        <p className="text-gray-900 font-black text-2xl">{req.quantity}kg</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                                                            <Banknote className="w-4 h-4 text-[#EEC044]" /> Expected Price
                                                        </span>
                                                        <p className="text-gray-900 font-black text-2xl">Rs.{req.expectedUnitPrice}/kg</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-5 min-w-[200px]">
                                                <button 
                                                    onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                                                    className={`w-full px-8 py-4 rounded-md font-black text-[11px] uppercase tracking-widest flex items-center justify-between border transition-all ${reqOffers.length > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                                >
                                                    <span>{reqOffers.length} Responses</span>
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                                {req.status === 'OPEN' && (
                                                    <div className="flex gap-3">
                                                        <Button variant="ghost" onClick={() => { setEditingId(req.id); setEditData(req); }} className="p-4 bg-gray-50 border border-gray-100 rounded-md hover:bg-gray-100"><Edit3 className="w-5 h-5 text-gray-600" /></Button>
                                                        <Button variant="ghost" onClick={() => { setItemToDelete(req.id); setShowDeletePopup(true); }} className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-md hover:bg-red-100"><Trash2 className="w-5 h-5" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-10 pt-10 border-t border-gray-100 space-y-6">
                                                {reqOffers.length === 0 ? (
                                                    <p className="text-center py-10 text-gray-400 font-bold uppercase text-[11px] tracking-widest">No responses yet.</p>
                                                ) : (
                                                    reqOffers.map((offer) => (
                                                        <div key={offer.id} className="bg-white rounded-md p-8 flex flex-col lg:flex-row justify-between items-center gap-8 border border-gray-200 shadow-sm transition-hover hover:shadow-md">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-14 h-14 bg-gray-50 rounded-md flex items-center justify-center border border-gray-100">
                                                                    <User className="text-[#68D391] w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-[#03230F] uppercase text-base">{offer.sellerName}</h4>
                                                                    <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">
                                                                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#EEC044]"/> {offer.contactNumber}</span>
                                                                        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#EEC044]"/> {offer.deliveryOption}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-12">
                                                                <div className="min-w-[100px]">
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Supply</p>
                                                                    <p className="text-xl font-black text-[#03230F]">{offer.supplyQty} kg</p>
                                                                </div>

                                                                <div className="text-right min-w-[100px]">
                                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                                                    <p className="text-xl font-black text-[#03230F]">Rs. {offer.unitPrice}/kg</p>
                                                                </div>
                                                                
                                                                <div className="flex gap-3">
                                                                    {req.status === 'OPEN' ? (
                                                                        <Button onClick={() => handleAcceptOffer(req.id, offer.id)} className="bg-[#EEC044] text-[#03230F] rounded-md px-8 h-12 font-black uppercase text-[11px] shadow-md tracking-widest flex items-center gap-2 hover:bg-[#d4b43a]">
                                                                            <CheckCircle className="w-4 h-4" /> Accept Offer
                                                                        </Button>
                                                                    ) : (
                                                                        <div className={`px-8 h-12 flex items-center border rounded-md font-bold text-[11px] uppercase tracking-widest ${offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-400 border-gray-100'}`}>
                                                                            {offer.status === 'ACCEPTED' ? 'Accepted' : 'Closed'}
                                                                        </div>
                                                                    )}
                                                                    <Button onClick={() => router.push(`/buyer/chat/?receiverId=${offer.sellerId}`)} className="bg-[#03230F] text-[#EEC044] rounded-md px-8 h-12 font-black uppercase text-[11px] tracking-widest hover:bg-black">
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