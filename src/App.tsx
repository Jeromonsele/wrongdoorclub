import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutCards } from "@/components/AboutCards";
import { AdventureCard } from "@/components/AdventureCard";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { Confetti } from "@/components/Confetti";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LangProvider } from "@/i18n";
import { lazy, Suspense, useEffect, useState } from "react";
const EventPanel = lazy(() => import("@/components/EventPanel").then(m => ({ default: m.EventPanel })));
const SuccessPanel = lazy(() => import("@/components/SuccessPanel").then(m => ({ default: m.SuccessPanel })));
const QrPanel = lazy(() => import("@/components/QrPanel").then(m => ({ default: m.QrPanel })));

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
        <Suspense fallback={<div className="p-8">Loading…</div>}>
          {showEvent ? (
            <EventPanel />
          ) : showSuccess ? (
            <SuccessPanel />
          ) : route.startsWith("qr") ? (
            <QrPanel />
          ) : (
            <>
              <Hero />
              <AboutCards />
              <Gallery />
              <AdventureCard />
            </>
          )}
        </Suspense>
      </main>
      <Footer />
    </LangProvider>
  );
}

