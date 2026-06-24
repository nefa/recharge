# Super Vacanta — Project Structure

Companion doc to [product-owner.md](./product-owner.md). Describes the technical setup across two repos.

## 1. Tech Stack

| Concern | Choice |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Styling | MUI v9 + Emotion |
| Backend | NestJS 11 (TypeScript) |
| Database | PostgreSQL 16 + TypeORM |
| Design system | Storybook 10 + @recharge/ui |
| Auth | JWT (access + refresh) via NestJS Passport, httpOnly cookies |
| Email | Resend |
| i18n | next-intl (RO/EN) |
| Package manager | Bun workspaces (both repos) |

## 2. Repository Layout

The project is split across two repositories:

### recharge-api ([github.com/nefa/recharge-api](https://github.com/nefa/recharge-api))

```
recharge-api/
├── apps/
│   └── api/                 # NestJS app
│       └── src/
│           ├── auth/        # JWT, Passport, guards, decorators
│           ├── users/
│           ├── departments/
│           ├── leave-types/
│           ├── leave-requests/
│           ├── leave-balances/
│           ├── holidays/
│           ├── calendar/    # Wallchart endpoint
│           ├── dashboard/   # Aggregated dashboard data
│           ├── invites/     # Employee invite flow
│           ├── notifications/ # Email via Resend
│           ├── entities/    # TypeORM entities
│           ├── migrations/
│           └── database/    # Seed script
├── packages/
│   └── shared/              # Enums & DTOs shared with recharge-web
├── docker-compose.yml       # PostgreSQL 16 + pgAdmin
├── features/                # Feature documentation
└── package.json             # Bun workspaces root
```

### recharge-web ([github.com/nefa/recharge-web](https://github.com/nefa/recharge-web))

```
recharge-web/
├── apps/
│   ├── web/                 # Next.js 16 app
│   │   ├── app/
│   │   │   ├── (auth)/      # Login, register, invite
│   │   │   └── (app)/       # App shell (dashboard, calendar, etc.)
│   │   ├── i18n/            # next-intl config
│   │   ├── lib/             # API client, auth context, hooks
│   │   ├── messages/        # en.json, ro.json
│   │   └── public/
│   └── storybook/           # Storybook 10 for design system
├── packages/
│   ├── ui/                  # @recharge/ui — MUI theme + components
│   └── shared/              # Enums & DTOs (copy, kept in sync with API)
└── package.json             # Bun workspaces root
```

## 3. Backend Modules (NestJS)

| Module | Responsibility |
|---|---|
| `AuthModule` | Register/login, JWT issue & refresh, guards, role decorators |
| `UsersModule` | Employee profiles, roles |
| `DepartmentsModule` | Departments + manager assignment |
| `LeaveTypesModule` | Per-company configurable leave types (seeded with RO defaults) |
| `LeaveRequestsModule` | Create/approve/decline requests, balance adjustments |
| `LeaveBalancesModule` | Per-user yearly allowance tracking |
| `HolidaysModule` | Romanian public holidays per year |
| `CalendarModule` | Wallchart data endpoint |
| `DashboardModule` | Aggregated personal + team dashboard data |
| `InvitesModule` | Employee invitation flow |
| `NotificationsModule` | Email via Resend |

## 4. Database Schema

```
companies
  id, name, created_at

users
  id, company_id, department_id, email, name, password_hash,
  role (admin | manager | employee), created_at

departments
  id, company_id, name, manager_id

leave_types
  id, company_id, name, color, requires_approval, is_paid, default_days

leave_balances
  id, user_id, leave_type_id, year, allowance_days, used_days

leave_requests
  id, user_id, leave_type_id, start_date, end_date, working_days,
  status (pending | approved | declined | cancelled), note,
  approver_id, decided_at

public_holidays
  id, date, name, year

invites
  id, token, email, company_id, role, expires_at, used_at

refresh_tokens
  id, token, user_id, expires_at
```

## 5. Frontend Routes (Next.js App Router)

```
/login
/register
/invite/[token]
/dashboard          # Role-aware: employee summary vs. manager approvals
/calendar           # Team wallchart (month view)
/requests           # My requests list
/requests/new       # New request form
/requests/[id]      # Request detail + approve/decline/cancel
/team               # Departments & members (admin/manager)
/settings           # Leave types, company info (admin)
```

## 6. Local Development

```bash
# recharge-api
docker compose up -d        # PostgreSQL + pgAdmin
bun install
bun run seed                # Seed demo data
bun run dev                 # NestJS on :3001

# recharge-web
bun install
bun run dev                 # Next.js on :3000
bun run dev:storybook       # Storybook on :6006
```

## 7. Deployment

| Piece | Target |
|---|---|
| Frontend (`recharge-web`) | Vercel |
| Backend (`recharge-api`) + Postgres | Railway / Render / Fly.io |
| Storybook | Chromatic / Vercel |
| Email | Resend |
