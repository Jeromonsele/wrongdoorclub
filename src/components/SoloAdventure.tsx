// src/components/SoloAdventure.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { VENUES, NEIGHBORHOODS, VIBES } from "@/data/venues";
import { EXPANSION_PACKS, SEED_PACK, Quest } from "@/data/quests";
import { load, save } from "@/utils/storage";
import { wallClockCountdown, now } from "@/utils/timers";
import { COPY } from "@/copy";
import { Compass, Clock, RefreshCw, Check, Image as ImageIcon, MapPin, Download, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
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
  challengeMode?: boolean;
};

type UserProfile = {
  attemptedQuests: number;
  completedQuests: number;
  xp: number;
  byNeighborhood: Record<string, number>;
  byType: Record<Quest["type"], number>;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewQuests, setPreviewQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<string[]>(() => load<string[]>("wdf_achievements", []));
  const [profile, setProfile] = useState<UserProfile>(() => load<UserProfile>("wdf_profile", { attemptedQuests: 0, completedQuests: 0, xp: 0, byNeighborhood: {}, byType: { social: 0, movement: 0, photo: 0, reflect: 0, food: 0 } }));
  const current = s.quests[s.idx];

  // keyboard shortcuts for accessibility: s=start, r=reroll, n=next, d=done
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as any).isContentEditable)) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        if (!isGenerating) generate();
      } else if (key === 'r' && current) {
        e.preventDefault();
        reroll();
      } else if (key === 'n' && current) {
        e.preventDefault();
        next();
      } else if (key === 'd' && current) {
        e.preventDefault();
        (async () => { setGpsLoading(true); const ok = await checkGPS(current); setGpsLoading(false); if (ok) markDone(current.id); })();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, isGenerating, s]);

  // Persist (debounced)
  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      save(KEY, s);
    }, 300);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
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
  const level = useMemo(() => 1 + Math.floor(profile.xp / 100), [profile.xp]);

  function generate() {
    setIsGenerating(true);
    // brief delay for perceived responsiveness and to display skeleton
    setTimeout(() => {
      const count = Math.min(5, Math.max(3, Math.round(s.duration / 20)));
      const quests = pickQuestsSmart(count, profile);
      const endTs = now() + s.duration * 60 * 1000;
      setS({ ...s, quests, idx: 0, doneIds: [], photos: {}, endTs, history: [`Start ${new Date().toLocaleTimeString()}`] });
      track("adventure_start", { neighborhood: s.neighborhood, vibe: s.vibe, duration: s.duration, count });
      const updated = { ...profile, attemptedQuests: profile.attemptedQuests + quests.length };
      setProfile(updated);
      save("wdf_profile", updated);
      setIsGenerating(false);
      navigator.vibrate?.(20);
      setPreviewOpen(false);
    }, 350);
  }

  function openPreview() {
    const sample = pickQuestsSmart(3, profile);
    setPreviewQuests(sample);
    setPreviewOpen(true);
  }

  function addAchievement(id: string) {
    if (achievements.includes(id)) return;
    const next = [...achievements, id];
    setAchievements(next);
    save("wdf_achievements", next);
  }

  function next() {
    if (s.idx < s.quests.length - 1) setS({ ...s, idx: s.idx + 1 });
    navigator.vibrate?.(10);
  }

  function markDone(id: string) {
    if (!s.doneIds.includes(id)) {
      const doneIds = [...s.doneIds, id];
      const history = [...s.history, `Finish ${id} ${new Date().toLocaleTimeString()}`];
      const allDone = doneIds.length >= s.quests.length && s.quests.length > 0;
      setS({ ...s, doneIds, history });
      // Confetti event via custom dispatch
      document.dispatchEvent(new CustomEvent("confetti"));
      if (doneIds.length === 1) addAchievement('first_quest');
      if (allDone) {
        track("adventure_complete", { total: s.quests.length, duration: s.duration, neighborhood: s.neighborhood, vibe: s.vibe });
        const streak = bumpStreak();
        console.debug("streak", streak);
        addAchievement('adventure_complete');
      }
      navigator.vibrate?.(30);
      // XP award
      const found = s.quests.find(q => q.id === id);
      if (found) {
        const gained = pointsFor(found);
        const byType = { ...profile.byType, [found.type]: (profile.byType[found.type] ?? 0) + 1 } as UserProfile["byType"];
        const byNeighborhood = { ...profile.byNeighborhood, [s.neighborhood]: (profile.byNeighborhood[s.neighborhood] ?? 0) + 1 };
        const updated: UserProfile = { ...profile, completedQuests: profile.completedQuests + 1, xp: profile.xp + gained, byType, byNeighborhood };
        setProfile(updated);
        save("wdf_profile", updated);
        evaluateAchievementThresholds(updated, found);
      }
    }
  }

  function reroll() {
    if (!current) return;
    const replacements = pickQuestsSmart(1, profile);
    const next = s.quests.slice();
    next[s.idx] = replacements[0];
    setS({ ...s, quests: next });
    navigator.vibrate?.(10);
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

  async function attachPhoto(id: string, file: File) {
    setUploadingPhotoId(id);
    try {
      const blob = await compressImage(file, 800);
      const dataUrl = await blobToDataUrl(blob);
      const photos = { ...s.photos, [id]: dataUrl };
      setS({ ...s, photos });
      navigator.vibrate?.(20);
    } catch {
      // fallback to original file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string;
        const photos = { ...s.photos, [id]: preview };
        setS({ ...s, photos });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhotoId(null);
    }
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

  // Adaptive difficulty & points helpers
  function estimateDifficulty(q: Quest): 1 | 2 | 3 | 4 | 5 {
    let score = 1;
    if (q.type === "social") score = 3;
    if (q.type === "movement") score = 2;
    if (q.type === "photo") score = 2;
    if (q.type === "reflect") score = 2;
    if (q.type === "food") score = 1;
    if (q.gps) score += 1;
    if (q.photo) score += 1;
    return Math.max(1, Math.min(5, score as number)) as 1 | 2 | 3 | 4 | 5;
  }

  function pointsFor(q: Quest): number {
    return estimateDifficulty(q) * 10;
  }

  function completionRate(p: UserProfile): number {
    const att = Math.max(1, p.attemptedQuests);
    return p.completedQuests / att;
  }

  function pickQuestsSmart(count: number, p: UserProfile): Quest[] {
    const pool = [ ...SEED_PACK.quests, ...getActivePacks().flatMap(pp => pp.quests) ];
    const rate = completionRate(p);
    let target = rate > 0.8 ? 4 : rate < 0.5 ? 2 : 3;
    if (s.challengeMode) target = Math.min(5, target + 1);
    const scored = pool.map(q => ({ q, d: estimateDifficulty(q), w: 1 / (1 + Math.abs(estimateDifficulty(q) - target)) }));
    const sorted = scored
      .map(item => ({ ...item, r: Math.random() * (item.w + 0.001) }))
      .sort((a, b) => b.r - a.r)
      .map(s => s.q);
    const unique: Quest[] = [];
    for (const q of sorted) {
      if (unique.length >= count) break;
      if (!unique.find(u => u.id === q.id)) unique.push(q);
    }
    return unique;
  }

  async function compressImage(file: File, maxWidth: number): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(bitmap, 0, 0, w, h);
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/webp', 0.85);
    });
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  function evaluateAchievementThresholds(p: UserProfile, q: Quest) {
    // Neighborhood Master: 10 in same neighborhood
    if ((p.byNeighborhood[s.neighborhood] ?? 0) >= 10) addAchievement(`master_${s.neighborhood}`);
    // Photo Hunter: 10 photo quests
    if ((p.byType.photo ?? 0) >= 10) addAchievement('photo_hunter');
    // Weekly streak reward
    const wk = getStreak().current;
    if (wk >= 1) addAchievement('streak_weekly');
    if (wk >= 4) addAchievement('streak_monthly');
    if (wk >= 100) addAchievement('streak_legendary');
    // Secret hooks: placeholder for future hidden triggers
  }

  return (
    <div className="grid gap-4">
      <div className="grid sm:grid-cols-3 gap-2 sm:gap-3">
        <Select
          label={t(COPY.adventure.controls.neighborhood, lang)}
          value={s.neighborhood}
          onChange={(v) => setS({ ...s, neighborhood: v })}
          options={NEIGHBORHOODS as unknown as string[]}
        />
        <TogglePills
          label={t(COPY.adventure.controls.vibe, lang)}
          value={s.vibe}
          onChange={(v) => setS({ ...s, vibe: v })}
          options={VIBES as unknown as string[]}
        />
        <TogglePills
          label={t(COPY.adventure.controls.duration, lang)}
          value={String(s.duration)}
          onChange={(v) => setS({ ...s, duration: Number(v) })}
          options={["30","45","60","90"]}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className={clsx("btn btn-amber", isGenerating && "opacity-70 cursor-not-allowed")}
          onClick={generate} disabled={isGenerating} aria-busy={isGenerating}>
          {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <Compass className="size-5" />}
          {isGenerating ? (lang === "es" ? "Generando…" : "Generating…") : t(COPY.adventure.controls.start, lang)}
        </button>
        <button className="btn btn-ghost" type="button" onClick={openPreview}>
          {lang === 'es' ? 'Vista previa' : 'Preview'}
        </button>
        <button
          className={clsx("btn", s.challengeMode ? "btn-amber" : "btn-ghost")}
          type="button"
          onClick={() => setS({ ...s, challengeMode: !s.challengeMode })}
          aria-pressed={!!s.challengeMode}
        >
          {lang === 'es' ? 'Modo desafío' : 'Challenge mode'}
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
            <div className="flex items-center gap-2" role="timer" aria-live="polite" aria-atomic="true" aria-label="Time remaining">
              <Clock className="size-4" />
              <span aria-live="polite" className={remaining.ms < 15000 ? "text-red-600" : remaining.ms < 60000 ? "text-amber-600" : undefined}>{remaining.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <Progress total={s.quests.length} done={s.doneIds.length} />
            <div className="px-2 py-1 rounded-3xl border border-amber-100 bg-white/80 text-clay text-xs" aria-label={lang === 'es' ? 'Nivel y experiencia' : 'Level and experience'}>
              {lang === 'es' ? 'Nivel' : 'Lvl'} {level} · {profile.xp} XP
            </div>
              <AchievementsBar ids={achievements} lang={lang} />
            </div>
          </div>

          <QuestCard
            quest={current}
            showEnglish={s.showEnglish}
            nextLabel={s.quests[s.idx + 1]?.text.es}
            onAttach={(id, f) => attachPhoto(id, f)}
            onReroll={reroll}
            onDone={async (id) => { setGpsLoading(true); const ok = await checkGPS(current); setGpsLoading(false); if (ok) markDone(id); }}
            onNext={next}
            isLast={s.idx === s.quests.length - 1}
            photos={s.photos}
            gpsLoading={gpsLoading}
            uploadingPhotoId={uploadingPhotoId}
            getPoints={pointsFor}
          />

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={downloadBadge}>
              <Download className="size-5" />
              {t(COPY.adventure.controls.download, lang)}
            </button>
          </div>

        {s.quests.length > 0 && s.doneIds.length === s.quests.length && (
          <CompletionDialog
            lang={lang}
            onTicket={() => track("ticket_click", { source: "adventure_complete_sheet" })}
            onWhatsapp={() => track("whatsapp_join", { source: "adventure_complete_sheet" })}
            onDownload={downloadBadge}
          />
        )}

          {cameraBlocked && (
            <Alert label={t(COPY.alerts.cameraBlocked, lang)} />
          )}
          {locationBlocked && (
            <Alert label={t(COPY.alerts.locationBlocked, lang)} />
          )}
        </div>
      )}

      {isGenerating && (
        <div className="card p-4 sm:p-5 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-3 w-24 bg-black/10 rounded" />
            <div className="h-8 w-28 bg-black/10 rounded-3xl" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-black/10 rounded" />
            <div className="h-5 w-2/3 bg-black/10 rounded" />
            <div className="h-5 w-1/2 bg-black/10 rounded" />
          </div>
          <div className="mt-4 h-10 w-40 bg-black/10 rounded-3xl" />
        </div>
      )}

      {previewOpen && (
        <PreviewDialog
          lang={lang}
          quests={previewQuests}
          showEnglish={s.showEnglish}
          onStart={generate}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

function Select(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-clay/70">{props.label}</span>
      <div className="relative">
        <select
          className="form-select w-full text-fluid-sm"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        >
          {props.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-clay/50"
          aria-hidden="true"
        />
      </div>
    </label>
  );
}

function TogglePills(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <fieldset className="grid gap-1 text-sm">
      <legend className="text-clay/70">{props.label}</legend>
      <div className="flex flex-wrap gap-2">
        {props.options.map((opt) => {
          const selected = String(props.value) === String(opt);
          return (
            <button
              key={opt}
              type="button"
              className={selected ? "btn btn-amber" : "btn btn-ghost"}
              onClick={() => props.onChange(String(opt))}
              aria-pressed={selected}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Progress({ total, done }: { total: number; done: number }) {
  const pct = Math.round((done / Math.max(1, total)) * 100);
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Progress">
      <div className="relative w-7 h-7">
        <svg viewBox="0 0 36 36" className="w-7 h-7 -rotate-90">
          <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#FEEBC8" strokeWidth="4" />
          <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={`${pct},100`} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[10px]" aria-live="polite" aria-atomic="true" aria-label={`Completed ${done} of ${total}`}>{done}/{total}</div>
      </div>
      <div className="w-28 h-2 bg-amber-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
      </div>
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
  photos,
  gpsLoading,
  uploadingPhotoId,
  getPoints
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
  gpsLoading: boolean;
  uploadingPhotoId: string | null;
  getPoints: (q: Quest) => number;
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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2">{renderTextWithVocab(quest.text.es, quest.vocab)}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-3xl border border-amber-200 bg-amber-50 text-amber-900" aria-label="Points">
            +{getPoints(quest)} XP
          </span>
        </div>
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
          <label className={clsx("btn btn-ghost cursor-pointer", uploadingPhotoId === quest.id && "opacity-70 cursor-progress")}
            aria-busy={uploadingPhotoId === quest.id}>
            {uploadingPhotoId === quest.id ? <Loader2 className="size-5 animate-spin" /> : <ImageIcon className="size-5" />}
            {uploadingPhotoId === quest.id ? "Adjuntando…" : "Adjuntar foto"}
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
          <button className={clsx("btn btn-amber", gpsLoading && "opacity-70 cursor-not-allowed")}
          onClick={() => void onDone(quest.id)} disabled={gpsLoading} aria-busy={gpsLoading}>
          {gpsLoading ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
          {gpsLoading ? "Validando…" : "Listo"}
        </button>
        {!isLast && (
          <button className="btn btn-ghost" onClick={onNext}>
            Siguiente
          </button>
        )}
      </div>

      {photoData && (
        <div className="mt-3">
          <img src={photoData} alt="Adjunto de misión" className="w-full h-48 object-cover rounded-3xl" />
        </div>
      )}
    </div>
  );
}

function CompletionDialog({ lang, onTicket, onWhatsapp, onDownload }: { lang: "es" | "en"; onTicket: () => void; onWhatsapp: () => void; onDownload: () => void }) {
  // focus management & escape to close to background
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = document.getElementById('complete-title');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        location.hash = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="complete-title">
      <div className="absolute inset-0 bg-black/40" onClick={() => (location.hash = '')} aria-hidden />
      <div className="relative card p-6 max-w-md w-full text-center">
        <p id="complete-title" tabIndex={-1} className="font-display text-2xl mb-1">{COPY.alerts.complete[lang]}</p>
        <p className="text-clay/70 mb-4">
          {lang === "es"
            ? "Tu siguiente paso - únete a quienes lo hicieron esta semana"
            : "Your next step - join others who did this this week"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href="#event" className="btn btn-ghost" onClick={onTicket}>
            {lang === "es" ? "Conseguir boleto" : "Get Ticket"}
          </a>
          <a href={WHATSAPP_GRADUATES_LINK} target="_blank" rel="noreferrer" className="btn btn-amber" onClick={onWhatsapp}>
            {lang === "es" ? "Entrar a WhatsApp" : "Join WhatsApp"}
          </a>
          <button className="btn btn-ghost" onClick={onDownload}>
            {t(COPY.adventure.controls.download, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewDialog({ lang, quests, showEnglish, onStart, onClose }: { lang: 'es' | 'en'; quests: Quest[]; showEnglish: boolean; onStart: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative card p-6 max-w-md w-full">
        <h3 id="preview-title" className="font-display text-xl mb-2">{lang === 'es' ? 'Vista previa' : 'Preview'}</h3>
        <ol className="space-y-2 list-decimal list-inside">
          {quests.map((q) => (
            <li key={q.id}>
              {renderTextWithVocab(q.text.es, q.vocab)}
              {showEnglish && <div className="text-sm text-clay/70">{q.text.en}</div>}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex gap-2 justify-end">
          <button className="btn btn-ghost" onClick={onClose}>{lang === 'es' ? 'Cerrar' : 'Close'}</button>
          <button className="btn btn-amber" onClick={onStart}>{lang === 'es' ? 'Empezar ahora' : 'Start now'}</button>
        </div>
      </div>
    </div>
  );
}

function AchievementsBar({ ids, lang }: { ids: string[]; lang: 'es' | 'en' }) {
  if (!ids.length) return null;
  const labels: Record<string, { es: string; en: string }> = {
    first_quest: { es: 'Primera misión', en: 'First quest' },
    adventure_complete: { es: 'Aventura completa', en: 'Adventure complete' },
    photo_hunter: { es: 'Cazador de fotos', en: 'Photo hunter' },
    streak_weekly: { es: 'Racha semanal', en: 'Weekly streak' },
    streak_monthly: { es: 'Racha mensual', en: 'Monthly streak' },
    streak_legendary: { es: 'Racha legendaria (100)', en: 'Legendary streak (100)' }
  };
  return (
    <ul className="flex flex-wrap gap-1" aria-label={lang === 'es' ? 'Logros' : 'Achievements'}>
      {ids.map((id) => (
        <li key={id} className="px-2 py-1 text-xs rounded-3xl border border-amber-200 bg-amber-50 text-amber-900">
          {labels[id]?.[lang] ?? id}
        </li>
      ))}
    </ul>
  );
}

