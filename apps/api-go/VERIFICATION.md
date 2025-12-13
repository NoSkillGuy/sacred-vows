# API-Go Verification Test Suite

This document outlines the verification tests to ensure api-go has complete feature parity with the original api.

## Test Environment Setup

1. Start api-go server: `cd apps/api-go && go run cmd/server/main.go`
2. Ensure PostgreSQL is running and configured
3. Set required environment variables (see `.env.example`)

## Endpoint Verification Tests

### Authentication Endpoints

#### POST /api/auth/register
**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Expected Response (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Verification:**
- ✅ Status code: 201
- ✅ Response contains token
- ✅ Response contains user object with id, email, name
- ✅ User is created in database
- ✅ Password is hashed

#### POST /api/auth/login
**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Valid credentials return token
- ✅ Invalid credentials return 401
- ✅ Missing fields return 400

#### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`

**Expected Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Verification:**
- ✅ Status code: 200 with valid token
- ✅ Status code: 401 without token
- ✅ Returns correct user data

#### GET /api/auth/google
**Expected:** Redirects to Google OAuth URL

**Verification:**
- ✅ Returns 302 redirect
- ✅ Redirect URL contains Google OAuth endpoint

#### GET /api/auth/google/callback?code=<code>
**Expected:** Redirects to frontend with token

**Verification:**
- ✅ With valid code: redirects to frontend with token
- ✅ With invalid code: redirects to frontend with error
- ✅ Creates or updates user in database

#### POST /api/auth/google/verify
**Request:**
```json
{
  "credential": "google_id_token"
}
```

**Expected Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@gmail.com",
    "name": "Google User"
  }
}
```

**Verification:**
- ✅ Status code: 200 with valid credential
- ✅ Status code: 401 with invalid credential
- ✅ Creates or updates user
- ✅ Returns JWT token

### Invitation Endpoints

#### GET /api/invitations
**Headers (optional):** `Authorization: Bearer <token>`

**Expected Response (200):**
```json
{
  "invitations": [
    {
      "id": "invitation_id",
      "templateId": "royal-elegance",
      "data": {},
      "title": "My Wedding",
      "status": "draft",
      "userId": "user_id",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns list of invitations
- ✅ Filters by userId when authenticated
- ✅ Works without authentication (anonymous)

#### GET /api/invitations/:id
**Expected Response (200):**
```json
{
  "invitation": {
    "id": "invitation_id",
    "templateId": "royal-elegance",
    "data": {},
    "title": "My Wedding",
    "status": "draft",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Verification:**
- ✅ Status code: 200 for existing invitation
- ✅ Status code: 404 for non-existent invitation
- ✅ Returns complete invitation data

#### GET /api/invitations/:id/preview
**Expected Response (200):**
```json
{
  "invitation": {
    "id": "invitation_id",
    "templateId": "royal-elegance",
    "data": {}
  }
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns only id, templateId, and data
- ✅ Works without authentication

#### POST /api/invitations
**Request:**
```json
{
  "templateId": "royal-elegance",
  "data": {
    "couple": {
      "bride": {"name": "Jane"},
      "groom": {"name": "John"}
    }
  },
  "title": "Jane & John's Wedding"
}
```

**Expected Response (201):**
```json
{
  "invitation": {
    "id": "invitation_id",
    "templateId": "royal-elegance",
    "data": {},
    "title": "Jane & John's Wedding",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Verification:**
- ✅ Status code: 201
- ✅ Creates invitation in database
- ✅ Title is stored and returned
- ✅ Default templateId is "royal-elegance" if not provided
- ✅ Works with or without authentication

#### PUT /api/invitations/:id
**Request:**
```json
{
  "data": {
    "couple": {
      "bride": {"name": "Jane Updated"}
    }
  },
  "title": "Updated Title",
  "status": "published"
}
```

**Expected Response (200):**
```json
{
  "invitation": {
    "id": "invitation_id",
    "templateId": "royal-elegance",
    "data": {},
    "title": "Updated Title",
    "status": "published",
    "updatedAt": "2024-01-01T00:00:01Z"
  }
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Updates invitation data
- ✅ Updates title if provided
- ✅ Updates status if provided
- ✅ Partial updates work (only provided fields)
- ✅ Status code: 404 for non-existent invitation

#### DELETE /api/invitations/:id
**Expected Response (200):**
```json
{
  "message": "Invitation deleted"
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Deletes invitation from database
- ✅ Status code: 404 for non-existent invitation

### Template Endpoints

#### GET /api/templates
**Query Params (optional):** `?category=classic&featured=true`

**Expected Response (200):**
```json
{
  "templates": [
    {
      "id": "royal-elegance",
      "name": "Royal Elegance",
      "description": "A classic template",
      "category": "classic",
      "isFeatured": true
    }
  ],
  "categories": ["all", "classic", "modern"]
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns all templates
- ✅ Filters by category when provided
- ✅ Filters by featured when featured=true
- ✅ Returns categories list

#### GET /api/templates/manifests
**Expected Response (200):**
```json
{
  "manifests": [
    {
      "id": "royal-elegance",
      "name": "Royal Elegance",
      "themes": []
    }
  ]
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns all template manifests
- ✅ Manifests are normalized

#### GET /api/templates/:id/manifest
**Expected Response (200):**
```json
{
  "manifest": {
    "id": "royal-elegance",
    "name": "Royal Elegance",
    "themes": []
  }
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns single manifest
- ✅ Status code: 404 for non-existent template

#### GET /api/templates/:id
**Expected Response (200):**
```json
{
  "template": {
    "id": "royal-elegance",
    "name": "Royal Elegance",
    "description": "A classic template"
  }
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns template summary
- ✅ Status code: 404 for non-existent template

### Asset Endpoints

#### POST /api/assets/upload
**Content-Type:** `multipart/form-data`
**Body:** `image` file

**Expected Response (200):**
```json
{
  "url": "/uploads/filename.jpg",
  "asset": {
    "id": "asset_id",
    "url": "/uploads/filename.jpg",
    "filename": "filename.jpg",
    "originalName": "original.jpg",
    "size": 12345,
    "mimetype": "image/jpeg",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Verification:**
- ✅ Status code: 200
- ✅ File is saved
- ✅ Asset record is created
- ✅ Validates file type
- ✅ Validates file size
- ✅ Works with or without authentication

#### GET /api/assets
**Headers (optional):** `Authorization: Bearer <token>`

**Expected Response (200):**
```json
{
  "assets": [
    {
      "id": "asset_id",
      "url": "/uploads/filename.jpg",
      "filename": "filename.jpg",
      "originalName": "original.jpg",
      "size": 12345,
      "mimetype": "image/jpeg",
      "userId": "user_id",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns user's assets when authenticated
- ✅ Works without authentication

#### DELETE /api/assets/delete
**Request:**
```json
{
  "url": "/uploads/filename.jpg"
}
```

**Expected Response (200):**
```json
{
  "message": "Asset deleted"
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Deletes asset record
- ✅ Deletes file from storage
- ✅ Status code: 404 for non-existent asset

### RSVP Endpoints

#### POST /api/rsvp/:invitationId
**Request:**
```json
{
  "name": "John Doe",
  "date": "2024-06-15",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Looking forward to it!"
}
```

**Expected Response (201):**
```json
{
  "rsvp": {
    "id": "rsvp_id",
    "invitationId": "invitation_id",
    "name": "John Doe",
    "date": "2024-06-15",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Looking forward to it!",
    "submittedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Verification:**
- ✅ Status code: 201
- ✅ Creates RSVP response
- ✅ Requires name and date
- ✅ Optional email, phone, message

#### GET /api/rsvp/:invitationId
**Expected Response (200):**
```json
{
  "responses": [
    {
      "id": "rsvp_id",
      "invitationId": "invitation_id",
      "name": "John Doe",
      "date": "2024-06-15",
      "email": "john@example.com",
      "submittedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns all RSVP responses for invitation
- ✅ Returns count

### Analytics Endpoints

#### POST /api/analytics/view
**Request:**
```json
{
  "invitationId": "invitation_id",
  "referrer": "https://example.com",
  "userAgent": "Mozilla/5.0..."
}
```

**Expected Response (200):**
```json
{
  "success": true
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Creates analytics record
- ✅ Captures IP address automatically

#### GET /api/analytics/:invitationId
**Expected Response (200):**
```json
{
  "invitationId": "invitation_id",
  "views": 10,
  "rsvps": 5,
  "analytics": [
    {
      "id": "analytics_id",
      "type": "view",
      "referrer": "https://example.com",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns view count
- ✅ Returns RSVP count
- ✅ Returns analytics records

### Health Check

#### GET /health
**Expected Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Verification:**
- ✅ Status code: 200
- ✅ Returns status and timestamp

## Error Handling Verification

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Error message"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Test Execution

1. Run manual tests using curl or Postman
2. Run automated tests (if created)
3. Compare responses with original API
4. Verify database state after operations
5. Test edge cases and error scenarios

## Notes

- All endpoints should match the original API's request/response format
- Authentication is optional for most endpoints (except /api/auth/me)
- Title and status are stored in the `_meta` field within the JSON data
- File uploads are validated for type and size
- All timestamps are in RFC3339 format
