"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Leaf, 
    Scale, 
    Banknote, 
    MapPin, 
    CalendarDays, 
    Loader2, 
    CheckCircle,
    FileText 
} from "lucide-react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/header"

export default function RequirementForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        cropName: "",
        quantity: "",
        expectedUnitPrice: "",
        deliveryAddress: "",
        expectedDate: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const userId = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");

        try {
            const res = await fetch("http://localhost:8080/api/requirements/create", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    buyerId: userId,
                    // Safety: Default to 0 if parsing an empty string to avoid backend errors
                    quantity: parseFloat(formData.quantity) || 0,
                    expectedUnitPrice: parseFloat(formData.expectedUnitPrice) || 0
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/buyer/dashboard"), 2000);
            }
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-12 text-center flex flex-col items-center space-y-4 border-2 border-[#EEC044] rounded-3xl shadow-xl">
                    <CheckCircle className="w-16 h-16 text-green-600 animate-in zoom-in duration-300" />
                    <h2 className="text-2xl font-bold text-[#03230F]">Requirement Posted Successfully!</h2>
                    <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Redirecting to Dashboard...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-3xl mx-auto py-8 px-4">
            
            <div className="mb-8 flex items-center gap-4">
                <div className="bg-[#03230F] p-3 rounded-2xl shadow-lg">
                    <ShoppingBag className="w-6 h-6 text-[#EEC044]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#03230F] uppercase tracking-tight">Post Your Crop Need</h1>
                    <p className="text-gray-500 font-medium">Inform farmers about your bulk requirements</p>
                </div>
            </div>

            <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white overflow-hidden relative">
                {/* Accent bar matching your dashboard cards */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[#EEC044]" />

                <form onSubmit={handleSubmit} className="space-y-8 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Vegetable Name */}
                        <div className="space-y-3">
                            <Label className="text-[#03230F] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                <Leaf className="w-4 h-4" /> Vegetable Name
                            </Label>
                            <Input 
                                required
                                placeholder="e.g. Carrots"
                                className="rounded-xl border-gray-200 bg-gray-50/50 h-12 focus:border-[#EEC044] focus:ring-0 transition-all font-medium text-lg"
                                // FIX: Added || "" to prevent null value error
                                value={formData.cropName || ""}
                                onChange={(e) => setFormData({...formData, cropName: e.target.value})}
                            />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-3">
                            <Label className="text-[#03230F] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Quantity (kg)
                            </Label>
                            <Input 
                                required
                                type="number"
                                placeholder="e.g. 100"
                                className="rounded-xl border-gray-200 bg-gray-50/50 h-12 focus:border-[#EEC044] focus:ring-0 transition-all font-medium text-lg"
                                value={formData.quantity || ""}
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            />
                        </div>

                        {/* Expected Price */}
                        <div className="space-y-3">
                            <Label className="text-[#03230F] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                <Banknote className="w-4 h-4" /> Target Unit Price (LKR)
                            </Label>
                            <Input 
                                required
                                type="number"
                                placeholder="e.g. 150"
                                className="rounded-xl border-gray-200 bg-gray-50/50 h-12 focus:border-[#EEC044] focus:ring-0 transition-all font-medium text-lg"
                                value={formData.expectedUnitPrice || ""}
                                onChange={(e) => setFormData({...formData, expectedUnitPrice: e.target.value})}
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-3">
                            <Label className="text-[#03230F] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" /> Expected Receive Date
                            </Label>
                            <Input 
                                required
                                type="date"
                                className="rounded-xl border-gray-200 bg-gray-50/50 h-12 focus:border-[#EEC044] focus:ring-0 transition-all font-medium text-gray-500"
                                value={formData.expectedDate || ""}
                                onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Requirement Description */}
                    <div className="space-y-3">
                        <Label className="text-[#03230F] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Requirement Description
                        </Label>
                        <Textarea 
                            required
                            placeholder="Provide details about quality standards, variety, or specific packaging needs..."
                            className="rounded-xl border-gray-200 bg-gray-50/50 min-h-[100px] focus:border-[#EEC044] focus:ring-0 transition-all font-medium"
                            // FIX: Added || "" to prevent null value error
                            value={formData.description || ""}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                        <Label className="text-[#03230F] font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Detailed Delivery Address
                        </Label>
                        <Textarea 
                            required
                            placeholder="Describe building, street, city..."
                            className="rounded-xl border-gray-200 bg-gray-50/50 min-h-[100px] focus:border-[#EEC044] focus:ring-0 transition-all font-medium"
                            // FIX: Added || "" to prevent null value error
                            value={formData.deliveryAddress || ""}
                            onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                        />
                    </div>

                    {/* Action Buttons styled like your dashboard */}
                    <div className="flex gap-4 pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="flex bg-[#03230F] hover:bg-[#03230F]/90 text-white py-5 px-10 rounded-xl text-sm font-semibold shadow-xl transition-all active:scale-[0.98] gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Publish Need"}
                        </Button>
                        <Button 
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="bg-gray-100 border-none text-gray-600 font-bold py-5 px-8 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
        </div>
    );
}

// Icon helper
function ShoppingBag(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    )
}