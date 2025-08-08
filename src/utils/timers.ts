export const now = () => Date.now();

export const wallClockCountdown = (endTs: number) => {
  const ms = Math.max(0, endTs - now());
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return { ms, label: `${m}:${s}` };
};

