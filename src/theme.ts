// src/theme.ts
export const THEME = {
  layout: {
    maxW: "max-w-6xl",
    padX: "px-4 sm:px-6 lg:px-8",
    radius: "rounded-3xl",
    shadow: "shadow-soft"
  },
  color: {
    text: "text-[#2E2A25]",
    bg: "bg-cream",
    brand: "amber-500",
    brandHover: "amber-600"
  },
  glass: {
    card: "bg-white/55 backdrop-blur-md border border-white/40 shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
    cardHover: "hover:bg-white/65 hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)]",
    pill: "bg-white/70 backdrop-blur-sm border border-white/50",
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
  },
  motion: {
    press: "active:scale-[0.98]",
    hoverLift: "transition will-change-transform hover:-translate-y-[1px]"
  },
  // Back-compat keys used across components
  colors: {
    bg: "bg-cream",
    text: "text-clay",
    accent: "amber-500",
    accentHover: "amber-600",
    softCard: "bg-white"
  },
  // Keep hero token for existing hero component
  hero: {
    panel: "rounded-3xl shadow-soft bg-gradient-to-br from-sun-1 via-sun-2 to-sun-3 h-64 md:h-80"
  }
};

export const FEATURE_FLAGS = {
  membershipTeaser: true,
  analytics: false
};

