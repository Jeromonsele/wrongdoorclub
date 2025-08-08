// src/components/AdventureCard.tsx
import { THEME } from "@/theme";
import { SoloAdventure } from "./SoloAdventure";
import { COPY } from "@/copy";
import { featuredSponsor } from "@/data/sponsors";
import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n";
import { EXPANSION_PACKS } from "@/data/quests";
import { load, save } from "@/utils/storage";
import { GlassCard } from "./ui/Glass";

export function AdventureCard() {
  const [packsOpen, setPacksOpen] = useState(false);
  const { lang } = useLang();

  return (
    <section id="adventure" className={`${THEME.layout.padX} py-12 md:py-16`}>
      <div className={`${THEME.layout.maxW} mx-auto grid lg:grid-cols-[2fr,1fr] gap-6 items-start`}>
        <GlassCard className="p-5">
          <h2 className="font-display text-2xl mb-2">{COPY.adventure.title[lang]}</h2>
          <SoloAdventure />
        </GlassCard>

        <div className="flex flex-col gap-4">
          <button
            className="card glass-card-hover p-4 text-left flex items-center justify-between"
            onClick={() => setPacksOpen(v => !v)}
            aria-expanded={packsOpen}
            aria-controls="packs"
          >
            <div>
              <div className="font-medium">{COPY.adventure.packDrawer.title[lang]}</div>
              <div className="text-sm text-clay/70">{COPY.adventure.packDrawer.hint[lang]}</div>
            </div>
            <ChevronDown className={`size-5 transition ${packsOpen ? "rotate-180" : ""}`} />
          </button>

          {packsOpen && (
            <div id="packs" className="card glass-card-hover p-4">
              <PackToggles />
            </div>
          )}

          <a href={featuredSponsor.url} className="card glass-card-hover p-4 hover:shadow-lg transition" target="_blank" rel="noreferrer">
            <div className="flex items-center gap-2 mb-1">
              <Star className="size-4 text-amber-600" />
              <div className="text-sm text-clay/70">{COPY.adventure.sponsor.label[lang]}</div>
            </div>
            <div className="font-medium">{featuredSponsor.name}</div>
            <p className="text-sm text-clay/80">{featuredSponsor.blurb}</p>
          </a>
        </div>
      </div>
    </section>
  );
}

function PackToggles() {
  const key = "wdf_pack_toggles";
  const initial = load<Record<string, boolean>>(key, {});
  const state = Object.fromEntries(
    EXPANSION_PACKS.map(p => [p.id, initial[p.id] ?? true])
  );
  const set = (id: string, val: boolean) => {
    const next = { ...state, [id]: val };
    save(key, next);
    // state read happens on generate, no hacky refresh needed
  };

  return (
    <div className="flex flex-col gap-2">
      {EXPANSION_PACKS.map(p => (
        <label key={p.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            defaultChecked={state[p.id]}
            onChange={e => set(p.id, e.currentTarget.checked)}
            className="size-5 accent-amber-600"
          />
          <span>{p.name.es} / {p.name.en}</span>
        </label>
      ))}
    </div>
  );
}

