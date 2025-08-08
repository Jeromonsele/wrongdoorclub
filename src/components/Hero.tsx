// src/components/Hero.tsx
import { COPY } from "@/copy";
import { THEME } from "@/theme";
import { Compass } from "lucide-react";
import { useLang } from "@/i18n";

export function Hero() {
  const { lang } = useLang();
  return (
    <section id="top" className={`${THEME.layout.padX} pt-10 md:pt-14`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-6`}>
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-4xl md:text-6xl leading-tight">
            {COPY.hero.title[lang]}
          </h1>
          <p className="text-lg text-clay/80">{COPY.hero.subtitle[lang]}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="#adventure" className="btn btn-amber">
              <Compass className="size-5" />
              {COPY.hero.ctaStart[lang]}
            </a>
            <a href="#about" className="btn btn-ghost">
              {COPY.hero.ctaWhat[lang]}
            </a>
          </div>
          <ul className="flex flex-wrap gap-3 text-sm text-clay/70" aria-label="facts">
            {COPY.hero.facts.map((f, i) => (
              <li key={i} className="px-3 py-1 rounded-3xl border border-black/10 bg-white">{f[lang]}</li>
            ))}
          </ul>
        </div>

        <div aria-hidden className={THEME.hero.panel} />
      </div>
    </section>
  );
}

