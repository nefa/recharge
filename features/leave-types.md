# Leave Types

## Overview
Configurable leave categories per company. Each company gets 6 Romanian defaults on registration. Admins can add, edit, or delete leave types. Leave types determine how leave balances and requests are categorized.

## Data Model
```
LeaveType
├── id (uuid)
├── companyId → Company
├── name (e.g. "Concediu de odihna")
├── color (hex, e.g. "#0B7A75")
├── requiresApproval (boolean, default: true)
├── isPaid (boolean, default: true)
├── defaultDays (int, default: 0) — used to seed balances for new employees
└── createdAt
```

## Romanian Defaults (seeded on registration)
| Name | Color | Approval | Paid | Default Days |
|------|-------|----------|------|-------------|
| Concediu de odihna | #0B7A75 (teal) | Yes | Yes | 21 |
| Concediu medical | #F57C00 (orange) | No | Yes | 0 |
| Concediu fara plata | #9E9E9E (grey) | Yes | No | 0 |
| Zi libera personala | #5C6BC0 (purple) | Yes | Yes | 3 |
| Concediu de maternitate | #E91E63 (pink) | Yes | Yes | 126 |
| Concediu de paternitate | #2196F3 (blue) | Yes | Yes | 10 |

## User Flows

### List Leave Types
```
GET /api/leave-types (any authenticated user)
  → Returns all leave types for the user's company
  → Sorted by name ASC
```

### Create Leave Type (admin)
```
POST /api/leave-types
  Body: { name, color?, requiresApproval?, isPaid?, defaultDays? }
  → Creates new leave type for the admin's company
```

### Update Leave Type (admin)
```
PATCH /api/leave-types/:id
  Body: { name?, color?, requiresApproval?, isPaid?, defaultDays? }
  → Updates existing leave type (must belong to admin's company)
```

### Delete Leave Type (admin)
```
DELETE /api/leave-types/:id
  → Removes leave type (must belong to admin's company)
```

## Seed Flow (during registration)
```
auth.service.register()
  → transaction starts
    → create Company
    → create User (admin)
    → leaveTypesService.seedDefaults(companyId, manager)
      → creates 6 LeaveType records
  → transaction commits
```

## Backend Files
- `apps/api/src/leave-types/leave-types.module.ts`
- `apps/api/src/leave-types/leave-types.controller.ts` — GET, POST, PATCH, DELETE
- `apps/api/src/leave-types/leave-types.service.ts` — seedDefaults, findByCompany, CRUD
- `apps/api/src/leave-types/dto/create-leave-type.dto.ts`
- `apps/api/src/leave-types/dto/update-leave-type.dto.ts`

## Frontend (Phase 6)
- Settings page (`/settings`) — admin only
- List with colored dots, name, toggles, default days
- Add/edit/delete actions

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/leave-types | JWT | List company leave types |
| POST | /api/leave-types | JWT + Admin | Create leave type |
| PATCH | /api/leave-types/:id | JWT + Admin | Update leave type |
| DELETE | /api/leave-types/:id | JWT + Admin | Delete leave type |
