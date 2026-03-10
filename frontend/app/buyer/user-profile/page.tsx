"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Loader2, X, Check, AlertCircle } from "lucide-react"
import BuyerHeader from "@/components/headers/BuyerHeader"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    district: "",
    zipcode: "",
    avatar_url: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("id");
      
      if (!userId || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/auth/user/${userId}`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        

        if (res.ok) {
          const data = await res.json();
          console.log("Fetched Profile Data:", data);
          setProfile({
            fullname: data.fullname || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            businessName: data.businessName || "",
            district: data.district || "",
            zipcode: data.zipcode || "",
            avatar_url: data.avatarUrl || ""
          });
        }
      } catch (err) {
        setNotification({ message: "Network error fetching profile.", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setNotification({ message: "File too large (Max 2MB)", type: 'error' });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "agrolink-profile-image"); 
    formData.append("cloud_name", "images-for-thumblify");         

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/images-for-thumblify/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setProfile((prev) => ({ ...prev, avatar_url: data.secure_url }));
        setNotification({ message: "Image uploaded! Click Save to finish.", type: 'success' });

      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      setNotification({ message: "Error uploading to Cloudinary.", type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8080/auth/profile/update`, {
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
        setNotification({ message: "Failed to update profile in database.", type: 'error' });
      }
    } catch (err) {
      setNotification({ message: "Could not connect to server.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile.fullname
    ? profile.fullname.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#2d5016]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <BuyerHeader/>

      {notification && (
          <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl border transition-all animate-in slide-in-from-right-5 ${
              notification.type === 'success' ? "bg-[#03230F] border-green-500 text-white" : "bg-red-950 border-red-500 text-white"
          }`}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? <Check className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                <p className="font-medium pr-4">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)}><X className="w-4 h-4 opacity-70" /></button>
          </div>
      )}

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg overflow-hidden">
                <AvatarImage src={profile.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-[#2d5016] text-white text-3xl font-bold">{initials}</AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </Avatar>
              
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className="absolute bottom-0 right-0 p-2.5 bg-[#f4a522] rounded-full text-white hover:bg-[#d89112] shadow-md transition-all active:scale-90 disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="mt-4 text-sm font-medium text-gray-600">{profile.fullname || "User Name"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <Input value={profile.fullname} onChange={(e) => setProfile({...profile, fullname: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Business Name</label>
              <Input value={profile.businessName} onChange={(e) => setProfile({...profile, businessName: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Address</label>
              <Input value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">District</label>
              <Input value={profile.district} onChange={(e) => setProfile({...profile, district: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Zip Code</label>
              <Input value={profile.zipcode} onChange={(e) => setProfile({...profile, zipcode: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-400">Registered Email</label>
              <Input value={profile.email} disabled className="bg-gray-50 italic opacity-75" />
            </div>
          </div>

          <div className="mt-10 border-t pt-6 flex justify-end">
            <Button 
              onClick={handleUpdate} 
              disabled={isSaving || isUploading} 
              className="bg-[#2d5016] hover:bg-[#1e360f] text-white px-10 h-12 min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}