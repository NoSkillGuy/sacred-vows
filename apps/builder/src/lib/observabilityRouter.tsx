/**
 * Observability Router Wrapper
 * Instruments React Router route changes with OpenTelemetry spans
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trace } from '@opentelemetry/api';

export function ObservabilityRouter({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Create a span for route change
    const tracer = trace.getTracer('sacred-vows-web');
    const span = tracer.startSpan('route_change', {
      attributes: {
        'http.route': location.pathname,
      },
    });

    // End span after a short delay to capture route change
    const timeout = setTimeout(() => {
      span.end();
    }, 100);

    return () => {
      clearTimeout(timeout);
      span.end();
    };
  }, [location.pathname]);

  return <>{children}</>;
}

