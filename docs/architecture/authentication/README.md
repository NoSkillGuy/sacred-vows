# Authentication Documentation

This directory contains comprehensive documentation for the authentication system, including system design and detailed API documentation.

## Documentation Structure

### System Design

- **[System Design](./system-design.md)** - Complete authentication system architecture, token system, security features, and configuration

### API Documentation

Each API endpoint has its own documentation file with architectural diagrams, request/response formats, and implementation details.

#### User Registration & Login

- **[Register API](./register.md)** - `POST /api/auth/register` - User registration with email and password
- **[Login API](./login.md)** - `POST /api/auth/login` - User authentication with email and password

#### Token Management

- **[Refresh Token API](./refresh-token.md)** - `POST /api/auth/refresh` - Refresh access token with token rotation
- **[Logout API](./logout.md)** - `POST /api/auth/logout` - Terminate user session
- **[Get Current User API](./get-current-user.md)** - `GET /api/auth/me` - Retrieve current authenticated user

#### Google OAuth

- **[Google OAuth Initiate API](./google-oauth-initiate.md)** - `GET /api/auth/google` - Initiate server-side OAuth flow
- **[Google OAuth Callback API](./google-oauth-callback.md)** - `GET /api/auth/google/callback` - Handle OAuth callback
- **[Google Verify API](./google-verify.md)** - `POST /api/auth/google/verify` - Verify Google ID token (client-side flow)

#### Password Reset (Unauthenticated)

- **[Forgot Password API](./forgot-password.md)** - `POST /api/auth/forgot-password` - Request password reset link
- **[Reset Password API](./reset-password.md)** - `POST /api/auth/reset-password` - Reset password with token

#### Password Change (Authenticated)

- **[Request Password Change OTP API](./request-password-change-otp.md)** - `POST /api/auth/password/request-otp` - Request OTP for password change
- **[Verify Password Change OTP API](./verify-password-change-otp.md)** - `POST /api/auth/password/verify-otp` - Verify OTP and update password

## Quick Reference

### API Endpoints Summary

| Method | Endpoint | Auth Required | Documentation |
|--------|----------|---------------|---------------|
| POST | `/api/auth/register` | No | [Register API](./register.md) |
| POST | `/api/auth/login` | No | [Login API](./login.md) |
| POST | `/api/auth/refresh` | No* | [Refresh Token API](./refresh-token.md) |
| POST | `/api/auth/logout` | Yes | [Logout API](./logout.md) |
| GET | `/api/auth/me` | Yes | [Get Current User API](./get-current-user.md) |
| GET | `/api/auth/google` | No | [Google OAuth Initiate API](./google-oauth-initiate.md) |
| GET | `/api/auth/google/callback` | No | [Google OAuth Callback API](./google-oauth-callback.md) |
| POST | `/api/auth/google/verify` | No | [Google Verify API](./google-verify.md) |
| POST | `/api/auth/forgot-password` | No | [Forgot Password API](./forgot-password.md) |
| POST | `/api/auth/reset-password` | No | [Reset Password API](./reset-password.md) |
| POST | `/api/auth/password/request-otp` | Yes | [Request Password Change OTP API](./request-password-change-otp.md) |
| POST | `/api/auth/password/verify-otp` | Yes | [Verify Password Change OTP API](./verify-password-change-otp.md) |

*Refresh endpoint requires refresh token in HttpOnly cookie

## Authentication Flows

### Registration & Login Flow

1. User registers or logs in → [Register API](./register.md) or [Login API](./login.md)
2. System generates access token (15min) and refresh token (30 days)
3. Access token stored in frontend memory
4. Refresh token stored in HttpOnly cookie
5. User can make authenticated requests

### Token Refresh Flow

1. Access token expires (15 minutes)
2. Frontend automatically calls [Refresh Token API](./refresh-token.md)
3. System generates new access token and new refresh token (rotation)
4. Old refresh token revoked
5. New tokens provided to frontend

### Google OAuth Flow (Server-Side)

1. User clicks "Sign in with Google" → [Google OAuth Initiate API](./google-oauth-initiate.md)
2. Redirected to Google consent screen
3. User authorizes → [Google OAuth Callback API](./google-oauth-callback.md)
4. System exchanges code for user info
5. User created/updated
6. Tokens generated and user redirected to frontend

### Google OAuth Flow (Client-Side)

1. User clicks "Sign in with Google" button
2. Google Sign-In library provides ID token
3. Frontend sends ID token → [Google Verify API](./google-verify.md)
4. System verifies token and creates/updates user
5. Tokens generated and returned to frontend

### Password Reset Flow (Unauthenticated)

1. User requests password reset → [Forgot Password API](./forgot-password.md)
2. System generates reset token and sends email
3. User clicks reset link → [Reset Password API](./reset-password.md)
4. System validates token and updates password
5. User can login with new password

### Password Change Flow (Authenticated)

1. Authenticated user requests OTP → [Request Password Change OTP API](./request-password-change-otp.md)
2. System generates 6-digit OTP and sends email
3. User enters OTP and new password → [Verify Password Change OTP API](./verify-password-change-otp.md)
4. System verifies OTP and updates password
5. User continues with new password

## Key Concepts

### Token System

- **Access Tokens**: Short-lived JWT tokens (15 minutes) stored in memory
- **Refresh Tokens**: Long-lived random strings (30 days) stored in HttpOnly cookies
- **Token Rotation**: New refresh token generated on each refresh, old one revoked

### Security Features

- HttpOnly cookies for refresh tokens (XSS protection)
- Token rotation (prevents reuse attacks)
- Password hashing with bcrypt
- OTP hashing with SHA-256
- Email enumeration prevention
- Rate limiting on sensitive endpoints

### Authentication Methods

- **Email/Password**: Traditional authentication with bcrypt password hashing
- **Google OAuth**: OAuth 2.0 authentication with Google (server-side and client-side flows)

## Related Documentation

- [Architecture Overview](../README.md) - General architecture documentation
- [System Overview](../system-overview.md) - High-level system architecture
- [Publishing Process](../publishing-process.md) - Publishing system architecture

