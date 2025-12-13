# Validator Package

## Purpose

Provides validation utilities and value objects for common data types like email and password.

## Components

### Email (`email.go`)

Email value object with validation.

**Features:**
- Email format validation using regex
- Type-safe email value
- Prevents invalid emails at domain level

**Usage:**
```go
email, err := validator.NewEmail("user@example.com")
if err != nil {
    // Handle invalid email
}
// Use email.String() to get string value
```

**Validation:**
- Must match email regex pattern
- Cannot be empty

### Password (`password.go`)

Password value object with strength validation.

**Features:**
- Minimum length validation (8 characters)
- Strength requirements:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Usage:**
```go
password, err := validator.NewPassword("SecurePass123")
if err != nil {
    // Handle weak password
}
// Use password.String() to get string value
```

**Validation Rules:**
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Returns error if requirements not met

## Error Types

- `ErrInvalidEmailFormat` - Email doesn't match format
- `ErrPasswordTooShort` - Password less than 8 characters
- `ErrPasswordTooWeak` - Password doesn't meet strength requirements

## Dependencies

- Standard Go libraries: `unicode`, `regexp`

## Related Files

- Domain: Can be used in domain entities
- Use Cases: Used for input validation

## Best Practices

1. Validate early in the flow
2. Use value objects for type safety
3. Return clear error messages
4. Keep validation rules consistent
5. Consider using in domain entities
6. Document validation requirements

## Future Enhancements

Consider adding:
- Phone number validation
- URL validation
- Date validation
- Custom validation rules
- Internationalization support
