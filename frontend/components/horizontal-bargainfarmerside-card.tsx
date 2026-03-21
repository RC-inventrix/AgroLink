"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Check, X, MapPin, Truck, Store, Map, User } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

interface BargainRequest {
    id: string
    name: string
    buyerId?: number
    buyerName: string
    image: string
    pricePerHundredG: number
    pricePerKg: number
    requestedQuantityKg: number
    actualPrice: number
    offeredPrice: number
    discount: number
    deliveryRequired: boolean
    buyerAddress: string
    deliveryFee: number
    buyerLatitude: number | null
    buyerLongitude: number | null
}

interface HorizontalBargainCardProps {
    item: BargainRequest
    status: "all" | "pending" | "accepted" | "rejected"
    onAccept?: () => void
    onReject?: () => void
    onDelete?: () => void
    onRemove?: () => void
}

function formatCurrency(amount: number): string {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function HorizontalBargainCard({
                                          item,
                                          status,
                                          onAccept,
                                          onReject,
                                          onDelete,
                                          onRemove,
                                      }: HorizontalBargainCardProps) {
    const { t } = useLanguage() // Initialized the hook
    const {
        name,
        buyerName,
        image,
        pricePerHundredG,
        pricePerKg,
        buyerId,
        requestedQuantityKg,
        actualPrice,
        offeredPrice,
        discount,
        deliveryRequired,
        buyerAddress,
        deliveryFee,
        buyerLatitude,
        buyerLongitude
    } = item

    const getStatusBadge = () => {
        switch (status) {
            case "pending":
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] rounded-full font-bold uppercase tracking-wider border border-yellow-200 shadow-sm h-auto">{t("bargainStatusPending")}</span>
            case "accepted":
                return <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] rounded-full font-bold uppercase tracking-wider border border-green-200 shadow-sm h-auto">{t("bargainStatusAccepted")}</span>
            case "rejected":
                return <span className="px-3 py-1 bg-red-100 text-red-800 text-[10px] rounded-full font-bold uppercase tracking-wider border border-red-200 shadow-sm h-auto">{t("bargainStatusRejected")}</span>
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-[10px] rounded-full font-bold uppercase tracking-wider border border-gray-200 shadow-sm h-auto">{t("bargainStatusUnknown")}</span>
        }
    }

    const googleMapsUrl = deliveryRequired && buyerLatitude && buyerLongitude
        ? `https://www.google.com/maps?q=$${buyerLatitude},${buyerLongitude}`
        : null;

    return (
        <Card className="flex flex-col sm:flex-row overflow-hidden border-green-100 bg-white rounded-2xl h-full sm:h-auto transition-all hover:shadow-lg shadow-sm">

            {/* Image Section */}
            <div className="w-full sm:w-56 h-56 sm:h-auto relative shrink-0 bg-green-50 border-b sm:border-b-0 sm:border-r border-green-100/50">
                <img
                    src={image || "/placeholder.svg"}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">

                {/* Header & Pricing Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-2xl text-green-900">{name}</h3>
                            {getStatusBadge()}
                        </div>
                        <div className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1.5">
                            <User className="w-4 h-4 opacity-70 shrink-0" />
                            <span>{t("bargainBuyerLabel")} </span>
                            {buyerId ? (
                                <Link 
                                    href={`/user/${buyerId}`} 
                                    className="font-bold text-green-900 hover:text-green-600 hover:underline transition-all cursor-pointer truncate"
                                >
                                    {buyerName}
                                </Link>
                            ) : (
                                <span className="font-bold text-green-900 truncate">{buyerName}</span>
                            )}
                        </div>
                    </div>

                    <div className="text-left sm:text-right bg-green-50/50 px-4 py-3 rounded-xl border border-green-100 w-full sm:w-auto">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">{t("bargainBuyerOffer")}</p>
                        <div className="text-2xl font-black text-green-800">Rs. {formatCurrency(offeredPrice)}</div>
                        <div className="flex items-center gap-2 mt-1 sm:justify-end">
                            {actualPrice > 0 && (
                                <div className="text-xs text-gray-400 line-through">{t("bargainYourPrice")} Rs. {formatCurrency(actualPrice)}</div>
                            )}
                            {discount > 0 && (
                                <div className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded h-auto">
                                    {t("bargainDiscountReq").replace("{discount}", Math.round(discount).toString())}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Information Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    {/* Offer Details Grid */}
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">{t("bargainOrderMetrics")}</h4>
                        <div className="flex justify-between text-sm gap-4">
                            <span className="text-gray-600 truncate">{t("bargainBaseRate")}</span>
                            <span className="font-semibold text-gray-900 shrink-0">Rs. {formatCurrency(pricePerKg)} {t("purchaseKgUnit")}</span>
                        </div>
                        <div className="flex justify-between text-sm gap-4">
                            <span className="text-gray-600 truncate">{t("bargainBuyersRate")}</span>
                            <span className="font-semibold text-orange-600 shrink-0">Rs. {formatCurrency(offeredPrice / (requestedQuantityKg || 1))} {t("purchaseKgUnit")}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2 gap-4">
                            <span className="text-gray-600 font-medium truncate">{t("bargainQuantityReq")}</span>
                            <span className="font-bold text-gray-900 shrink-0">{requestedQuantityKg} {t("purchaseKgUnit")}</span>
                        </div>
                    </div>

                    {/* Logistics & Delivery Block */}
                    <div className={`p-4 rounded-xl border space-y-3 ${deliveryRequired ? 'bg-blue-50/30 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            {deliveryRequired ? <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0"/> : <Store className="w-3.5 h-3.5 text-orange-600 shrink-0"/>}
                            <span className={deliveryRequired ? "text-blue-800" : "text-orange-800"}>{t("bargainDeliveryReq")}</span>
                        </h4>

                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${deliveryRequired ? "text-blue-500" : "text-orange-500"}`} />
                            <span className="text-gray-700 font-medium leading-tight">
                                {buyerAddress}
                            </span>
                        </div>

                        {deliveryRequired ? (
                            <>
                                <div className="flex justify-between items-center text-sm border-t pt-2 mt-2 border-white/60 gap-4">
                                    <span className="text-gray-600 truncate">{t("bargainDeliveryFee")}</span>
                                    <span className="font-bold text-blue-700 shrink-0">Rs. {formatCurrency(deliveryFee)}</span>
                                </div>
                                {googleMapsUrl && (
                                    <div className="pt-1">
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors bg-blue-100/50 px-2.5 py-1.5 rounded-md h-auto"
                                        >
                                            <Map className="w-3.5 h-3.5 shrink-0" />
                                            {t("bargainViewBuyerLoc")}
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2 border-white/60 gap-4">
                                <span className="text-gray-600 truncate">{t("bargainActionLabel")}</span>
                                <span className="font-bold text-orange-700 shrink-0">{t("bargainPickupOnly")}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex justify-end flex-wrap items-center gap-3 mt-auto pt-5 border-t border-green-100">
                    {status === "pending" && (
                        <>
                            <Button onClick={onDelete} variant="outline" className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold rounded-lg hidden sm:flex mr-auto h-auto py-2">
                                <Trash2 className="w-4 h-4 shrink-0" />
                                {t("bargainBtnDelete")}
                            </Button>
                            <Button onClick={onReject} variant="outline" className="gap-2 text-orange-700 hover:bg-orange-50 border-orange-200 font-semibold rounded-lg h-auto py-2">
                                <X className="w-4 h-4 shrink-0" />
                                {t("bargainBtnReject")}
                            </Button>
                            <Button onClick={onAccept} className="gap-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg px-6 shadow-sm h-auto py-2">
                                <Check className="w-4 h-4 shrink-0" />
                                {t("bargainBtnAccept")}
                            </Button>
                        </>
                    )}

                    {status === "accepted" && (
                        <>
                            <span className="text-sm font-bold text-green-700 flex items-center px-4 py-2 bg-green-50 rounded-lg border border-green-200 mr-auto h-auto">
                                <Check className="w-4 h-4 mr-2 shrink-0" />
                                {t("bargainDealConfirmed")}
                            </span>
                            <Button onClick={onRemove} variant="outline" className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold rounded-lg h-auto py-2">
                                <Trash2 className="w-4 h-4 shrink-0" />
                                {t("bargainBtnRemove")}
                            </Button>
                        </>
                    )}

                    {status === "rejected" && (
                        <>
                            <span className="text-sm font-bold text-red-700 flex items-center px-4 py-2 bg-red-50 rounded-lg border border-red-200 mr-auto h-auto">
                                <X className="w-4 h-4 mr-2 shrink-0" />
                                {t("bargainOfferRejected")}
                            </span>
                            <Button onClick={onDelete} variant="outline" className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold rounded-lg h-auto py-2">
                                <Trash2 className="w-4 h-4 shrink-0" />
                                {t("bargainBtnDelete")}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    )
}