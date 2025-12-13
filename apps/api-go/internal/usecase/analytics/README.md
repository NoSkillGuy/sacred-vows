# Analytics Use Cases

## Purpose

Handles analytics tracking and retrieval for invitations, tracking views, RSVPs, shares, and other events.

## Use Cases

### TrackViewUseCase (`track_view.go`)

Tracks a view event for an invitation.

**Input:**
- `InvitationID`: Invitation identifier
- `Referrer`: Optional referrer URL
- `UserAgent`: Optional user agent string
- `IPAddress`: Optional IP address

**Output:**
- Error if tracking fails

**Process:**
1. Validate invitation ID
2. Create analytics entity with type "view"
3. Generate unique ID
4. Save to repository
5. Return success or error

**Note:** This is called automatically when invitations are viewed.

### GetAnalyticsByInvitationUseCase (`get_by_invitation.go`)

Retrieves analytics data for an invitation.

**Input:**
- `InvitationID`: Invitation identifier

**Output:**
- `InvitationID`: Invitation identifier
- `Views`: Count of view events
- `RSVPs`: Count of RSVP events
- `Analytics`: Array of all analytics events

**Process:**
1. Find all analytics events by invitation ID
2. Count views by type
3. Count RSVPs by type
4. Convert events to DTOs
5. Return aggregated data

## Analytics Types

Defined in `domain.AnalyticsType`:
- `AnalyticsTypeView`: Page view
- `AnalyticsTypeRSVP`: RSVP submission
- `AnalyticsTypeShare`: Share event

## DTOs (`dto.go`)

- `AnalyticsDTO`: Analytics event representation

## Dependencies

- `repository.AnalyticsRepository`: Analytics data operations
- `domain.Analytics`: Analytics entity
- `domain.AnalyticsType`: Analytics type enum
- `github.com/segmentio/ksuid`: ID generation

## Data Collected

Analytics events capture:
- **Required**: InvitationID, Type, Timestamp
- **Optional**: Referrer, UserAgent, IPAddress

## Related Files

- Handler: `internal/interfaces/http/handlers/analytics_handler.go`
- Domain: `internal/domain/analytics.go`
- Repository: `internal/interfaces/repository/analytics_repository.go`

## Privacy

IP addresses and user agents are collected for analytics but should be handled according to privacy policies. Consider anonymization for production use.
