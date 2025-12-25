/**
 * Frontend Metrics Definitions and Tracking Functions
 * Uses OpenTelemetry metrics to track business events
 */

import { metrics, Counter, Histogram } from "@opentelemetry/api";
import { getMeterProvider } from "./observability";

// Get meter for business metrics
function getMeter() {
  const provider = getMeterProvider();
  if (!provider) {
    return null;
  }
  return metrics.getMeter("sacred-vows-web", "1.0.0");
}

// Initialize metrics
let pageViewsCounter: Counter | null = null;
let buttonClicksCounter: Counter | null = null;
let sessionDurationHistogram: Histogram | null = null;
let layoutViewsCounter: Counter | null = null;
let builderActionsCounter: Counter | null = null;

function initMetrics() {
  const meter = getMeter();
  if (!meter) {
    return;
  }

  pageViewsCounter = meter.createCounter("frontend_page_views_total", {
    description: "Total number of page views",
    unit: "1",
  });

  buttonClicksCounter = meter.createCounter("frontend_button_clicks_total", {
    description: "Total number of button clicks",
    unit: "1",
  });

  sessionDurationHistogram = meter.createHistogram("frontend_session_duration_seconds", {
    description: "Session duration in seconds",
    unit: "s",
  });

  layoutViewsCounter = meter.createCounter("frontend_layout_views_total", {
    description: "Total number of layout views in gallery",
    unit: "1",
  });

  builderActionsCounter = meter.createCounter("frontend_builder_actions_total", {
    description: "Total number of builder actions",
    unit: "1",
  });
}

// Initialize metrics when module loads
if (typeof window !== "undefined") {
  // Wait a bit for observability to initialize
  setTimeout(() => {
    initMetrics();
  }, 100);
}

/**
 * Track a page view
 */
export function trackPageView(page: string): void {
  if (pageViewsCounter) {
    pageViewsCounter.add(1, { page });
  }
}

/**
 * Track a button click
 */
export function trackButtonClick(buttonId: string, page: string): void {
  if (buttonClicksCounter) {
    buttonClicksCounter.add(1, { button_id: buttonId, page });
  }
}

/**
 * Record session duration
 */
export function recordSessionDuration(durationSeconds: number): void {
  if (sessionDurationHistogram) {
    sessionDurationHistogram.record(durationSeconds);
  }
}

/**
 * Track a layout view in gallery
 */
export function trackLayoutView(layoutId: string): void {
  if (layoutViewsCounter) {
    layoutViewsCounter.add(1, { layout_id: layoutId });
  }
}

/**
 * Track a builder action
 */
export function trackBuilderAction(actionType: string): void {
  if (builderActionsCounter) {
    builderActionsCounter.add(1, { action_type: actionType });
  }
}
