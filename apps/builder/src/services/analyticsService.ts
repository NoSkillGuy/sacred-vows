const STORAGE_KEY = 'sv_analytics_events';
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
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as EventStore : [];
  } catch (err) {
    console.warn('Analytics read failed', err);
    return [];
  }
};

const setStore = (events: EventStore): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch (err) {
    console.warn('Analytics write failed', err);
  }
};

const persist = (event: AnalyticsEvent): void => {
  const events = getStore();
  events.push(event);
  setStore(events);
  if (typeof window !== 'undefined') {
    (window as { __svAnalytics?: EventStore }).__svAnalytics = events;
  }
};

export const trackEvent = (name: string, payload: Record<string, unknown> = {}): AnalyticsEvent => {
  const event: AnalyticsEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    payload,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    ts: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  persist(event);

  // Optional network hook (ignored if fails or route missing)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const body = JSON.stringify(event);
      navigator.sendBeacon('/api/analytics/view', body);
    } catch {
      /* no-op */
    }
  }

  return event;
};

export const trackPageView = (meta: Record<string, unknown> = {}): AnalyticsEvent => trackEvent('page_view', meta);
export const trackCTA = (label: string, meta: Record<string, unknown> = {}): AnalyticsEvent => trackEvent('cta_click', { label, ...meta });
export const trackLayoutView = (layoutId: string, meta: Record<string, unknown> = {}): AnalyticsEvent =>
  trackEvent('layout_view', { layoutId, ...meta });
export const trackLayoutDemo = (layoutId: string, meta: Record<string, unknown> = {}): AnalyticsEvent =>
  trackEvent('layout_demo', { layoutId, ...meta });
export const trackSectionViewed = (sectionId: string, meta: Record<string, unknown> = {}): AnalyticsEvent =>
  trackEvent('section_view', { sectionId, ...meta });
export const trackExperiment = (name: string, variant: string, meta: Record<string, unknown> = {}): AnalyticsEvent =>
  trackEvent('experiment', { name, variant, ...meta });

export const getRecentEvents = (): EventStore => getStore();

