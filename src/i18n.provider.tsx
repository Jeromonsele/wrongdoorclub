// src/i18n.provider.tsx
import { useEffect, useState, createContext, useContext } from "react";
import { load, save } from "@/utils/storage";

export type Lang = "es" | "en";

const LANG_KEY = "wdc_lang";
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "es", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => load<Lang>(LANG_KEY, "es"));
  const setLang = (l: Lang) => { setLangState(l); save(LANG_KEY, l); document.documentElement.lang = l; };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() { return useContext(LangCtx); }

export function t<T extends Record<string, string>>(obj: T, lang: Lang): string {
  return obj[lang] ?? obj.es ?? "";
}

