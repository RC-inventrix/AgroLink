import type { Metadata } from "next"
import { OrderHistoryClient } from "@/components/order-history-client"

export const metadata: Metadata = {
  title: "Order History - AgroLink",
  description: "View your vegetable orders and delivery status",
}

export default function OrderHistoryPage() {
  return <OrderHistoryClient />
}
