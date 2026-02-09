# API v1 - Versioned API Endpoints

This directory contains the versioned API routes for b0ase.com.

## Structure

- `/auth` - Authentication endpoints (login, signup, refresh)
- `/projects` - Project management endpoints
- `/users` - User management endpoints
- `/video` - Video processing endpoints
- `/webhooks` - External webhook handlers (n8n, Stripe, etc.)

## Principles

1. **Consistent Error Handling** - All endpoints use centralized error handler
2. **Input Validation** - All requests validated with Zod schemas
3. **Authentication** - Protected endpoints use middleware wrapper
4. **Documentation** - Each endpoint has clear JSDoc comments
5. **Backward Compatibility** - Old endpoints redirect to v1 equivalents

## Using API v1

All requests should be made to `/api/v1/*` instead of `/api/*`.

Example:
```
POST /api/v1/auth/login
POST /api/v1/projects
GET /api/v1/users/:id
```

Old endpoints will redirect to v1 for backward compatibility.

## Future Versions

When v2 is needed:
1. Create `/api/v2` directory
2. Leave v1 endpoints active for 6+ months
3. Deprecate v1 endpoints gradually
