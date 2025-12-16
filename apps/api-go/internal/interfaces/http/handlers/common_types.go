package handlers

// ErrorResponse represents a standard error response
// @Description Standard error response format
type ErrorResponse struct {
	Error string `json:"error" example:"Error message"`
}

// MessageResponse represents a standard message response
// @Description Standard message response format
type MessageResponse struct {
	Message string `json:"message" example:"Operation successful"`
}
