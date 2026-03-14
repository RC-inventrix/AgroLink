"use client"

import React, { useState, useEffect, useRef } from "react"
import L, { LeafletMouseEvent, DragEndEvent } from "leaflet"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import citiesData from "@/data/srilanka-cities.json"
import { isWithinCityRadius } from "@/lib/geo-utils"
import { AlertCircle, Loader2 } from "lucide-react"

// --- TYPES ---
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

// --- INTERNAL COMPONENT: MAP CONTROLLER ---
// Handles programmatic map movement (FlyTo)
function MapController({ center }: { center: [number, number] | null }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.setView(center, 13, { animate: true })
            map.invalidateSize()
        }
    }, [center, map])
    return null
}

// --- INTERNAL COMPONENT: INTERACTIVE MARKER ---
// Handles clicks and drags
function InteractiveMarker({
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
            if (cityCenter && !isWithinCityRadius(e.latlng.lat, e.latlng.lng, cityCenter.lat, cityCenter.lng, 15)) {
                onError("Location is outside the selected city area.")
            } else {
                onPositionChange(newPos)
                onError("")
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
                    if (cityCenter && !isWithinCityRadius(pos.lat, pos.lng, cityCenter.lat, cityCenter.lng, 15)) {
                        onError("Location is outside the selected city area.")
                    } else {
                        onPositionChange([pos.lat, pos.lng])
                        onError("")
                    }
                },
            }}
        />
    ) : null
}

// --- INTERNAL COMPONENT: ATOMIC MAP INSTANCE ---
// This component is mounted/unmounted purely based on keys.
// It contains the specific strict-mode guard.
const LeafletMapInstance = ({
                                center,
                                markerPosition,
                                targetCenter,
                                cityCenter,
                                onPositionChange,
                                onError
                            }: any) => {

    // STRICT MODE GUARD:
    // Generate a stable ID across re-renders to prevent "Map container is being reused" errors.
    const containerId = React.useMemo(() => `map-container-${Math.random().toString(36).substr(2, 9)}`, []);

    useEffect(() => {
        // Fix Icons globally
        // @ts-ignore
        if (typeof window !== "undefined" && !L.Icon.Default.prototype._getIconUrl_Original) {
            // @ts-ignore
            L.Icon.Default.prototype._getIconUrl_Original = L.Icon.Default.prototype._getIconUrl;
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });
        }

        // AGGRESSIVE CLEANUP
        // If this component unmounts, we find the DOM element and manually strip the Leaflet ID.
        // This prevents the "already initialized" error if React reuses the node.
        return () => {
            const container = document.getElementById(containerId);
            if (container) {
                // @ts-ignore
                container._leaflet_id = null;
            }
        };
    }, [containerId]);

    return (
        <MapContainer
            id={containerId}
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={targetCenter} />
            <InteractiveMarker
                position={markerPosition}
                onPositionChange={onPositionChange}
                onError={onError}
                cityCenter={cityCenter}
            />
        </MapContainer>
    );
};

// --- MAIN COMPONENT ---
export default function LocationPickerMap({
                                              value,
                                              onChange,
                                              variant = "light",
                                              showStreetAddress = true,
                                              required = false,
                                              label = "Location",
                                          }: LocationPickerProps) {

    // Data State
    const [provinces] = useState<any[]>(citiesData.provinces);
    const [districts, setDistricts] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    // Map Logic State
    const [targetCenter, setTargetCenter] = useState<[number, number] | null>(null);
    const [selectedCityCenter, setSelectedCityCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
        value.latitude && value.longitude ? [value.latitude, value.longitude] : null
    );
    const [boundaryError, setBoundaryError] = useState("");

    // Initial Center (Sri Lanka)
    const initialCenter: [number, number] = [7.8731, 80.7718];

    // --- CASCADING DROPDOWNS ---
    useEffect(() => {
        if (value.province) {
            const p = provinces.find((p) => p.name === value.province);
            setDistricts(p ? p.districts : []);
        } else {
            setDistricts([]);
            setCities([]);
        }
    }, [value.province, provinces]);

    useEffect(() => {
        if (value.district) {
            const d = districts.find((d) => d.name === value.district);
            setCities(d ? d.cities : []);
        } else {
            setCities([]);
        }
    }, [value.district, districts]);

    useEffect(() => {
        if (value.city) {
            const c = cities.find((c) => c.name === value.city);
            if (c) {
                setTargetCenter([c.lat, c.lng]);
                setSelectedCityCenter({ lat: c.lat, lng: c.lng });
                if (!markerPosition) {
                    const newPos: [number, number] = [c.lat, c.lng];
                    setMarkerPosition(newPos);
                    onChange({ ...value, latitude: c.lat, longitude: c.lng });
                }
            }
        }
    }, [value.city, cities]);

    // --- HANDLERS ---
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, province: e.target.value, district: "", city: "", latitude: null, longitude: null });
        setMarkerPosition(null);
        setBoundaryError("");
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, district: e.target.value, city: "", latitude: null, longitude: null });
        setMarkerPosition(null);
        setBoundaryError("");
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange({ ...value, city: e.target.value, latitude: null, longitude: null });
        setMarkerPosition(null);
        setBoundaryError("");
    };

    const handlePosChange = (pos: [number, number]) => {
        setMarkerPosition(pos);
        onChange({ ...value, latitude: pos[0], longitude: pos[1] });
    };

    // Styling
    const isDark = variant === "dark";
    const inputClasses = isDark
        ? "w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EEC044]/50 transition-all"
        : "w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all";
    const labelClasses = isDark
        ? "text-white/70 text-xs font-semibold ml-1 mb-1 block"
        : "text-muted-foreground text-sm font-semibold mb-1 block";

    return (
        <div className="space-y-4">
            <h3 className={isDark ? "text-white text-base font-semibold" : "text-foreground text-base font-semibold"}>
                {label}
            </h3>

            {/* FORM SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Province {required && <span className="text-red-500">*</span>}</label>
                    <select value={value.province} onChange={handleProvinceChange} required={required} className={inputClasses}>
                        <option value="">Select Province</option>
                        {provinces.map((p) => <option key={p.name} value={p.name} className="text-black">{p.name}</option>)}
                    </select>
                </div>
                {value.province && (
                    <div className="animate-in fade-in">
                        <label className={labelClasses}>District {required && <span className="text-red-500">*</span>}</label>
                        <select value={value.district} onChange={handleDistrictChange} required={required} className={inputClasses}>
                            <option value="">Select District</option>
                            {districts.map((d) => <option key={d.name} value={d.name} className="text-black">{d.name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {value.district && (
                <div className="animate-in fade-in">
                    <label className={labelClasses}>City {required && <span className="text-red-500">*</span>}</label>
                    <select value={value.city} onChange={handleCityChange} required={required} className={inputClasses}>
                        <option value="">Select City</option>
                        {cities.map((c) => <option key={c.name} value={c.name} className="text-black">{c.name}</option>)}
                    </select>
                </div>
            )}

            {showStreetAddress && (
                <div>
                    <label className={labelClasses}>Street Address {required && <span className="text-red-500">*</span>}</label>
                    <input
                        type="text"
                        value={value.streetAddress}
                        onChange={(e) => onChange({ ...value, streetAddress: e.target.value })}
                        placeholder="Enter street address"
                        required={required}
                        className={inputClasses}
                    />
                </div>
            )}

            {/* MAP SECTION */}
            {value.city && (
                <div className="mt-4 animate-in fade-in duration-300">
                    <label className={labelClasses}>Pin Your Exact Location</label>
                    <p className={isDark ? "text-white/50 text-xs mb-2" : "text-muted-foreground text-xs mb-2"}>
                        Click on the map or drag the marker.
                    </p>

                    <div className="border-2 border-border rounded-lg overflow-hidden h-80 relative z-0 bg-muted/10 flex items-center justify-center">
                        {/* ARCHITECTURAL FIX:
                           We use `value.city` as part of the KEY.
                           This guarantees that if the city changes, React destroys the old map
                           and creates a brand new one.
                           The internal LeafletMapInstance handles strict mode cleanup.
                        */}
                        <LeafletMapInstance
                            key={`map-${value.province}-${value.district}-${value.city}`}
                            center={initialCenter}
                            targetCenter={targetCenter}
                            markerPosition={markerPosition}
                            cityCenter={selectedCityCenter}
                            onPositionChange={handlePosChange}
                            onError={setBoundaryError}
                        />
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