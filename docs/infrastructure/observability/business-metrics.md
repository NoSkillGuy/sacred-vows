# Business Metrics

This document describes the business metrics implementation for the Sacred Vows application. Business metrics track user behavior, engagement, and conversion events to help understand product usage and user journeys.

## Architecture

Business metrics are collected using OpenTelemetry and stored in Prometheus:

- **Frontend**: Sends client-side metrics via OTLP HTTP to OpenTelemetry Collector
- **Backend**: Sends server-side metrics via OTLP gRPC to OpenTelemetry Collector
- **OpenTelemetry Collector**: Aggregates metrics from both sources and exports to Prometheus
- **Prometheus**: Stores all metrics for querying and alerting
- **Grafana**: Visualizes metrics via PromQL queries

## Metrics Overview

### User Metrics

- `business_user_signups_total` (counter) - Total user signups, labeled by `method` (email/oauth)
- `business_user_logins_total` (counter) - Total user logins, labeled by `method` (email/oauth)
- `business_users_active_daily` (gauge) - Daily active users
- `business_users_active_weekly` (gauge) - Weekly active users
- `business_users_active_monthly` (gauge) - Monthly active users

### Invitation Metrics

- `business_invitations_created_total` (counter) - Total invitations created
- `business_invitations_published_total` (counter) - Total invitations published
- `business_invitations_active` (gauge) - Currently active published invitations
- `business_invitation_creation_duration_seconds` (histogram) - Time to create invitation

### Engagement Metrics

- `business_builder_sessions_total` (counter) - Total builder sessions
- `business_builder_session_duration_seconds` (histogram) - Builder session duration
- `business_asset_uploads_total` (counter) - Total asset uploads, labeled by `file_type`
- `business_layout_selections_total` (counter) - Total layout selections, labeled by `layout_id`

### Conversion Metrics

- `business_publish_attempts_total` (counter) - Total publish attempts
- `business_publish_success_total` (counter) - Successful publishes
- `business_publish_failures_total` (counter) - Failed publishes

### Guest Engagement Metrics

- `business_invitation_views_total` (counter) - Total invitation views
- `business_rsvp_submissions_total` (counter) - Total RSVP submissions

### Feature Usage Metrics

- `business_theme_changes_total` (counter) - Theme customization events
- `business_section_toggles_total` (counter) - Section enable/disable events
- `business_language_switches_total` (counter) - Language switching events

### Frontend Metrics

- `frontend_page_views_total` (counter) - Page views, labeled by `page`
- `frontend_button_clicks_total` (counter) - Button clicks, labeled by `button_id` and `page`
- `frontend_session_duration_seconds` (histogram) - Session duration
- `frontend_layout_views_total` (counter) - Layout views in gallery, labeled by `layout_id`
- `frontend_builder_actions_total` (counter) - Builder actions, labeled by `action_type`

## Usage

### Backend Tracking

Metrics are tracked automatically in use cases:

```go
import "github.com/sacred-vows/api-go/internal/infrastructure/observability"

// Track user signup
observability.RecordUserSignup("email")
observability.MarkUserActiveWithID(userID)

// Track invitation creation
observability.RecordInvitationCreated()

// Track publish attempt
observability.RecordPublishAttempt(true) // or false for failure
```

### Frontend Tracking

Metrics are tracked via the analytics service:

```typescript
import { trackPageView, trackButtonClick } from './services/analyticsService';

// Track page view (automatically sends metric)
trackPageView({ page: 'dashboard' });

// Track button click (automatically sends metric)
trackCTA('signup-button', { page: 'landing' });
```

## PromQL Queries

### Conversion Rates

**Signup to Invitation:**
```promql
rate(business_invitations_created_total[5m]) / rate(business_user_signups_total[5m])
```

**Invitation to Publish:**
```promql
rate(business_invitations_published_total[5m]) / rate(business_invitations_created_total[5m])
```

**View to RSVP:**
```promql
rate(business_rsvp_submissions_total[5m]) / rate(business_invitation_views_total[5m])
```

### Active Users

**Daily Active Users:**
```promql
business_users_active_daily
```

**Weekly Active Users:**
```promql
business_users_active_weekly
```

**Monthly Active Users:**
```promql
business_users_active_monthly
```

### Publish Success Rate

```promql
rate(business_publish_success_total[5m]) / rate(business_publish_attempts_total[5m]) * 100
```

## Grafana Dashboards

Business metrics are visualized in the "Business Metrics" dashboard in Grafana. The dashboard includes:

- User acquisition metrics (signups, logins)
- Active user counts (daily, weekly, monthly)
- Invitation creation and publishing rates
- Conversion funnels
- Guest engagement (views, RSVPs)
- Feature usage statistics

Access the dashboard at: http://localhost:3001/d/business-metrics

## Label Cardinality

To keep Prometheus storage and query performance reasonable, metrics use low-cardinality labels:

- **Allowed labels**: `method`, `file_type`, `layout_id`, `page`, `button_id`, `action_type`
- **Not allowed**: User IDs, emails, or other high-cardinality identifiers

## Active Users Tracking

Active users are tracked in-memory and reset periodically:

- **Daily**: Reset at midnight
- **Weekly**: Reset on Monday at midnight
- **Monthly**: Reset on the 1st of each month at midnight

The active users tracker runs background goroutines to manage these resets and update Prometheus gauges hourly.

## Troubleshooting

### Metrics Not Appearing

1. Check OpenTelemetry Collector logs: `docker-compose logs otel-collector`
2. Verify metrics endpoint in Prometheus: http://localhost:9090/targets
3. Check if metrics are being exported: http://localhost:8889/metrics (collector endpoint)

### High Cardinality Warnings

If Prometheus shows high cardinality warnings:

1. Review metric labels - ensure no user IDs or emails in labels
2. Check for label explosion in dynamic labels (e.g., `layout_id` with too many unique values)
3. Consider aggregating or removing high-cardinality labels

### Missing Metrics

If specific metrics are missing:

1. Verify tracking calls are in the correct use cases
2. Check that metrics are initialized in `InitBusinessMetrics()`
3. Ensure OpenTelemetry Collector is receiving metrics from both frontend and backend
