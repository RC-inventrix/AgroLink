/* fileName: cart-item.tsx */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Truck, Store, MapPin, User } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext" // Imported translation hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Vegetable {
    id: string
    name: string
    image: string
    pricePerKg: number
    quantity: number
    seller: string 
    selected: boolean
    deliveryFee?: number | null
    deliveryAddress?: string
    sellerId?: string | number 
}

interface CartItemProps {
    item: Vegetable
    onToggle: (id: string) => void
    onDelete: (id: string) => void
}

export default function CartItem({ item, onToggle, onDelete }: CartItemProps) {
    const { t } = useLanguage() // Initialized the hook
    const [sellerFullName, setSellerFullName] = useState<string>("");

    useEffect(() => {
        const fetchSellerName = async () => {
            const idToFetch = item.sellerId || item.seller.replace(/\D/g, "");
            
            if (!idToFetch) {
                setSellerFullName(item.seller);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/fullnames?ids=${idToFetch}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data[idToFetch]) {
                        setSellerFullName(data[idToFetch]);
                    } else {
                        setSellerFullName(item.seller);
                    }
                } else {
                    setSellerFullName(item.seller);
                }
            } catch (err) {
                setSellerFullName(item.seller);
            }
        };

        fetchSellerName();
    }, [item.seller, item.sellerId]);

    const finalPrice = item.pricePerKg * item.quantity

    return (
        <div className={`p-4 transition-colors`}>
            <div className="flex gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm">
                    <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{item.name}</h3>
                        
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-medium truncate max-w-[150px]">{sellerFullName || "Loading..."}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-bold text-[#03230F] bg-green-50 px-2 py-0.5 rounded-md">{item.quantity} {t("purchaseKgUnit")}</span>
                            <span className="text-gray-400 font-medium">×</span>
                            <span className="text-gray-600 font-medium">Rs. {item.pricePerKg.toFixed(2)} / kg</span>
                        </div>
                    </div>

                    <div className="mt-3">
                        {item.deliveryFee !== null && item.deliveryFee !== undefined ? (
                            <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                                <Truck className="w-4 h-4 shrink-0" />
                                <span className="font-bold text-xs tracking-tight shrink-0">{t("cartItemDeliveryOrder")}</span>
                                {item.deliveryAddress && (
                                    <>
                                        <span className="text-blue-300 mx-0.5 shrink-0">•</span>
                                        <MapPin className="w-3 h-3 opacity-70 shrink-0" />
                                        <span className="text-[11px] font-medium truncate max-w-[120px]">{item.deliveryAddress}</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 w-fit px-2.5 py-1 rounded-md">
                                <Store className="w-4 h-4 shrink-0" />
                                <span className="font-bold text-xs tracking-tight">{t("cartItemPickupOrder")}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-gray-900 text-lg">Rs. {finalPrice.toFixed(2)}</p>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5 px-3 py-1.5 h-auto shrink-0"
                        aria-label={`Remove ${item.name} from cart`}
                    >
                        <Trash2 className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">{t("cartItemRemove")}</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}