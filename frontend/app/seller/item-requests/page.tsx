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
import Footer2 from "@/components/footer/Footer"; 
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- SSR Safe Components ---
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

let L: any;
if (typeof window !== "undefined") {
    L = require("leaflet");
    // Fix leaflet marker icon issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
        iconUrl: require("leaflet/dist/images/marker-icon.png").default,
        shadowUrl: require("leaflet/dist/images/marker-shadow.png").default,
    });
}

// Interfaces
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
    const { t } = useLanguage(); // Initialized the hook
    const router = useRouter()
    const [requirements, setRequirements] = useState<BuyerRequirement[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>("All")
    const [selectedDistrict, setSelectedDistrict] = useState<string>("All")
    const [districts, setDistricts] = useState<string[]>([])

    // Offers state
    const [offeredReqIds, setOfferedReqIds] = useState<Set<number>>(new Set())
    const [rejectedReqIds, setRejectedReqIds] = useState<Set<number>>(new Set())

    // Modal state for Submitting Offer
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [selectedReq, setSelectedReq] = useState<BuyerRequirement | null>(null)
    const [offerPrice, setOfferPrice] = useState("")
    const [provideDelivery, setProvideDelivery] = useState(false)
    const [deliveryFeeFirst3Km, setDeliveryFeeFirst3Km] = useState("")
    const [deliveryFeePerKm, setDeliveryFeePerKm] = useState("")
    const [offerMessage, setOfferMessage] = useState("")
    const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

    // Modal state for Rejecting
    const [showRejectPopup, setShowRejectPopup] = useState(false)
    const [itemToReject, setItemToReject] = useState<number | null>(null)

    // Load Districts
    useEffect(() => {
        const allDistricts: string[] = [];
        citiesData.provinces?.forEach(province => {
            province.districts?.forEach(district => {
                allDistricts.push(district.name);
            });
        });
        const uniqueDistricts = Array.from(new Set(allDistricts)).sort();
        setDistricts(uniqueDistricts);
    }, [])

    // Load open requirements AND seller's existing offers
    useEffect(() => {
        const token = sessionStorage.getItem("token")
        const sellerId = sessionStorage.getItem("id")
        if (!token || !sellerId) {
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                // 1. Fetch ALL open requirements
                const reqRes = await fetch(`${API_URL}/api/requirements/status/OPEN`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                
                // 2. Fetch offers made by THIS seller
                const offerRes = await fetch(`${API_URL}/api/offers/seller/${sellerId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })

                if (reqRes.ok && offerRes.ok) {
                    const reqData: BuyerRequirement[] = await reqRes.json()
                    const offerData: any[] = await offerRes.json()

                    // Extract the requirement IDs that the seller has already made an offer on
                    const respondedIds = new Set(offerData.map(o => o.requirementId))
                    setOfferedReqIds(respondedIds)

                    // Load rejected items from session storage
                    const localRejects = JSON.parse(sessionStorage.getItem("rejectedReqs") || "[]")
                    const rejectedSet = new Set<number>(localRejects)
                    setRejectedReqIds(rejectedSet)

                    // Filter out requirements that the seller has responded to or rejected
                    const filteredReqs = reqData.filter(req => !respondedIds.has(req.id) && !rejectedSet.has(req.id))

                    // Sort newest first
                    filteredReqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    setRequirements(filteredReqs)
                }
            } catch (err) {
                console.error("Failed to load requirements or offers", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Filter Logic
    const filteredRequirements = useMemo(() => {
        return requirements.filter(req => {
            const matchCategory = selectedCategory === "All" || req.category === selectedCategory;
            
            // Check if district matches (mapping city to district using citiesData)
            let matchDistrict = true;
            if (selectedDistrict !== "All") {
                let isFound = false;
                citiesData.provinces?.forEach(province => {
                    province.districts?.forEach(district => {
                        if (district.name === selectedDistrict) {
                            const cityInDistrict = district.cities?.some(city => 
                                city.name.toLowerCase() === req.buyerCity.toLowerCase()
                            );
                            if (cityInDistrict) {
                                isFound = true;
                            }
                        }
                    });
                });
                matchDistrict = isFound;
            }
            return matchCategory && matchDistrict;
        });
    }, [requirements, selectedCategory, selectedDistrict])


    // Handlers
    const handleMakeOfferClick = (req: BuyerRequirement) => {
        setSelectedReq(req)
        setOfferPrice(req.expectedPricePerKg.toString())
        setProvideDelivery(false)
        setDeliveryFeeFirst3Km("")
        setDeliveryFeePerKm("")
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
            offeredPricePerKg: parseFloat(offerPrice),
            deliveryAvailable: provideDelivery,
            deliveryFeeFirst3Km: provideDelivery ? parseFloat(deliveryFeeFirst3Km || "0") : 0,
            deliveryFeePerKm: provideDelivery ? parseFloat(deliveryFeePerKm || "0") : 0,
            message: offerMessage
        }

        try {
            const res = await fetch(`${API_URL}/api/offers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                alert(t("itemReqSuccess")); // Replaced hardcoded text
                setShowOfferModal(false);
                setRequirements(prev => prev.filter(r => r.id !== selectedReq.id));
                setOfferedReqIds(prev => new Set(prev).add(selectedReq.id));
            } else {
                alert(t("itemReqFail"));
            }
        } catch (err) {
            console.error(err)
            alert(t("itemReqNetworkErr"));
        } finally {
            setIsSubmittingOffer(false);
        }
    }

    const handleRejectClick = (id: number) => {
        setItemToReject(id)
        setShowRejectPopup(true)
    }

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

    // Custom map icon for buyers
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
                        
                        {/* Header Section */}
                        <div className="mb-8 bg-[#03230F] text-white p-8 rounded-3xl shadow-lg flex items-center gap-4">
                            <div className="bg-[#EEC044] p-3 rounded-2xl shrink-0">
                                <Inbox className="w-8 h-8 text-[#03230F]" />
                            </div>
                            <div>
                                <h1 className="text-[32px] font-black mb-1 tracking-tight">{t("itemReqTitle")}</h1>
                                <p className="text-gray-300 font-medium">{t("itemReqSubtitle")}</p>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-sm shrink-0">
                                <Filter className="w-5 h-5" />
                                {t("itemReqFilters")}
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("itemReqCategory")}</Label>
                                    <select 
                                        className="w-full border-gray-200 rounded-xl bg-gray-50 h-10 px-3 text-sm focus:ring-[#EEC044] focus:border-[#EEC044]"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="All">{t("itemReqAllCategories")}</option>
                                        <option value="Vegetable">{t("itemReqCatVegetable")}</option>
                                        <option value="Leafy">{t("itemReqCatLeafy")}</option>
                                        <option value="Root">{t("itemReqCatRoot")}</option>
                                        <option value="Fruit">{t("itemReqCatFruit")}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("itemReqDistrict")}</Label>
                                    <select 
                                        className="w-full border-gray-200 rounded-xl bg-gray-50 h-10 px-3 text-sm focus:ring-[#EEC044] focus:border-[#EEC044]"
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                    >
                                        <option value="All">{t("itemReqAllDistricts")}</option>
                                        {districts.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Loading / Empty State */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-[#004d2b]">
                                <Loader2 className="h-10 w-10 animate-spin text-[#EEC044] mb-4" />
                                <span className="font-semibold text-lg">{t("itemReqLoading")}</span>
                            </div>
                        ) : filteredRequirements.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{t("itemReqNoFound")}</h3>
                                <p className="text-gray-500">{t("itemReqNoFoundDesc")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredRequirements.map(req => (
                                    <Card key={req.id} className="overflow-hidden border-none bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            {/* Top info row */}
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                                <div>
                                                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 h-auto rounded uppercase tracking-widest mb-2 inline-block">
                                                        {t("itemReqPostId")} {req.id}
                                                    </span>
                                                    <h3 className="text-xl font-black text-[#03230F] leading-tight">
                                                        {t("itemReqNeed").replace("{qty}", req.quantityKg.toString()).replace("{name}", req.vegetableName)}
                                                    </h3>
                                                    <p className="text-sm font-bold text-[#D4A017] mt-1">
                                                        {t("itemReqBudget").replace("{price}", req.expectedPricePerKg.toLocaleString())}
                                                    </p>
                                                </div>
                                                <div className="bg-orange-50 text-orange-700 px-3 py-1.5 h-auto rounded-xl flex items-center gap-1.5 shadow-sm shrink-0">
                                                    <Calendar className="w-4 h-4 shrink-0" />
                                                    <span className="text-xs font-bold whitespace-nowrap">{t("itemReqBefore").replace("{date}", new Date(req.requiredByDate).toLocaleDateString())}</span>
                                                </div>
                                            </div>

                                            {/* Location & Delivery Info */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-gray-50 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("itemReqLocation")}</p>
                                                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                                                        <MapPin className="w-4 h-4 text-[#EEC044] shrink-0" />
                                                        {req.buyerCity}
                                                    </p>
                                                </div>
                                                <div className={`p-3 rounded-xl ${req.deliveryRequired ? 'bg-blue-50' : 'bg-green-50'}`}>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("itemReqDeliveryReq")}</p>
                                                    <p className={`text-sm font-semibold flex items-center gap-1.5 ${req.deliveryRequired ? 'text-blue-700' : 'text-green-700'}`}>
                                                        {req.deliveryRequired ? <Truck className="w-4 h-4 shrink-0"/> : <Store className="w-4 h-4 shrink-0"/>}
                                                        {req.deliveryRequired ? t("itemReqDeliveryReq") : t("itemReqPickup")}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Description & Map */}
                                            {req.description && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t("itemReqDesc")}</p>
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{req.description}</p>
                                                </div>
                                            )}

                                            {req.buyerLatitude && req.buyerLongitude && L && (
                                                <div className="h-32 rounded-xl overflow-hidden mb-6 border border-gray-200 shadow-inner z-0 relative">
                                                    <MapContainer 
                                                        center={[req.buyerLatitude, req.buyerLongitude]} 
                                                        zoom={10} 
                                                        scrollWheelZoom={false} 
                                                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                                                    >
                                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                        <Marker position={[req.buyerLatitude, req.buyerLongitude]} icon={buyerMapIcon}>
                                                            <Popup>{req.buyerAddress}</Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 mt-4">
                                                <Button onClick={() => handleMakeOfferClick(req)} className="flex-1 bg-[#03230F] hover:bg-black text-[#EEC044] h-auto py-2.5 rounded-xl font-bold shadow-md">
                                                    <Send className="w-4 h-4 mr-2 shrink-0" />
                                                    {t("itemReqMakeOffer")}
                                                </Button>
                                                <Button onClick={() => handleRejectClick(req.id)} variant="outline" className="flex-1 border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-auto py-2.5 rounded-xl font-bold">
                                                    <XCircle className="w-4 h-4 mr-2 shrink-0" />
                                                    {t("itemReqReject")}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Make Offer Modal */}
            <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl bg-white border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-gray-50 border-b border-gray-100">
                        <DialogTitle className="text-xl font-black text-[#03230F] flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-[#D4A017] shrink-0" />
                            {t("itemReqMakeOfferTitle")}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedReq && (
                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{t("itemReqOfferDetails")}</p>
                                    <p className="text-base font-bold text-blue-900">{selectedReq.vegetableName} ({selectedReq.quantityKg} kg)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{t("itemReqBudget").replace("Rs. {price}/kg", "")}</p>
                                    <p className="text-base font-bold text-blue-900">Rs. {selectedReq.expectedPricePerKg}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">{t("itemReqPricePerKg")}</Label>
                                    <Input 
                                        type="number" 
                                        value={offerPrice} 
                                        onChange={e => setOfferPrice(e.target.value)} 
                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl text-lg font-bold"
                                        placeholder="0.00"
                                    />
                                </div>

                                {selectedReq.deliveryRequired && (
                                    <div className="space-y-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                id="provideDelivery"
                                                className="w-5 h-5 rounded border-gray-300 text-[#EEC044] focus:ring-[#EEC044]"
                                                checked={provideDelivery}
                                                onChange={e => setProvideDelivery(e.target.checked)}
                                            />
                                            <Label htmlFor="provideDelivery" className="font-bold text-gray-700 cursor-pointer">{t("itemReqProvideDelivery")}</Label>
                                        </div>

                                        {provideDelivery && (
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">{t("itemReqBaseFee")}</Label>
                                                    <Input type="number" placeholder="0" value={deliveryFeeFirst3Km} onChange={e => setDeliveryFeeFirst3Km(e.target.value)} className="bg-white border-gray-200" />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">{t("itemReqRatePerKm")}</Label>
                                                    <Input type="number" placeholder="0" value={deliveryFeePerKm} onChange={e => setDeliveryFeePerKm(e.target.value)} className="bg-white border-gray-200" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">{t("itemReqMessage")}</Label>
                                    <textarea 
                                        rows={3} 
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 text-sm focus:ring-[#EEC044] focus:border-[#EEC044]"
                                        value={offerMessage}
                                        onChange={e => setOfferMessage(e.target.value)}
                                        placeholder="Add a friendly note..."
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <span className="font-bold block mb-0.5">{t("itemReqNote")}</span>
                                    {t("itemReqNoteDesc")}
                                </div>
                            </div>

                            <Button onClick={submitOffer} disabled={isSubmittingOffer} className="w-full bg-[#03230F] text-[#EEC044] font-bold h-auto py-4 rounded-2xl uppercase shadow-xl hover:bg-black transition-all active:scale-95">
                                {isSubmittingOffer ? <Loader2 className="w-5 h-5 animate-spin mr-2 shrink-0"/> : <CheckCircle className="w-5 h-5 mr-2 shrink-0" />}
                                {isSubmittingOffer ? t("itemReqSubmitting") : t("itemReqSubmitBtn")}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Confirmation Popup */}
            {showRejectPopup && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-10 border-none shadow-2xl rounded-[40px] bg-white text-center">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
                        </div>
                        <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2">{t("itemReqRejectTitle")}</h2>
                        <p className="text-gray-500 text-sm mb-8 font-sans">{t("itemReqRejectDesc")}</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={confirmReject} className="w-full bg-[#03230F] text-[#EEC044] font-bold h-auto py-4 rounded-2xl uppercase shadow-xl hover:bg-black transition-all active:scale-95">{t("itemReqYesReject")}</Button>
                            <button onClick={() => { setShowRejectPopup(false); setItemToReject(null); }} className="w-full font-bold text-gray-400 h-auto py-3 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors focus:outline-none">{t("commonCancel")}</button>
                        </div>
                    </Card>
                </div>
            )}
            
            <Footer2 />
        </div>
    )
}