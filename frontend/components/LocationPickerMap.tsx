"use client"

import React, { useState, useEffect } from "react"
import L, { LeafletMouseEvent, DragEndEvent } from "leaflet"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import citiesData from "@/data/srilanka-cities.json"
import { isWithinCityRadius } from "@/lib/geo-utils"
import { AlertCircle } from "lucide-react"

// --- Interfaces ---
interface LocationData {
    province: string
    district: string
    city: string
    streetAddress: string
    latitude: number | null
    longitude: number | null
}

interface LocationPickerProps {
    value: LocationData
    onChange: (location: LocationData) => void
    variant?: "dark" | "light"
    showStreetAddress?: boolean
    required?: boolean
    label?: string
}

interface City {
    name: string
    lat: number
    lng: number
}

interface District {
    name: string
    cities: City[]
}

interface Province {
    name: string
    districts: District[]
}

// --- Helper Components ---
function MapController({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (center[0] && center[1]) {
            map.setView(center, 13)
        }
    }, [center, map])
    return null
}

function LocationMarker({
                            position,
                            onPositionChange,
                            onError,
                            cityCenter,
                        }: {
    position: [number, number] | null
    onPositionChange: (pos: [number, number]) => void
    onError: (msg: string) => void
    cityCenter: { lat: number; lng: number } | null
}) {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
            if (cityCenter) {
                if (isWithinCityRadius(e.latlng.lat, e.latlng.lng, cityCenter.lat, cityCenter.lng, 15)) {
                    onPositionChange(newPos)
                    onError("")
                } else {
                    onError("Location is outside the selected city area.")
                }
            } else {
                onPositionChange(newPos)
            }
        },
    })

    return position ? (
        <Marker
            position={position}
            draggable
            eventHandlers={{
                dragend: (e: DragEndEvent) => {
                    const marker = e.target
                    const pos = marker.getLatLng()
                    const newPos: [number, number] = [pos.lat, pos.lng]
                    if (cityCenter) {
                        if (isWithinCityRadius(pos.lat, pos.lng, cityCenter.lat, cityCenter.lng, 15)) {
                            onPositionChange(newPos)
                            onError("")
                        } else {
                            onError("Location is outside the selected city area.")
                        }
                    } else {
                        onPositionChange(newPos)
                    }
                },
            }}
        />
    ) : null
}

// --- Main Component ---
export default function LocationPickerMap({
                                              value,
                                              onChange,
                                              variant = "light",
                                              showStreetAddress = true,
                                              required = false,
                                              label = "Location",
                                          }: LocationPickerProps) {

    // --- Fix for Leaflet Icons ---
    useEffect(() => {
        // @ts-ignore
        if (!L.Icon.Default.prototype._getIconUrl_Original) {
            // @ts-ignore
            L.Icon.Default.prototype._getIconUrl_Original = L.Icon.Default.prototype._getIconUrl;
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            })
        }
    }, []);

    const [provinces] = useState<Province[]>(citiesData.provinces as unknown as Province[])
    const [districts, setDistricts] = useState<District[]>([])
    const [cities, setCities] = useState<City[]>([])
    const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718])
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
        value.latitude && value.longitude ? [value.latitude, value.longitude] : null
    )
    const [boundaryError, setBoundaryError] = useState("")
    const [selectedCityCenter, setSelectedCityCenter] = useState<{ lat: number; lng: number } | null>(null)

    // 1. Update districts
    useEffect(() => {
        if (value.province) {
            const province = provinces.find((p) => p.name === value.province)
            if (province) setDistricts(province.districts)
        } else {
            setDistricts([])
            setCities([])
        }
    }, [value.province, provinces])

    // 2. Update cities
    useEffect(() => {
        if (value.district) {
            const district = districts.find((d) => d.name === value.district)
            if (district) setCities(district.cities)
        } else {
            setCities([])
        }
    }, [value.district, districts])

    // 3. Update map center
    useEffect(() => {
        if (value.city) {
            const city = cities.find((c) => c.name === value.city)
            if (city) {
                setMapCenter([city.lat, city.lng])
                setSelectedCityCenter({ lat: city.lat, lng: city.lng })
                if (!markerPosition) {
                    setMarkerPosition([city.lat, city.lng])
                    onChange({ ...value, latitude: city.lat, longitude: city.lng })
                }
            }
        }
    }, [value.city, cities])

    // Handlers
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({
            province: e.target.value,
            district: "",
            city: "",
            streetAddress: value.streetAddress,
            latitude: null,
            longitude: null,
        })
        setMarkerPosition(null)
        setSelectedCityCenter(null)
        setBoundaryError("")
    }

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, district: e.target.value, city: "", latitude: null, longitude: null })
        setMarkerPosition(null)
        setSelectedCityCenter(null)
        setBoundaryError("")
    }

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, city: e.target.value, latitude: null, longitude: null })
        setMarkerPosition(null)
        setBoundaryError("")
    }

    const handleStreetAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, streetAddress: e.target.value })
    }

    const handleMarkerPositionChange = (pos: [number, number]) => {
        setMarkerPosition(pos)
        onChange({ ...value, latitude: pos[0], longitude: pos[1] })
    }

    // Styles
    const isDark = variant === "dark"
    const inputClasses = isDark
        ? "w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044]/50 transition-all"
        : "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"

    const labelClasses = isDark
        ? "text-white/70 text-xs font-semibold ml-1 mb-1 block"
        : "text-muted-foreground text-sm font-semibold mb-1 block"

    return (
        <div className="space-y-4">
            <h3 className={isDark ? "text-white text-base font-semibold" : "text-foreground text-base font-semibold"}>
                {label}
            </h3>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Province {required && <span className="text-red-500">*</span>}</label>
                    <select value={value.province} onChange={handleProvinceChange} required={required} className={inputClasses}>
                        <option value="">Select Province</option>
                        {provinces.map((p) => (<option key={p.name} value={p.name} className={isDark ? "bg-[#03230F] text-white" : ""}>{p.name}</option>))}
                    </select>
                </div>

                {value.province && (
                    <div className="animate-in fade-in">
                        <label className={labelClasses}>District {required && <span className="text-red-500">*</span>}</label>
                        <select value={value.district} onChange={handleDistrictChange} required={required} className={inputClasses}>
                            <option value="">Select District</option>
                            {districts.map((d) => (<option key={d.name} value={d.name} className={isDark ? "bg-[#03230F] text-white" : ""}>{d.name}</option>))}
                        </select>
                    </div>
                )}
            </div>

            {value.district && (
                <div className="animate-in fade-in">
                    <label className={labelClasses}>City {required && <span className="text-red-500">*</span>}</label>
                    <select value={value.city} onChange={handleCityChange} required={required} className={inputClasses}>
                        <option value="">Select City</option>
                        {cities.map((c) => (<option key={c.name} value={c.name} className={isDark ? "bg-[#03230F] text-white" : ""}>{c.name}</option>))}
                    </select>
                </div>
            )}

            {showStreetAddress && (
                <div>
                    <label className={labelClasses}>Street Address {required && <span className="text-red-500">*</span>}</label>
                    <input type="text" value={value.streetAddress} onChange={handleStreetAddressChange} placeholder="Enter street address" required={required} className={inputClasses} />
                </div>
            )}

            {/* Map Section */}
            {value.city && (
                <div className="animate-in fade-in duration-300 mt-4">
                    <label className={labelClasses}>Pin Your Exact Location</label>
                    <p className={isDark ? "text-white/50 text-xs mb-2" : "text-muted-foreground text-xs mb-2"}>
                        Click on the map or drag the marker.
                    </p>

                    {/* Key ensures a new map instance when city changes */}
                    <div className="border-2 border-border rounded-lg overflow-hidden h-80 relative z-0">
                        <MapContainer
                            key={value.city}
                            center={mapCenter}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapController center={mapCenter} />
                            <LocationMarker
                                position={markerPosition}
                                onPositionChange={handleMarkerPositionChange}
                                onError={setBoundaryError}
                                cityCenter={selectedCityCenter}
                            />
                        </MapContainer>
                    </div>

                    {boundaryError && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{boundaryError}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}