// Import metrics tracking functions
import {
  trackPageView as trackPageViewMetric,
  trackButtonClick,
  trackLayoutView as trackLayoutViewMetric,
} from "../lib/metrics";

const STORAGE_KEY = "sv_analytics_events";
const MAX_EVENTS = 100;

export interface AnalyticsEvent {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  path?: string;
  ts: number;
  userAgent?: string;
}

type EventStore = AnalyticsEvent[];

const getStore = (): EventStore => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EventStore) : [];
  } catch (err) {
    console.warn("Analytics read failed", err);
    return [];
  }
};

const setStore = (events: EventStore): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch (err) {
    console.warn("Analytics write failed", err);
  }
};

const persist = (event: AnalyticsEvent): void => {
  const events = getStore();
  events.push(event);
  setStore(events);
  if (typeof window !== "undefined") {
    (window as { __svAnalytics?: EventStore }).__svAnalytics = events;
  }
};

export const trackEvent = (name: string, payload: Record<string, unknown> = {}): AnalyticsEvent => {
  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    payload,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    ts: Date.now(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  };

  persist(event);

  // Only send to API if this is an invitation view event with invitationId
  // The /api/analytics/view endpoint is specifically for tracking published invitation views
  if (name === "page_view" && payload.invitationId && typeof payload.invitationId === "string") {
    // Send to API in the format it expects (fire-and-forget, no error logging)
    if (typeof fetch !== "undefined") {
      const apiPayload = {
        invitationId: payload.invitationId,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        userAgent: event.userAgent,
      };
      // Use fetch with keepalive for reliability, but don't await or log errors
      fetch("/api/analytics/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
        keepalive: true, // Ensures request completes even if page unloads
      }).catch(() => {
        // Silently fail - analytics is non-critical and errors shouldn't pollute console
      });
    }
  }

  return event;
};

export const trackPageView = (meta: Record<string, unknown> = {}): AnalyticsEvent => {
  const event = trackEvent("page_view", meta);
  // Also track as metric
  const page =
    (meta.page as string) || (typeof window !== "undefined" ? window.location.pathname : "unknown");
  trackPageViewMetric(page);
  return event;
};

export const trackCTA = (label: string, meta: Record<string, unknown> = {}): AnalyticsEvent => {
  const event = trackEvent("cta_click", { label, ...meta });
  // Also track as metric
  const page =
    (meta.page as string) || (typeof window !== "undefined" ? window.location.pathname : "unknown");
  trackButtonClick(label, page);
  return event;
};

export const trackLayoutView = (
  layoutId: string,
  meta: Record<string, unknown> = {}
): AnalyticsEvent => {
  const event = trackEvent("layout_view", { layoutId, ...meta });
  // Also track as metric
  trackLayoutViewMetric(layoutId);
  return event;
};

export const trackLayoutDemo = (
  layoutId: string,
  meta: Record<string, unknown> = {}
): AnalyticsEvent => trackEvent("layout_demo", { layoutId, ...meta });

export const trackSectionViewed = (
  sectionId: string,
  meta: Record<string, unknown> = {}
): AnalyticsEvent => trackEvent("section_view", { sectionId, ...meta });

export const trackExperiment = (
  name: string,
  variant: string,
  meta: Record<string, unknown> = {}
): AnalyticsEvent => trackEvent("experiment", { name, variant, ...meta });

export const getRecentEvents = (): EventStore => getStore();
