import Header from "@/components/header"
import SellerHeader from "@/components/headers/SellerHeader"
import ProductList from "@/components/product-list"
import SellerSidebar from "../dashboard/SellerSideBar"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SellerHeader />
      <div className="flex">
        <SellerSidebar unreadCount={0} activePage="products" />
        <ProductList />
      </div>
      
    </main>
  )
}
