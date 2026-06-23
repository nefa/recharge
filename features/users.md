# Users

## Overview
User profiles and company employee listing. Users belong to a company and optionally a department. Role-based access controls what each user can see and do.

## Data Model
```
User
├── id (uuid)
├── email (unique)
├── name
├── passwordHash
├── role (admin | manager | employee)
├── companyId → Company
├── departmentId → Department (nullable)
├── createdAt
└── updatedAt
```

## User Flows

### Get My Profile
```
GET /api/users/me (any authenticated user)
  → Returns: id, email, name, role, companyId, departmentId, companyName
```

### List Company Employees
```
GET /api/users (admin or manager only)
  → Returns all users in the same company
  → Sorted by name ASC
  → Includes: id, email, name, role, departmentId, departmentName
```

## Role Permissions
| Action | Admin | Manager | Employee |
|--------|-------|---------|----------|
| View own profile | Yes | Yes | Yes |
| List company users | Yes | Yes | No |
| Invite users | Phase 3 | No | No |
| Change roles | Phase 3 | No | No |

## Backend Files
- `apps/api/src/users/users.module.ts`
- `apps/api/src/users/users.controller.ts` — GET /me, GET /
- `apps/api/src/users/users.service.ts` — findByEmail, findById, getMe, listByCompany

## Frontend
- Profile data consumed via `useAuth()` context (no dedicated profile page yet)
- App shell shows user avatar + name in AppBar

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/users/me | JWT | Current user profile |
| GET | /api/users | JWT + Admin/Manager | List company employees |
