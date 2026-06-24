# Leave Requests

## Overview
Core business logic: employees submit leave requests, managers/admins approve or decline, balances update automatically. Includes working day calculation that excludes weekends and Romanian public holidays.

## Data Model
```
LeaveRequest
├── id (uuid)
├── userId → User
├── leaveTypeId → LeaveType
├── startDate (date)
├── endDate (date)
├── status (pending | approved | declined | cancelled)
├── note (nullable)
├── approverId → User (nullable)
├── decidedAt (nullable)
└── createdAt
```

## Working Days Calculator
```
calculateWorkingDays(startDate, endDate, holidayDates: Set<string>): number
```
Iterates each day in range, skips Saturday (6), Sunday (0), and any date in the holidays set. Located at `apps/api/src/common/working-days.ts`.

## User Flows

### Create Request (any authenticated user)
```
POST /api/leave-requests
  Body: { leaveTypeId, startDate, endDate, note? }
  → Validate leave type belongs to user's company
  → Validate endDate >= startDate
  → Calculate working days (excluding weekends + holidays)
  → Check balance: remainingDays >= workingDays (else 400)
  → Check no overlapping pending/approved requests (else 400)
  → Create as PENDING
  → If leave type has requiresApproval=false → auto-approve + update usedDays
  → Returns formatted request with workingDays
```

### Approve (admin or department manager)
```
PATCH /api/leave-requests/:id/approve
  → Verify request is PENDING
  → Verify approver is admin or the requester's department manager
  → Add workingDays to balance.usedDays
  → Set status=APPROVED, approverId, decidedAt
```

### Decline (admin or department manager)
```
PATCH /api/leave-requests/:id/decline
  → Verify request is PENDING
  → Verify approver is admin or the requester's department manager
  → Set status=DECLINED, approverId, decidedAt
  → Balance unchanged
```

### Cancel (request owner only)
```
PATCH /api/leave-requests/:id/cancel
  → Only the requester can cancel
  → Allowed for PENDING or APPROVED requests
  → If was APPROVED: subtract workingDays from balance.usedDays
  → Set status=CANCELLED
```

### Query Endpoints
```
GET /api/leave-requests/me          → All requests for current user
GET /api/leave-requests/pending     → Pending requests (admin: all company, manager: own team)
GET /api/leave-requests/company     → All company requests (admin/manager), optional ?status= filter
GET /api/leave-requests/:id         → Single request details
```

## Leave Balances Endpoints
```
GET  /api/leave-balances/me              → Current user's balances for year (?year= default current)
GET  /api/leave-balances/user/:userId    → Admin: specific user's balances
PATCH /api/leave-balances/:id            → Admin: adjust allowance { allowanceDays }
```

## Backend Files
- `apps/api/src/common/working-days.ts` — calculateWorkingDays utility
- `apps/api/src/leave-requests/leave-requests.module.ts`
- `apps/api/src/leave-requests/leave-requests.controller.ts`
- `apps/api/src/leave-requests/leave-requests.service.ts`
- `apps/api/src/leave-requests/dto/create-leave-request.dto.ts`
- `apps/api/src/leave-requests/dto/update-leave-request.dto.ts`
- `apps/api/src/leave-balances/leave-balances.controller.ts`
- `apps/api/src/leave-balances/dto/adjust-balance.dto.ts`

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/leave-requests | JWT | Create leave request |
| GET | /api/leave-requests/me | JWT | My requests |
| GET | /api/leave-requests/pending | JWT + Admin/Manager | Pending requests |
| GET | /api/leave-requests/company | JWT + Admin/Manager | All company requests |
| GET | /api/leave-requests/:id | JWT | Single request |
| PATCH | /api/leave-requests/:id/approve | JWT + Admin/Manager | Approve request |
| PATCH | /api/leave-requests/:id/decline | JWT + Admin/Manager | Decline request |
| PATCH | /api/leave-requests/:id/cancel | JWT | Cancel own request |
| GET | /api/leave-balances/me | JWT | My balances |
| GET | /api/leave-balances/user/:userId | JWT + Admin | User's balances |
| PATCH | /api/leave-balances/:id | JWT + Admin | Adjust allowance |
