# Migration Guide: From API to API-Go

This guide helps you migrate from the original Node.js API (`apps/api`) to the Go implementation (`apps/api-go`).

## Overview

The Go API is a complete replacement with full feature parity. All endpoints, request/response formats, and behaviors match the original API.

## Pre-Migration Checklist

- [ ] Review `VERIFICATION.md` to understand all endpoints
- [ ] Ensure PostgreSQL database is accessible
- [ ] Backup existing database
- [ ] Review environment variables (see `.env.example`)
- [ ] Test api-go in a staging environment first

## Step 1: Environment Setup

1. Copy environment variables from original API to api-go:
   ```bash
   cd apps/api-go
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string (same as original)
   - `JWT_SECRET` - Same secret as original API (for token compatibility)
   - `PORT` - Server port (default: 3000)
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI
   - `FRONTEND_URL` - Frontend application URL
   - `UPLOAD_PATH` - Path for file uploads
   - `TEMPLATES_DIR` - Path to templates directory

## Step 2: Database Verification

The database schema is compatible. Verify:

1. **Users Table**: Should have `id`, `email`, `name`, `password`, `createdAt`, `updatedAt`
2. **Invitations Table**: Should have `id`, `templateId`, `data` (JSONB), `userId`, `createdAt`, `updatedAt`
3. **Assets Table**: Should have `id`, `url`, `filename`, `originalName`, `size`, `mimetype`, `userId`, `createdAt`
4. **RSVP Responses Table**: Should have `id`, `invitationId`, `name`, `date`, `email`, `phone`, `message`, `submittedAt`
5. **Analytics Table**: Should have `id`, `invitationId`, `type`, `referrer`, `userAgent`, `ipAddress`, `timestamp`

The Go API will automatically run migrations on startup using GORM AutoMigrate, which will create any missing tables or columns.

## Step 3: Testing

1. **Start api-go**:
   ```bash
   cd apps/api-go
   go run cmd/server/main.go
   ```

2. **Run Verification Tests**: Follow the test cases in `VERIFICATION.md`

3. **Test with Frontend**: 
   - Point frontend to api-go endpoint
   - Test all major workflows:
     - User registration and login
     - Creating and editing invitations
     - Uploading assets
     - RSVP submission
     - Analytics tracking

## Step 4: Deployment Strategy

### Option A: Parallel Running (Recommended)

1. Deploy api-go alongside the original API
2. Route a small percentage of traffic to api-go (e.g., 10%)
3. Monitor logs and metrics
4. Gradually increase traffic percentage
5. Once stable, route 100% to api-go
6. Keep original API running for 24-48 hours as backup
7. Remove original API once confident

### Option B: Direct Cutover

1. Deploy api-go to production
2. Update load balancer/routing to point to api-go
3. Keep original API available for quick rollback
4. Monitor closely for first 24 hours

## Step 5: Post-Migration

1. **Monitor**:
   - Check application logs
   - Monitor error rates
   - Verify database operations
   - Check file uploads are working

2. **Verify**:
   - All endpoints responding correctly
   - Authentication flows working
   - File uploads working
   - No data loss

3. **Cleanup**:
   - Remove original API once stable
   - Update documentation
   - Update CI/CD pipelines

## Rollback Plan

If issues are discovered:

1. Route traffic back to original API
2. Investigate issues in api-go
3. Fix and redeploy
4. Retry migration

## Known Differences

### Title and Status Fields

- **Original API**: Stored title/status in memory (not persisted in Prisma schema)
- **API-Go**: Stores title/status in `_meta` field within JSON `data` column
- **Impact**: None - fields are returned as top-level fields in responses for compatibility

### Google OAuth Verify

- **Original API**: Implemented but basic
- **API-Go**: Fully implemented with proper ID token verification
- **Impact**: Improved security and reliability

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- Verify database user has proper permissions

### Authentication Issues

- Ensure `JWT_SECRET` matches original API (for token compatibility)
- Verify Google OAuth credentials are correct
- Check token expiration settings

### File Upload Issues

- Verify `UPLOAD_PATH` directory exists and is writable
- Check file size and type limits match expectations

### Template Issues

- Verify `TEMPLATES_DIR` points to correct directory
- Ensure template manifest files are accessible

## Support

If you encounter issues during migration:

1. Check logs: `apps/api-go` logs will show detailed error messages
2. Review `VERIFICATION.md` to ensure endpoints match
3. Compare request/response formats with original API
4. Check database state and migrations

## Success Criteria

Migration is successful when:

- ✅ All endpoints respond correctly
- ✅ Frontend works without changes
- ✅ No data loss
- ✅ Performance is equal or better
- ✅ No increase in error rates
- ✅ All features working as expected
