import { THEME } from "@/theme";
import { COPY } from "@/copy";
import { Menu, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export function Header() {
  const [open, setOpen] = useState(false);
  const linkClass =
    "px-3 py-2 rounded-xl2 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

  return (
    <header className={clsx("sticky top-0 z-40", THEME.colors.bg, THEME.layout.padX, "backdrop-blur bg-cream/85")}>
      <div className={clsx("mx-auto", THEME.layout.maxW, "flex items-center justify-between h-16")}>
        <a href="#top" className="flex items-center gap-2 font-display text-lg">
          <Sparkles className="size-5 text-amber-500" aria-hidden />
          <span>{COPY.siteName}</span>
        </a>

        <nav className="hidden md:flex items-center gap-2">
          <a href="#about" className={linkClass}>{COPY.nav.about}</a>
          <a href="#adventure" className={linkClass}>{COPY.nav.adventure}</a>
          <a href="#join" className={linkClass}>{COPY.nav.join}</a>
        </nav>

        <button
          aria-label="Open menu"
          className="md:hidden p-2 rounded-xl2 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          onClick={() => setOpen(v => !v)}
        >
          <Menu className="size-6" />
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={clsx(THEME.layout.padX, "md:hidden")}
        >
          <div className={clsx("mx-auto", THEME.layout.maxW, "pb-3 flex flex-col gap-2")}>
            <a href="#about" className={linkClass} onClick={() => setOpen(false)}>{COPY.nav.about}</a>
            <a href="#adventure" className={linkClass} onClick={() => setOpen(false)}>{COPY.nav.adventure}</a>
            <a href="#join" className={linkClass} onClick={() => setOpen(false)}>{COPY.nav.join}</a>
          </div>
        </motion.div>
      )}
    </header>
  );
}

