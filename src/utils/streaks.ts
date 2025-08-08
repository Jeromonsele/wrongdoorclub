const K = "wdc_streak";
export type Streak = { current: number; best: number; lastISO: string };

export function getStreak(): Streak {
  const raw = localStorage.getItem(K);
  if (!raw) return { current: 0, best: 0, lastISO: "" };
  try { return JSON.parse(raw) as Streak; } catch { return { current: 0, best: 0, lastISO: "" }; }
}

export function bumpStreak(nowISO = new Date().toISOString()) {
  const s = getStreak();
  const last = s.lastISO ? new Date(s.lastISO) : null;
  const now = new Date(nowISO);
  const diffDays = last ? Math.floor((now.getTime() - startOfDay(last).getTime()) / 86400000) : Infinity;

  let current = s.current;
  if (diffDays >= 7) current = 1;       // reset if week gap or first time
  else if (diffDays >= 1) current += 1; // new week, plus one

  const best = Math.max(s.best, current);
  const next = { current, best, lastISO: nowISO };
  localStorage.setItem(K, JSON.stringify(next));
  return next;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}


