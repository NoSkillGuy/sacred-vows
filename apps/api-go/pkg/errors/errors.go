package errors

import (
	"fmt"
	"net/http"
)

// AppError represents an application error
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"error"`
	Err     error  `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

// New creates a new AppError
func New(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

// Wrap wraps an error with an AppError
func Wrap(code int, message string, err error) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// Predefined errors
var (
	ErrNotFound            = New(http.StatusNotFound, "Resource not found")
	ErrBadRequest          = New(http.StatusBadRequest, "Bad request")
	ErrUnauthorized        = New(http.StatusUnauthorized, "Authentication required")
	ErrForbidden           = New(http.StatusForbidden, "Invalid or expired token")
	ErrInternalServerError = New(http.StatusInternalServerError, "Internal server error")
	ErrConflict            = New(http.StatusConflict, "Resource already exists")
)

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// ToResponse converts AppError to ErrorResponse
func (e *AppError) ToResponse() ErrorResponse {
	return ErrorResponse{
		Error: e.Message,
	}
}
