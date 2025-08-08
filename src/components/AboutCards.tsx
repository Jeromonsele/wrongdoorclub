import { COPY } from "@/copy";
import { THEME } from "@/theme";
import { motion } from "framer-motion";
import { Feather, DoorOpen, Smile } from "lucide-react";

const ICONS = [Feather, DoorOpen, Smile];

export function AboutCards() {
  return (
    <section id="about" className={`${THEME.layout.padX} py-12 md:py-16`}>
      <div className={`${THEME.layout.maxW} mx-auto`}>
        <h2 className="font-display text-2xl mb-6">{COPY.about.title}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {COPY.about.cards.map((c, i) => {
            const Ico = ICONS[i] ?? Smile;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Ico className="size-5 text-amber-600" />
                  <h3 className="font-medium">{c.title}</h3>
                </div>
                <p className="text-clay/80">{c.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

