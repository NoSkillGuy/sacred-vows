# Shared Packages (pkg)

## Purpose

Contains reusable packages that can be used across different layers of the application. These are shared utilities that don't belong to any specific domain or use case.

## Packages

### Errors (`errors/`)

Custom error types and error handling utilities:
- `AppError` - Application error type
- Predefined error constants
- Error response formatting

### Logger (`logger/`)

Structured logging utilities:
- Zap logger initialization
- Gin middleware for request logging
- Development and production configurations

### Validator (`validator/`)

Validation utilities and value objects:
- Email validation
- Password validation
- Value object types

## Usage

These packages are imported by:
- Use cases (errors, validator)
- Handlers (errors, logger)
- Infrastructure (logger, errors)
- Domain (validator)

## Dependencies

- **go.uber.org/zap**: Structured logging
- Standard Go libraries

## Best Practices

1. Keep packages focused and independent
2. Avoid domain-specific logic
3. Make packages easily testable
4. Document public APIs
5. Keep dependencies minimal
