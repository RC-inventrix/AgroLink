"use client"

import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderSuccessPage() {
  const router = useRouter()

  const handleGoToDashboard = () => {
    router.push("/buyer/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Dark header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-primary shadow-sm flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">AgroLink</h1>
      </div>

      {/* Success card */}
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-accent rounded-full opacity-20 animate-pulse"></div>
              <CheckCircle className="w-20 h-20 text-accent relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          {/* Success heading */}
          <h2 className="text-3xl font-bold text-foreground mb-3">Order Placed Successfully!</h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 text-base leading-relaxed">
            Your order has been successfully placed and is now being processed. We'll notify you once your order is
            ready for shipment.
          </p>

          {/* Dashboard button */}
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 rounded-lg transition-colors duration-200"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
