import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutCards } from "@/components/AboutCards";
import { AdventureCard } from "@/components/AdventureCard";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { Confetti } from "@/components/Confetti";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LangProvider } from "@/i18n";
import { useEffect, useState } from "react";
import { EventPanel } from "@/components/EventPanel";
import { SuccessPanel } from "@/components/SuccessPanel";

export default function App() {
  useAnalytics();
  const [hash, setHash] = useState<string>(location.hash || "");

  useEffect(() => {
    const onHash = () => setHash(location.hash || "");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const route = hash.replace(/^#/, "");
  const showEvent = route.startsWith("event");
  const showSuccess = route.startsWith("success");

  return (
    <LangProvider>
      <div className="bg-sunset" aria-hidden />
      <Confetti />
      <Header />
      <main>
        {showEvent ? (
          <EventPanel />
        ) : showSuccess ? (
          <SuccessPanel />
        ) : (
          <>
            <Hero />
            <AboutCards />
            <Gallery />
            <AdventureCard />
          </>
        )}
      </main>
      <Footer />
    </LangProvider>
  );
}

