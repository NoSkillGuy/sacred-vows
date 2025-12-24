# Use Case Layer

## Purpose

The use case layer contains application-specific business logic. It orchestrates domain entities and repository operations to fulfill application requirements. This layer depends only on domain entities and repository interfaces, not on implementations.

## Responsibilities

- Implement application business logic
- Coordinate between domain entities and repositories
- Handle business workflows
- Transform between domain entities and DTOs
- Validate business rules at the application level

## Key Principles

1. **Depends on Interfaces**: Uses repository interfaces, not implementations
2. **Single Responsibility**: Each use case handles one specific operation
3. **Business Logic**: Contains application-specific rules
4. **Error Handling**: Returns domain or application errors

## Structure

Each feature area has its own subdirectory with related use cases:

- `auth/` - Authentication use cases
- `invitation/` - Invitation management
- `layout/` - Layout operations
- `asset/` - Asset management
- `rsvp/` - RSVP handling
- `analytics/` - Analytics tracking

## Use Case Pattern

Each use case follows this pattern:

```go
type UseCaseNameUseCase struct {
    // Dependencies (repositories, services)
}

func NewUseCaseNameUseCase(deps...) *UseCaseNameUseCase {
    // Constructor
}

type UseCaseNameInput struct {
    // Input parameters
}

type UseCaseNameOutput struct {
    // Output data
}

func (uc *UseCaseNameUseCase) Execute(ctx context.Context, input UseCaseNameInput) (*UseCaseNameOutput, error) {
    // Implementation
}
```

## Use Cases by Feature

### Authentication (`auth/`)
- `RegisterUseCase` - User registration
- `LoginUseCase` - User authentication
- `GetCurrentUserUseCase` - Get authenticated user
- `GoogleOAuthUseCase` - Google OAuth flow

### Invitations (`invitation/`)
- `CreateInvitationUseCase` - Create new invitation
- `GetInvitationByIDUseCase` - Get single invitation
- `GetAllInvitationsUseCase` - List user invitations
- `GetInvitationPreviewUseCase` - Get preview data
- `UpdateInvitationUseCase` - Update invitation
- `DeleteInvitationUseCase` - Delete invitation

### Layouts (`layout/`)
- `GetAllLayoutsUseCase` - List layouts with filtering
- `GetLayoutByIDUseCase` - Get layout details
- `GetLayoutManifestUseCase` - Get layout manifest
- `GetManifestsUseCase` - Get all manifests

### Assets (`asset/`)
- `UploadAssetUseCase` - Handle file upload
- `GetAllAssetsUseCase` - List user assets
- `DeleteAssetUseCase` - Delete asset

### RSVP (`rsvp/`)
- `SubmitRSVPUseCase` - Submit RSVP response
- `GetRSVPByInvitationUseCase` - Get RSVP responses

### Analytics (`analytics/`)
- `TrackViewUseCase` - Track invitation view
- `GetAnalyticsByInvitationUseCase` - Get analytics data

## DTOs (Data Transfer Objects)

Each use case package includes a `dto.go` file that defines:
- Request/Response DTOs
- Conversion functions between domain entities and DTOs
- Public-facing data structures

## Dependencies

- **Domain Layer**: Uses domain entities and errors
- **Repository Interfaces**: Depends on interfaces, not implementations
- **Context**: Uses `context.Context` for cancellation and timeouts

## Related Layers

- **Domain**: Uses domain entities and business rules
- **Interfaces/Repository**: Depends on repository interfaces
- **Interfaces/HTTP**: Handlers call use cases
- **Infrastructure**: Repository implementations are injected

## Best Practices

1. One use case per operation
2. Use context for cancellation
3. Return domain errors, not infrastructure errors
4. Keep use cases focused and testable
5. Use DTOs for external communication
6. Validate inputs before processing
7. Handle business logic, not technical concerns

## Testing

Use cases should be easily testable by mocking repository interfaces. We use hand-written mocks with function fields for clarity and maintainability.

### Mock Pattern

Each use case package includes a `mocks_test.go` file with hand-written mocks:

```go
// mocks_test.go
type MockUserRepository struct {
	CreateFn     func(ctx context.Context, user *domain.User) error
	FindByIDFn   func(ctx context.Context, id string) (*domain.User, error)
	FindByEmailFn func(ctx context.Context, email string) (*domain.User, error)
	// ... other methods
}

func (m *MockUserRepository) Create(ctx context.Context, user *domain.User) error {
	if m.CreateFn != nil {
		return m.CreateFn(ctx, user)
	}
	return nil
}
```

### Test Example

```go
func TestRegisterUseCase_Execute(t *testing.T) {
	mockRepo := &MockUserRepository{
		FindByEmailFn: func(ctx context.Context, email string) (*domain.User, error) {
			return nil, nil  // User doesn't exist
		},
		CreateFn: func(ctx context.Context, user *domain.User) error {
			return nil
		},
	}
	
	useCase := NewRegisterUseCase(mockRepo)
	// ... test logic
}
```

### Table-Driven Tests

For similar test cases, use table-driven tests with configurable mocks:

```go
tests := []struct {
	name      string
	mockSetup func() *MockUserRepository
	input     RegisterInput
	wantErr   bool
	validate  func(*testing.T, *RegisterOutput)
}{
	// ... test cases
}
```

### Clock Injection

For time-dependent logic, inject a `Clock` interface instead of using `time.Now()` directly:

```go
type UseCase struct {
	clock clock.Clock
}

// In production
useCase := NewUseCase(clock.NewRealClock())

// In tests
mockClock := &MockClock{
	NowFn: func() time.Time {
		return fixedTime
	},
}
```

See `docs/testing-best-practices.md` for comprehensive testing guidelines.
