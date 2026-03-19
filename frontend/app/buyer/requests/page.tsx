"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import "leaflet/dist/leaflet.css"
import { 
    Edit3, Trash2, Calendar, Scale, Banknote, 
    Loader2, CheckCircle, ChevronDown, MessageCircle, Truck, Phone, AlertTriangle, MapPin, AlignLeft, Image as ImageIcon, Navigation
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BuyerHeader from "@/components/headers/BuyerHeader"
import { DashboardNav } from "@/components/dashboard-nav"
import Footer2 from "@/components/footer/Footer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// SSR safe Map imports
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

interface Requirement {
    id: number;
    cropName: string;
    quantity: number;
    expectedUnitPrice: number;
    deliveryAddress: string;
    status: string; 
    description: string;
    expectedDate: string;
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
    imageUrl?: string;      
    status: string; 
    createdAt: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    pickupAddress?: string;
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

    // Map Modal States
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [mapData, setMapData] = useState({ lat: 0, lng: 0, address: "", city: "" });

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
        } catch (err) { console.error("Error fetching offers", err); }
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
        } catch (err) { console.error("Fetch requirements failed", err); } 
        finally { setLoading(false); }
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
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ status: "ACCEPTED" })
            });
            if (!offerRes.ok) throw new Error("Failed to update offer status");
            const reqPayload = { ...reqToUpdate, status: "CLOSED" };
            const reqRes = await fetch(`${API_URL}/api/requirements/${reqId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(reqPayload)
            });
            if (reqRes.ok) {
                alert("Deal Confirmed! This request is now closed and the offer is accepted.");
                fetchMyRequirements();
            }
        } catch (err) { alert("Could not accept offer. Please try again."); }
    };

    const handleUpdate = async (id: number) => {
        if (!token) return;
        try {
            const payload = { ...editData, id, quantity: Number(editData.quantity), expectedUnitPrice: Number(editData.expectedUnitPrice) };
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
        } catch (err) { console.error("Delete failed", err); } 
        finally { setIsDeleting(false); setItemToDelete(null); }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
            <BuyerHeader />

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
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-[#03230F]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {requirements.map((req) => {
                                    const isExpanded = expandedReqId === req.id;
                                    const reqOffers = offers[req.id] || [];

                                    return (
                                        <Card key={req.id} className="p-0 overflow-hidden border border-gray-200 shadow-md rounded-lg bg-white relative min-h-[260px] flex flex-col justify-center">
                                            <div className={`absolute top-0 left-0 w-2 h-full ${req.status === 'CLOSED' ? 'bg-gray-400' : 'bg-[#EEC044]'}`} />
                                            
                                            {editingId === req.id ? (
                                                <div className="p-10 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Crop Name</Label>
                                                            <Input value={editData.cropName || ""} onChange={e => setEditData({...editData, cropName: e.target.value})} className="rounded-md font-bold text-[#03230F]" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity (kg)</Label>
                                                            <Input type="number" value={editData.quantity || ""} onChange={e => setEditData({...editData, quantity: parseFloat(e.target.value) || 0})} className="rounded-md font-bold text-[#03230F]" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Price (Rs.)</Label>
                                                            <Input type="number" value={editData.expectedUnitPrice || ""} onChange={e => setEditData({...editData, expectedUnitPrice: parseFloat(e.target.value) || 0})} className="rounded-md font-bold text-[#03230F]" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Date</Label>
                                                            <Input type="date" value={editData.expectedDate || ""} onChange={e => setEditData({...editData, expectedDate: e.target.value})} className="rounded-md font-bold text-[#03230F]" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</Label>
                                                        <Input value={editData.deliveryAddress || ""} onChange={e => setEditData({...editData, deliveryAddress: e.target.value})} className="rounded-md font-bold text-[#03230F]" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</Label>
                                                        <Textarea value={editData.description || ""} onChange={e => setEditData({...editData, description: e.target.value})} className="rounded-md font-bold min-h-[100px] text-[#03230F]" />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <Button onClick={() => handleUpdate(req.id)} className="flex-1 bg-[#03230F] text-[#EEC044] font-black rounded-md py-6 uppercase text-xs tracking-widest">Save Changes</Button>
                                                        <Button variant="ghost" onClick={() => setEditingId(null)} className="bg-gray-100 rounded-md font-bold px-8">Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-10">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                                                        <div className="flex-1 space-y-6 w-full">
                                                            <div className="flex items-center gap-4">
                                                                <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tight">{req.cropName}</h2>
                                                                <span className={`text-[10px] font-bold px-4 py-1.5 rounded-sm uppercase border tracking-tighter ${req.status === 'CLOSED' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                                    {req.status}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-gray-500 font-bold text-sm">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><Scale className="w-3.5 h-3.5 text-[#EEC044]" /> Qty</span>
                                                                    <p className="text-gray-900 font-black text-xl">{req.quantity}kg</p>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><Banknote className="w-3.5 h-3.5 text-[#EEC044]" /> Price</span>
                                                                    <p className="text-gray-900 font-black text-xl">Rs.{req.expectedUnitPrice}</p>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><Calendar className="w-3.5 h-3.5 text-[#EEC044]" /> Needed By</span>
                                                                    <p className="text-gray-900 font-black text-sm">{new Date(req.expectedDate).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400"><MapPin className="w-3.5 h-3.5 text-[#EEC044]" /> Address</span>
                                                                    <p className="text-gray-900 font-black text-xs truncate max-w-[150px]">{req.deliveryAddress}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-5 min-w-[200px] w-full md:w-auto">
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
                                                        <div className="mt-10 pt-10 border-t border-gray-100 space-y-8">
                                                            {reqOffers.length === 0 ? (
                                                                <p className="text-center py-10 text-gray-400 font-bold uppercase text-[11px] tracking-widest">No responses yet.</p>
                                                            ) : (
                                                                reqOffers.map((offer) => (
                                                                    <div key={offer.id} className="bg-white rounded-md p-0 overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                                                        <div className="flex flex-col md:flex-row">
                                                                            <div className="w-full md:w-1/3 lg:w-1/4 h-64 md:h-auto bg-gray-100 relative shrink-0 border-b md:border-b-0 md:border-r border-gray-100">
                                                                                {offer.imageUrl ? (
                                                                                    <img src={offer.imageUrl} alt="Product" className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                                                                                        <ImageIcon className="w-12 h-12" />
                                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image Available</span>
                                                                                    </div>
                                                                                )}
                                                                                <div className="absolute top-4 left-4">
                                                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${
                                                                                        offer.status === 'ACCEPTED' ? 'bg-green-500 text-white' : 'bg-[#03230F] text-[#EEC044]'
                                                                                    }`}>
                                                                                        {offer.status}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex-1 p-8 flex flex-col justify-between gap-6">
                                                                                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                                                                    <div className="space-y-4">
                                                                                        <div>
                                                                                            <h4 className="font-black text-[#03230F] uppercase text-xl leading-none">{offer.sellerName}</h4>
                                                                                            <div className="flex flex-wrap gap-4 text-[11px] text-gray-500 font-bold mt-2 uppercase tracking-tighter">
                                                                                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#EEC044]"/> {offer.contactNumber}</span>
                                                                                                <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#EEC044]"/> {offer.deliveryOption}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                        {offer.deliveryOption === 'Buyer Pickup' && offer.pickupAddress && (
                                                                                            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                                                                    <MapPin className="w-3 h-3 text-[#EEC044]" /> Seller Collection Point
                                                                                                </span>
                                                                                                <div className="flex justify-between items-center gap-4">
                                                                                                    <p className="text-xs font-bold text-[#03230F]">{offer.pickupAddress}</p>
                                                                                                    {offer.pickupLatitude && offer.pickupLongitude && (
                                                                                                        <button 
                                                                                                            onClick={() => {
                                                                                                                setMapData({
                                                                                                                    lat: offer.pickupLatitude!,
                                                                                                                    lng: offer.pickupLongitude!,
                                                                                                                    address: offer.pickupAddress!,
                                                                                                                    city: "Seller's Farm Location"
                                                                                                                });
                                                                                                                setIsMapModalOpen(true);
                                                                                                            }}
                                                                                                            className="text-[9px] font-black text-[#EEC044] uppercase bg-[#03230F] px-3 py-1.5 rounded-lg hover:bg-black transition-colors shrink-0"
                                                                                                        >
                                                                                                            View Map
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex gap-8 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 w-full lg:w-auto justify-center lg:justify-start">
                                                                                        <div className="text-center">
                                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Supply</p>
                                                                                            <p className="text-2xl font-black text-[#03230F]">{offer.supplyQty}kg</p>
                                                                                        </div>
                                                                                        <div className="w-px h-8 bg-gray-200" />
                                                                                        <div className="text-center">
                                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</p>
                                                                                            <p className="text-2xl font-black text-[#03230F]">Rs.{offer.unitPrice}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex gap-4 w-full">
                                                                                    {req.status === 'OPEN' ? (
                                                                                        <Button 
                                                                                            onClick={() => handleAcceptOffer(req.id, offer.id)} 
                                                                                            className="flex-1 bg-[#EEC044] text-[#03230F] rounded-xl h-14 font-black uppercase text-xs shadow-lg tracking-widest flex items-center justify-center gap-2 hover:bg-[#d4b43a]"
                                                                                        >
                                                                                            <CheckCircle className="w-5 h-5" /> Accept Seller Offer
                                                                                        </Button>
                                                                                    ) : (
                                                                                        <div className={`flex-1 h-14 flex items-center justify-center border-2 rounded-xl font-black text-xs uppercase tracking-widest ${
                                                                                            offer.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-300 border-gray-100'
                                                                                        }`}>
                                                                                            {offer.status === 'ACCEPTED' ? 'Offer Accepted' : 'Requirement Closed'}
                                                                                        </div>
                                                                                    )}
                                                                                    <Button 
                                                                                        onClick={() => router.push(`/buyer/chat/?receiverId=${offer.sellerId}`)} 
                                                                                        className="flex-1 bg-[#03230F] text-[#EEC044] rounded-xl h-14 font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg"
                                                                                    >
                                                                                        <MessageCircle className="w-5 h-5 mr-2" /> Message Seller
                                                                                    </Button>
                                                                                </div>
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
                        )}
                    </div>
                </main>
            </div>

            <Footer2 />

            <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
                <DialogContent className="max-w-3xl rounded-[35px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-white border-b">
                        <DialogTitle className="flex items-center gap-2 text-[#03230F] font-black uppercase tracking-tight">
                            <MapPin className="text-[#EEC044]" /> {mapData.city}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="h-[450px] w-full relative z-0 bg-gray-100">
                        {typeof window !== 'undefined' && isMapModalOpen && (
                            <MapContainer 
                                key={`${mapData.lat}-${mapData.lng}`} 
                                center={[mapData.lat, mapData.lng]} 
                                zoom={15} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[mapData.lat, mapData.lng]} />
                            </MapContainer>
                        )}
                    </div>
                    <div className="p-8 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6 text-[#03230F]">
                        <div className="space-y-1 flex-1 text-center sm:text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</p>
                            <p className="text-sm font-bold">{mapData.address}</p>
                        </div>
                        <Button 
                            onClick={() => window.open(`https://www.google.com/maps?q=${mapData.lat},${mapData.lng}`, '_blank')}
                            className="bg-[#03230F] text-[#EEC044] font-black gap-2 rounded-2xl h-14 px-8 shadow-xl hover:bg-black"
                        >
                            <Navigation className="w-4 h-4" /> Open GPS
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}