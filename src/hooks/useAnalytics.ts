import { useEffect } from "react";
import { FEATURE_FLAGS } from "@/theme";

type EventPayload = Record<string, unknown>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
    posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
  }
}

export function useAnalytics() {
  const enabled = FEATURE_FLAGS.analytics;

  const track = (evt: string, payload: EventPayload = {}) => {
    if (!enabled) return;
    try {
      window.plausible?.(evt, { props: payload });
      window.posthog?.capture(evt, payload);
      if (!window.plausible && !window.posthog) console.debug("[analytics]", evt, payload);
    } catch {
      /* no-op */
    }
  };

  useEffect(() => {
    track("page_view", { path: location.pathname + location.hash });
  }, []);

  return { track };
}

