// src/components/AboutCards.tsx
import { COPY } from "@/copy";
import { THEME } from "@/theme";
import { Feather, DoorOpen, Smile } from "lucide-react";
import { useLang } from "@/i18n";
import { useState } from "react";

const ICONS = [Feather, DoorOpen, Smile];

const PHOTOS = [
  { src: "/images/city-bridge.jpg", alt: "Sunlit bridge and domed building" },
  { src: "/images/crosswalk-sun.jpg", alt: "Golden hour crosswalk" },
  { src: "/images/cyclist-truck.jpg", alt: "Cyclist passing a truck" }
];

function PhotoTile({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true);
  return (
    <figure className="rounded-3xl shadow-soft border border-amber-100 bg-white overflow-hidden h-56 md:h-64">
      {ok ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="w-full h-full grid place-items-center bg-gradient-to-br from-sun-1 via-sun-2 to-sun-3 text-clay/70 text-sm">
          <span>Drop {src.replace("/images/", "")} into <code>/public/images/</code></span>
        </div>
      )}
    </figure>
  );
}

export function AboutCards() {
  const { lang } = useLang();
  return (
    <section id="about" className={`${THEME.layout.padX} py-12 md:py-16`}>
      <div className={`${THEME.layout.maxW} mx-auto`}>
        <h2 className="font-display text-2xl mb-6">{COPY.about.title[lang]}</h2>

        {/* Explainer cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {COPY.about.cards.map((c, i) => {
            const Ico = ICONS[i] ?? Smile;
            return (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Ico className="size-5 text-amber-600" />
                  <h3 className="font-medium">{c.title[lang]}</h3>
                </div>
                <p className="text-clay/80">{c.body[lang]}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-5">
          <a href="#whatsapp" className="btn btn-amber">
            {lang === "es" ? "Unirme a WhatsApp" : "Join WhatsApp"}
          </a>
        </div>

        {/* Photo tiles with graceful fallback */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {PHOTOS.map(p => (
            <PhotoTile key={p.src} src={p.src} alt={p.alt} />
          ))}
        </div>
      </div>
    </section>
  );
}

