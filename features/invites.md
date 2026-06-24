# Invites

## Overview
Admin invites employees by email. The invite generates a unique token with a 72-hour expiry. Employees click the invite link, set their name and password, and are created as users with leave balances.

## Data Model
```
Invite
├── id (uuid)
├── token (unique, 32-byte crypto-random base64url)
├── email
├── companyId → Company
├── role (default: employee)
├── expiresAt (72 hours from creation)
├── usedAt (nullable — set on accept)
└── createdAt
```

## User Flows

### Create Invite (admin)
```
POST /api/invites
  Body: { email, role? }
  → Checks no existing user with this email
  → Checks no active (unused + unexpired) invite for this email+company
  → Generates 32-byte crypto-random base64url token
  → Sets expiresAt to 72 hours from now
  → Returns invite record
```

### List Invites (admin)
```
GET /api/invites
  → Returns all invites for admin's company
  → Sorted by createdAt DESC
```

### Validate Invite (public)
```
GET /api/invites/:token
  → Checks invite exists, not used, not expired
  → Returns: { email, companyName, role }
  → Used by frontend to show the accept form
```

### Accept Invite (public)
```
POST /api/invites/:token/accept
  Body: { name, password }
  → Validates invite (exists, not used, not expired)
  → Checks no existing user with invite email
  → Transaction:
    → Hash password (bcrypt, cost 12)
    → Create User with invite's role and companyId
    → Mark invite as used (usedAt = now)
    → Create leave balances for all company leave types (current year)
  → Returns created user info
```

## Backend Files
- `apps/api/src/invites/invites.module.ts`
- `apps/api/src/invites/invites.controller.ts` — POST, GET list, GET :token, POST :token/accept
- `apps/api/src/invites/invites.service.ts` — create, validate, accept, listByCompany
- `apps/api/src/invites/dto/create-invite.dto.ts`
- `apps/api/src/invites/dto/accept-invite.dto.ts`

## Frontend (in [recharge-web](https://github.com/nefa/recharge-web))
- `apps/web/app/(auth)/invite/[token]/page.tsx` — validate + accept form

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/invites | JWT + Admin | Create invite |
| GET | /api/invites | JWT + Admin | List company invites |
| GET | /api/invites/:token | Public | Validate invite token |
| POST | /api/invites/:token/accept | Public | Accept invite, create user |
