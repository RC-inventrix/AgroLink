"use client"

import React, { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import citiesData from "@/data/srilanka-cities.json"
import { isWithinCityRadius } from "@/lib/geo-utils"
import { AlertCircle } from "lucide-react"

// Fix for default marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

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

// Component to handle map center updates
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    if (center[0] && center[1]) {
      map.setView(center, 13)
    }
  }, [center, map])
  
  return null
}

// Component to handle map clicks
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
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      
      // Validate if within city radius
      if (cityCenter) {
        if (isWithinCityRadius(e.latlng.lat, e.latlng.lng, cityCenter.lat, cityCenter.lng, 15)) {
          onPositionChange(newPos)
          onError("")
        } else {
          onError("Location is outside the selected city area. Please select the correct city or adjust your pin.")
        }
      } else {
        onPositionChange(newPos)
      }
    },
  })

  return position ? <Marker position={position} draggable eventHandlers={{
    dragend: (e) => {
      const marker = e.target
      const pos = marker.getLatLng()
      const newPos: [number, number] = [pos.lat, pos.lng]
      
      // Validate if within city radius
      if (cityCenter) {
        if (isWithinCityRadius(pos.lat, pos.lng, cityCenter.lat, cityCenter.lng, 15)) {
          onPositionChange(newPos)
          onError("")
        } else {
          onError("Location is outside the selected city area. Please select the correct city or adjust your pin.")
        }
      } else {
        onPositionChange(newPos)
      }
    },
  }} /> : null
}

export default function LocationPicker({
  value,
  onChange,
  variant = "light",
  showStreetAddress = true,
  required = false,
  label = "Location",
}: LocationPickerProps) {
  const [provinces] = useState<Province[]>(citiesData.provinces)
  const [districts, setDistricts] = useState<District[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]) // Center of Sri Lanka
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    value.latitude && value.longitude ? [value.latitude, value.longitude] : null
  )
  const [boundaryError, setBoundaryError] = useState("")
  const [selectedCityCenter, setSelectedCityCenter] = useState<{ lat: number; lng: number } | null>(null)

  // Update districts when province changes
  useEffect(() => {
    if (value.province) {
      const province = provinces.find((p) => p.name === value.province)
      if (province) {
        setDistricts(province.districts)
      }
    } else {
      setDistricts([])
      setCities([])
    }
  }, [value.province, provinces])

  // Update cities when district changes
  useEffect(() => {
    if (value.district) {
      const district = districts.find((d) => d.name === value.district)
      if (district) {
        setCities(district.cities)
      }
    } else {
      setCities([])
    }
  }, [value.district, districts])

  // Update map center and marker when city changes
  useEffect(() => {
    if (value.city) {
      const city = cities.find((c) => c.name === value.city)
      if (city) {
        setMapCenter([city.lat, city.lng])
        setSelectedCityCenter({ lat: city.lat, lng: city.lng })
        // Auto-set marker to city center if no marker is placed yet
        if (!markerPosition) {
          setMarkerPosition([city.lat, city.lng])
          onChange({
            ...value,
            latitude: city.lat,
            longitude: city.lng,
          })
        }
      }
    }
  }, [value.city, cities])

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
    onChange({
      ...value,
      district: e.target.value,
      city: "",
      latitude: null,
      longitude: null,
    })
    setMarkerPosition(null)
    setSelectedCityCenter(null)
    setBoundaryError("")
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      city: e.target.value,
      latitude: null,
      longitude: null,
    })
    setMarkerPosition(null)
    setBoundaryError("")
  }

  const handleStreetAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      streetAddress: e.target.value,
    })
  }

  const handleMarkerPositionChange = (pos: [number, number]) => {
    setMarkerPosition(pos)
    onChange({
      ...value,
      latitude: pos[0],
      longitude: pos[1],
    })
  }

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

      {/* Province Dropdown */}
      <div>
        <label className={labelClasses}>
          Province {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={value.province}
          onChange={handleProvinceChange}
          required={required}
          className={inputClasses}
        >
          <option value="">Select Province</option>
          {provinces.map((province) => (
            <option key={province.name} value={province.name} className={isDark ? "bg-[#03230F] text-white" : ""}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown */}
      {value.province && (
        <div className="animate-in fade-in duration-300">
          <label className={labelClasses}>
            District {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value.district}
            onChange={handleDistrictChange}
            required={required}
            className={inputClasses}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.name} value={district.name} className={isDark ? "bg-[#03230F] text-white" : ""}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City Dropdown */}
      {value.district && (
        <div className="animate-in fade-in duration-300">
          <label className={labelClasses}>
            City {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value.city}
            onChange={handleCityChange}
            required={required}
            className={inputClasses}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name} className={isDark ? "bg-[#03230F] text-white" : ""}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Street Address */}
      {showStreetAddress && (
        <div>
          <label className={labelClasses}>
            Street Address {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={value.streetAddress}
            onChange={handleStreetAddressChange}
            placeholder="Enter your street address"
            required={required}
            className={inputClasses}
          />
        </div>
      )}

      {/* Map */}
      {value.city && (
        <div className="animate-in fade-in duration-300">
          <label className={labelClasses}>
            Pin Your Exact Location {required && <span className="text-red-500">*</span>}
          </label>
          <p className={isDark ? "text-white/50 text-xs mb-2" : "text-muted-foreground text-xs mb-2"}>
            Click on the map or drag the marker to set your exact location
          </p>
          
          <div className="border-2 border-border rounded-lg overflow-hidden h-80">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

          {/* Boundary Error */}
          {boundaryError && (
            <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{boundaryError}</p>
            </div>
          )}

          {/* Coordinates Display */}
          {markerPosition && !boundaryError && (
            <div className={`mt-2 p-3 rounded-lg ${isDark ? "bg-white/10" : "bg-gray-50"}`}>
              <p className={`text-xs ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
                Selected Coordinates: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
