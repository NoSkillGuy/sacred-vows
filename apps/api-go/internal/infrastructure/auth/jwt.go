package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/segmentio/ksuid"
)

type JWTService struct {
	secret             string
	accessExpiration   time.Duration // Short-lived access token
	refreshExpiration  time.Duration // Long-lived refresh token
	issuer             string        // JWT issuer claim
	audience           string        // JWT audience claim
	clockSkewTolerance time.Duration // Clock skew tolerance
}

func NewJWTService(secret string, accessExpiration, refreshExpiration time.Duration, issuer, audience string, clockSkewTolerance time.Duration) *JWTService {
	return &JWTService{
		secret:             secret,
		accessExpiration:   accessExpiration,
		refreshExpiration:  refreshExpiration,
		issuer:             issuer,
		audience:           audience,
		clockSkewTolerance: clockSkewTolerance,
	}
}

type Claims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// GenerateAccessToken generates a short-lived access token with standard claims
func (s *JWTService) GenerateAccessToken(userID, email string) (string, error) {
	now := time.Now()
	tokenID := ksuid.New().String()

	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        tokenID, // jti claim
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessExpiration)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now.Add(-s.clockSkewTolerance)), // nbf claim with clock skew
			Issuer:    s.issuer,
			Audience:  []string{s.audience},
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secret))
}

// GenerateRefreshToken generates a long-lived refresh token and returns both the token and its ID (jti)
func (s *JWTService) GenerateRefreshToken(userID, email string) (tokenID string, token string, err error) {
	tokenID = ksuid.New().String()

	// Generate a random token string (not a JWT, just a secure random string)
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random token: %w", err)
	}
	token = base64.URLEncoding.EncodeToString(randomBytes)

	// Note: Refresh tokens are stored in database, not validated as JWT
	// The tokenID (jti) is what we use to identify the token in the database
	return tokenID, token, nil
}

// ValidateAccessToken validates an access token with clock skew tolerance
func (s *JWTService) ValidateAccessToken(tokenString string) (*Claims, error) {
	// Parse with leeway for clock skew
	parser := jwt.NewParser(
		jwt.WithValidMethods([]string{"HS256"}),
		jwt.WithLeeway(s.clockSkewTolerance),
	)

	claims := &Claims{}
	token, err := parser.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(s.secret), nil
	})

	if err != nil {
		// Check if error is due to expiration
		if errors.Is(err, jwt.ErrTokenExpired) {
			// Token expired, return expired error with claims if available
			if claims.ExpiresAt != nil {
				expTime := claims.ExpiresAt.Time
				now := time.Now()
				// Check if within clock skew tolerance
				if now.After(expTime) && now.Sub(expTime) <= s.clockSkewTolerance {
					// Within clock skew, return claims but mark as expired
					return claims, &TokenExpiredError{Claims: claims}
				}
			}
			return nil, &TokenExpiredError{}
		}
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Validate issuer and audience
	if s.issuer != "" && claims.Issuer != s.issuer {
		return nil, errors.New("invalid issuer")
	}
	if s.audience != "" && len(claims.Audience) > 0 {
		audienceValid := false
		for _, aud := range claims.Audience {
			if aud == s.audience {
				audienceValid = true
				break
			}
		}
		if !audienceValid {
			return nil, errors.New("invalid audience")
		}
	}

	return claims, nil
}

// TokenExpiredError represents an expired token error
type TokenExpiredError struct {
	Claims *Claims
}

func (e *TokenExpiredError) Error() string {
	return "token expired"
}

// IsTokenExpired checks if an error is a token expired error
func IsTokenExpired(err error) bool {
	_, ok := err.(*TokenExpiredError)
	return ok
}

// GetRefreshExpiration returns the refresh token expiration duration
func (s *JWTService) GetRefreshExpiration() time.Duration {
	return s.refreshExpiration
}
