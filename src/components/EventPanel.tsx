import { useEffect, useMemo, useState } from "react";
import { THEME } from "@/theme";
import { TEST_EVENT } from "@/data/events";
import { useLang } from "@/i18n";
import { useAnalytics } from "@/hooks/useAnalytics";

function useCountdown(whenISO: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return useMemo(() => {
    const target = new Date(whenISO).getTime();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, done: diff === 0 };
  }, [now, whenISO]);
}

export function EventPanel() {
  const { lang } = useLang();
  const { track } = useAnalytics();
  const c = useCountdown(TEST_EVENT.whenISO);

  return (
    <section className={`${THEME.layout.padX} py-12 md:py-16`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-5`}>
        <div className="card p-6">
          <div className="kicker">{lang === "es" ? "Evento" : "Event"}</div>
          <h1 className="font-display text-3xl md:text-4xl">{TEST_EVENT.title[lang]}</h1>
          <p className="text-clay/80">
            {TEST_EVENT.where[lang]} • {new Date(TEST_EVENT.whenISO).toLocaleString()}
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <TimeBox label={lang === "es" ? "Días" : "Days"} value={c.d} />
            <TimeBox label={lang === "es" ? "Horas" : "Hours"} value={c.h} />
            <TimeBox label={lang === "es" ? "Min" : "Min"} value={c.m} />
            <TimeBox label={lang === "es" ? "Seg" : "Sec"} value={c.s} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={TEST_EVENT.stripePaymentLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-amber"
              onClick={() => track("ticket_click", { source: "event_panel", id: TEST_EVENT.id })}
            >
              {lang === "es" ? "Conseguir boleto" : "Get Ticket"} • {TEST_EVENT.priceLabel[lang]}
            </a>
            <a href="#success" className="btn btn-ghost">
              {lang === "es" ? "Ya compré" : "I already bought"}
            </a>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl mb-2">{lang === "es" ? "Qué esperar" : "What to expect"}</h2>
          <ul className="list-disc pl-5 text-clay/80 space-y-1">
            <li>{lang === "es" ? "Gente que hizo micro aventuras esta semana" : "People who ran micro adventures this week"}</li>
            <li>{lang === "es" ? "Puertas pequeñas para romper el hielo" : "Tiny door prompts to break the ice"}</li>
            <li>{lang === "es" ? "Lugar acogedor en Roma Norte" : "Cozy venue in Roma Norte"}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-3">
      <div className="text-2xl font-display">{String(value).padStart(2, "0")}</div>
      <div className="text-sm text-clay/70">{label}</div>
    </div>
  );
}

