// src/components/Hero.tsx
import { COPY } from "@/copy";
import { THEME } from "@/theme";
import { Compass } from "lucide-react";
import { useLang } from "@/i18n";
import { WHATSAPP_GRADUATES_LINK } from "@/data/social";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useState } from "react";
import { getStreak } from "@/utils/streaks";

export function Hero() {
  const { lang } = useLang();
  const { track } = useAnalytics();
  const [streak, setStreak] = useState(0);
  useEffect(() => { setStreak(getStreak().current); }, []);
  return (
    <section id="top" className={`${THEME.layout.padX} pt-safe-top pt-8 md:pt-14`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-6`}>
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-fluid-2xl leading-tight">
            {COPY.hero.title[lang]}
          </h1>
          {streak > 0 && (
            <div className="kicker">
              {lang === "es" ? `Racha: ${streak} semana(s)` : `Streak: ${streak} week(s)`}
            </div>
          )}
          <p className="text-lg text-clay/80">{COPY.hero.subtitle[lang]}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="#adventure" className="btn btn-amber" onClick={() => track("adventure_cta_click", { source: "hero" })}>
              <Compass className="size-5" />
              {COPY.hero.ctaStart[lang]}
            </a>
            <a href="#about" className="btn btn-ghost">
              {COPY.hero.ctaWhat[lang]}
            </a>
            <a
              href={WHATSAPP_GRADUATES_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
              onClick={() => track("whatsapp_join", { source: "hero" })}
            >
              {lang === "es" ? "Entrar a WhatsApp" : "Join WhatsApp"}
            </a>
            <a
              href="#event"
              className="btn btn-ghost"
              onClick={() => track("ticket_click", { source: "hero" })}
            >
              {lang === "es" ? "Conseguir boleto" : "Get Ticket"}
            </a>
          </div>
          <ul className="flex flex-wrap gap-3 text-sm text-clay/70" aria-label="facts">
            {COPY.hero.facts.map((f, i) => (
              <li key={i} className="px-3 py-1 rounded-3xl border border-black/10 bg-white">{f[lang]}</li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const [ok, setOk] = useState(true);
  return (
    <figure aria-hidden className="rounded-3xl shadow-soft overflow-hidden h-64 md:h-80">
      {ok ? (
        <img
          src="/images/tower-portrait.jpg"
          alt=""
          className="w-full h-full object-cover"
          onError={() => setOk(false)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-3xl shadow-soft bg-[conic-gradient(at_20%_20%,#FFF3C4,#FFD08A,#FFAF70,#FFF3C4)]" />
      )}
    </figure>
  );
}

