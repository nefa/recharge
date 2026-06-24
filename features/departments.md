# Departments

## Overview
Group employees by team/department with an assigned manager. The manager relationship determines the approval routing for leave requests. Admins create and manage departments.

## Data Model
```
Department
├── id (uuid)
├── name
├── companyId → Company
├── managerId → User (nullable)
├── createdAt
├── manager (relation)
└── members (relation → User[])
```

## User Flows

### List Departments
```
GET /api/departments (admin or manager)
  → Returns all departments for the user's company
  → Includes: id, name, managerId, managerName, memberCount
  → Sorted by name ASC
```

### Get Department
```
GET /api/departments/:id (admin or manager)
  → Returns single department with manager and member count
```

### Create Department (admin)
```
POST /api/departments
  Body: { name, managerId? }
  → Validates managerId belongs to same company
  → Returns created department
```

### Update Department (admin)
```
PATCH /api/departments/:id
  Body: { name?, managerId? }
  → Validates managerId belongs to same company
  → managerId can be set to null to unassign manager
```

### Delete Department (admin)
```
DELETE /api/departments/:id
  → Fails if department has assigned members (400)
  → Members must be reassigned first
```

### Assign User to Department (admin)
```
PATCH /api/departments/:id/assign
  Body: { userId }
  → Validates both department and user belong to same company
  → Updates user's departmentId
```

### Get Manager for User (internal)
```
departmentsService.getManagerForUser(userId)
  → Returns the manager User entity for the user's department
  → Used by leave request approval routing (Phase 4)
```

## Backend Files
- `apps/api/src/departments/departments.module.ts`
- `apps/api/src/departments/departments.controller.ts` — GET, POST, PATCH, DELETE, PATCH assign
- `apps/api/src/departments/departments.service.ts` — CRUD + assignUser + getManagerForUser
- `apps/api/src/departments/dto/create-department.dto.ts`
- `apps/api/src/departments/dto/update-department.dto.ts`
- `apps/api/src/departments/dto/assign-user.dto.ts`

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/departments | JWT + Admin/Manager | List company departments |
| GET | /api/departments/:id | JWT + Admin/Manager | Get single department |
| POST | /api/departments | JWT + Admin | Create department |
| PATCH | /api/departments/:id | JWT + Admin | Update department |
| DELETE | /api/departments/:id | JWT + Admin | Delete department |
| PATCH | /api/departments/:id/assign | JWT + Admin | Assign user to department |
