"use client"

import { AuctionsList } from "@/components/auctions-list"
import { useEffect, useState } from "react"
import SellerHeader from "@/components/headers/SellerHeader"
import SellerSidebar from "../dashboard/SellerSideBar";
import "../dashboard/SellerDashboard.css"
import { Toaster } from "sonner"

export default function AuctionsPage() {
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
        `http://localhost:8080/api/auctions/farmer/${farmerId}`,
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
      }else {
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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Toaster position="top-center" richColors />

      <SellerHeader />

      <div className="flex flex-1 overflow-hidden">
        <SellerSidebar unreadCount={0} activePage="auctions" />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-[32px] font-black text-[#03230F] mb-2 tracking-tight">
                My Auctions
              </h1>
              <p className="text-[#A3ACBA] font-medium">
                Manage your agricultural auction listings
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
    </div>
  )
}
