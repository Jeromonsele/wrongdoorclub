import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutCards } from "@/components/AboutCards";
import { AdventureCard } from "@/components/AdventureCard";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { Confetti } from "@/components/Confetti";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LangProvider } from "@/i18n";

export default function App() {
  useAnalytics();
  return (
    <>
      <div className="bg-sunset" aria-hidden />
      <Confetti />
      <Header />
      <main>
        <Hero />
        <AboutCards />
        <Gallery />
        <AdventureCard />
      </main>
      <Footer />
    </>
  );
}

