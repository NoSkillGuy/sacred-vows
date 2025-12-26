package observability

import (
	"context"
	"sync"
	"time"
)

var (
	activeUsersDaily             = sync.Map{} // map[string]bool - user ID -> true
	activeUsersWeekly            = sync.Map{}
	activeUsersMonthly           = sync.Map{}
	activeInvitations      int64 = 0
	activeInvitationsMutex sync.Mutex
	trackerCancel          context.CancelFunc
	trackerWg              sync.WaitGroup
)

// MarkUserActive marks a user as active (called from tracking functions)
func MarkUserActive() {
	// This will be called with user ID from use cases
	// For now, we'll track by timestamp-based keys to avoid needing user IDs
	// In production, you'd pass user ID and track: activeUsersDaily.Store(userID, true)
}

// MarkUserActiveWithID marks a specific user as active
func MarkUserActiveWithID(userID string) {
	if userID == "" {
		return
	}
	activeUsersDaily.Store(userID, true)
	activeUsersWeekly.Store(userID, true)
	activeUsersMonthly.Store(userID, true)
	updateActiveUserGauges()
}

// updateActiveUserGauges updates the active user gauge metrics
func updateActiveUserGauges() {
	dailyCount := int64(0)
	weeklyCount := int64(0)
	monthlyCount := int64(0)

	activeUsersDaily.Range(func(key, value interface{}) bool {
		dailyCount++
		return true
	})
	activeUsersWeekly.Range(func(key, value interface{}) bool {
		weeklyCount++
		return true
	})
	activeUsersMonthly.Range(func(key, value interface{}) bool {
		monthlyCount++
		return true
	})

	if businessUsersActiveDaily != nil {
		businessUsersActiveDaily.Record(context.Background(), dailyCount)
	}
	if businessUsersActiveWeekly != nil {
		businessUsersActiveWeekly.Record(context.Background(), weeklyCount)
	}
	if businessUsersActiveMonthly != nil {
		businessUsersActiveMonthly.Record(context.Background(), monthlyCount)
	}
}

// IncrementActiveInvitations increments the active invitations gauge
func IncrementActiveInvitations() {
	activeInvitationsMutex.Lock()
	activeInvitations++
	count := activeInvitations
	activeInvitationsMutex.Unlock()

	if businessInvitationsActive != nil {
		businessInvitationsActive.Record(context.Background(), count)
	}
}

// DecrementActiveInvitations decrements the active invitations gauge
func DecrementActiveInvitations() {
	activeInvitationsMutex.Lock()
	if activeInvitations > 0 {
		activeInvitations--
	}
	count := activeInvitations
	activeInvitationsMutex.Unlock()

	if businessInvitationsActive != nil {
		businessInvitationsActive.Record(context.Background(), count)
	}
}

// SetActiveInvitations sets the active invitations gauge to a specific value
func SetActiveInvitations(count int64) {
	activeInvitationsMutex.Lock()
	activeInvitations = count
	activeInvitationsMutex.Unlock()

	if businessInvitationsActive != nil {
		businessInvitationsActive.Record(context.Background(), count)
	}
}

// StartActiveUsersTracker starts the background goroutine that manages active user tracking
// It accepts a context for graceful shutdown. The tracker will stop when the context is cancelled.
func StartActiveUsersTracker(ctx context.Context) {
	// Create a cancellable context for the tracker
	trackerCtx, cancel := context.WithCancel(ctx)
	trackerCancel = cancel

	// Update gauges every hour
	ticker := time.NewTicker(1 * time.Hour)
	trackerWg.Add(1)
	go func() {
		defer trackerWg.Done()
		defer ticker.Stop()
		for {
			select {
			case <-trackerCtx.Done():
				return
			case <-ticker.C:
				updateActiveUserGauges()
			}
		}
	}()

	// Reset daily set at midnight
	trackerWg.Add(1)
	go func() {
		defer trackerWg.Done()
		for {
			select {
			case <-trackerCtx.Done():
				return
			default:
				now := time.Now()
				nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
				duration := nextMidnight.Sub(now)
				timer := time.NewTimer(duration)
				select {
				case <-trackerCtx.Done():
					timer.Stop()
					return
				case <-timer.C:
					// Clear daily set by iterating and deleting (fixes race condition)
					activeUsersDaily.Range(func(key, value interface{}) bool {
						activeUsersDaily.Delete(key)
						return true
					})
					updateActiveUserGauges()
				}
			}
		}
	}()

	// Reset weekly set on Monday at midnight
	trackerWg.Add(1)
	go func() {
		defer trackerWg.Done()
		for {
			select {
			case <-trackerCtx.Done():
				return
			default:
				now := time.Now()
				daysUntilMonday := (8 - int(now.Weekday())) % 7
				if daysUntilMonday == 0 {
					daysUntilMonday = 7 // If it's Monday, reset next Monday
				}
				nextMonday := time.Date(now.Year(), now.Month(), now.Day()+daysUntilMonday, 0, 0, 0, 0, now.Location())
				duration := nextMonday.Sub(now)
				timer := time.NewTimer(duration)
				select {
				case <-trackerCtx.Done():
					timer.Stop()
					return
				case <-timer.C:
					// Clear weekly set by iterating and deleting (fixes race condition)
					activeUsersWeekly.Range(func(key, value interface{}) bool {
						activeUsersWeekly.Delete(key)
						return true
					})
					updateActiveUserGauges()
				}
			}
		}
	}()

	// Reset monthly set on 1st of month at midnight
	trackerWg.Add(1)
	go func() {
		defer trackerWg.Done()
		for {
			select {
			case <-trackerCtx.Done():
				return
			default:
				now := time.Now()
				nextMonth := time.Date(now.Year(), now.Month()+1, 1, 0, 0, 0, 0, now.Location())
				duration := nextMonth.Sub(now)
				timer := time.NewTimer(duration)
				select {
				case <-trackerCtx.Done():
					timer.Stop()
					return
				case <-timer.C:
					// Clear monthly set by iterating and deleting (fixes race condition)
					activeUsersMonthly.Range(func(key, value interface{}) bool {
						activeUsersMonthly.Delete(key)
						return true
					})
					updateActiveUserGauges()
				}
			}
		}
	}()
}

// StopActiveUsersTracker stops the active users tracker gracefully
func StopActiveUsersTracker() {
	if trackerCancel != nil {
		trackerCancel()
		trackerCancel = nil
	}
	trackerWg.Wait()
}
