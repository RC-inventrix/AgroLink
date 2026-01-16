"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const finalizeOrder = async () => {
      const paymentStatus = searchParams.get("payment")
      const userId = sessionStorage.getItem("id")

      // Only clear the cart if the URL contains ?payment=success (Stripe redirect)
      // Cash on Delivery (COD) cart clearing is already handled by the backend service.
      if (paymentStatus === "success" && userId) {
        try {
          // 1. Call the backend to clear the database cart for this user
          await fetch(`http://localhost:8080/cart/user/${userId}`, {
            method: 'DELETE',
          })

          // 2. Clear local session storage checkout data
          sessionStorage.removeItem("checkoutItems")
          
          console.log("Stripe order finalized: Cart cleared.")
        } catch (error) {
          console.error("Failed to clear cart after payment:", error)
        }
      }
    }

    finalizeOrder()
  }, [searchParams])

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
        <div className="bg-card rounded-lg shadow-lg p-8 text-center border">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full opacity-50 animate-pulse"></div>
              <CheckCircle className="w-20 h-20 text-[#03230F] relative z-10" strokeWidth={1.5} />
            </div>
          </div>

          {/* Success heading */}
          <h2 className="text-3xl font-bold text-foreground mb-3">Order Confirmed!</h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 text-base leading-relaxed">
            Thank you for your purchase. Your order has been successfully logged and sent to the farmers for processing.
          </p>

          {/* Dashboard button */}
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-[#03230F] hover:bg-[#03230F]/90 text-white font-semibold py-6 rounded-lg transition-all"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}