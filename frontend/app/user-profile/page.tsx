"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Loader2 } from "lucide-react"

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

  // 1. Fetch current user data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("id"); // Current logged-in user ID
      
      if (!userId || !token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetching from your Identity Service
        const res = await fetch(`http://localhost:8081/auth/user/${userId}`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Map the backend entity fields directly to the state
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
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdate = async () => {
    setIsSaving(true)
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
      if (res.ok) alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setIsSaving(false)
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2d5016]" />
        <span className="ml-2 font-medium">Loading your profile...</span>
      </div>
    );
  }

  const initials = profile.fullname
    ? profile.fullname.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">Account Settings</h1>
            
            <div className="flex flex-col items-center mb-10">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.AvatarUrl} />
                  <AvatarFallback className="bg-[#2d5016] text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2 bg-[#f4a522] rounded-full text-white cursor-pointer hover:bg-[#d89112] shadow-md">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <Input 
                  value={profile.fullname} 
                  onChange={(e) => setProfile({...profile, fullname: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <Input 
                  value={profile.phone} 
                  onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Business Name</label>
                <Input 
                  value={profile.businessName} 
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <Input 
                  value={profile.address} 
                  onChange={(e) => setProfile({...profile, address: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">District</label>
                <Input 
                  value={profile.district} 
                  onChange={(e) => setProfile({...profile, district: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                <Input 
                  value={profile.zipcode} 
                  onChange={(e) => setProfile({...profile, zipcode: e.target.value})} 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-400">Registered Email</label>
                <Input value={profile.email} disabled className="bg-gray-50 italic" />
              </div>
            </div>

            <div className="mt-10 border-t pt-6">
              <Button 
                onClick={handleUpdate} 
                disabled={isSaving}
                className="bg-[#2d5016] text-white px-8 h-12"
              >
                {isSaving ? "Saving..." : "Save Changes"}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}