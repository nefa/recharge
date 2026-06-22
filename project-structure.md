# Super Vacanta — Project Structure (MVP)

Companion doc to [product-owner.md](./product-owner.md). Describes the technical setup for the MVP: **Next.js** frontend, **NestJS** backend, **PostgreSQL** database.

## 1. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router, TypeScript) | Pages for auth, dashboard, calendar, requests, team, settings |
| Styling | Tailwind CSS | Fast to iterate, matches other portfolio projects |
| Backend | NestJS (TypeScript) | Modular structure maps cleanly to domain (auth, users, leave, etc.) |
| Database | PostgreSQL | Relational fit for users/companies/requests/balances |
| ORM | Prisma | Type-safe schema + migrations, plays well with NestJS |
| Auth | JWT (access + refresh) via NestJS Passport, httpOnly cookies | Roles: admin / manager / employee |
| Email | Transactional email provider (e.g. Resend) | Request submitted/approved/declined notifications |
| Monorepo tooling | npm workspaces | Simple, no extra build-system overhead for an MVP |

## 2. Repository Layout

```
recharge/
├── apps/
│   ├── web/                # Next.js app
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── (auth)/register/
│   │   │   ├── dashboard/
│   │   │   ├── calendar/
│   │   │   ├── requests/
│   │   │   ├── team/
│   │   │   └── settings/
│   │   ├── components/
│   │   ├── lib/             # API client, auth helpers
│   │   └── middleware.ts    # route protection
│   │
│   └── api/                 # NestJS app
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── companies/
│       │   ├── departments/
│       │   ├── leave-types/
│       │   ├── leave-requests/
│       │   ├── holidays/
│       │   ├── notifications/
│       │   └── prisma/      # PrismaService + schema
│       └── prisma/
│           ├── schema.prisma
│           └── seed.ts       # demo company, users, RO public holidays
│
├── packages/
│   └── shared/               # shared TS types/enums (Role, LeaveStatus, DTOs)
│
├── docker-compose.yml         # local Postgres
├── package.json                # workspaces root
├── product-owner.md
└── project-structure.md
```

## 3. Backend Modules (NestJS)

| Module | Responsibility |
|---|---|
| `AuthModule` | Register/login, JWT issue & refresh, guards, role decorators |
| `UsersModule` | Employee profiles, roles, leave balances |
| `CompaniesModule` | Company record, settings, invite flow |
| `DepartmentsModule` | Departments + manager assignment |
| `LeaveTypesModule` | Per-company configurable leave types (seeded with RO defaults) |
| `LeaveRequestsModule` | Create/approve/decline requests, balance adjustments |
| `HolidaysModule` | Romanian public holidays per year |
| `NotificationsModule` | Email sending for request lifecycle events |

## 4. Database Schema (high level)

```
companies
  id, name, created_at

users
  id, company_id, department_id, email, name, password_hash,
  role (admin | manager | employee), created_at

departments
  id, company_id, name, manager_id

leave_types
  id, company_id, name, color, requires_approval, is_paid

leave_balances
  id, user_id, leave_type_id, year, allowance_days, used_days

leave_requests
  id, user_id, leave_type_id, start_date, end_date,
  status (pending | approved | declined), note, approver_id, decided_at

public_holidays
  id, country (RO), date, name, year
```

## 5. API Surface (initial)

```
POST   /auth/register          # creates company + admin user
POST   /auth/login
POST   /auth/refresh

GET    /users                  # list company employees (admin/manager)
POST   /users/invite           # invite employee by email
GET    /users/me

GET    /departments
POST   /departments

GET    /leave-types
POST   /leave-types

GET    /leave-requests          # filter by user/department/status
POST   /leave-requests          # employee creates request
PATCH  /leave-requests/:id       # manager approves/declines

GET    /holidays?year=2026

GET    /dashboard/me             # balances + my requests
GET    /dashboard/team           # pending approvals + team wallchart data
```

## 6. Frontend Routes (Next.js App Router)

```
/login
/register
/dashboard          # role-aware: employee summary vs. manager approvals
/calendar           # team wallchart (month view)
/requests           # my requests + new request form
/requests/[id]
/team               # departments & members (admin/manager)
/settings           # leave types, public holidays, company info (admin)
```

Auth state via httpOnly JWT cookie set by the API; `middleware.ts` redirects unauthenticated users to `/login` and gates `/settings`/`/team` by role.

## 7. Local Development

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install deps (workspace root)
npm install

# 3. Run migrations + seed (demo company, users, RO holidays)
npm run -w apps/api prisma:migrate
npm run -w apps/api prisma:seed

# 4. Run both apps
npm run -w apps/api dev      # NestJS on :3001
npm run -w apps/web dev      # Next.js on :3000
```

## 8. Deployment

| Piece | Target |
|---|---|
| Frontend (`apps/web`) | Vercel |
| Backend (`apps/api`) + Postgres | Railway / Render / Fly.io |
| Email | Resend (or similar) |

## 9. Build Order (suggested)

1. **Scaffolding** — npm workspaces, `apps/web` (Next.js + Tailwind), `apps/api` (NestJS), `docker-compose.yml` for Postgres, Prisma schema for the 6 core tables.
2. **Auth** — register (creates company + admin), login, JWT guards, roles.
3. **Company setup** — leave types + RO public holidays seed, departments, invite employees.
4. **Leave requests** — create request, balance check, manager approve/decline, email notifications.
5. **Calendar / wallchart** — month view aggregating approved leave + public holidays.
6. **Dashboard** — employee balance summary, manager pending-approvals list.
7. **Polish & deploy** — responsive styling, seed demo data, deploy frontend + backend.

## 10. Open Technical Questions

- Prisma vs. TypeORM — Prisma chosen above for DX, but TypeORM may integrate more idiomatically if leaning on NestJS decorators/DI patterns.
- Email provider — Resend vs. SMTP via a free-tier provider (e.g. Mailtrap for dev, real provider for prod).
- Where do Romanian public holidays come from — hardcoded yearly seed list vs. an external API/library.
