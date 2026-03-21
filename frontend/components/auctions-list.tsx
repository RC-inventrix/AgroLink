"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { AuctionCard } from "@/components/auction-card"
import { AuctionDetailsModal } from "./auction-details-modal"
import { CalendarClock } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

interface AuctionsListProps {
    initialAuctions: any[]
    onAuctionUpdated: () => void
}

export function AuctionsList({
                                 initialAuctions,
                                 onAuctionUpdated,
                             }: AuctionsListProps) {
    const { t } = useLanguage() // Initialized the hook
    const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "CANCELLED" | "DRAFT">(
        "ACTIVE"
    )
    const [selectedAuction, setSelectedAuction] = useState<any | null>(null)
    const [sellerId, setSellerId] = useState<string | null>(null)

    useEffect(() => {
        const id = sessionStorage.getItem("id")
        setSellerId(id)
    }, [])

    // Filter auctions by status
    const filteredAuctions = useMemo(() => {
        return initialAuctions.filter((auction) => {
            const status = auction.status?.toUpperCase()

            // Include EXPIRED auctions in the CANCELLED tab
            if (activeTab === "CANCELLED") {
                return status === "CANCELLED" || status === "EXPIRED"
            }

            return status === activeTab
        })
    }, [initialAuctions, activeTab])

    // Count tabs
    const counts = useMemo(() => {
        const acc = { ACTIVE: 0, COMPLETED: 0, CANCELLED: 0, DRAFT: 0 }

        initialAuctions.forEach((a) => {
            const status = a.status?.toUpperCase()

            if (status === "ACTIVE") {
                acc.ACTIVE++
            } else if (status === "COMPLETED") {
                acc.COMPLETED++
            } else if (status === "CANCELLED" || status === "EXPIRED") {
                acc.CANCELLED++
            } else if (status === "DRAFT") {
                acc.DRAFT++
            }
        })

        return acc
    }, [initialAuctions])

    // Updated Tab Config with Translations
    const tabConfig = [
        { key: "ACTIVE" as const, label: t("auctionTabOngoing"), icon: "⏱️", color: "text-blue-600" },
        {
            key: "DRAFT" as const,
            label: t("auctionTabDraft"),
            icon: <CalendarClock className="w-4 h-4 shrink-0" />, 
            color: "text-orange-600"
        },
        {
            key: "COMPLETED" as const,
            label: t("auctionTabSold"),
            icon: "✓",
            color: "text-green-600",
        },
        {
            key: "CANCELLED" as const,
            label: t("auctionTabCancelled"),
            icon: "✕",
            color: "text-red-600",
        },
    ]

    // Helper to get the current tab's translated label for the empty state
    const currentTabLabel = tabConfig.find(tab => tab.key === activeTab)?.label.toLowerCase() || "";

    return (
        <div className="space-y-8">
            {/* Vertical Tabs (Horizontal on mobile) */}
            <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex sm:flex-col gap-3 border-b sm:border-b-0 sm:border-r border-gray-200 pb-4 sm:pb-0 sm:pr-6 min-w-fit overflow-x-auto no-scrollbar">
                    {tabConfig.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center h-auto ${
                                activeTab === tab.key
                                    ? "bg-[#03230F] text-white shadow-md"
                                    : "bg-gray-50 text-[#697386] hover:bg-gray-100"
                            }`}
                        >
                            <span className="mr-2 flex items-center justify-center w-4 h-4 shrink-0">
                                {typeof tab.icon === "string" ? tab.icon : tab.icon}
                            </span>
                            {tab.label}
                            <span className="ml-2 inline-block bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">
                                {counts[tab.key]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Auction Cards */}
                <div className="flex-1 space-y-4 w-full">
                    {filteredAuctions.length > 0 ? (
                        filteredAuctions.map((auction) => (
                            <AuctionCard
                                key={auction.id}
                                auction={auction}
                                onOpen={setSelectedAuction}
                            />
                        ))
                    ) : (
                        <Card className="p-12 text-center border-none shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
                            <p className="text-[#A3ACBA] font-medium">
                                {!sellerId
                                    ? t("auctionVerifyingSeller")
                                    : t("auctionNoAuctions").replace("{status}", currentTabLabel)}
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AuctionDetailsModal
                isOpen={!!selectedAuction}
                auction={selectedAuction}
                onClose={() => setSelectedAuction(null)}
                onUpdate={() => {
                    onAuctionUpdated()
                    setSelectedAuction(null)
                }}
            />
        </div>
    )
}