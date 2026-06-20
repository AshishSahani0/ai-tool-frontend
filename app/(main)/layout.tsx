import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareFloatingBar from "@/components/CompareFloatingBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <CompareFloatingBar />
      <Footer />
    </>
  );
}