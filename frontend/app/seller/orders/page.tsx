import { Header } from "@/components/header"
import { OrdersList } from "@/components/orders-list"
import { StatsOverview } from "@/components/stats-overview"

export const metadata = {
  title: "Pending Orders - AgroLink",
  description: "Manage your vegetable orders pending completion",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Pending Orders</h1>
            <p className="text-muted-foreground">Manage your vegetable orders awaiting completion</p>
          </div>

          <StatsOverview />
          <OrdersList />
        </div>
      </main>
    </div>
  )
}
