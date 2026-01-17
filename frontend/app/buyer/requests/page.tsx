"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Edit3, Trash2, MapPin, Calendar, Scale, Banknote, 
    Loader2, CheckCircle, XCircle, ChevronRight, AlertTriangle, X, FileText
} from "lucide-react"
import DashboardHeader from "@/components/header"
import Link from "next/link"

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

export default function MyRequirementsPage() {
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [loading, setLoading] = useState(true)
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
            if (res.ok) setRequirements(await res.json());
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED HANDLE UPDATE ---
    const handleUpdate = async (id: number) => {
        try {
            // We send the full editData including the ID to ensure an update happens
            const payload = {
                ...editData,
                id: id, // Explicitly ensure ID is present in the body
                quantity: Number(editData.quantity),
                expectedUnitPrice: Number(editData.expectedUnitPrice)
            };

            const res = await fetch(`http://localhost:8080/api/requirements/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setEditingId(null);
                fetchMyRequirements(); // Refresh the list from DB
            } else {
                console.error("Server rejected the update. Check backend logs.");
            }
        } catch (err) { 
            console.error("Network error during update:", err); 
        }
    };

    const triggerDeletePopup = (id: number) => {
        setItemToDelete(id);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`http://localhost:8080/api/requirements/${itemToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setShowDeletePopup(false);
                fetchMyRequirements();
            }
        } catch (err) { 
            console.error("Delete failed", err); 
        } finally {
            setIsDeleting(false);
            setItemToDelete(null);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#EEC044]" /></div>

    return (
        <div className="relative min-h-screen bg-gray-50">
            <DashboardHeader/>

            {showDeletePopup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md p-8 border-none shadow-2xl rounded-[2rem] bg-white text-center">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-[#03230F] uppercase mb-2">Delete Request?</h2>
                        <p className="text-gray-500 font-medium mb-8">Are you sure you want to remove this crop requirement? This action cannot be undone.</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={confirmDelete} disabled={isDeleting} className="w-full bg-[#03230F] hover:bg-black text-[#EEC044] font-black py-7 rounded-2xl uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95">
                                {isDeleting && <Loader2 className="animate-spin mr-2" />} Yes, Delete Permanently
                            </Button>
                            <Button variant="ghost" onClick={() => setShowDeletePopup(false)} disabled={isDeleting} className="w-full font-bold text-gray-400 py-4 hover:bg-gray-100 rounded-2xl uppercase tracking-widest text-[10px]">No, Keep My Request</Button>
                        </div>
                    </Card>
                </div>
            )}

            <div className="max-w-5xl mx-auto py-10 px-4">
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-[#03230F] uppercase">My Item Requests</h1>
                        <p className="text-gray-500 font-medium">Track and manage your bulk vegetable needs</p>
                    </div>
                    <Link href="/buyer/requests/new-request">
                        <button className="bg-[#EEC044] rounded-2xl px-6 py-3 font-semibold uppercase text-sm shadow-xl hover:bg-[#d4b43a] transition-all active:scale-95">New Request + </button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {requirements.map((req) => (
                        <Card key={req.id} className="p-0 overflow-hidden border-none shadow-xl rounded-3xl bg-white relative group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#EEC044]" />
                            
                            {editingId === req.id ? (
                                <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-gray-400">Crop Name</Label>
                                            {/* FIX: Added || "" to prevent null crash */}
                                            <Input value={editData.cropName || ""} onChange={e => setEditData({...editData, cropName: e.target.value})} className="rounded-xl border-2 h-12 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-gray-400">Quantity (kg)</Label>
                                            <Input type="number" value={editData.quantity || ""} onChange={e => setEditData({...editData, quantity: parseFloat(e.target.value) || 0})} className="rounded-xl border-2 h-12 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-gray-400">Target Price (LKR)</Label>
                                            <Input type="number" value={editData.expectedUnitPrice || ""} onChange={e => setEditData({...editData, expectedUnitPrice: parseFloat(e.target.value) || 0})} className="rounded-xl border-2 h-12 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-gray-400">Required Date</Label>
                                            <Input type="date" value={editData.expectedDate || ""} onChange={e => setEditData({...editData, expectedDate: e.target.value})} className="rounded-xl border-2 h-12 font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-400">Requirement Description</Label>
                                        <Textarea value={editData.description || ""} onChange={e => setEditData({...editData, description: e.target.value})} className="rounded-xl border-2 font-bold min-h-[100px]" placeholder="Details..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-400">Delivery Address</Label>
                                        <Textarea value={editData.deliveryAddress || ""} onChange={e => setEditData({...editData, deliveryAddress: e.target.value})} className="rounded-xl border-2 font-bold" />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button onClick={() => handleUpdate(req.id)} className="flex-1 bg-[#03230F] text-[#EEC044] font-black rounded-xl py-6 uppercase tracking-widest shadow-lg active:scale-95">Save Changes</Button>
                                        <Button variant="ghost" onClick={() => setEditingId(null)} className="bg-gray-100 rounded-xl px-8 font-bold">Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-[#03230F] uppercase">{req.cropName}</h2>
                                            {req.description && (
                                                <div className="flex items-start gap-2 mt-2 text-gray-600">
                                                    <FileText className="w-4 h-4 mt-1 text-[#EEC044] shrink-0" />
                                                    <p className="text-sm line-clamp-2 italic">{req.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-6 pt-2">
                                            <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                                <Scale className="w-4 h-4 text-[#EEC044]" /> <span className="font-light">Quantity: </span>{req.quantity}kg
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                                <Banknote className="w-4 h-4 text-[#EEC044]" /><span className="font-light">Price: </span>Rs. {req.expectedUnitPrice}/kg
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                                <Calendar className="w-4 h-4 text-[#EEC044]" /><span className="font-light">Date: </span>{req.expectedDate}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 text-gray-400 text-sm font-bold pt-1">
                                            <MapPin className="w-4 h-4 mt-0.5 text-[#EEC044]" /> {req.deliveryAddress}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => { setEditingId(req.id); setEditData(req); }}
                                            className="w-full md:w-44 border-2 border-gray-100 rounded-xl font-black hover:bg-[#EEC044]/10 transition-all uppercase text-[10px] tracking-widest py-6"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" /> Edit Request
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => triggerDeletePopup(req.id)}
                                            className="w-full text-red-500 font-black uppercase text-[10px] tracking-widest py-6"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}