# PromQL Query Examples for Business Metrics

This document provides PromQL query examples for common business metrics calculations.

## Conversion Rates

### Signup to Invitation Creation Rate

Percentage of users who create an invitation after signing up:

```promql
rate(business_invitations_created_total[5m]) / rate(business_user_signups_total[5m]) * 100
```

### Invitation to Publish Rate

Percentage of created invitations that get published:

```promql
rate(business_invitations_published_total[5m]) / rate(business_invitations_created_total[5m]) * 100
```

### View to RSVP Conversion Rate

Percentage of invitation views that result in RSVP submissions:

```promql
rate(business_rsvp_submissions_total[5m]) / rate(business_invitation_views_total[5m]) * 100
```

## Funnel Analysis

### Complete User Journey Funnel

Track users through the entire journey:

```promql
# Step 1: Signups
sum(rate(business_user_signups_total[5m]))

# Step 2: Invitation Creation
sum(rate(business_invitations_created_total[5m]))

# Step 3: Publishing
sum(rate(business_invitations_published_total[5m]))

# Step 4: Views
sum(rate(business_invitation_views_total[5m]))

# Step 5: RSVPs
sum(rate(business_rsvp_submissions_total[5m]))
```

### Drop-off Rates

Calculate drop-off between funnel steps:

```promql
# Drop-off from signup to invitation creation
1 - (rate(business_invitations_created_total[5m]) / rate(business_user_signups_total[5m]))

# Drop-off from invitation creation to publishing
1 - (rate(business_invitations_published_total[5m]) / rate(business_invitations_created_total[5m]))
```

## Active Users

### Current Active User Counts

```promql
# Daily Active Users
business_users_active_daily

# Weekly Active Users
business_users_active_weekly

# Monthly Active Users
business_users_active_monthly
```

### Active User Growth Rate

```promql
# Daily active user growth (day-over-day)
(business_users_active_daily - business_users_active_daily offset 1d) / business_users_active_daily offset 1d * 100
```

## Engagement Metrics

### Average Session Duration

```promql
rate(business_builder_session_duration_seconds_sum[5m]) / rate(business_builder_sessions_total[5m])
```

### Builder Sessions per User

```promql
rate(business_builder_sessions_total[5m]) / rate(business_user_logins_total[5m])
```

### Asset Uploads by Type

```promql
sum by (file_type) (rate(business_asset_uploads_total[5m]))
```

## Publish Metrics

### Publish Success Rate

```promql
rate(business_publish_success_total[5m]) / rate(business_publish_attempts_total[5m]) * 100
```

### Publish Failure Rate

```promql
rate(business_publish_failures_total[5m]) / rate(business_publish_attempts_total[5m]) * 100
```

### Average Time to Publish

```promql
rate(business_invitation_creation_duration_seconds_sum[5m]) / rate(business_invitations_created_total[5m])
```

## Feature Usage

### Most Popular Layouts

```promql
topk(10, sum by (layout_id) (business_layout_selections_total))
```

### Theme Change Frequency

```promql
rate(business_theme_changes_total[5m])
```

### Language Switch Frequency

```promql
rate(business_language_switches_total[5m])
```

## Signup Method Breakdown

### Signups by Method

```promql
sum by (method) (rate(business_user_signups_total[5m]))
```

### Login Method Distribution

```promql
sum by (method) (rate(business_user_logins_total[5m]))
```

## Time-based Queries

### Signups in Last 24 Hours

```promql
increase(business_user_signups_total[24h])
```

### Invitations Created Today

```promql
increase(business_invitations_created_total[1d])
```

### RSVPs This Week

```promql
increase(business_rsvp_submissions_total[7d])
```

## Rate Calculations

All rate calculations use a 5-minute window by default. Adjust the window based on your needs:

- `[1m]` - 1 minute window (more granular, more noise)
- `[5m]` - 5 minute window (balanced, recommended)
- `[15m]` - 15 minute window (smoother, less responsive)
- `[1h]` - 1 hour window (very smooth, less responsive)

## Using in Grafana

These queries can be used directly in Grafana panels:

1. Create a new panel
2. Select Prometheus as the data source
3. Enter the PromQL query in the query editor
4. Configure visualization type (graph, stat, table, etc.)
5. Add to dashboard

For more examples, see the Business Metrics dashboard in Grafana.
