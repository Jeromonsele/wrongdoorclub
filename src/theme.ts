// src/theme.ts
export const THEME = {
  colors: {
    bg: "bg-cream",
    text: "text-clay",
    accent: "amber-500",
    accentHover: "amber-600",
    softCard: "bg-white"
  },
  layout: {
    maxW: "max-w-5xl", // tighter column for premium feel
    radius: "rounded-3xl",
    shadow: "shadow-soft",
    padX: "px-4 sm:px-6 lg:px-8"
  },
  hero: {
    // big, type-led hero panel
    panel: "rounded-3xl shadow-soft bg-gradient-to-br from-sun-1 via-sun-2 to-sun-3 h-64 md:h-80"
  }
};

export const FEATURE_FLAGS = {
  membershipTeaser: true,
  analytics: false
};

