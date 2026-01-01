"use client"
import { Spinner } from "./ui/spinner"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

    useEffect(() => {
        const verifySession = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
                
                // We call a protected endpoint (like /auth/validate or /auth/me)
                // The browser automatically sends the HttpOnly cookie
                const response = await fetch(`${baseUrl}/auth/validate`, {
                    method: "GET",
                    credentials: "include", // Required to send the HttpOnly cookie
                })

                if (response.ok) {
                    setIsAuthorized(true)
                } else {
                    // Cookie is missing, expired, or invalid
                    setIsAuthorized(false)
                    router.push("/") // Redirect to Login page
                }
            } catch (error) {
                console.error("Auth verification failed:", error)
                setIsAuthorized(false)
                router.push("/")
            }
        }

        verifySession()
    }, [router])

    // While waiting for the server to respond, show a loading state
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-[#03230F] flex items-center justify-center">
                <div className="text-[#EEC044] animate-pulse font-semibold">
                    AgroLink <Spinner color="success"/>
                </div>
            </div>
        )
    }

    // Only render children (the dashboard) if authorized
    return isAuthorized ? <>{children}</> : null
}