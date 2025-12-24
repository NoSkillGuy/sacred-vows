package clock

import "time"

// Clock provides an abstraction over time operations
// This allows for testability by injecting mock clocks in tests
type Clock interface {
	Now() time.Time
}

// RealClock is the production implementation that uses the real time
type RealClock struct{}

// NewRealClock creates a new RealClock instance
func NewRealClock() *RealClock {
	return &RealClock{}
}

// Now returns the current time
func (r *RealClock) Now() time.Time {
	return time.Now()
}
