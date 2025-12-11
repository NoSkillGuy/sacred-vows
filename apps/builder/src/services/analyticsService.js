const STORAGE_KEY = 'sv_analytics_events';
const MAX_EVENTS = 100;

const getStore = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Analytics read failed', err);
    return [];
  }
};

const setStore = (events) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch (err) {
    console.warn('Analytics write failed', err);
  }
};

const persist = (event) => {
  const events = getStore();
  events.push(event);
  setStore(events);
  if (typeof window !== 'undefined') {
    window.__svAnalytics = events;
  }
};

export const trackEvent = (name, payload = {}) => {
  const event = {
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

export const trackPageView = (meta = {}) => trackEvent('page_view', meta);
export const trackCTA = (label, meta = {}) => trackEvent('cta_click', { label, ...meta });
export const trackTemplateView = (templateId, meta = {}) =>
  trackEvent('template_view', { templateId, ...meta });
export const trackTemplateDemo = (templateId, meta = {}) =>
  trackEvent('template_demo', { templateId, ...meta });
export const trackSectionViewed = (sectionId, meta = {}) =>
  trackEvent('section_view', { sectionId, ...meta });
export const trackExperiment = (name, variant, meta = {}) =>
  trackEvent('experiment', { name, variant, ...meta });

export const getRecentEvents = () => getStore();


