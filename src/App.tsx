import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AboutCards } from "@/components/AboutCards";
import { AdventureCard } from "@/components/AdventureCard";
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
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white focus:text-clay focus:px-3 focus:py-2 focus:rounded-3xl focus:shadow-soft">Skip to content</a>
      <Confetti />
      <Header />
      <main id="main" role="main" aria-label="Main content">
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
              <AdventureCard />
            </>
          )}
        </Suspense>
      </main>
      <Footer />
    </LangProvider>
  );
}

