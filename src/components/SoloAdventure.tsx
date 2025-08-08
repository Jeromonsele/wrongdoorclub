// src/components/SoloAdventure.tsx
import { useEffect, useMemo, useState } from "react";
import { VENUES, NEIGHBORHOODS, VIBES } from "@/data/venues";
import { EXPANSION_PACKS, SEED_PACK, Quest } from "@/data/quests";
import { load, save } from "@/utils/storage";
import { wallClockCountdown, now } from "@/utils/timers";
import { COPY } from "@/copy";
import { Compass, Clock, RefreshCw, Check, Image as ImageIcon, MapPin, Download, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { useLang, t } from "@/i18n";
import { VocabHint } from "./VocabHint";
import { AudioButton } from "./AudioButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { WHATSAPP_GRADUATES_LINK } from "@/data/social";
import { bumpStreak, getStreak } from "@/utils/streaks";

type State = {
  neighborhood: string;
  vibe: string;
  duration: number; // minutes
  quests: Quest[];
  idx: number;
  doneIds: string[];
  endTs?: number;
  photos: Record<string, string>; // questId -> base64
  history: string[];
  showEnglish: boolean;
};

const KEY = "wdf_adventure_state";
const DEFAULT: State = {
  neighborhood: "Roma",
  vibe: "Chill",
  duration: 45,
  quests: [],
  idx: 0,
  doneIds: [],
  photos: {},
  history: [],
  showEnglish: false
};

const getActivePacks = () => {
  const toggles = load<Record<string, boolean>>("wdf_pack_toggles", {});
  return EXPANSION_PACKS.filter(p => toggles[p.id] ?? true);
};

function pickQuests(count: number): Quest[] {
  const pool = [ ...SEED_PACK.quests, ...getActivePacks().flatMap(p => p.quests) ];
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, Math.min(count, shuffled.length));
  return chosen;
}

export function SoloAdventure() {
  const { lang } = useLang();
  const { track } = useAnalytics();
  const [s, setS] = useState<State>(() => ({ ...DEFAULT, ...load<State>(KEY, DEFAULT) }));
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [tick, setTick] = useState(0);

  // Persist
  useEffect(() => {
    save(KEY, s);
  }, [s]);

  // Timer tick
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Reduced motion flag
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("reduced-motion");
    }
  }, []);

  const remaining = useMemo(() => (s.endTs ? wallClockCountdown(s.endTs) : { ms: 0, label: "00:00" }), [tick, s.endTs]);
  const current = s.quests[s.idx];

  function generate() {
    const count = Math.min(5, Math.max(3, Math.round(s.duration / 20)));
    const quests = pickQuests(count);
    const endTs = now() + s.duration * 60 * 1000;
    setS({ ...s, quests, idx: 0, doneIds: [], photos: {}, endTs, history: [`Start ${new Date().toLocaleTimeString()}`] });
    track("adventure_start", { neighborhood: s.neighborhood, vibe: s.vibe, duration: s.duration, count });
  }

  function next() {
    if (s.idx < s.quests.length - 1) setS({ ...s, idx: s.idx + 1 });
  }

  function markDone(id: string) {
    if (!s.doneIds.includes(id)) {
      const doneIds = [...s.doneIds, id];
      const history = [...s.history, `Finish ${id} ${new Date().toLocaleTimeString()}`];
      const allDone = doneIds.length >= s.quests.length && s.quests.length > 0;
      setS({ ...s, doneIds, history });
      // Confetti event via custom dispatch
      document.dispatchEvent(new CustomEvent("confetti"));
      if (allDone) {
        track("adventure_complete", { total: s.quests.length, duration: s.duration, neighborhood: s.neighborhood, vibe: s.vibe });
        const streak = bumpStreak();
        console.debug("streak", streak);
      }
    }
  }

  function reroll() {
    if (!current) return;
    const replacements = pickQuests(1);
    const next = s.quests.slice();
    next[s.idx] = replacements[0];
    setS({ ...s, quests: next });
  }

  async function checkGPS(q?: Quest) {
    if (!q?.gps) return true;
    try {
      await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 5000 })
      );
      return true;
    } catch {
      setLocationBlocked(true);
      return false;
    }
  }

  function attachPhoto(id: string, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      const photos = { ...s.photos, [id]: preview };
      setS({ ...s, photos });
    };
    reader.readAsDataURL(file);
  }

  function nearbyUrl() {
    const pool = VENUES.filter(v => v.neighborhoods.includes(s.neighborhood as any));
    const v = pool[0] ?? VENUES[0];
    const q = v.mapsQuery ? encodeURIComponent(v.mapsQuery) : `${v.lat},${v.lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  function downloadBadge() {
    const lines = [
      `Wrong Door Club`,
      `Neighborhood: ${s.neighborhood}`,
      `Vibe: ${s.vibe}`,
      `Duration: ${s.duration} min`,
      `Completed: ${s.doneIds.length}/${s.quests.length}`,
      ``,
      ...s.quests.map((q, i) => `${i + 1}. [${q.type}] ${q.text} ${s.doneIds.includes(q.id) ? "(done)" : ""}`),
      ``,
      ...s.history
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wrong-door-badge-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="field">
          <span className="field-label">{t(COPY.adventure.controls.neighborhood, lang)}</span>
          <select
            className="select"
            value={s.neighborhood}
            onChange={(e) => setS({ ...s, neighborhood: e.target.value })}
          >
            {(NEIGHBORHOODS as unknown as string[]).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t(COPY.adventure.controls.vibe, lang)}</span>
          <select
            className="select"
            value={s.vibe}
            onChange={(e) => setS({ ...s, vibe: e.target.value })}
          >
            {(VIBES as unknown as string[]).map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t(COPY.adventure.controls.duration, lang)}</span>
          <select
            className="select"
            value={String(s.duration)}
            onChange={(e) => setS({ ...s, duration: Number(e.target.value) })}
          >
            {["30","45","60","90"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-amber" onClick={generate}>
          <Compass className="size-5" />
          {t(COPY.adventure.controls.start, lang)}
        </button>
        <a href={nearbyUrl()} target="_blank" rel="noreferrer" className="btn btn-ghost">
          <MapPin className="size-5" />
          {t(COPY.adventure.controls.nearby, lang)}
        </a>
        <button
          className="ml-auto btn btn-ghost text-sm"
          onClick={() => setS({ ...s, showEnglish: !s.showEnglish })}
        >
          {s.showEnglish ? t(COPY.adventure.controls.hideEnglish, lang) : t(COPY.adventure.controls.showEnglish, lang)}
        </button>
      </div>

      {s.quests.length > 0 && (
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm text-clay/70">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span aria-live="polite">{remaining.label}</span>
            </div>
            <Progress total={s.quests.length} done={s.doneIds.length} />
          </div>

          <QuestCard
            quest={current}
            showEnglish={s.showEnglish}
            nextLabel={s.quests[s.idx + 1]?.text.es}
            onAttach={(id, f) => attachPhoto(id, f)}
            onReroll={reroll}
            onDone={async (id) => { const ok = await checkGPS(current); if (ok) markDone(id); }}
            onNext={next}
            isLast={s.idx === s.quests.length - 1}
            photos={s.photos}
          />

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={downloadBadge}>
              <Download className="size-5" />
              {t(COPY.adventure.controls.download, lang)}
            </button>
          </div>

        {s.quests.length > 0 && s.doneIds.length === s.quests.length && (
          <div className="card p-4">
            <p className="font-medium">{COPY.alerts.complete[lang]}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="#event"
                className="btn btn-ghost"
                onClick={() => track("ticket_click", { source: "adventure_complete" })}
              >
                {lang === "es" ? "Conseguir boleto" : "Get Ticket"}
              </a>
              <a
                href={WHATSAPP_GRADUATES_LINK}
                target="_blank"
                rel="noreferrer"
                className="btn btn-amber"
                onClick={() => track("whatsapp_join", { source: "adventure_complete" })}
              >
                {lang === "es" ? "Entrar a WhatsApp" : "Join WhatsApp"}
              </a>
            </div>
          </div>
        )}

          {cameraBlocked && (
            <Alert label={t(COPY.alerts.cameraBlocked, lang)} />
          )}
          {locationBlocked && (
            <Alert label={t(COPY.alerts.locationBlocked, lang)} />
          )}
        </div>
      )}
    </div>
  );
}

function Select(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-clay/70">{props.label}</span>
      <select
        className="rounded-xl2 border border-black/10 bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Progress({ total, done }: { total: number; done: number }) {
  const pct = Math.round((done / Math.max(1, total)) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-28 h-2 bg-amber-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
      </div>
      <span>{done}/{total}</span>
    </div>
  );
}

function Alert({ label }: { label: string }) {
  return <div className="rounded-3xl bg-amber-50 text-amber-900 px-3 py-2">{label}</div>;
}

function renderTextWithVocab(text: string, vocab?: { word: string; hint: string }[]) {
  if (!vocab || vocab.length === 0) return <span className="text-lg">{text}</span>;
  let result: React.ReactNode[] = [];
  let remaining = text;
  vocab.forEach(({ word, hint }, i) => {
    const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
    if (idx >= 0) {
      const before = remaining.slice(0, idx);
      const after = remaining.slice(idx + word.length);
      result.push(<span key={`before-${i}`}>{before}</span>);
      result.push(<VocabHint key={`v-${i}`} word={remaining.substr(idx, word.length)} hint={hint} />);
      remaining = after;
    }
  });
  result.push(<span key="last">{remaining}</span>);
  return <span className="text-lg">{result}</span>;
}

function QuestCard({
  quest,
  showEnglish,
  nextLabel,
  isLast,
  onReroll,
  onNext,
  onDone,
  onAttach,
  photos
}: {
  quest?: Quest;
  showEnglish: boolean;
  nextLabel?: string;
  isLast: boolean;
  onReroll: () => void;
  onNext: () => void;
  onDone: (id: string) => void | Promise<void>;
  onAttach: (id: string, f: File) => void;
  photos: Record<string, string>;
}) {
  if (!quest) return null;
  const photoData = photos[quest.id];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="kicker">{quest.type}</div>
        <div className="flex gap-2">
          <AudioButton text={quest.text.es} />
          <button className="btn btn-ghost text-sm" onClick={onReroll} aria-label="Reroll">
            <RefreshCw className="size-4" />
            Cambiar
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {renderTextWithVocab(quest.text.es, quest.vocab)}
        {showEnglish && <p className="text-clay/70">{quest.text.en}</p>}
      </div>

      {nextLabel && (
        <div className="mt-3 text-sm text-clay/70 flex items-center gap-1">
          <ChevronRight className="size-4" />
          <span>Siguiente: {nextLabel}</span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {quest.photo && (
          <label className="btn btn-ghost cursor-pointer">
            <ImageIcon className="size-5" />
            Adjuntar foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (!f) return;
                onAttach(quest.id, f);
              }}
            />
          </label>
        )}
        <button className="btn btn-amber" onClick={() => void onDone(quest.id)}>
          <Check className="size-5" />
          Listo
        </button>
        {!isLast && (
          <button className="btn btn-ghost" onClick={onNext}>
            Siguiente
          </button>
        )}
      </div>

      {photoData && (
        <div className="mt-3">
          <img src={photoData} alt="Adjunto" className="w-full h-48 object-cover rounded-3xl" />
        </div>
      )}
    </div>
  );
}

