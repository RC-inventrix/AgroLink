"use client"

import dynamic from "next/dynamic"
import React from "react"

// Define the Props interface here so other files get the correct types
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

// Dynamically import the REAL map component
// ssr: false -> Tells Next.js "Never try to run this on the server"
const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="h-80 w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">
            Loading Map...
        </div>
    ),
})

export default function LocationPicker(props: LocationPickerProps) {
    return <LocationPickerMap {...props} />
}