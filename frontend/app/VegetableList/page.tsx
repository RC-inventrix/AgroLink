"use client"

import Header from "@/components/Header"
import VegetableListings from "@/components/vegetable-listings"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <VegetableListings />
    </main>
  )
}
