# RSVP Use Cases

## Purpose

Handles RSVP (Response) operations for wedding invitations, allowing guests to respond to invitations.

## Use Cases

### SubmitRSVPUseCase (`submit.go`)

Submits an RSVP response for an invitation.

**Input:**
- `InvitationID`: Invitation identifier
- `Name`: Guest name (required)
- `Date`: Arrival date (required)
- `Email`: Optional email
- `Phone`: Optional phone number
- `Message`: Optional message

**Output:**
- `RSVP`: RSVP response DTO

**Process:**
1. Validate required fields (name, date)
2. Create RSVP response entity
3. Generate unique ID
4. Save to repository
5. Return RSVP DTO

**Validation:**
- Name is required
- Date is required
- InvitationID must be valid

### GetRSVPByInvitationUseCase (`get_by_invitation.go`)

Retrieves all RSVP responses for an invitation.

**Input:**
- `InvitationID`: Invitation identifier

**Output:**
- `Responses`: Array of RSVP DTOs
- `Count`: Number of responses

**Process:**
1. Find all RSVP responses by invitation ID
2. Convert to DTOs
3. Return list with count

## DTOs (`dto.go`)

- `RSVPDTO`: RSVP response representation with all fields

## Dependencies

- `repository.RSVPRepository`: RSVP data operations
- `domain.RSVPResponse`: RSVP entity
- `github.com/segmentio/ksuid`: ID generation

## Data Model

RSVP responses include:
- **Required**: Name, Date, InvitationID
- **Optional**: Email, Phone, Message
- **Automatic**: ID, SubmittedAt timestamp

## Related Files

- Handler: `internal/interfaces/http/handlers/rsvp_handler.go`
- Domain: `internal/domain/rsvp.go`
- Repository: `internal/interfaces/repository/rsvp_repository.go`

## Usage

RSVP responses are public (no authentication required) to allow guests to respond to invitations they receive via links.
