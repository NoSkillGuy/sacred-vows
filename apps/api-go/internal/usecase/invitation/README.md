# Invitation Use Cases

## Purpose

Handles all business logic related to wedding invitations including creation, retrieval, updates, and deletion.

## Use Cases

### CreateInvitationUseCase (`create.go`)

Creates a new wedding invitation.

**Input:**
- `LayoutID`: Layout identifier (defaults to "royal-elegance")
- `Data`: JSON configuration data
- `UserID`: Owner user ID

**Output:**
- `Invitation`: Invitation DTO

**Process:**
1. Validate input data
2. Create invitation entity
3. Generate unique ID
4. Save to repository
5. Return invitation DTO

### GetInvitationByIDUseCase (`get_by_id.go`)

Retrieves a single invitation by ID.

**Input:**
- `ID`: Invitation identifier

**Output:**
- `Invitation`: Invitation DTO

**Process:**
1. Find invitation by ID
2. Return invitation DTO or error if not found

### GetAllInvitationsUseCase (`get_all.go`)

Lists all invitations for a user.

**Input:**
- `UserID`: User identifier

**Output:**
- `Invitations`: Array of invitation DTOs

**Process:**
1. Find all invitations by user ID
2. Convert to DTOs
3. Return list

### GetInvitationPreviewUseCase (`get_preview.go`)

Gets preview data for an invitation (layout ID and data only).

**Input:**
- `ID`: Invitation identifier

**Output:**
- `Invitation`: Preview DTO (ID, LayoutID, Data only)

**Process:**
1. Find invitation by ID
2. Extract preview fields
3. Return preview DTO

### UpdateInvitationUseCase (`update.go`)

Updates an existing invitation.

**Input:**
- `ID`: Invitation identifier
- `LayoutID`: Optional new layout ID
- `Data`: Optional new data

**Output:**
- `Invitation`: Updated invitation DTO

**Process:**
1. Find invitation by ID
2. Update fields if provided
3. Save changes
4. Return updated DTO

### DeleteInvitationUseCase (`delete.go`)

Deletes an invitation.

**Input:**
- `ID`: Invitation identifier

**Output:**
- Error if deletion fails

**Process:**
1. Verify invitation exists
2. Delete from repository
3. Return success or error

## DTOs (`dto.go`)

- `InvitationDTO`: Full invitation representation
- `InvitationPreviewDTO`: Preview-only fields

## Dependencies

- `repository.InvitationRepository`: Invitation data operations
- `domain.Invitation`: Invitation entity
- `github.com/segmentio/ksuid`: ID generation

## Related Files

- Handler: `internal/interfaces/http/handlers/invitation_handler.go`
- Domain: `internal/domain/invitation.go`
- Repository: `internal/interfaces/repository/invitation_repository.go`
