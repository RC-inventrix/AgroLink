"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { 
    User, Mail, Phone, Calendar, MapPin, Star, 
    ArrowLeft, ShoppingBag, CheckCircle2, ShieldCheck, AlertTriangle 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Import headers
import SellerHeader from "@/components/headers/SellerHeader"
import BuyerHeader from "@/components/headers/BuyerHeader"

// Import Both Report Modals
import ReportProblemModalBuyer from "@/components/buyers/reportProblemModelBuyer"
import ReportBuyerModal from "@/components/sellers/reportProblemModelFarmers" 

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- TYPES ---
interface UserProfile {
    id: number;
    fullname: string;
    username: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    joinDate?: string;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerId: number;
    date: string;
}

interface RatingStats {
    average: number;
    count: number;
}

export default function GenericProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams(); 

    const userId = params.id;
    // The role of the PROFILE being viewed (e.g. ?role=SELLER)
    const profileRole = searchParams.get("role")?.toUpperCase() || "BUYER"; 
    
    const [user, setUser] = useState<UserProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<RatingStats>({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    
    // States for Viewer and Report Modal
    const [viewerRole, setViewerRole] = useState<string | null>(null);
    const [viewerId, setViewerId] = useState<number | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        // Determine Viewer Role using your specific session variable
        const currentRole = sessionStorage.getItem("userRole"); 
        const currentId = sessionStorage.getItem("id");
        
        setViewerRole(currentRole ? currentRole.toUpperCase() : null);
        setViewerId(currentId ? parseInt(currentId) : null);

        const fetchProfileData = async () => {
            const token = sessionStorage.getItem("token");
            if (!token || !userId) return;
            
            try {
                // Fetch User Basic Info
                const userRes = await fetch(`${API_URL}/auth/user/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (userRes.ok) {
                    setUser(await userRes.json());
                }

                // Fetch Rating Stats
                const statsRes = await fetch(`${API_URL}/api/reviews/stats/user/${userId}?role=${profileRole}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (statsRes.ok) {
                    setStats(await statsRes.json());
                }

                // Fetch Reviews List
                const reviewRes = await fetch(`${API_URL}/api/reviews/user/${userId}?role=${profileRole}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (reviewRes.ok) {
                    const reviewData = await reviewRes.json();
                    const reviewerIds = reviewData.map((r: any) => r.reviewerId);
                    const uniqueIds = Array.from(new Set(reviewerIds)).filter(id => id != null);
                    
                    let namesMap: Record<number, string> = {};

                    if (uniqueIds.length > 0) {
                        const namesQuery = uniqueIds.join(",");
                        const nameRes = await fetch(`${API_URL}/auth/fullnames?ids=${namesQuery}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        
                        if (nameRes.ok) {
                            namesMap = await nameRes.json();
                        }
                    }

                    const formattedReviews = reviewData.map((r: any) => ({
                        id: r.id,
                        rating: r.rating,
                        comment: r.comment,
                        reviewerId: r.reviewerId,
                        reviewerName: namesMap[r.reviewerId] || `User #${r.reviewerId}`, 
                        date: new Date(r.date).toLocaleDateString() 
                    }));

                    setReviews(formattedReviews);
                }
                
            } catch (err) {
                console.error("Error loading profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId, profileRole]); 

    if (loading) return <div className="flex justify-center items-center h-screen text-gray-400">Loading Profile...</div>;
    if (!user) return <div className="p-10 text-center">User not found</div>;

    // Check if the profile being viewed belongs to a Farmer
    const isViewingFarmerProfile = profileRole === "SELLER";

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header based on Viewer role */}
            {viewerRole === "SELLER" ? <SellerHeader /> : <BuyerHeader />}

            <div className="p-6 md:p-12">
                <div className="max-w-5xl mx-auto space-y-8">
                    
                    <div className="flex justify-between items-center">
                        <Button 
                            variant="ghost" 
                            onClick={() => router.back()} 
                            className="gap-2 text-gray-500 hover:text-[#03230F] pl-0 hover:bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>

                        {/* Report Button - Guarded against self-reporting */}
                        {viewerId && viewerId !== Number(userId) && (
                            <Button 
                                onClick={() => setIsReportModalOpen(true)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none font-bold rounded-xl gap-2 h-10 px-4 transition-colors"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Report User
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT COLUMN: USER CARD */}
                        <Card className="lg:col-span-1 p-8 border-none shadow-xl bg-white rounded-[30px] h-fit">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="w-32 h-32 border-4 border-[#F0FDF4] shadow-sm mb-6">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullname}`} />
                                    <AvatarFallback className="bg-[#03230F] text-[#EEC044] text-3xl font-bold">
                                        {user.fullname.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <h1 className="text-2xl font-black text-[#03230F] mb-1">{user.fullname}</h1>
                                <p className="text-sm font-medium text-gray-400 mb-6">@{user.username}</p>

                                <div className="flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] text-[#166534] rounded-full text-xs font-bold uppercase tracking-wider mb-8">
                                    <ShieldCheck className="w-4 h-4" /> 
                                    {isViewingFarmerProfile ? "Verified Farmer" : "Verified Buyer"}
                                </div>

                                <div className="w-full space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Mail className="w-4 h-4 text-[#EEC044]" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <MapPin className="w-4 h-4 text-[#EEC044]" />
                                        <span>{user.address || "No address provided"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Calendar className="w-4 h-4 text-[#EEC044]" />
                                        <span>Member since 2024</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* RIGHT COLUMN: STATS & REVIEWS */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <Card className="p-6 border-none shadow-md bg-white rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                                    <h3 className="text-3xl font-black text-[#03230F]">{stats.average}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Rating</p>
                                </Card>
                                <Card className="p-6 border-none shadow-md bg-white rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                                    <ShoppingBag className="w-8 h-8 text-blue-500" />
                                    <h3 className="text-3xl font-black text-[#03230F]">{stats.count}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activities</p>
                                </Card>
                                <Card className="p-6 border-none shadow-md bg-white rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    <h3 className="text-3xl font-black text-[#03230F]">100%</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reliability</p>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-[#03230F] uppercase tracking-wide">Recent Feedback</h2>
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <Card key={review.id} className="p-6 border-none shadow-sm bg-white rounded-2xl">
                                            {/* Review Content logic */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10 bg-gray-100">
                                                        <AvatarFallback className="text-gray-500 font-bold">{review.reviewerName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#03230F]">{review.reviewerName}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">{review.date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-xl">"{review.comment}"</p>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-400 italic">No reviews yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Switch modal based on whether the PROFILE being viewed is a Farmer (SELLER) or Buyer (BUYER) */}
            {isViewingFarmerProfile ? (
                <ReportProblemModalBuyer 
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    orderId={null}
                    reporterId={viewerId}
                    reportedId={Number(userId)}
                />
            ) : (
                <ReportBuyerModal 
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    orderId={null}
                    reporterId={viewerId}
                    reportedId={Number(userId)}
                />
            )}
        </div>
    )
}