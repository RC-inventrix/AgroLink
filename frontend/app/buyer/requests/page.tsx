"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Edit3, Trash2, Calendar, Scale, Banknote, 
    Loader2, CheckCircle, ChevronDown, MessageCircle, Truck, Phone, User, AlertTriangle, MapPin, AlignLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BuyerHeader from "@/components/headers/BuyerHeader"
import { DashboardNav } from "@/components/dashboard-nav"
import Footer2 from "@/components/footer/Footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    const [navUnread, setNavUnread] = useState(0) 

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
            const res = await fetch(`${API_URL}/api/offers/requirement/${reqId}`, {
                headers: { "Authorization": `Bearer ${currentToken}` }
            });
            
            if (res.ok) {
                const offerData: Offer[] = await res.json();
                if (offerData.length > 0) {
                    const sellerIds = Array.from(new Set(offerData.map(o => o.sellerId))).join(',');
                    const nameRes = await fetch(`${API_URL}/auth/fullnames?ids=${sellerIds}`, {
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
            const res = await fetch(`${API_URL}/api/requirements/buyer/${userId}`, {
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
            const offerRes = await fetch(`${API_URL}/api/offers/${offerId}/status`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: "ACCEPTED" })
            });

            if (!offerRes.ok) throw new Error("Failed to update offer status");

            const reqPayload = { ...reqToUpdate, status: "CLOSED" };
            const reqRes = await fetch(`${API_URL}/api/requirements/${reqId}`, {
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
            const payload = { 
                ...editData, 
                id, 
                quantity: Number(editData.quantity), 
                expectedUnitPrice: Number(editData.expectedUnitPrice) 
            };
            const res = await fetch(`${API_URL}/api/requirements/${id}`, {
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
            const res = await fetch(`${API_URL}/api/requirements/${itemToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) { setShowDeletePopup(false); fetchMyRequirements(); }
        } catch (err) { console.error("Delete failed", err); } finally { setIsDeleting(false); setItemToDelete(null); }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <BuyerHeader />

            {/* DELETE POPUP */}
            {showDeletePopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md p-8 border-none shadow-2xl rounded-2xl bg-white text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2 tracking-tight">Delete Request?</h2>
                        <p className="text-sm text-gray-500 mb-8 font-medium">This action cannot be undone.</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-6 rounded-xl uppercase tracking-widest text-xs shadow-lg transition-all">
                                {isDeleting ? <Loader2 className="animate-spin" /> : "Yes, Delete"}
                            </Button>
                            <button onClick={() => setShowDeletePopup(false)} className="w-full font-bold text-gray-400 py-3 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}
            
            <div className="flex flex-1">
            
                <DashboardNav unreadCount={navUnread} />

                <main className="flex-1 w-full overflow-x-hidden flex flex-col p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto w-full">
                        
                        {/* Theme Colors Applied: Clean Header Style from 1st Image */}
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4">
                            <div>
                                <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">My Item Requests</h1>
                                <p className="text-[#A3ACBA] font-medium">Manage your requirements and accept seller proposals</p>
                            </div>
                            <Link href="/buyer/requests/new-request" className="w-full md:w-auto">
                                <button className="w-full bg-[#03230F] text-[#EEC044] rounded-full px-8 py-3.5 font-bold uppercase text-xs tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2">
                                    <AlignLeft className="w-4 h-4" /> New Request
                                </button>
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex flex-col min-h-[40vh] items-center justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-[#EEC044] mb-4" />
                                <p className="text-[#03230F] font-bold text-lg">Loading your requests...</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {requirements.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
                                        <p className="text-[#03230F] font-bold text-lg mb-1">No requests found.</p>
                                        <p className="text-gray-500 text-sm">Click 'New Request' to add your first requirement.</p>
                                    </div>
                                ) : (
                                    requirements.map((req) => {
                                        const reqOffers = offers[req.id] || [];
                                        const isExpanded = expandedReqId === req.id;

                                        return (
                                            <Card key={req.id} className="p-0 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white relative min-h-[260px] flex flex-col justify-center">
                                                <div className={`absolute top-0 left-0 w-2 h-full ${req.status === 'CLOSED' ? 'bg-gray-400' : 'bg-[#EEC044]'}`} />
                                                
                                                {editingId === req.id ? (
                                                    <div className="p-8 lg:p-10 space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-[#03230F] uppercase tracking-widest">Crop Name</Label>
                                                                <Input value={editData.cropName || ""} onChange={e => setEditData({...editData, cropName: e.target.value})} className="rounded-xl font-bold bg-gray-50 border-gray-200 focus:ring-[#EEC044]" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-[#03230F] uppercase tracking-widest">Quantity (kg)</Label>
                                                                <Input type="number" value={editData.quantity || ""} onChange={e => setEditData({...editData, quantity: parseFloat(e.target.value) || 0})} className="rounded-xl font-bold bg-gray-50 border-gray-200 focus:ring-[#EEC044]" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-[#03230F] uppercase tracking-widest">Expected Price (Rs.)</Label>
                                                                <Input type="number" value={editData.expectedUnitPrice || ""} onChange={e => setEditData({...editData, expectedUnitPrice: parseFloat(e.target.value) || 0})} className="rounded-xl font-bold bg-gray-50 border-gray-200 focus:ring-[#EEC044]" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-[#03230F] uppercase tracking-widest">Expected Date</Label>
                                                                <Input type="date" value={editData.expectedDate || ""} onChange={e => setEditData({...editData, expectedDate: e.target.value})} className="rounded-xl font-bold bg-gray-50 border-gray-200 focus:ring-[#EEC044]" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-[#03230F] uppercase tracking-widest">Delivery Address</Label>
                                                            <Input value={editData.deliveryAddress || ""} onChange={e => setEditData({...editData, deliveryAddress: e.target.value})} className="rounded-xl font-bold bg-gray-50 border-gray-200 focus:ring-[#EEC044]" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-[#03230F] uppercase tracking-widest">Description</Label>
                                                            <Textarea value={editData.description || ""} onChange={e => setEditData({...editData, description: e.target.value})} className="rounded-xl font-medium bg-gray-50 border-gray-200 focus:ring-[#EEC044] min-h-[100px] resize-none" />
                                                        </div>
                                                        <div className="flex gap-4 pt-4">
                                                            <Button onClick={() => handleUpdate(req.id)} className="flex-1 bg-[#03230F] text-[#EEC044] hover:bg-black font-black rounded-xl py-6 uppercase text-xs tracking-widest shadow-md transition-all">Save Changes</Button>
                                                            <Button variant="outline" onClick={() => setEditingId(null)} className="rounded-xl font-bold px-8 py-6 border-gray-200 text-gray-500 hover:bg-gray-50 uppercase text-xs tracking-widest">Cancel</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-8 lg:p-10">
                                                        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                                                            <div className="flex-1 space-y-6 w-full">
                                                                <div className="flex items-center gap-4">
                                                                    <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tight">{req.cropName}</h2>
                                                                    <span className={`text-[10px] font-bold px-4 py-1.5 rounded-md uppercase border tracking-widest ${req.status === 'CLOSED' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-[#EEC044]/20 text-[#03230F] border-none'}`}>
                                                                        {req.status}
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-500 font-bold text-sm">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><Scale className="w-3.5 h-3.5 text-[#EEC044]" /> Qty</span>
                                                                        <p className="text-[#03230F] font-black text-xl">{req.quantity} kg</p>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><Banknote className="w-3.5 h-3.5 text-[#EEC044]" /> Price</span>
                                                                        <p className="text-[#03230F] font-black text-xl">Rs. {req.expectedUnitPrice}</p>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><Calendar className="w-3.5 h-3.5 text-[#EEC044]" /> Needed By</span>
                                                                        <p className="text-[#03230F] font-black text-sm">{new Date(req.expectedDate).toLocaleDateString()}</p>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><MapPin className="w-3.5 h-3.5 text-[#EEC044]" /> Address</span>
                                                                        <p className="text-[#03230F] font-black text-xs truncate max-w-[150px]">{req.deliveryAddress}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                                                    <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#03230F] font-black mb-2">
                                                                        <AlignLeft className="w-3 h-3 text-[#EEC044]" /> Description
                                                                    </span>
                                                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                                                        {req.description || "No additional description provided."}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-end gap-5 min-w-[200px] w-full md:w-auto">
                                                                <button 
                                                                    onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                                                                    className={`w-full px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-between border transition-all shadow-sm ${reqOffers.length > 0 ? 'bg-[#03230F] text-[#EEC044] border-black hover:bg-black' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                                                                >
                                                                    <span>{reqOffers.length} Responses</span>
                                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {req.status === 'OPEN' && (
                                                                    <div className="flex gap-3 w-full">
                                                                        <Button variant="outline" onClick={() => { setEditingId(req.id); setEditData(req); }} className="flex-1 py-6 bg-white border-gray-200 rounded-xl hover:bg-gray-50"><Edit3 className="w-5 h-5 text-[#03230F]" /></Button>
                                                                        <Button variant="outline" onClick={() => { setItemToDelete(req.id); setShowDeletePopup(true); }} className="flex-1 py-6 bg-white border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200"><Trash2 className="w-5 h-5 text-red-500" /></Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="mt-10 pt-10 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                                                {reqOffers.length === 0 ? (
                                                                    <p className="text-center py-10 text-gray-400 font-bold uppercase text-[11px] tracking-widest">No responses yet.</p>
                                                                ) : (
                                                                    reqOffers.map((offer) => (
                                                                        <div key={offer.id} className="bg-gray-50/50 rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-center gap-8 border border-gray-200 hover:border-[#EEC044]/50 transition-all hover:bg-white hover:shadow-sm">
                                                                            <div className="flex items-center gap-6">
                                                                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                                                                                    <User className="text-[#03230F] w-6 h-6" />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-black text-[#03230F] uppercase text-base">{offer.sellerName}</h4>
                                                                                    <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 font-bold mt-1.5 uppercase tracking-wider">
                                                                                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border"><Phone className="w-3.5 h-3.5 text-[#EEC044]"/> {offer.contactNumber}</span>
                                                                                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border"><Truck className="w-3.5 h-3.5 text-[#EEC044]"/> {offer.deliveryOption}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end">
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
                                                                                        <Button onClick={() => handleAcceptOffer(req.id, offer.id)} className="bg-[#EEC044] text-[#03230F] rounded-xl px-8 h-12 font-black uppercase text-[11px] shadow-md tracking-widest flex items-center gap-2 hover:bg-[#d4b43a] transition-all">
                                                                                            <CheckCircle className="w-4 h-4" /> Accept
                                                                                        </Button>
                                                                                    ) : (
                                                                                        <div className={`px-8 h-12 flex items-center border rounded-xl font-bold text-[11px] uppercase tracking-widest ${offer.status === 'ACCEPTED' ? 'bg-[#03230F] text-[#EEC044] border-black shadow-md' : 'bg-white text-gray-400 border-gray-200'}`}>
                                                                                            {offer.status === 'ACCEPTED' ? 'Accepted' : 'Closed'}
                                                                                        </div>
                                                                                    )}
                                                                                    <Button onClick={() => router.push(`/buyer/chat/?receiverId=${offer.sellerId}`)} className="bg-white border border-gray-200 text-[#03230F] rounded-xl px-6 h-12 font-black uppercase text-[11px] tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                                                                                        <MessageCircle className="w-4 h-4" />
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
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            
            <Footer2 />
        </div>
    );
}