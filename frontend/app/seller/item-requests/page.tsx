"use client"

import React, { useState, useEffect, useCallback, ChangeEvent, useMemo } from 'react'
import dynamic from "next/dynamic"
import SellerHeader from '@/components/headers/SellerHeader'
import SellerSidebar from '../dashboard/SellerSideBar'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import "leaflet/dist/leaflet.css";
import {
    MessageCircle, CheckCircle, XCircle, Scale,
    Banknote, Loader2, User, Upload, X, Truck, Phone, Inbox, Send,
    AlertTriangle, MapPin, Calendar, AlignLeft, Store, Navigation, Filter, Search
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import citiesData from "@/data/srilanka-cities.json"
import '../dashboard/SellerDashboard.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- SSR Safe Components ---
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

// THE FIX: Import LocationPicker dynamically with SSR disabled directly in this file
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">Initialising Map...</div>
});

interface Requirement {
    id: number;
    buyerId: number;
    buyerName?: string;
    cropName: string;
    quantity: number;
    expectedUnitPrice: number;
    deliveryAddress: string;
    contactNumber?: string;
    province?: string;
    district?: string;
    city?: string;
    deliveryMethod?: string;
    latitude?: number;
    longitude?: number;
    expectedDate: string;
    description: string;
    status: string;
}

const ItemRequestsPage = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<Requirement[]>([]);
    const [myRespondedIds, setMyRespondedIds] = useState<Set<number>>(new Set());
    const [offerStatuses, setOfferStatuses] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'new' | 'responded'>('new');

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const districts = useMemo(() => {
        if (!selectedProvince) return [];
        return citiesData.provinces.find(p => p.name === selectedProvince)?.districts || [];
    }, [selectedProvince]);

    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showRejectPopup, setShowRejectPopup] = useState(false);
    const [itemToReject, setItemToReject] = useState<number | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [mapData, setMapData] = useState({ lat: 0, lng: 0, address: "", city: "" });

    const [offerData, setOfferData] = useState({
        supplyQty: "", unitPrice: "", contactNumber: "",
        image: null as File | null, imagePreview: ""
    });

    const [sellerLocation, setSellerLocation] = useState({
        province: "", district: "", city: "", streetAddress: "",
        latitude: null as number | null, longitude: null as number | null
    });

    const token = typeof window !== 'undefined' ? sessionStorage.getItem("token") : null;
    const sellerId = typeof window !== 'undefined' ? sessionStorage.getItem("id") : null;

    const loadData = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true);
        try {
            const [openRes, fulfilledRes] = await Promise.all([
                fetch(`${API_URL}/api/requirements/status/OPEN`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/api/requirements/status/FULFILLED`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);
            const offerRes = await fetch(`${API_URL}/api/offers/seller/${sellerId}`, { headers: { "Authorization": `Bearer ${token}` } });

            if (openRes.ok && fulfilledRes.ok && offerRes.ok) {
                const openData: Requirement[] = await openRes.json();
                const fulfilledData: Requirement[] = await fulfilledRes.json();
                const myOffers = await offerRes.json();
                const combinedReqs = [...openData, ...fulfilledData];
                
                const respondedIds = new Set<number>();
                const statusMap: Record<number, string> = {};
                myOffers.forEach((o: any) => {
                    respondedIds.add(o.requirementId);
                    statusMap[o.requirementId] = o.status;
                });
                setMyRespondedIds(respondedIds);
                setOfferStatuses(statusMap);

                const uniqueBuyerIds = Array.from(new Set(combinedReqs.map(r => r.buyerId)));
                if (uniqueBuyerIds.length > 0) {
                    const nameRes = await fetch(`${API_URL}/auth/fullnames?ids=${uniqueBuyerIds.join(',')}`, { headers: { "Authorization": `Bearer ${token}` } });
                    const nameMap = nameRes.ok ? await nameRes.json() : {};
                    setRequests(combinedReqs.map(req => ({ ...req, buyerName: nameMap[req.buyerId] || "Unknown User" })));
                } else { setRequests(combinedReqs); }
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, [sellerId, token]);

    useEffect(() => { loadData(); }, [loadData]);

    const displayedRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesTab = activeTab === 'new' ? (req.status === 'OPEN' && !myRespondedIds.has(req.id)) : myRespondedIds.has(req.id);
            const matchesSearch = req.cropName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProvince = selectedProvince ? req.province === selectedProvince : true;
            const matchesDistrict = selectedDistrict ? req.district === selectedDistrict : true;
            return matchesTab && matchesSearch && matchesProvince && matchesDistrict;
        });
    }, [requests, activeTab, myRespondedIds, searchQuery, selectedProvince, selectedDistrict]);

    const handleViewOnMap = (req: Requirement) => {
        if (req.latitude && req.longitude) {
            setMapData({ lat: req.latitude, lng: req.longitude, address: req.deliveryAddress, city: req.city || "Location" });
            setIsMapModalOpen(true);
        }
    };

    const handleOpenOffer = async (req: Requirement) => {
        setSelectedReq(req);
        let dbPhoneNumber = "";
        if (sellerId && token) {
            try {
                const response = await fetch(`${API_URL}/auth/user/${sellerId}`, { headers: { "Authorization": `Bearer ${token}` } });
                if (response.ok) {
                    const userData = await response.json();
                    dbPhoneNumber = userData.phone || "";
                }
            } catch (err) { console.error(err); }
        }
        setOfferData({ supplyQty: "", unitPrice: req.expectedUnitPrice.toString(), contactNumber: dbPhoneNumber, image: null, imagePreview: "" });
        setIsOfferModalOpen(true);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOfferData(prev => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
        }
    };

   // Inside handleSubmitOffer in ItemRequestsPage.tsx
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
        deliveryOption: selectedReq.deliveryMethod === 'DELIVERY' ? 'Seller Delivery' : 'Buyer Pickup',
        
        // Ensure these keys match the Java fields exactly
        pickupLatitude: selectedReq.deliveryMethod === 'PICKUP' ? sellerLocation.latitude : null,
        pickupLongitude: selectedReq.deliveryMethod === 'PICKUP' ? sellerLocation.longitude : null,
        pickupAddress: selectedReq.deliveryMethod === 'PICKUP' ? sellerLocation.streetAddress : null,
        
        // This must be a string URL
        imageUrl: offerData.imagePreview || null 
    };

    try {
        const res = await fetch(`${API_URL}/api/offers/create`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) { 
            setIsOfferModalOpen(false); 
            setShowSuccessPopup(true); 
            loadData(); 
        }
    } catch (err) { 
        console.error("Update failed", err); 
    } finally { 
        setSubmitting(false); 
    }
};

    const confirmReject = () => {
        if (itemToReject !== null) {
            setMyRespondedIds(prev => { const newSet = new Set(prev); newSet.add(itemToReject); return newSet; });
            setShowRejectPopup(false);
            setItemToReject(null);
        }
    };

    const openChat = (buyerId: number) => { router.push(`/seller/chat?receiverId=${buyerId}`); };

    return (
        <div className="min-h-screen bg-gray-50 relative font-sans text-[#03230F]">
            <SellerHeader />
            <div className='flex'>
                <SellerSidebar unreadCount={0} activePage='item-requests' />

                <main className="flex-1 p-8">
                    <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-[#03230F]">Buyer Crop Needs</h1>
                            <p className="text-gray-500 font-medium">Browse and respond to bulk buyer requirements</p>
                        </div>
                        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                            <button onClick={() => setActiveTab('new')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'new' ? 'bg-[#03230F] text-[#EEC044] shadow-lg' : 'text-gray-400 hover:text-[#03230F]'}`}>
                                <Inbox className="w-4 h-4" /> New Requests
                            </button>
                            <button onClick={() => setActiveTab('responded')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'responded' ? 'bg-[#03230F] text-[#EEC044] shadow-lg' : 'text-gray-400 hover:text-[#03230F]'}`}>
                                <Send className="w-4 h-4" /> Responded
                            </button>
                        </div>
                    </div>

                    <Card className="mb-8 p-6 bg-white border-none shadow-sm rounded-3xl space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-[2] relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search crop..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-bold text-gray-600 outline-none focus:border-[#EEC044] transition-all" />
                            </div>
                            <div className="flex-[3] flex gap-4">
                                <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(""); }} className="flex-1 h-12 px-4 rounded-2xl border border-gray-100 bg-gray-50 text-xs font-black uppercase outline-none">
                                    <option value="">All Provinces</option>
                                    {citiesData.provinces.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                                <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedProvince} className="flex-1 h-12 px-4 rounded-2xl border border-gray-100 bg-gray-50 text-xs font-black uppercase outline-none disabled:opacity-50">
                                    <option value="">All Districts</option>
                                    {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                                {(searchQuery || selectedProvince) && <button onClick={() => { setSearchQuery(""); setSelectedProvince(""); setSelectedDistrict(""); }} className="px-4 text-[10px] font-black uppercase text-red-500">Reset</button>}
                            </div>
                        </div>
                    </Card>

                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#EEC044] w-10 h-10" /></div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {displayedRequests.map((req) => (
                                <Card key={req.id} className="overflow-hidden border border-gray-200 shadow-md rounded-lg bg-white relative flex flex-col transition-all hover:shadow-xl">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />
                                    <div className="p-8 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 text-[#EEC044] mb-1">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Requester: <span className="text-[#03230F]">{req.buyerName}</span></span>
                                                </div>
                                                <h2 className="text-2xl font-bold text-[#03230F]">{req.cropName}</h2>
                                                <div className="flex gap-2 mt-2">
                                                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${req.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{req.status}</div>
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100"><Truck className="w-2.5 h-2.5" /> {req.deliveryMethod}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" onClick={() => openChat(req.buyerId)} className="bg-gray-100 text-[#03230F] rounded-2xl hover:bg-[#EEC044]/20 gap-2 font-bold px-4 py-6">
                                                <MessageCircle className="w-5 h-5 text-[#EEC044]" /> Chat
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Volume</span><span className="flex items-center gap-2 text-lg font-black text-[#03230F]"><Scale className="w-5 h-5 text-[#EEC044]" /> {req.quantity} KG</span></div>
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Price</span><span className="flex items-center gap-2 text-lg font-black text-[#03230F]"><Banknote className="w-5 h-5 text-[#EEC044]" /> Rs. {req.expectedUnitPrice}/kg</span></div>
                                        </div>
                                        <div className="flex flex-col mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#EEC044]" /> Collection / Delivery Point</span>
                                                {req.latitude && req.longitude && (
                                                    <button onClick={() => handleViewOnMap(req)} className="text-[9px] font-black text-[#03230F] uppercase tracking-widest bg-[#EEC044] px-2 py-1 rounded hover:bg-black hover:text-white transition-all shadow-sm">View on Map</button>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-sm font-bold">
                                                <p>{req.city}, {req.district}</p>
                                                <p className="text-xs text-gray-500 font-medium">{req.deliveryAddress}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8"><span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2"><AlignLeft className="w-3 h-3 text-[#EEC044]" /> Buyer Notes</span><p className="text-xs text-gray-600 font-medium leading-relaxed">{req.description || "No additional details."}</p></div>
                                        <div className="flex gap-4">
                                            {activeTab === 'new' ? (
                                                <>
                                                    <Button onClick={() => handleOpenOffer(req)} className="flex bg-[#03230F] text-[#EEC044] py-3 rounded-md uppercase tracking-widest shadow-lg hover:bg-black gap-2 transition-all active:scale-95 flex-1"><CheckCircle className="w-5 h-5" /> Send an Offer</Button>
                                                    <Button variant="outline" onClick={() => { setItemToReject(req.id); setShowRejectPopup(true); }} className="border-2 border-gray-100 text-red-500 font-bold py-3 px-10 rounded-md uppercase tracking-widest hover:bg-red-50 gap-2 transition-all"><XCircle className="w-5 h-5" /> Reject</Button>
                                                </>
                                            ) : (
                                                <div className="w-full py-4 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50 border-[#EEC044]/30"><span className="text-[#03230F] font-black uppercase text-xs tracking-widest">Offer Submitted</span></div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* View Location Modal (Read Only) */}
            <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
                <DialogContent className="max-w-3xl rounded-[35px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-white border-b"><DialogTitle className="flex items-center gap-2 text-[#03230F] font-black uppercase tracking-tight"><MapPin className="text-[#EEC044]" /> Destination: {mapData.city}</DialogTitle></DialogHeader>
                    <div className="h-[450px] w-full relative z-0 bg-gray-100">
                        {typeof window !== 'undefined' && isMapModalOpen && (
                            <MapContainer center={[mapData.lat, mapData.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
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
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${mapData.lat},${mapData.lng}`, '_blank')}
                            className="bg-[#03230F] text-[#EEC044] font-black gap-2 rounded-2xl h-14 px-8 shadow-xl hover:bg-black"
                        >
                            <Navigation className="w-4 h-4" /> Open GPS
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- OFFER SENDING MODAL --- */}
            {isOfferModalOpen && selectedReq && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <Card className="w-full max-w-2xl p-8 border-none shadow-2xl rounded-[30px] bg-white relative my-4 sm:my-8 mb-20">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />
                        
                        <button 
                            onClick={() => setIsOfferModalOpen(false)} 
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none z-10"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tight leading-none mb-2">Create Offer</h2>
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                                Requirement: {selectedReq.cropName} ({selectedReq.quantity}kg)
                            </p>
                        </div>

                        <form onSubmit={handleSubmitOffer} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#03230F] font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                                        <Scale className="w-3.5 h-3.5 text-[#EEC044]" /> Supply Amount (kg)
                                    </Label>
                                    <Input required type="number" placeholder={`Max ${selectedReq.quantity}kg`} className="rounded-xl border-gray-200 bg-gray-50 h-12 font-bold text-sm" value={offerData.supplyQty} onChange={(e) => setOfferData({ ...offerData, supplyQty: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#03230F] font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                                        <Banknote className="w-3.5 h-3.5 text-[#EEC044]" /> Unit Price (LKR/kg)
                                    </Label>
                                    <Input required type="number" className="rounded-xl border-gray-200 bg-gray-50 h-12 font-bold text-sm" value={offerData.unitPrice} onChange={(e) => setOfferData({ ...offerData, unitPrice: e.target.value })} />
                                </div>
                            </div>
                            
                            {/* Fulfillment Details Section */}
                            {/* ... inside the Offer Modal form ... */}

{/* Fulfillment Details Section */}
<div className="p-6 rounded-[25px] border-2 border-gray-100 bg-gray-50/50 space-y-4">
    <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2">
        <Truck className="w-4 h-4 text-[#EEC044]" /> Fulfillment: {selectedReq.deliveryMethod}
    </Label>

    {selectedReq.deliveryMethod === 'DELIVERY' ? (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Deliver to:</p>
            <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                <MapPin className="w-5 h-5 text-[#EEC044] shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold">{selectedReq.city}, {selectedReq.district}</p>
                    <p className="text-xs text-gray-600">{selectedReq.deliveryAddress}</p>
                </div>
            </div>
        </div>
    ) : (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Select Your Pickup Point:</p>
            
            {/* THE FIX: Scrollable wrapper for the Location Selection section */}
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border border-gray-200 rounded-2xl p-4 bg-white shadow-inner">
                <LocationPicker 
                    value={sellerLocation}
                    onChange={setSellerLocation}
                    variant="light"
                    showStreetAddress={true}
                    required={true}
                />
            </div>
            <p className="text-[9px] text-gray-400 italic text-center">Scroll above to view the map and address fields</p>
        </div>
    )}
</div>

{/* ... rest of the form ... */}

                            <div className="space-y-2">
                                <Label className="text-[#03230F] font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-[#EEC044]" /> Contact No
                                </Label>
                                <Input required type="tel" className="rounded-xl border-gray-200 bg-gray-50 h-12 font-bold text-sm" value={offerData.contactNumber} onChange={(e) => setOfferData({ ...offerData, contactNumber: e.target.value })} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-[#03230F] font-black text-[11px] uppercase tracking-widest flex items-center gap-2"><Upload className="w-3.5 h-3.5 text-[#EEC044]" /> Product Image</Label>
                                <div className="relative group cursor-pointer">
                                    <input type="file" accept="image/*" className="hidden" id="offer-img" onChange={handleImageChange} />
                                    <label htmlFor="offer-img" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                                        {offerData.imagePreview ? <img src={offerData.imagePreview} className="h-24 w-auto rounded-md object-cover" alt="Preview" /> : <><Upload className="w-6 h-6 text-gray-300 mb-1" /><span className="text-gray-400 font-bold uppercase text-[9px] tracking-widest text-center">Click to upload photo</span></>}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={submitting} className="flex-1 bg-[#03230F] text-[#EEC044] font-black py-7 rounded-2xl uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all active:scale-95">
                                    {submitting ? <Loader2 className="animate-spin" /> : "Confirm Offer"}
                                </Button>
                                <Button type="button" onClick={() => setIsOfferModalOpen(false)} className="px-8 bg-gray-100 text-gray-400 font-bold py-7 rounded-2xl uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">Cancel</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-10 border-none shadow-2xl rounded-[40px] bg-white text-center">
                        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce"><CheckCircle className="w-12 h-12 text-green-500" /></div>
                        <h2 className="text-3xl font-black text-[#03230F] uppercase tracking-tighter mb-3">Offer Sent!</h2>
                        <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm">Your proposal has been successfully delivered to the buyer.</p>
                        <Button onClick={() => setShowSuccessPopup(false)} className="w-full bg-[#03230F] text-[#EEC044] font-black py-7 rounded-2xl uppercase tracking-widest shadow-xl hover:bg-black">Got it!</Button>
                    </Card>
                </div>
            )}

            {/* Reject Confirmation Popup */}
            {showRejectPopup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-10 border-none shadow-2xl rounded-[40px] bg-white text-center">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2">Reject Request?</h2>
                        <p className="text-gray-500 text-sm mb-8 font-sans">This request will be removed from your view.</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={confirmReject} className="w-full bg-[#03230F] text-[#EEC044] font-bold py-7 rounded-2xl uppercase shadow-xl hover:bg-black transition-all active:scale-95">Yes, Reject</Button>
                            <button onClick={() => { setShowRejectPopup(false); setItemToReject(null); }} className="w-full font-bold text-gray-400 py-4 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors focus:outline-none">Cancel</button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default ItemRequestsPage;