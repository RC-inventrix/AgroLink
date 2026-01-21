import Header from "@/components/header";
import Footer from "@/components/Footer";
import BuyerHeader from "@/components/headers/BuyerHeader";

export default function AgroLinkLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <BuyerHeader />
            {children}
            <Footer />
        </>
    );
}
