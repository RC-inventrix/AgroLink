import SellerHeader from "@/components/headers/SellerHeader"
import ProductList from "@/components/product-list"
import SellerSidebar from "../dashboard/SellerSideBar"
import Footer2 from "@/components/footer/Footer"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <SellerHeader />
      
      <div className="flex flex-1">
        <SellerSidebar unreadCount={0} activePage="products" />
        
        <main className="flex-1 w-full overflow-hidden">
          <ProductList />
        </main>
      </div>
      
      <Footer2 />
    </div>
  )
}