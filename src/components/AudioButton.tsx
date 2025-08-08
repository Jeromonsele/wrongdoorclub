// src/components/AudioButton.tsx
import { useEffect, useRef, useState } from "react";
import { Volume2, Loader2 } from "lucide-react";

function waitForVoices(timeoutMs = 800): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const have = speechSynthesis.getVoices();
    if (have.length > 0) return resolve(have);
    const t = setTimeout(() => resolve(speechSynthesis.getVoices()), timeoutMs);
    const on = () => {
      clearTimeout(t);
      speechSynthesis.removeEventListener("voiceschanged", on);
      resolve(speechSynthesis.getVoices());
    };
    speechSynthesis.addEventListener("voiceschanged", on);
  });
}

async function speak(text: string, preferred = ["es-MX", "es-ES", "es"]) {
  try {
    const voices = await waitForVoices();
    const match =
      voices.find(v => preferred.includes(v.lang)) ||
      voices.find(v => v.lang.toLowerCase().startsWith("es")) ||
      null;

    const u = new SpeechSynthesisUtterance(text);
    if (match) u.voice = match;
    u.lang = match?.lang || "es-MX";
    u.rate = 1;
    u.pitch = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch {
    // No-op fallback
  }
}

export function AudioButton({ text }: { text: string }) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    await speak(text);
    setTimeout(() => mounted.current && setBusy(false), 700);
  };

  return (
    <button
      type="button"
      className="btn btn-ghost text-sm"
      aria-label="Escuchar"
      onClick={onClick}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Volume2 className="size-4" />}
      Escuchar
    </button>
  );
}

