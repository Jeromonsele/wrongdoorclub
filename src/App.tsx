import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutCards } from "@/components/AboutCards";
import { AdventureCard } from "@/components/AdventureCard";
import { Footer } from "@/components/Footer";
import { Confetti } from "@/components/Confetti";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function App() {
  useAnalytics();
  return (
    <>
      <Confetti />
      <Header />
      <main>
        <Hero />
        <AboutCards />
        <AdventureCard />
      </main>
      <Footer />
    </>
  );
}

