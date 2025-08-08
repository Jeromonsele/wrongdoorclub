import { useEffect, useMemo, useRef, useState } from "react";
import { VENUES, NEIGHBORHOODS, VIBES } from "@/data/venues";
import { EXPANSION_PACKS, SEED_PACK, Quest } from "@/data/quests";
import { load, save } from "@/utils/storage";
import { wallClockCountdown, now } from "@/utils/timers";
import { COPY } from "@/copy";
import { Compass, Clock, RefreshCw, Check, Image as ImageIcon, MapPin, Download } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

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
  history: []
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
    setS({ ...s, quests, idx: 0, doneIds: [], photos: {}, endTs, history: [`Started ${new Date().toLocaleTimeString()}`] });
  }

  function next() {
    if (s.idx < s.quests.length - 1) setS({ ...s, idx: s.idx + 1 });
  }

  function markDone(id: string) {
    if (!s.doneIds.includes(id)) {
      const doneIds = [...s.doneIds, id];
      const history = [...s.history, `Finished ${id} at ${new Date().toLocaleTimeString()}`];
      setS({ ...s, doneIds, history });
      // Confetti event via custom dispatch
      document.dispatchEvent(new CustomEvent("confetti"));
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
        <Select
          label={COPY.adventure.controls.neighborhood}
          value={s.neighborhood}
          onChange={v => setS({ ...s, neighborhood: v })}
          options={NEIGHBORHOODS as unknown as string[]}
        />
        <Select
          label={COPY.adventure.controls.vibe}
          value={s.vibe}
          onChange={v => setS({ ...s, vibe: v })}
          options={VIBES as unknown as string[]}
        />
        <Select
          label={COPY.adventure.controls.duration}
          value={String(s.duration)}
          onChange={v => setS({ ...s, duration: Number(v) })}
          options={["30", "45", "60", "90"]}
        />
      </div>

      <div className="flex gap-2">
        <button className="btn btn-amber" onClick={generate}>
          <Compass className="size-5" />
          {COPY.adventure.controls.start}
        </button>
        <a href={nearbyUrl()} target="_blank" rel="noreferrer" className="btn btn-ghost">
          <MapPin className="size-5" />
          {COPY.adventure.controls.nearby}
        </a>
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
            key={current?.id ?? "none"}
            quest={current}
            photoData={current?.id ? s.photos[current.id] : undefined}
            onAttach={(f) => {
              if (!current) return;
              attachPhoto(current.id, f);
            }}
            onReroll={reroll}
            onDone={async () => {
              if (!current) return;
              const ok = await checkGPS(current);
              if (ok) markDone(current.id);
            }}
            onNext={next}
            isLast={s.idx === s.quests.length - 1}
          />

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={downloadBadge}>
              <Download className="size-5" />
              {COPY.adventure.controls.download}
            </button>
          </div>

          {cameraBlocked && (
            <Alert>{COPY.alerts.cameraBlocked}</Alert>
          )}
          {locationBlocked && (
            <Alert>{COPY.alerts.locationBlocked}</Alert>
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

function Alert({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl2 bg-amber-50 text-amber-900 px-3 py-2">{children}</div>;
}

function QuestCard({
  quest,
  onReroll,
  onDone,
  onNext,
  isLast,
  onAttach,
  photoData
}: {
  quest?: Quest;
  onReroll: () => void;
  onDone: () => void | Promise<void>;
  onNext: () => void;
  isLast: boolean;
  onAttach: (file: File) => void;
  photoData?: string;
}) {
  if (!quest) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm uppercase tracking-wide text-clay/60">{quest.type}</div>
        <div className="flex gap-2">
          <button className="btn btn-ghost text-sm" onClick={onReroll} aria-label="Reroll quest">
            <RefreshCw className="size-4" />
            {COPY.adventure.controls.reroll}
          </button>
        </div>
      </div>
      <p className="text-lg">{quest.text}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {quest.photo && (
          <label className="btn btn-ghost cursor-pointer">
            <ImageIcon className="size-5" />
            {COPY.adventure.controls.attach}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (!f) return;
                if (!navigator.mediaDevices) {
                  // graceful fallback
                }
                onAttach(f);
              }}
            />
          </label>
        )}
        <button className="btn btn-amber" onClick={() => void onDone()}>
          <Check className="size-5" />
          {COPY.adventure.controls.done}
        </button>
        {!isLast && (
          <button className="btn btn-ghost" onClick={onNext}>
            {COPY.adventure.controls.next}
          </button>
        )}
      </div>

      {photoData && (
        <div className="mt-3">
          <img src={photoData} alt="Attached quest" className="w-full h-48 object-cover rounded-xl2" />
        </div>
      )}
    </motion.div>
  );
}

