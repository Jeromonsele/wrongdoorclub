// src/components/Footer.tsx
import { COPY } from "@/copy";
import { THEME, FEATURE_FLAGS } from "@/theme";
import { useLang } from "@/i18n";
import { WHATSAPP_GRADUATES_LINK } from "@/data/social";

export function Footer() {
  const year = new Date().getFullYear();
  const { lang } = useLang();
  return (
    <footer id="join" className={`${THEME.layout.padX} py-12`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-6`}>
        {FEATURE_FLAGS.membershipTeaser && (
          <div className="card p-5 flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-xl">{COPY.footer.membershipTeaserTitle[lang]}</div>
              <p className="text-clay/80">{COPY.footer.membershipTeaserBody[lang]}</p>
            </div>
            <div className="flex gap-2">
              <a className="btn btn-amber" href="#join-link">
                {COPY.footer.joinCta[lang]}
              </a>
              <a className="btn btn-ghost" href={WHATSAPP_GRADUATES_LINK} target="_blank" rel="noreferrer">
                {lang === "es" ? "WhatsApp" : "WhatsApp"}
              </a>
            </div>
          </div>
        )}
        <div className="text-center text-clay/70">
          <div className="font-display text-lg mb-1">{COPY.footer.line[lang]}</div>
          <div>{COPY.footer.yearPrefix[lang]} {year} {COPY.siteName[lang]}</div>
        </div>
      </div>
    </footer>
  );
}

