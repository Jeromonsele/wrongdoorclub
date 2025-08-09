import { useEffect, useState } from 'react';

const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560
} as const;

type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setDimensions({ width, height });

      // Find the current breakpoint
      let current: Breakpoint = 'xs';
      for (const [bp, size] of Object.entries(breakpoints)) {
        if (width >= size) {
          current = bp as Breakpoint;
        }
      }
      setBreakpoint(current);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    width: dimensions.width,
    height: dimensions.height,
    isMobile: dimensions.width < breakpoints.md,
    isTablet: dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg,
    isDesktop: dimensions.width >= breakpoints.lg,
    isLargeScreen: dimensions.width >= breakpoints['2xl']
  };
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}