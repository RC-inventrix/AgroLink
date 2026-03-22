"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from "next/dynamic"
import SellerHeader from '@/components/headers/SellerHeader'
import SellerSidebar from '../dashboard/SellerSideBar'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import "leaflet/dist/leaflet.css";
import {
    CheckCircle, XCircle, Scale, Banknote, Loader2, Inbox, Send,
    MapPin, Calendar, Filter, Search, Truck, Store, Navigation,
    AlertTriangle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import citiesData from "@/data/srilanka-cities.json"
import '../dashboard/SellerDashboard.css';
import Footer2 from "@/components/footer/Footer"; 
import { useLanguage } from "@/context/LanguageContext" 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- SSR Safe Components ---
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { 
    ssr: false,
    loading: () => <div className="h-48 w-full bg-gray-50 animate-pulse rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">Initialising Map...</div>
});

let L: any;
if (typeof window !== "undefined") {
    L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

// --- HELPER: COUNTDOWN COMPONENT ---
function RequestCountdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const calculate = () => {
            const diff = new Date(targetDate).getTime() - new Date().getTime();
            if (diff <= 0) { setTimeLeft("Expired"); return; }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${d > 0 ? d + "d " : ""}${h}h ${m}m left`);
        };
        calculate();
        const timer = setInterval(calculate, 60000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${timeLeft === "Expired" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
            {timeLeft}
        </span>
    );
}

interface BuyerRequirement {
    id: number;
    buyerId: number;
    vegetableName: string;
    category: string;
    quantityKg: number;
    expectedPricePerKg: number;
    requiredByDate: string;
    deliveryRequired: boolean;
    buyerAddress: string;
    buyerCity: string;
    buyerLatitude: number | null;
    buyerLongitude: number | null;
    description: string;
    status: string;
    createdAt: string;
}

export default function BuyerRequirements() {
    const { t } = useLanguage(); 
    const router = useRouter()
    const [requirements, setRequirements] = useState<BuyerRequirement[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [selectedDistrict, setSelectedDistrict] = useState<string>("All")
    const [districts, setDistricts] = useState<string[]>([])
    const [offeredReqIds, setOfferedReqIds] = useState<Set<number>>(new Set())
    const [rejectedReqIds, setRejectedReqIds] = useState<Set<number>>(new Set())
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [selectedReq, setSelectedReq] = useState<BuyerRequirement | null>(null)
    const [offerPrice, setOfferPrice] = useState("")
    const [provideDelivery, setProvideDelivery] = useState(false)
    const [deliveryFeeFirst3Km, setDeliveryFeeFirst3Km] = useState("")
    const [deliveryFeePerKm, setDeliveryFeePerKm] = useState("")
    const [offerMessage, setOfferMessage] = useState("")
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)
    const [showRejectPopup, setShowRejectPopup] = useState(false)
    const [itemToReject, setItemToReject] = useState<number | null>(null)
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [mapData, setMapData] = useState({ lat: 0, lng: 0, address: "", city: "" });

    const [offerInputs, setOfferInputs] = useState({
        supplyQty: "",
        contactNumber: "",
        imagePreview: ""
    });

    const [sellerLocation, setSellerLocation] = useState({
        province: "", district: "", city: "", streetAddress: "",
        latitude: null as number | null, longitude: null as number | null
    });

    useEffect(() => {
        const allDistricts: string[] = [];
        citiesData.provinces?.forEach(p => p.districts?.forEach(d => allDistricts.push(d.name)));
        setDistricts(Array.from(new Set(allDistricts)).sort());
    }, [])

    useEffect(() => {
        const token = sessionStorage.getItem("token")
        const sellerId = sessionStorage.getItem("id")
        if (!token || !sellerId) { setLoading(false); return; }

        const fetchData = async () => {
            try {
                const [reqRes, offerRes, userRes] = await Promise.all([
                    fetch(`${API_URL}/api/requirements/status/OPEN`, { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/offers/seller/${sellerId}`, { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch(`${API_URL}/auth/user/${sellerId}`, { headers: { "Authorization": `Bearer ${token}` } })
                ]);

                if (reqRes.ok && offerRes.ok) {
                    const reqData: any[] = await reqRes.json();
                    const offerData: any[] = await offerRes.json();
                    const respondedIds = new Set(offerData.map(o => o.requirementId));
                    setOfferedReqIds(respondedIds);

                    const localRejects = JSON.parse(sessionStorage.getItem("rejectedReqs") || "[]")
                    const rejectedSet = new Set<number>(localRejects)
                    setRejectedReqIds(rejectedSet)

                    const mappedReqs: BuyerRequirement[] = reqData.map(req => ({
                        ...req,
                        deliveryRequired: req.deliveryMethod === 'DELIVERY', 
                        buyerCity: req.buyerCity || req.city || "Unknown City",
                        buyerAddress: req.buyerAddress || req.deliveryAddress || "",
                        buyerLatitude: req.buyerLatitude ?? req.latitude ?? null,
                        buyerLongitude: req.buyerLongitude ?? req.longitude ?? null,
                        quantityKg: req.quantity ?? 0,
                        expectedPricePerKg: req.expectedUnitPrice ?? 0,
                        vegetableName: req.vegetableName ?? req.cropName ?? "Unknown Product",
                        requiredByDate: req.requiredByDate || req.expectedDate || ""
                    }));

                    const filteredReqs = mappedReqs.filter(req => !respondedIds.has(req.id) && !rejectedSet.has(req.id))
                    filteredReqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    setRequirements(filteredReqs)
                }

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setSellerLocation({
                        province: userData.province || "",
                        district: userData.district || "",
                        city: userData.city || "",
                        streetAddress: userData.address || "",
                        latitude: userData.latitude || null,
                        longitude: userData.longitude || null
                    });
                    setOfferInputs(prev => ({ ...prev, contactNumber: userData.phone || "" }));
                }
            } catch (err) { console.error(err) } finally { setLoading(false) }
        }
        fetchData()
    }, [])

    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            const matchCategory = selectedCategory === "All" || req.category === selectedCategory;
            let matchDistrict = true;
            if (selectedDistrict !== "All") {
                matchDistrict = req.buyerCity.toLowerCase().includes(selectedDistrict.toLowerCase());
            }
            return matchCategory && matchDistrict;
        });
    }, [requirements, selectedCategory, selectedDistrict])

    const handleViewOnMap = (req: BuyerRequirement) => {
        if (req.buyerLatitude && req.buyerLongitude) {
            setMapData({ lat: req.buyerLatitude, lng: req.buyerLongitude, address: req.buyerAddress, city: req.buyerCity });
            setIsMapModalOpen(true);
        }
    };

    const handleMakeOfferClick = (req: BuyerRequirement) => {
        setSelectedReq(req)
        setOfferPrice((req.expectedPricePerKg || 0).toString())
        setProvideDelivery(false)
        setOfferMessage("")
        setShowOfferModal(true)
    }

    const submitOffer = async () => {
        if (!selectedReq) return;
        setIsSubmittingOffer(true);
        const token = sessionStorage.getItem("token")
        const sellerId = sessionStorage.getItem("id")

        const payload = {
            requirementId: selectedReq.id,
            sellerId: parseInt(sellerId || "0"),
            unitPrice: parseFloat(offerPrice),
            supplyQty: parseFloat(offerInputs.supplyQty),
            deliveryOption: provideDelivery ? "Seller Delivery" : "Buyer Pickup",
            contactNumber: offerInputs.contactNumber,
            message: offerMessage,
            imageUrl: offerInputs.imagePreview || null,
            ...(!selectedReq.deliveryRequired ? {
                pickupLatitude: sellerLocation.latitude,
                pickupLongitude: sellerLocation.longitude,
                pickupAddress: sellerLocation.streetAddress
            } : {})
        }

        try {
            const res = await fetch(`${API_URL}/api/offers/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setShowOfferModal(false);
                setRequirements(prev => prev.filter(r => r.id !== selectedReq.id));
                setOfferedReqIds(prev => new Set(prev).add(selectedReq.id));
            }
        } finally { setIsSubmittingOffer(false) }
    }

    const handleRejectClick = (id: number) => { setItemToReject(id); setShowRejectPopup(true); }

    const confirmReject = () => {
        if (itemToReject) {
            setRequirements(prev => prev.filter(r => r.id !== itemToReject));
            const updatedRejects = new Set(rejectedReqIds).add(itemToReject);
            setRejectedReqIds(updatedRejects);
            sessionStorage.setItem("rejectedReqs", JSON.stringify(Array.from(updatedRejects)));
            setShowRejectPopup(false);
            setItemToReject(null);
        }
    }

    const buyerMapIcon = L ? new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }) : null;

    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
            <SellerHeader />
            <div className="flex flex-1">
                <SellerSidebar unreadCount={0} activePage="item-requests" />
                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8 bg-[#03230F] text-white p-8 rounded-3xl shadow-lg flex items-center gap-4">
                            <div className="bg-[#EEC044] p-3 rounded-2xl shrink-0"><Inbox className="w-8 h-8 text-[#03230F]" /></div>
                            <div>
                                <h1 className="text-[32px] font-black mb-1 tracking-tight">{t("itemReqTitle")}</h1>
                                <p className="text-gray-300 font-medium">{t("itemReqSubtitle")}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-sm shrink-0"><Filter className="w-5 h-5" />{t("itemReqFilters")}</div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("itemReqCategory")}</Label>
                                    <select className="w-full border-gray-200 rounded-xl bg-gray-50 h-10 px-3 text-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                        <option value="All">{t("itemReqAllCategories")}</option>
                                        <option value="Vegetable">{t("itemReqCatVegetable")}</option>
                                        <option value="Leafy">{t("itemReqCatLeafy")}</option>
                                        <option value="Root">{t("itemReqCatRoot")}</option>
                                        <option value="Fruit">{t("itemReqCatFruit")}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("itemReqDistrict")}</Label>
                                    <select className="w-full border-gray-200 rounded-xl bg-gray-50 h-10 px-3 text-sm" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
                                        <option value="All">{t("itemReqAllDistricts")}</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[#004d2b]"><Loader2 className="h-10 w-10 animate-spin text-[#EEC044] mb-4" /><span className="font-semibold text-lg">{t("itemReqLoading")}</span></div>
                        ) : filteredRequirements.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"><Search className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-gray-800 mb-2">{t("itemReqNoFound")}</h3></div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredRequirements.map(req => (
                                    <Card key={req.id} className="overflow-hidden border-none bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                                <div>
                                                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 h-auto rounded uppercase tracking-widest mb-2 inline-block">{t("itemReqPostId")} {req.id}</span>
                                                    <h3 className="text-xl font-black text-[#03230F] leading-tight">{t("itemReqNeed").replace("{qty}", (req.quantityKg ?? 0).toString()).replace("{name}", req.vegetableName)}</h3>
                                                    <p className="text-sm font-bold text-[#D4A017] mt-1">{t("itemReqBudget").replace("{price}", (req.expectedPricePerKg ?? 0).toLocaleString())}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <div className="bg-orange-50 text-orange-700 px-3 py-1.5 h-auto rounded-xl flex items-center gap-1.5 shadow-sm border border-orange-100">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-xs font-bold whitespace-nowrap">{req.requiredByDate ? new Date(req.requiredByDate).toLocaleDateString() : "N/A"}</span>
                                                    </div>
                                                    {req.requiredByDate && <RequestCountdown targetDate={req.requiredByDate} />}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-1 justify-between">
                                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("itemReqLocation")}</p><p className="text-sm font-bold text-gray-800 truncate">{req.buyerCity}</p></div>
                                                    <Button onClick={() => handleViewOnMap(req)} className="h-7 text-[9px] font-black uppercase tracking-widest bg-white border border-gray-200 text-[#03230F] hover:bg-[#EEC044] gap-1 shadow-none"><MapPin className="w-3 h-3" /> {t("itemReqLocation")}</Button>
                                                </div>
                                                <div className={`p-3 rounded-xl ${req.deliveryRequired ? 'bg-blue-50' : 'bg-green-50'}`}>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Method</p>
                                                    <p className={`text-sm font-semibold flex items-center gap-1.5 ${req.deliveryRequired ? 'text-blue-700' : 'text-green-700'}`}>{req.deliveryRequired ? <Truck className="w-4 h-4"/> : <Store className="w-4 h-4"/>}{req.deliveryRequired ? t("itemReqDeliveryReq") : t("itemReqPickup")}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4">
                                                <Button onClick={() => handleMakeOfferClick(req)} className="flex-1 bg-[#03230F] hover:bg-black text-[#EEC044] h-auto py-2.5 rounded-xl font-bold shadow-md"><Send className="w-4 h-4 mr-2 shrink-0" />{t("itemReqMakeOffer")}</Button>
                                                <Button onClick={() => handleRejectClick(req.id)} variant="outline" className="flex-1 border-gray-200 text-gray-600 hover:text-red-600 h-auto py-2.5 rounded-xl font-bold"><XCircle className="w-4 h-4 mr-2 shrink-0" />{t("itemReqReject")}</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Offer Modal */}
            <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl bg-white border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-gray-50 border-b"><DialogTitle className="text-xl font-black text-[#03230F] flex items-center gap-2"><Banknote className="w-5 h-5 text-[#D4A017]" /> {t("itemReqMakeOfferTitle")}</DialogTitle></DialogHeader>
                    {selectedReq && (
                        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Proposed Price (LKR/kg)</Label><Input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="h-12 bg-gray-50 border-gray-200 rounded-xl text-lg font-bold" /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Supply Amount (kg)</Label><Input type="number" value={offerInputs.supplyQty} onChange={e => setOfferInputs({...offerInputs, supplyQty: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" placeholder={`Max ${selectedReq.quantityKg}`} /></div>
                            </div>
                            {!selectedReq.deliveryRequired && (
                                <div className="p-4 rounded-xl border-2 border-[#EEC044]/20 bg-[#EEC044]/5 space-y-4">
                                    <Label className="text-[#03230F] font-black text-xs uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4 text-[#EEC044]" /> Your Pickup Point</Label>
                                    <div className="bg-white border-gray-200 rounded-xl p-4 shadow-inner min-h-[300px]">
                                        <LocationPicker value={sellerLocation} onChange={setSellerLocation} variant="light" showStreetAddress={true} />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="space-y-2"><Label className="text-xs font-bold uppercase text-gray-500 tracking-widest">Contact Number</Label><Input type="tel" value={offerInputs.contactNumber} onChange={e => setOfferInputs({...offerInputs, contactNumber: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" /></div>
                                <div className="space-y-2"><Label className="text-xs font-bold uppercase text-gray-500 tracking-widest">Product Image</Label><Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) setOfferInputs({...offerInputs, imagePreview: URL.createObjectURL(f)})}} /></div>
                                <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:ring-1 focus:ring-[#EEC044]" value={offerMessage} onChange={e => setOfferMessage(e.target.value)} placeholder="Add a friendly note..." />
                            </div>
                            <Button onClick={submitOffer} disabled={isSubmittingOffer} className="w-full bg-[#03230F] text-[#EEC044] font-bold h-14 rounded-2xl shadow-xl transition-all hover:bg-black active:scale-95">{isSubmittingOffer ? <Loader2 className="animate-spin" /> : t("itemReqSubmitBtn")}</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Location Modal */}
            <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
                <DialogContent className="max-w-3xl rounded-[35px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-white border-b"><DialogTitle className="flex items-center gap-2 text-[#03230F] font-black uppercase tracking-tight"><MapPin className="text-[#EEC044] shrink-0" /> {mapData.city}</DialogTitle></DialogHeader>
                    <div className="h-[450px] w-full relative z-0 bg-gray-100">
                        {isMapModalOpen && (
                            <MapContainer key={`${mapData.lat}-${mapData.lng}`} center={[mapData.lat, mapData.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[mapData.lat, mapData.lng]} icon={buyerMapIcon} />
                            </MapContainer>
                        )}
                    </div>
                    <div className="p-8 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6 text-[#03230F]">
                        <div className="space-y-1 flex-1 text-center sm:text-left"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</p><p className="text-sm font-bold">{mapData.address}</p></div>
                        <Button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${mapData.lat},${mapData.lng}`, '_blank')} className="bg-[#03230F] text-[#EEC044] font-black gap-2 rounded-2xl h-auto py-4 px-8 shadow-xl hover:bg-black"><Navigation className="w-4 h-4 shrink-0" /> Open GPS</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showRejectPopup} onOpenChange={setShowRejectPopup}>
                <DialogContent className="sm:max-w-[400px] p-10 border-none shadow-2xl rounded-[40px] bg-white text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2">{t("itemReqRejectTitle")}</h2>
                    <Button onClick={confirmReject} className="w-full bg-[#03230F] text-[#EEC044] font-bold h-12 rounded-2xl uppercase shadow-xl hover:bg-black transition-all">Yes, Reject</Button>
                    <button onClick={() => setShowRejectPopup(false)} className="mt-2 w-full font-bold text-gray-400 h-auto py-3 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">{t("commonCancel")}</button>
                </DialogContent>
            </Dialog>
            <Footer2 />
        </div>
    )
}