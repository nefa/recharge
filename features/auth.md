# Authentication

## Overview
Email/password auth with JWT access token (15min, in-memory) + refresh token (7 days, httpOnly cookie). Supports company registration and employee login.

## User Flows

### Admin Registration
```
User fills form (company name, name, email, password)
  → POST /api/auth/register
    → Create Company (transaction)
    → Hash password (bcrypt, cost 12)
    → Create User (role: admin)
    → Seed 6 default leave types
    → Generate access token + refresh token
    → Store refresh token in DB
    → Set httpOnly cookie
  → Frontend stores access token in memory
  → Redirect to /dashboard
```

### Login
```
User fills form (email, password)
  → POST /api/auth/login
    → Validate email exists
    → Compare bcrypt hash
    → Generate access token + refresh token
    → Store refresh token in DB
    → Set httpOnly cookie
  → Frontend stores access token in memory
  → Redirect to /dashboard
```

### Session Restore (page reload)
```
App mounts
  → AuthProvider calls POST /api/auth/refresh
    → Browser sends httpOnly cookie automatically
    → API validates refresh token in DB
    → Delete old token, generate new pair (rotation)
    → Set new httpOnly cookie
  → Frontend stores new access token in memory
  → User state restored
```

### Auto Token Refresh (401 retry)
```
API call returns 401
  → api-client intercepts
  → POST /api/auth/refresh
  → If success: store new access token, retry original request
  → If fail: clear state, redirect to /login
```

### Logout
```
User clicks Logout
  → POST /api/auth/logout
    → Delete refresh token from DB
    → Clear httpOnly cookie
  → Frontend clears access token + user state
  → Redirect to /login
```

## Roles
| Role | Created via |
|------|------------|
| Admin | Self-registration at /register |
| Manager | Invite with role (Phase 3) |
| Employee | Invite with default role (Phase 3) |

## Backend Files
- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/auth.controller.ts` — POST register, login, refresh, logout
- `apps/api/src/auth/auth.service.ts` — core logic, token generation
- `apps/api/src/auth/strategies/jwt.strategy.ts` — Bearer token extraction
- `apps/api/src/auth/strategies/local.strategy.ts` — email/password validation
- `apps/api/src/auth/guards/jwt-auth.guard.ts` — global, skips @Public()
- `apps/api/src/auth/guards/roles.guard.ts` — checks @Roles() metadata
- `apps/api/src/auth/decorators/public.decorator.ts`
- `apps/api/src/auth/decorators/roles.decorator.ts`
- `apps/api/src/auth/decorators/current-user.decorator.ts`

## Frontend Files
- `apps/web/lib/api-client.ts` — fetch wrapper with 401 → refresh → retry
- `apps/web/lib/auth-context.tsx` — React context: user, login, register, logout
- `apps/web/app/(auth)/layout.tsx` — centered layout, redirects logged-in users
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/middleware.ts` — route protection (passthrough, auth handled client-side)

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Create company + admin |
| POST | /api/auth/login | Public | Email/password login |
| POST | /api/auth/refresh | Public | Rotate refresh token |
| POST | /api/auth/logout | JWT | Delete refresh token |

## Security
- Passwords hashed with bcrypt (cost 12)
- Access token: 15min expiry, never stored in browser storage
- Refresh token: 7-day expiry, httpOnly + sameSite:lax cookie, rotation on use
- Global JwtAuthGuard — all routes protected unless @Public()
- Global RolesGuard — checks @Roles() decorator
- Next.js proxy rewrites /api/* to backend (same-origin cookies)
