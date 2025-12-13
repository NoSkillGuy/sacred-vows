# Domain Layer

## Purpose

The domain layer contains the core business entities and rules. This is the innermost layer of Clean Architecture and has no dependencies on external frameworks or libraries. It represents the pure business logic of the application.

## Responsibilities

- Define business entities with their properties
- Implement business rules and validation
- Define domain-specific errors
- Ensure entities are self-contained and independent

## Key Principles

1. **No External Dependencies**: Domain entities don't depend on frameworks, databases, or external libraries
2. **Business Logic Only**: Contains only business rules, not technical concerns
3. **Pure Go Types**: Uses standard Go types and structures
4. **Validation**: Entities validate themselves

## Entities

### User (`user.go`)
Represents a user in the system.

**Properties:**
- `ID`: Unique identifier
- `Email`: User email address
- `Name`: Optional user name
- `Password`: Hashed password
- `CreatedAt`, `UpdatedAt`: Timestamps

**Business Rules:**
- Email is required
- Password is required
- Validation ensures required fields are present

### Invitation (`invitation.go`)
Represents a wedding invitation.

**Properties:**
- `ID`: Unique identifier
- `TemplateID`: Reference to template
- `Data`: JSON configuration data
- `UserID`: Owner of the invitation
- `CreatedAt`, `UpdatedAt`: Timestamps

**Business Rules:**
- TemplateID is required
- UserID is required
- Data is stored as JSON

### Template (`template.go`)
Represents a template definition (stored in database, but also loaded from file system).

**Properties:**
- `ID`, `Name`, `Description`
- `PreviewImage`, `Tags`
- `Version`, `Config`
- `IsActive`
- `CreatedAt`, `UpdatedAt`

### Asset (`asset.go`)
Represents an uploaded file asset.

**Properties:**
- `ID`, `URL`, `Filename`, `OriginalName`
- `Size`, `MimeType`
- `UserID`
- `CreatedAt`

**Business Rules:**
- URL is required
- Filename is required
- UserID is required

### RSVPResponse (`rsvp.go`)
Represents an RSVP response to an invitation.

**Properties:**
- `ID`, `InvitationID`
- `Name`, `Date`
- `Email`, `Phone`, `Message` (optional)
- `SubmittedAt`

**Business Rules:**
- InvitationID is required
- Name is required
- Date is required

### Analytics (`analytics.go`)
Represents an analytics event.

**Properties:**
- `ID`, `InvitationID`
- `Type`: AnalyticsType enum (view, rsvp, share)
- `Referrer`, `UserAgent`, `IPAddress` (optional)
- `Timestamp`

**Business Rules:**
- InvitationID is required
- Type is required

## Domain Errors (`errors.go`)

Defines domain-specific error types:
- `ErrInvalidEmail`
- `ErrInvalidPassword`
- `ErrUserNotFound`
- `ErrUserAlreadyExists`
- `ErrInvalidCredentials`
- And more...

## Usage

Domain entities are created using factory functions:

```go
user, err := domain.NewUser(email, password, name)
if err != nil {
    // Handle validation error
}
```

Entities validate themselves:

```go
if err := user.Validate(); err != nil {
    // Handle validation error
}
```

## Dependencies

**None** - This layer has zero dependencies on external packages. It only uses:
- Standard Go library
- `time` package for timestamps
- `encoding/json` for JSON types

## Related Layers

- **Use Cases**: Use domain entities to implement business logic
- **Repositories**: Store and retrieve domain entities
- **Infrastructure**: Maps domain entities to database models

## Best Practices

1. Keep entities pure - no database tags or framework code
2. Validate in the domain layer, not in use cases
3. Use value objects for complex types (Email, Password)
4. Define clear business rules in entity methods
5. Use domain errors, not generic errors
