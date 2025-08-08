import { THEME } from "@/theme";
import { useLang } from "@/i18n";
import { WHATSAPP_GRADUATES_LINK } from "@/data/social";
import { useAnalytics } from "@/hooks/useAnalytics";
import { buildICS } from "@/utils/ics";

export function SuccessPanel() {
  const { lang } = useLang();
  const { track } = useAnalytics();

  return (
    <section className={`${THEME.layout.padX} py-12 md:py-16`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-5`}>
        <div className="card p-6">
          <h1 className="font-display text-3xl md:text-4xl">
            {lang === "es" ? "Listo. Nos vemos." : "All set. See you there."}
          </h1>
          <p className="text-clay/80">
            {lang === "es" ? "Únete al grupo para detalles y actualizaciones:" : "Join the group for details and updates:"}
          </p>
          <div className="mt-3">
            <a
              className="btn btn-amber"
              href={WHATSAPP_GRADUATES_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("whatsapp_join", { source: "success" })}
            >
              {lang === "es" ? "Entrar a WhatsApp" : "Join WhatsApp"}
            </a>
            <button
              className="btn btn-ghost ml-2"
              onClick={() => {
                const ics = buildICS({
                  title: lang === "es" ? "Encuentro de Egresados" : "Adventure Graduates Meetup",
                  startISO: new Date().toISOString(),
                  durationMin: 120,
                  description: "Adventure Graduates Meetup",
                  location: "Roma Norte, CDMX"
                });
                const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "wrong-door-event.ics";
                a.click();
                URL.revokeObjectURL(a.href);
              }}
            >
              {lang === "es" ? "Agregar al calendario" : "Add to calendar"}
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl mb-2">
            {lang === "es" ? "Siguiente reto semanal" : "Next weekly challenge"}
          </h2>
          <p className="text-clay/80 mb-3">
            {lang === "es" ? "Recibe misiones y avisos cada semana." : "Get weekly quests and invites."}
          </p>

          {/* Buttondown - replace USERNAME */}
          <form
            action="https://buttondown.email/USERNAME"
            method="post"
            target="popupwindow"
            onSubmit={() => {
              window.open("https://buttondown.email/USERNAME", "popupwindow");
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder={lang === "es" ? "tu@email.com" : "you@email.com"}
              className="rounded-3xl border border-black/10 bg-white px-3 py-2 flex-1"
            />
            <button className="btn btn-amber" type="submit">
              {lang === "es" ? "Suscribirme" : "Subscribe"}
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}

