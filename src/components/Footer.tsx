import { COPY } from "@/copy";
import { THEME, FEATURE_FLAGS } from "@/theme";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="join" className={`${THEME.layout.padX} py-12`}>
      <div className={`${THEME.layout.maxW} mx-auto grid gap-6`}>
        {FEATURE_FLAGS.membershipTeaser && (
          <div className="card p-5 flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-xl">{COPY.footer.membershipTeaserTitle}</div>
              <p className="text-clay/80">{COPY.footer.membershipTeaserBody}</p>
            </div>
            <a className="btn btn-amber" href="#join-link">
              {COPY.footer.joinCta}
            </a>
          </div>
        )}
        <div className="text-center text-clay/70">
          <div className="font-display text-lg mb-1">{COPY.footer.line}</div>
          <div>{COPY.footer.yearPrefix} {year} {COPY.siteName}</div>
        </div>
      </div>
    </footer>
  );
}

