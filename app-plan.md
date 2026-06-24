# Recharge — Implementation Plan (Completed)

> **Note:** This plan was written during initial development. All phases have been implemented.
> The project has since been split into two repos: [recharge-api](https://github.com/nefa/recharge-api) and [recharge-web](https://github.com/nefa/recharge-web), both using Bun.

## Context

**Super Vacanta** is a Timetastic-style leave management platform for Romanian SMEs. A portfolio-grade full-stack app: admin creates a company, invites employees, employees request time off, managers approve/decline, everyone sees a team calendar.

---

## Key Decisions
- **Build order:** Sequential, starting Phase 0 (foundation first)
- **Styling:** MUI v9 + Emotion only (no Tailwind)
- **Language:** Bilingual RO/EN from the start (i18n setup in Phase 0)

---

## Pre-Implementation: Fix Existing Inconsistencies

1. **StatusBadge uses `'rejected'` but shared enum uses `'declined'`** — Update `packages/ui/src/components/StatusBadge/StatusBadge.tsx` to support `'declined'` as well (map to same error color)
2. **`project-structure.md` mentions Tailwind CSS** — The actual project uses MUI v9 + Emotion. No Tailwind needed; use MUI's `sx` prop throughout
3. **Auth docs only list ADMIN/EMPLOYEE** — Implementation uses all three roles from `packages/shared`: Admin, Manager, Employee

---

## Phase 0: Foundation — TypeORM, Environment, Shared Types

**Goal:** Set up the database ORM, env config, and extend shared types with DTOs.

### What to do:

**Environment files:**
- Create `.env.example` at repo root with `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `RESEND_API_KEY`, `WEB_URL`, `API_URL`
- Create `apps/api/.env` (gitignored) with local values
- Create `apps/web/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

**TypeORM setup:**
- Install `@nestjs/typeorm typeorm pg` in `apps/api`
- Configure `TypeOrmModule.forRootAsync()` in `app.module.ts` using `ConfigService` to read `DATABASE_URL`
- Create 9 entity classes under `apps/api/src/entities/`:
  - `company.entity.ts` — id (uuid), name, createdAt, updatedAt. OneToMany: users, departments, leaveTypes, invites
  - `user.entity.ts` — id (uuid), email (unique), name, passwordHash, role (enum: admin/manager/employee), companyId, departmentId. ManyToOne: company, department. OneToMany: leaveBalances, leaveRequests, approvedRequests, refreshTokens
  - `department.entity.ts` — id (uuid), name, companyId, managerId. ManyToOne: company, manager (User). OneToMany: members (User[])
  - `leave-type.entity.ts` — id (uuid), companyId, name, color (#0B7A75 default), requiresApproval (true), isPaid (true), defaultDays (0). ManyToOne: company
  - `leave-balance.entity.ts` — id (uuid), userId, leaveTypeId, year, allowanceDays (decimal), usedDays (decimal, default 0). Unique constraint: [userId, leaveTypeId, year]. ManyToOne: user, leaveType
  - `leave-request.entity.ts` — id (uuid), userId, leaveTypeId, startDate (date), endDate (date), status (enum: pending/approved/declined/cancelled), note (nullable), approverId (nullable), decidedAt (nullable). ManyToOne: user, leaveType, approver (User)
  - `public-holiday.entity.ts` — id (uuid), country (default "RO"), date (date), name, year. Unique constraint: [country, date]
  - `invite.entity.ts` — id (uuid), token (unique), email, companyId, role (default employee), expiresAt, usedAt (nullable). ManyToOne: company
  - `refresh-token.entity.ts` — id (uuid), token (unique), userId, expiresAt. ManyToOne: user
- All entities use `@Entity('table_name')` for snake_case table names and `@Column({ name: 'column_name' })` for snake_case columns while keeping camelCase in TS
- TypeORM config: `synchronize: false` in prod, `true` in dev (or use migrations from the start)

**Migrations approach:**
- Use TypeORM CLI: `typeorm migration:generate -n InitialSchema` to auto-generate migration from entities
- `typeorm migration:run` to apply
- Add scripts to `apps/api/package.json`: `typeorm:generate`, `typeorm:run`, `typeorm:revert`
- Create `apps/api/typeorm.config.ts` (DataSource config for CLI, separate from NestJS module config)

**Extend shared types (`packages/shared/src/index.ts`):**
- Add API DTOs: `RegisterDto`, `LoginDto`, `CreateLeaveRequestDto`, `UpdateLeaveRequestDto`, `CreateDepartmentDto`, `CreateInviteDto`, `AcceptInviteDto`
- Add response types: `UserProfile`, `LeaveBalanceResponse`, `LeaveRequestResponse`, `DashboardMyResponse`, `DashboardTeamResponse`, `PublicHolidayResponse`, `WallchartEntry`

**Validation pipeline:**
- Install `class-validator`, `class-transformer`, `cookie-parser` in `apps/api`
- Add `ValidationPipe({ whitelist: true, transform: true })` to `main.ts`
- Add `cookieParser()` middleware
- Set `credentials: true` on CORS config

**i18n setup (bilingual RO/EN):**
- Install `next-intl` in `apps/web`
- Create `apps/web/i18n/` with:
  - `request.ts` — i18n configuration
  - `messages/en.json` — English translations
  - `messages/ro.json` — Romanian translations
- Restructure routes to use `[locale]` segment: `apps/web/app/[locale]/(auth)/...` and `apps/web/app/[locale]/(dashboard)/...`
- Create `apps/web/middleware.ts` with locale detection (browser language → cookie → default RO)
- Add language switcher component to AppBar (RO/EN toggle)
- Translation keys cover: navigation labels, form labels, leave type names, status labels, error messages, empty states

### Verification:
- `docker compose up -d` → PostgreSQL running
- `npm run typeorm:run` (or `synchronize: true` in dev) → all tables created
- `npm run dev:api` → server starts, health endpoint works, TypeORM connects to DB

---

## Phase 1: Authentication Module (Backend)

**Goal:** Register, login, token refresh, logout, JWT guards, role decorators.

### Dependencies to install in `apps/api`:
`@nestjs/passport @nestjs/jwt @nestjs/config passport passport-jwt passport-local bcrypt` (+ `@types/` devDeps)

### Files to create under `apps/api/src/auth/`:

| File | Purpose |
|------|---------|
| `auth.module.ts` | Imports JwtModule (15min expiry), PassportModule |
| `auth.controller.ts` | POST /register, /login, /refresh, /logout |
| `auth.service.ts` | Core logic: register (creates company+admin in transaction), login (bcrypt compare), generateTokens (access+refresh), refresh (token rotation), logout |
| `strategies/jwt.strategy.ts` | Extracts Bearer token, returns `{ userId, companyId, role }` |
| `strategies/local.strategy.ts` | Email/password validation for login |
| `guards/jwt-auth.guard.ts` | Global guard, skips `@Public()` routes |
| `guards/roles.guard.ts` | Reads `@Roles()` metadata, checks user role |
| `decorators/current-user.decorator.ts` | `@CurrentUser()` param decorator |
| `decorators/roles.decorator.ts` | `@Roles(Role.Admin)` metadata decorator |
| `decorators/public.decorator.ts` | `@Public()` to skip JWT auth |
| `dto/register.dto.ts` | class-validator: companyName, name, email, password (min 8) |
| `dto/login.dto.ts` | class-validator: email, password |

**How auth works:**
- Access token (15min): stored in frontend memory, sent via `Authorization: Bearer` header
- Refresh token (7 days): stored in `refresh_tokens` table, sent as httpOnly cookie (path: `/api/auth`, secure in prod)
- On refresh: old token deleted, new pair issued (rotation prevents replay)
- Global `JwtAuthGuard` + `RolesGuard` registered as `APP_GUARD` in `app.module.ts`

**Also create `apps/api/src/users/`** (basic):
- `users.module.ts`: imports `TypeOrmModule.forFeature([User])` to make the User repository available
- `users.service.ts`: injects `@InjectRepository(User)` repository. Methods: findByEmail, findById, getMe, listByCompany — all use repository methods like `repository.findOne({ where: { email }, relations: ['company'] })`
- `users.controller.ts`: `GET /users/me`, `GET /users` (admin/manager only)

**Repository pattern across all services:** Each NestJS module imports `TypeOrmModule.forFeature([Entity1, Entity2])` for its entities. Services inject repositories via `@InjectRepository(Entity)`. This replaces the single PrismaService — each service only has access to the repositories it needs.

### Verification:
- POST `/api/auth/register` → 201, returns accessToken + user, sets cookie
- POST `/api/auth/login` → 200, returns tokens
- POST `/api/auth/refresh` (with cookie) → new token pair
- GET `/api/users/me` (with Bearer) → user profile
- GET `/api/users/me` (no token) → 401

---

## Phase 2: Frontend Auth Flow

**Goal:** Login/register pages, API client with auto-refresh, route protection, app shell layout.

### API Client (`apps/web/lib/api-client.ts`):
- Fetch wrapper storing access token in module-level variable (memory only)
- On 401: attempts `POST /auth/refresh` (browser sends httpOnly cookie), retries original request
- If refresh fails: clears token, redirects to `/login`
- All requests include `credentials: 'include'` for cross-origin cookies

### Auth Context (`apps/web/lib/auth-context.tsx`):
- React context providing: `user`, `isLoading`, `login()`, `register()`, `logout()`, `refreshUser()`
- On mount: calls `refreshUser()` to restore session from refresh cookie (survives page reload)

### Next.js Middleware (`apps/web/middleware.ts`):
- Checks for `refresh_token` cookie presence (not validity — API validates)
- Public paths: `/login`, `/register`, `/invite/*`
- If no cookie + protected path → redirect to `/login`
- If has cookie + visiting `/login` or `/register` → redirect to `/dashboard`

### Auth Pages:
- `apps/web/app/(auth)/layout.tsx` — centered layout, no sidebar/appbar, just logo + form
- `apps/web/app/(auth)/login/page.tsx` — email + password form, uses `Button` from `@recharge/ui`
- `apps/web/app/(auth)/register/page.tsx` — company name, name, email, password, confirm password
- `apps/web/app/(auth)/invite/[token]/page.tsx` — validates token on mount, shows name + password form

### App Shell (`apps/web/app/(dashboard)/layout.tsx`):
Reuses existing UI components:
- **`AppBar`** — company name from user profile, `Avatar` with user menu (Profile, Logout)
- **`Sidebar`** — items: Dashboard, Calendar, My Requests (all roles) + Team (manager/admin) + Settings (admin only). Active state from `usePathname()`
- Main content area with grey background, padding

### Verification:
- Navigate to localhost:3000 → redirected to `/login`
- Register → lands on `/dashboard`
- Refresh page → still on `/dashboard` (session restored)
- Logout → redirected to `/login`

---

## Phase 3: Company Setup — Leave Types, Holidays, Departments, Invites (Backend)

**Goal:** CRUD modules for admin configuration.

### Leave Types (`apps/api/src/leave-types/`):
- `seedDefaults(companyId)` — called during registration, creates 6 Romanian defaults:
  - Concediu de odihna (annual, 21 days, teal)
  - Concediu medical (sick, 0 days, orange, no approval needed)
  - Concediu fara plata (unpaid, 0 days, grey)
  - Zi libera personala (personal, 3 days, purple)
  - Concediu de maternitate (126 days, pink)
  - Concediu de paternitate (10 days, blue)
- CRUD endpoints: GET (all), POST/PATCH/DELETE (admin only)

### Holidays (`apps/api/src/holidays/`):
- `data/romanian-holidays.ts` — static list of Romanian public holidays for 2024-2028
- `seed()` — upserts holidays (idempotent via unique constraint)
- `findByYear(year)`, `isHoliday(date)`, `getHolidayDatesForRange(start, end)` — used by leave calculation
- Endpoints: GET `/holidays?year=2026`

### Departments (`apps/api/src/departments/`):
- CRUD + `assignUser(userId, departmentId)` + `getManagerForUser(userId)` (critical for approval routing)
- Endpoints: GET, POST, PATCH (admin), PATCH `/:id/assign` (admin)

### Invites (`apps/api/src/invites/`):
- `create(companyId, { email, role? })` — generates 32-byte crypto-random token, 72hr expiry
- `validate(token)` — checks expiry and usage
- `accept(token, { name, password })` — transaction: creates User, hashes password, marks invite used, creates leave balances
- Endpoints: POST `/invites` (admin), GET `/invites/:token` (public), POST `/invites/:token/accept` (public)

### Wire into registration:
- `auth.service.register()` calls `leaveTypesService.seedDefaults()` and `holidaysService.seed()` after creating company

### Verification:
- Register → DB has 6 leave types, holidays, admin with leave balances
- Create invite → validate token → accept → new user with balances
- CRUD operations on leave types, departments work

---

## Phase 4: Leave Request Workflow (Backend)

**Goal:** The core business logic — submitting, calculating, approving, declining leave.

### Working Days Calculator (`apps/api/src/common/working-days.ts`):
```
calculateWorkingDays(startDate, endDate, holidayDates: Set<string>): number
```
Iterates each day, skips weekends (Sat=6, Sun=0) and public holidays. This is the critical calculation used everywhere.

### Leave Requests (`apps/api/src/leave-requests/`):

**`create(userId, dto)`:**
1. Fetch leave type (check `requiresApproval`)
2. Get public holidays for date range
3. Calculate working days
4. Check balance: `allowanceDays - usedDays >= workingDays`, else throw 400
5. Check for overlapping requests (same user, overlapping dates, pending/approved)
6. Create request as `pending`
7. If no approval needed → auto-approve, update `usedDays`
8. If needs approval → find department manager, queue notification

**`update(requestId, approverId, { status })`:**
1. Verify request is still `pending`
2. Verify approver is department manager or admin
3. If approving: recalculate working days, add to `usedDays`
4. Set status, approverId, decidedAt
5. Queue notification to requester

**`cancel(requestId, userId)`:**
- If was approved: subtract working days from `usedDays`
- Set status to `cancelled`

**Other queries:** `findByUser`, `findPendingByManager`, `findByCompany`, `findByDateRange` (for wallchart)

### Leave Balances (`apps/api/src/leave-balances/`):
- `getByUser(userId, year)` — returns balances with computed `remainingDays`
- `createDefaults(userId, companyId, year)` — creates balances for all leave types with `defaultDays > 0`
- `adjustAllowance(balanceId, newDays)` — admin override
- Endpoints: GET `/leave-balances/me`, GET `/leave-balances/user/:userId` (admin), PATCH (admin)

### Verification:
- Create request for 5 working days → succeeds
- Request more than balance allows → 400
- Manager approves → usedDays increases
- Cancel approved request → usedDays decreases
- Dates spanning weekend → correctly excludes Sat/Sun
- Dates spanning holiday → correctly excludes it

---

## Phase 5: Dashboard, Calendar & Requests (Backend + Frontend)

**Goal:** The main pages users interact with daily.

### Dashboard API (`apps/api/src/dashboard/`):
- `GET /dashboard/me` → user profile, leave balances, upcoming + recent requests
- `GET /dashboard/team` (manager/admin) → pending approvals, team on leave today, department summary

### Calendar API (`apps/api/src/calendar/`):
- `GET /calendar/wallchart?start=2026-06-01&end=2026-06-30&departmentId=...`
- Returns `WallchartEntry[]`: for each user, for each day, what's happening (leave with type/color, holiday, weekend, or normal)

### Frontend Dependencies to install in `apps/web`:
`@mui/x-date-pickers date-fns`

### Dashboard Page (`apps/web/app/(dashboard)/dashboard/page.tsx`):

**Employee view:**
- Row of `StatCard` components: Annual Leave Balance ("X / 21 days"), Pending Requests count, Days Used This Year
- "Upcoming Leave" `Card` with list of approved upcoming requests
- "Recent Requests" `Card` with table: dates, type, `StatusBadge`, working days

**Manager/Admin additional view:**
- "Pending Approvals" `Card`: each row has `Avatar` + employee name, dates, type, approve/decline `Button`s
- "Team On Leave Today" `Card`
- Department summary cards

### Requests Pages:
- `apps/web/app/(dashboard)/requests/page.tsx` — list with status filter tabs, "New Request" button
- `apps/web/app/(dashboard)/requests/new/page.tsx` — leave type dropdown, MUI date range picker, note field, live balance display, working days preview
- `apps/web/app/(dashboard)/requests/[id]/page.tsx` — full details, cancel button (requester) or approve/decline buttons (manager/admin)

### Calendar/Wallchart Page (`apps/web/app/(dashboard)/calendar/page.tsx`):
- Month/year navigation
- Department filter dropdown
- Grid: header = day numbers, first column = employee names with `Avatar`, cells colored by leave type, marked for holidays, grey for weekends
- Tooltip on hover showing leave type + dates
- Built with MUI Box + CSS Grid (no third-party calendar lib)

Helper components in `apps/web/components/calendar/`:
- `WallchartGrid.tsx`, `CalendarCell.tsx`, `MonthNavigation.tsx`

### Verification:
- Dashboard loads with real data, StatCards show correct numbers
- New request form works end-to-end
- Manager can approve from dashboard
- Wallchart shows colored blocks for approved leave
- Holidays and weekends render correctly
- Month navigation works

---

## Phase 6: Team Management & Email Notifications

**Goal:** Team/department management UI, invite flow frontend, transactional emails.

### Team Page (`apps/web/app/(dashboard)/team/page.tsx`):
- "Invite Employee" button (admin only) → `InviteDialog` component
- Department cards showing manager, members with `Avatar`
- All employees table with role, department, actions

### Settings Page (`apps/web/app/(dashboard)/settings/page.tsx`, admin only):
- Leave Types section: list with edit/delete, add new
- Public Holidays section: display for current year
- Company Info section

### Notifications (`apps/api/src/notifications/`):
- Install `resend` in `apps/api`
- `notifications.service.ts`: uses Resend SDK for transactional emails
  - `sendRequestSubmittedNotification(request, managerEmail)`
  - `sendRequestApprovedNotification(request, employeeEmail)`
  - `sendRequestDeclinedNotification(request, employeeEmail)`
  - `sendInviteEmail(invite, companyName)`
- Simple inline-styled HTML templates (email client compatible)
- **Graceful degradation:** if `RESEND_API_KEY` not set, logs to console instead

### Integration:
- `leave-requests.service.ts` calls notifications on create/approve/decline
- `invites.service.ts` calls notification on invite creation

---

## Phase 7: Seed Data & Polish

**Goal:** Portfolio-ready demo data and UI refinements.

### Seed Script (`apps/api/src/database/seed.ts`):
Creates a realistic demo company:
- **Company:** "TechRo Solutions SRL"
- **Admin:** admin@techro.ro / password123
- **3 Departments:** Engineering, Design, Marketing (each with a manager)
- **8-10 Employees** across departments
- **Leave balances** for all users (current year)
- **Sample requests:** mix of approved (past), upcoming approved, pending (for demo), declined
- **Romanian holidays** for 2025-2027

Demo credentials shown on login page.

### UI Polish:
- Loading skeletons on every data-fetching page (MUI `Skeleton`)
- Empty states with icons and messages
- Error handling with MUI `Alert`/`Snackbar`
- Custom hooks: `useLeaveRequests`, `useLeaveBalances`, `useDashboard`, `useWallchart`
- Mobile responsiveness testing (Sidebar already handles mobile)
- Global exception filter for consistent error responses

### Root page redirect:
- `apps/web/app/page.tsx` → redirect to `/dashboard`

---

## Phase 8: Deployment

| Component | Target |
|-----------|--------|
| Frontend (`apps/web`) | Vercel |
| Backend (`apps/api`) + PostgreSQL | Railway / Render / Fly.io |
| Storybook | Chromatic / Vercel |

- Production env files with strong secrets
- `typeorm migration:run` for production migrations (`synchronize: false` in prod)
- `output: 'standalone'` in next.config if needed

---

## Complete New File Summary

~70 new files across 8 phases. Key ones:

| Critical File | Why |
|---------------|-----|
| `apps/api/src/entities/*.entity.ts` | Entire data model — everything depends on these |
| `apps/api/src/auth/auth.service.ts` | Core auth logic (register, login, tokens) |
| `apps/api/src/leave-requests/leave-requests.service.ts` | Core business logic (request, balance check, approval) |
| `apps/api/src/common/working-days.ts` | Working days calculation excluding weekends + holidays |
| `apps/web/lib/auth-context.tsx` | Frontend auth state — every page depends on this |
| `apps/web/lib/api-client.ts` | Fetch wrapper with auto token refresh |
| `apps/web/app/(dashboard)/layout.tsx` | App shell reusing AppBar + Sidebar from @recharge/ui |
| `packages/shared/src/index.ts` | DTOs and types shared between frontend and backend |

## Dependencies to Install

**`apps/api`:** @nestjs/typeorm, typeorm, pg, @nestjs/passport, @nestjs/jwt, @nestjs/config, passport, passport-jwt, passport-local, bcrypt, class-validator, class-transformer, cookie-parser, resend, date-fns

**`apps/web`:** @mui/x-date-pickers, date-fns, next-intl

## Existing Components Reused

All 6 `@recharge/ui` components are used in the frontend:
- **AppBar** → dashboard layout header
- **Sidebar** → dashboard layout navigation
- **Avatar** → user menu, employee lists, wallchart
- **Button** → forms, actions, approve/decline
- **Card + StatCard** → dashboard metrics, content sections
- **StatusBadge** → request status everywhere (after adding 'declined' support)

## Estimated Effort

| Phase | Estimate |
|-------|----------|
| Phase 0: Foundation + i18n | 4-5 hours |
| Phase 1: Auth backend | 4-6 hours |
| Phase 2: Auth frontend | 4-5 hours |
| Phase 3: Company setup | 5-6 hours |
| Phase 4: Leave workflow | 4-5 hours |
| Phase 5: Dashboard + Calendar | 8-10 hours |
| Phase 6: Team + Notifications | 4-5 hours |
| Phase 7: Seed + Polish | 3-4 hours |
| Phase 8: Deployment | 2-3 hours |
| **Total** | **~38-50 hours** |
