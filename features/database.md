# Database & Entities

## Overview
PostgreSQL 16 via Docker, TypeORM as ORM. 9 entity classes with snake_case table/column names, camelCase in TypeScript. Enums extracted to a shared file to avoid circular imports.

## Entity Relationship Diagram
```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  companies  │────<│    users     │>────│ departments  │
│             │     │              │     │              │
│ id          │     │ id           │     │ id           │
│ name        │     │ email        │     │ name         │
│ created_at  │     │ name         │     │ company_id   │
│ updated_at  │     │ password_hash│     │ manager_id   │
│             │     │ role         │     │ created_at   │
│             │     │ company_id   │     └──────────────┘
│             │     │ department_id│
│             │     │ created_at   │
│             │     │ updated_at   │
│             │     └──────────────┘
│             │            │
│             │            │ (user has many)
│             │            ▼
│             │     ┌──────────────┐     ┌──────────────┐
│             │     │leave_requests│────>│  leave_types  │
│             │     │              │     │              │
│             │     │ id           │     │ id           │
│             │     │ user_id      │     │ company_id   │
│             │     │ leave_type_id│     │ name         │
│             │     │ start_date   │     │ color        │
│             │     │ end_date     │     │ requires_    │
│             │     │ status       │     │  approval    │
│             │     │ note         │     │ is_paid      │
│             │     │ approver_id  │     │ default_days │
│             │     │ decided_at   │     │ created_at   │
│             │     │ created_at   │     └──────────────┘
│             │     └──────────────┘            │
│             │                                 │
│             │     ┌──────────────┐            │
│             │     │leave_balances│────────────┘
│             │     │              │
│             │     │ id           │
│             │     │ user_id      │
│             │     │ leave_type_id│
│             │     │ year         │
│             │     │ allowance_   │
│             │     │  days        │
│             │     │ used_days    │
│             │     └──────────────┘
│             │
│             │     ┌──────────────┐
│             ├────<│   invites    │
│             │     │ id           │
│             │     │ token        │
│             │     │ email        │
│             │     │ company_id   │
│             │     │ role         │
│             │     │ expires_at   │
│             │     │ used_at      │
│             │     │ created_at   │
│             │     └──────────────┘
│             │
└─────────────┘

┌──────────────┐     ┌──────────────┐
│refresh_tokens│────>│    users     │
│              │     │              │
│ id           │     │              │
│ token        │     │              │
│ user_id      │     │              │
│ expires_at   │     │              │
│ created_at   │     │              │
└──────────────┘     └──────────────┘

┌──────────────┐
│public_holidays│  (standalone, no FK)
│              │
│ id           │
│ country      │
│ date         │
│ name         │
│ year         │
└──────────────┘
```

## Enums
```typescript
// apps/api/src/entities/enums.ts
enum Role { ADMIN, MANAGER, EMPLOYEE }
enum LeaveStatus { PENDING, APPROVED, DECLINED, CANCELLED }
```

## Key Constraints
- `users.email` — unique
- `leave_balances` — unique on (user_id, leave_type_id, year)
- `public_holidays` — unique on (country, date)
- `invites.token` — unique
- `refresh_tokens.token` — unique

## Entity Files
- `apps/api/src/entities/enums.ts`
- `apps/api/src/entities/company.entity.ts`
- `apps/api/src/entities/user.entity.ts`
- `apps/api/src/entities/department.entity.ts`
- `apps/api/src/entities/leave-type.entity.ts`
- `apps/api/src/entities/leave-balance.entity.ts`
- `apps/api/src/entities/leave-request.entity.ts`
- `apps/api/src/entities/public-holiday.entity.ts`
- `apps/api/src/entities/invite.entity.ts`
- `apps/api/src/entities/refresh-token.entity.ts`
- `apps/api/src/entities/index.ts` — barrel export

## Configuration
- Docker: `docker-compose.yml` (postgres:16-alpine + pgAdmin)
- TypeORM config: `apps/api/src/app.module.ts` (TypeOrmModule.forRootAsync)
- CLI config: `apps/api/typeorm.config.ts` (DataSource for migrations)
- Dev: `synchronize: true` (auto-creates tables from entities)
- Prod: `synchronize: false` (use migrations)
