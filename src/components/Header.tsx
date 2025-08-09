// src/components/Header.tsx
import { THEME } from "@/theme";
import { COPY } from "@/copy";
import { Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n";
import clsx from "clsx";

export function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLang();
  const linkClass = "px-3 py-2 rounded-3xl hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

  return (
    <header className={clsx("sticky top-0 z-40 pt-safe-top", THEME.colors.bg, THEME.layout.padX, "backdrop-blur bg-cream/85")}> 
      <div className={clsx("mx-auto", THEME.layout.maxW, "flex items-center justify-between h-16")}> 
        <a href="#top" className="flex items-center gap-2 font-display text-lg">
          <Sparkles className="size-5 text-amber-500" aria-hidden />
          <span>{COPY.siteName[lang]}</span>
        </a>

        <nav className="hidden md:flex items-center gap-2" role="navigation" aria-label="Primary">
          <a href="#about" className={linkClass}>{COPY.nav.about[lang]}</a>
          <a href="#adventure" className={linkClass}>{COPY.nav.adventure[lang]}</a>
          <a href="#join" className={linkClass}>{COPY.nav.join[lang]}</a>
          <a href="#event" className={linkClass}>Tickets</a>
          <button
            className={clsx(
              "ml-2 px-3 py-2 rounded-3xl border bg-white hover:bg-amber-50",
              lang === "es" ? "border-amber-300" : "border-black/10"
            )}
            aria-label="Language"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <span className={clsx("text-xs font-medium", lang === "es" ? "text-amber-700" : "text-clay/70")}>{lang.toUpperCase()}</span>
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label="Language"
            className={clsx("p-2 rounded-3xl border bg-white", lang === "es" ? "border-amber-300" : "border-black/10")}
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <span className={clsx("text-xs font-medium", lang === "es" ? "text-amber-700" : "text-clay/70")}>{lang.toUpperCase()}</span>
          </button>
          <button
            aria-label="Open menu"
            className="p-2 rounded-3xl hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className={clsx(THEME.layout.padX, "md:hidden")}> 
          <div id="mobile-nav" role="navigation" aria-label="Mobile Primary" className={clsx("mx-auto", THEME.layout.maxW, "pb-3 flex flex-col gap-2")}> 
            <a href="#about" className={linkClass} onClick={() => setOpen(false)}>{COPY.nav.about[lang]}</a>
            <a href="#adventure" className={linkClass} onClick={() => setOpen(false)}>{COPY.nav.adventure[lang]}</a>
            <a href="#join" className={linkClass} onClick={() => setOpen(false)}>{COPY.nav.join[lang]}</a>
            <a href="#event" className={linkClass} onClick={() => setOpen(false)}>Tickets</a>
          </div>
        </div>
      )}
    </header>
  );
}

