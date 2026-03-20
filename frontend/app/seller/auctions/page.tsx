"use client"

import { AuctionsList } from "@/components/auctions-list"
import { useEffect, useState } from "react"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../dashboard/SellerSideBar";
import "../dashboard/SellerDashboard.css"
import { Toaster } from "sonner"
import Footer2 from "@/components/footer/Footer";
import { useLanguage } from "@/context/LanguageContext"; // Imported translation hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AuctionsPage() {
  const { t } = useLanguage(); // Initialized the hook
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAuctions = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const farmerId = sessionStorage.getItem("id")

      if (!farmerId || !token) {
        setLoading(false)
        return
      }

      const res = await fetch(
        `${API_URL}/api/auctions/farmer/${farmerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.ok) {
        const data = await res.json()
        // Flatten if API returns nested structure
        const flatData = Array.isArray(data) ? data : Object.values(data).flat()
        setAuctions(flatData)
      } else {
          // --- ADD THIS ERROR HANDLING ---
          console.error("API Error:", res.status, res.statusText);
          const errorText = await res.text();
          console.error("Error Body:", errorText);
      }
    } catch (error) {
      console.error("Failed to fetch auctions", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuctions()
      const interval = setInterval(fetchAuctions, 30000)
      return () => clearInterval(interval)
  }, [])

  return (
    
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]"> 
      <Toaster position="top-center" richColors />

      <SellerHeader />

      <div className="flex flex-1">
        <SellerSidebar unreadCount={0} activePage="auctions" />

        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">
                {t("auctionsTitle")}
              </h1>
              <p className="text-[#A3ACBA] font-medium">
                {t("auctionsSubtitle")}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-40 bg-gray-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <AuctionsList
                initialAuctions={auctions}
                onAuctionUpdated={fetchAuctions}
              />
            )}
          </div>
        </main>
      </div>
      
      
      <Footer2 />
    </div>
  )
}