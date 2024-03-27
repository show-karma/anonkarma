import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Layout({ children }: any) {
  return (
    <section className="container flex min-h-screen flex-col items-center justify-between p-10">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>

      <Header />
      {children}
      <Footer />
    </section>
  );
}
