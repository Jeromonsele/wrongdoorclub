// src/components/AudioButton.tsx
import { Volume2 } from "lucide-react";
import { useState } from "react";

function speak(text: string, lang = "es-MX") {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const mx = voices.find(v => v.lang.toLowerCase().startsWith("es-mx"));
    const es = voices.find(v => v.lang.toLowerCase().startsWith("es"));
    utter.lang = mx?.lang || es?.lang || lang;
    utter.rate = 1;
    speechSynthesis.speak(utter);
  } catch {}
}

export function AudioButton({ text }: { text: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-ghost text-sm"
      onClick={() => {
        if (busy) return;
        setBusy(true);
        speak(text);
        setTimeout(() => setBusy(false), 900);
      }}
      aria-label="Play Spanish audio"
    >
      <Volume2 className="size-4" />
      Escuchar
    </button>
  );
}

