import type React from "react"
import type { Metadata } from "next"

// NOTE: We don't need to import fonts or globals.css here
// because the main RootLayout (app/layout.tsx) already handles them.

export const metadata: Metadata = {
    title: "AgroLink - Farmer Registration",
    description: "Register your farm business with AgroLink",
    generator: "v0.app",
    icons: {
        icon: [
            {
                url: "/icon-light-32x32.png",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/icon-dark-32x32.png",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/icon.svg",
                type: "image/svg+xml",
            },
        ],
        apple: "/apple-icon.png",
    },
}

// Renamed to 'RegisterLayout' for clarity (it's not the Root)
export default function RegisterLayout({
                                           children,
                                       }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        // We replaced <html> and <body> with a simple <div> wrapper.
        // The classes ensure it takes up the full screen and uses your font settings.
        <div className="min-h-screen font-sans antialiased">
            {children}
        </div>
    )
}