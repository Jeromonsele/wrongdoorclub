// src/components/VocabHint.tsx
import { useState } from "react";

export function VocabHint({ word, hint }: { word: string; hint: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <button className="vocab" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label={`Hint for ${word}`}>
        {word}
      </button>
      {open && (
        <div className="vocab-tooltip absolute left-0 mt-2">
          {hint}
        </div>
      )}
    </span>
  );
}

