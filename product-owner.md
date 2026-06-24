# Recharge — Product Owner Brief

## 1. Vision

**Super Vacanta** (`supervacanta.ro`) is a leave & absence management platform for Romanian small and medium businesses — think **"Timetastic, but built for Romania"**. It replaces Excel sheets, WhatsApp messages, and paper request forms with a simple, paperless way to request, approve, and track time off.

Reference product: [timetastic.co.uk](https://timetastic.co.uk) — a UK staff holiday planner used by 8,000+ businesses. Super Vacanta adapts the same core idea (request -> approve -> calendar) to the Romanian context: local leave types, Romanian public holidays, and a bilingual (RO/EN) UI.

## 2. Problem

Most Romanian SMEs have no dedicated tool for managing employee leave:

- HR/owners track allowances manually in spreadsheets, which drift out of date.
- Employees don't know how many days of *concediu* they have left.
- Managers approve requests over email/WhatsApp with no central record.
- No single view of "who's off this week" across a team.

## 3. Personas

| Persona | Role | Needs |
|---|---|---|
| **Admin / Company Owner** | Sets up the company account, configures leave types, departments, public holidays, leave policies | Quick setup, control over policy, visibility across the whole company |
| **Manager** | Leads a department/team | Approve/decline requests for their team, see team wallchart, avoid understaffing |
| **Employee** | Regular staff member | Request leave in a few clicks, see remaining allowance, see team calendar |

## 4. MVP Scope (Must-haves)

1. **Auth & company onboarding** — admin signs up, creates a company, invites employees by email.
2. **User roles** — Admin, Manager, Employee (role-based access).
3. **Leave allowance** — each employee has an annual leave balance (default from company policy, can be overridden).
4. **Leave types** — configurable per company, seeded with Romanian defaults:
   - Concediu de odihna (annual leave)
   - Concediu medical (sick leave)
   - Concediu fara plata (unpaid leave)
   - Invoire / Zi libera (short personal leave)
   - Concediu de maternitate/paternitate
5. **Leave request workflow** — employee submits a request (date range, type, note) -> manager gets notified -> approves/declines -> employee notified.
6. **Team calendar / wallchart** — month view showing who is off and why, per department.
7. **Romanian public holidays** — pre-seeded official legal holidays per year, shown on the calendar and excluded from leave-day counts.
8. **Departments** — group employees, assign a manager, basic "who approves whom" structure.
9. **Dashboard** — employee sees remaining allowance + their requests; manager/admin sees pending approvals and team overview.
10. **Email notifications** — request submitted, approved, declined.

## 5. Phase 2 (Post-MVP / Nice-to-haves)

- Google/Outlook calendar sync
- Slack/Teams notifications
- Absence analytics & exportable reports
- Accrued leave policies (days accrue monthly rather than granted upfront)
- Minimum staffing levels & clash detection on approval
- Rota & time clock
- SSO
- Native mobile apps

## 6. Out of Scope for MVP

- Payroll integration
- Multi-tenant agency/reseller mode
- Native mobile apps (responsive web is enough)
- Real billing/subscriptions

## 7. Core User Stories (MVP)

- As an **Admin**, I want to create a company account and invite employees, so the team can start using the platform.
- As an **Admin**, I want to configure leave types and each employee's annual allowance, so policy matches our company rules.
- As an **Employee**, I want to request time off by selecting dates and a leave type, so I don't need to email HR.
- As an **Employee**, I want to see how many days of each leave type I have left, so I can plan ahead.
- As a **Manager**, I want to see pending requests for my team and approve/decline them, so I control my team's availability.
- As a **Manager/Employee**, I want to see a team calendar showing who's off, so I can plan work and meetings.
- As anyone, I want public holidays to appear on the calendar automatically, so I don't need to track them manually.

## 8. Success Criteria (Portfolio Demo)

- End-to-end flow works: admin creates company -> invites employee -> employee requests leave -> manager approves -> calendar & balance update.
- Clean, responsive UI built with MUI v9 + custom design system.
- Bilingual UI (RO/EN) via next-intl.
- Seeded demo data (sample company, employees, Romanian public holidays) so the deployed demo is immediately explorable.
- Deployed: frontend on Vercel, backend + Postgres on Railway/Render/Fly.io.

## 9. Decisions Made

| Question | Decision |
|---|---|
| Auth approach | Custom JWT (NestJS Passport) — no auth-as-a-service |
| ORM | TypeORM (idiomatic NestJS decorator pattern) |
| Styling | MUI v9 + Emotion (no Tailwind) |
| Language | Bilingual RO/EN from day one (next-intl) |
| Public holidays | Hardcoded seed list for 2024-2028 |
| Demo data | Single seeded company ("TechRo Solutions SRL") |
| Package manager | Bun (both repos) |
| Repo structure | Two repos: recharge-api + recharge-web |
