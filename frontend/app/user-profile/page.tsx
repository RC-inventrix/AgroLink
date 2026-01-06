"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Loader2, X, Check, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    district: "",
    zipcode: "",
    AvatarUrl: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // --- Custom Notification State ---
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 1. Fetch current user data
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("id");
      
      if (!userId || !token) {
        setIsLoading(false);
        setNotification({ message: "Session expired. Please login again.", type: 'error' });
        return;
      }

      try {
        const res = await fetch(`http://localhost:8081/auth/user/${userId}`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile({
            fullname: data.fullname || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            businessName: data.businessName || "",
            district: data.district || "",
            zipcode: data.zipcode || "",
            AvatarUrl: data.AvatarUrl || ""
          });
        } else {
            setNotification({ message: "Failed to load profile data.", type: 'error' });
        }
      } catch (err) {
        setNotification({ message: "Network error while fetching profile.", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdate = async () => {
    setIsSaving(true)
    setNotification(null)
    const token = sessionStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:8081/auth/profile/update`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      });
      
      if (res.ok) {
          setNotification({ message: "Profile updated successfully!", type: 'success' });
      } else {
          const errorMsg = await res.text();
          setNotification({ message: errorMsg || "Update failed.", type: 'error' });
      }
    } catch (err) {
      setNotification({ message: "Could not connect to server.", type: 'error' });
    } finally {
      setIsSaving(false)
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#2d5016] mb-4" />
            <span className="font-semibold text-gray-600">Syncing Profile Data...</span>
        </div>
      </div>
    );
  }

  const initials = profile.fullname
    ? profile.fullname.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <DashboardHeader />

      {/* --- CUSTOM NOTIFICATION UI --- */}
      {notification && (
          <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all transform duration-500 ease-out animate-in slide-in-from-right-10 ${
              notification.type === 'success' 
              ? "bg-[#03230F] border-green-500 text-white" 
              : "bg-red-950 border-red-500 text-white"
          }`}>
              <div className="flex items-center gap-3">
                  {notification.type === 'success' ? (
                      <Check className="w-5 h-5 text-green-400" />
                  ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className="font-medium pr-4">{notification.message}</p>
              </div>
              <button 
                  onClick={() => setNotification(null)} 
                  className="ml-auto hover:bg-white/10 p-1 rounded transition-colors"
              >
                  <X className="w-4 h-4 opacity-70" />
              </button>
          </div>
      )}

      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-500">ID: {sessionStorage.getItem("id")}</p>
            </div>
            
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg transition-transform group-hover:scale-105">
                  <AvatarImage src={profile.AvatarUrl} />
                  <AvatarFallback className="bg-[#2d5016] text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2.5 bg-[#f4a522] rounded-full text-white cursor-pointer hover:bg-[#d89112] shadow-md transition-all hover:scale-110">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" />
                </label>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-600">{profile.fullname || "User Name"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <Input 
                  className="focus-visible:ring-[#2d5016]"
                  value={profile.fullname} 
                  onChange={(e) => setProfile({...profile, fullname: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <Input 
                   className="focus-visible:ring-[#2d5016]"
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Business Name</label>
                <Input 
                   className="focus-visible:ring-[#2d5016]"
                  value={profile.businessName} 
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <Input 
                   className="focus-visible:ring-[#2d5016]"
                  value={profile.address} 
                  onChange={(e) => setProfile({...profile, address: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">District</label>
                <Input 
                   className="focus-visible:ring-[#2d5016]"
                  value={profile.district} 
                  onChange={(e) => setProfile({...profile, district: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                <Input 
                   className="focus-visible:ring-[#2d5016]"
                  value={profile.zipcode} 
                  onChange={(e) => setProfile({...profile, zipcode: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-400">Registered Email</label>
                <Input value={profile.email} disabled className="bg-gray-50 italic cursor-not-allowed opacity-75" />
              </div>
            </div>

            <div className="mt-10 border-t pt-6 flex justify-end">
              <Button 
                onClick={handleUpdate} 
                disabled={isSaving}
                className="bg-[#2d5016] hover:bg-[#1e360f] text-white px-10 h-12 shadow-md transition-all active:scale-95"
              >
                {isSaving ? (
                    <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                    </div>
                ) : (
                    <div className="flex items-center">
                        Save Changes
                        <Save className="ml-2 h-4 w-4" />
                    </div>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}