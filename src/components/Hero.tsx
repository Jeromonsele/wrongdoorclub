import { COPY } from "@/copy";
import { THEME } from "@/theme";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className={`${THEME.layout.padX} pt-10 md:pt-14`}>
      <div className={`${THEME.layout.maxW} mx-auto grid md:grid-cols-2 items-center gap-8`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-4"
        >
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            {COPY.hero.title}
          </h1>
          <p className="text-lg text-clay/80">{COPY.hero.subtitle}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href="#adventure" className="btn btn-amber">
              <Compass className="size-5" />
              {COPY.hero.ctaStart}
            </a>
            <a href="#about" className="btn btn-ghost">
              {COPY.hero.ctaWhat}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          aria-hidden
          className="h-56 md:h-64 rounded-xl2 shadow-soft bg-[conic-gradient(at_20%_20%,#FFF3C4,#FFD08A,#FFAF70,#FFF3C4)]"
        />
      </div>
    </section>
  );
}

