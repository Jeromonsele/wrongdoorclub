// src/components/VocabHint.tsx
import { useEffect, useRef, useState } from "react";

type Props = {
  word: string;   // Spanish word to show
  hint: string;   // Short English gloss
};

export function VocabHint({ word, hint }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <span ref={ref} className="relative inline-block align-baseline">
      <button
        type="button"
        className="vocab"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(v => !v)}
      >
        {word}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Hint for ${word}`}
          className="vocab-tooltip absolute left-0 mt-2 whitespace-nowrap"
          style={{ transform: "translateZ(0)" }}
        >
          {hint}
        </div>
      )}
    </span>
  );
}

