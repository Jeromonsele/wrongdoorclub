import { useEffect } from "react";
import { FEATURE_FLAGS } from "@/theme";

type EventPayload = Record<string, unknown>;

export function useAnalytics() {
  const track = (evt: string, payload: EventPayload = {}) => {
    if (!FEATURE_FLAGS.analytics) return;
    // Replace with your provider of choice
    // Example: window.plausible?.(evt, { props: payload });
    console.debug("[analytics]", evt, payload);
  };

  useEffect(() => {
    track("page_view", { path: location.pathname });
  }, []);

  return { track };
}

