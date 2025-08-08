export type KV<T> = { key: string; value: T };

export const save = <T>(key: string, value: T) =>
  localStorage.setItem(key, JSON.stringify(value));

export const load = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const remove = (key: string) => localStorage.removeItem(key);

