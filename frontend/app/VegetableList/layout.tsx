import Header from "@/components/header";
import Footer from "@/components/Footer";

export default function AgroLinkLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
