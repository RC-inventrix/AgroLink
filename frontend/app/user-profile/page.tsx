"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Save, Loader2, AlertTriangle, X } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    district: "",
    zipcode: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Custom UI States
  const [showModal, setShowModal] = useState(false)
  const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("id");

      if (!userId || !token) {
        setIsLoading(false);
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

  // Helper to show auto-hiding notification
  const showToast = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

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

      if (res.ok) {
        showToast("Profile updated successfully!", "success");
      } else {
        showToast("Failed to update profile.", "error");
      }
    } catch (err) {
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsSaving(false);
      setShowModal(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#2d5016]" /></div>;

  const initials = profile.fullname ? profile.fullname.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="min-h-screen bg-gray-50 relative">
     
      {/* 1. CUSTOM NOTIFICATION BAR */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-[100] p-4 rounded-lg shadow-lg flex items-center border-l-4 animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
          }`}>
          <span className="mr-3 font-medium">{notification.msg}</span>
          <button onClick={() => setNotification(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* 2. CUSTOM CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Update</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save these changes to your Agrolink profile? This will update your contact and business details.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-[#2d5016] text-white rounded-lg hover:bg-[#1f3810] flex items-center disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? "Updating..." : "Yes, Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DashboardHeader />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
            <h1 className="text-2xl font-bold mb-8 text-gray-900">Account Settings</h1>

            <div className="flex flex-col items-center mb-10">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-[#2d5016] text-white text-3xl font-bold">{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <Input value={profile.fullname} onChange={(e) => setProfile({ ...profile, fullname: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Business Name</label>
                <Input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">District</label>
                <Input value={profile.district} onChange={(e) => setProfile({ ...profile, district: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                <Input value={profile.zipcode} onChange={(e) => setProfile({ ...profile, zipcode: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-400">Registered Email</label>
                <Input value={profile.email} disabled className="bg-gray-50 italic" />
              </div>
            </div>

            <div className="mt-10 border-t pt-6 text-right">
              <Button
                onClick={() => setShowModal(true)}
                className="bg-[#2d5016] text-white px-8 h-12 hover:bg-[#1f3810]"
              >
                Save Changes
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}