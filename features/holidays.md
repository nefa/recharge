# Public Holidays

## Overview
Romanian public holidays pre-seeded for 2024-2028. Used by the leave request system to exclude holidays from working day calculations. Seeded automatically during company registration.

## Data Model
```
PublicHoliday
├── id (uuid)
├── country (default "RO")
├── date (date, unique with country)
├── name (e.g. "Craciunul")
└── year
```

## Holidays Included (per year)
~16-17 holidays per year including:
- Anul Nou (Jan 1-2)
- Boboteaza (Jan 6)
- Sfantul Ion (Jan 7)
- Ziua Unirii Principatelor Romane (Jan 24)
- Vinerea Mare (varies — Orthodox Good Friday)
- Pastele Ortodox (varies — Orthodox Easter Sunday + Monday)
- Ziua Muncii (May 1)
- Ziua Copilului (Jun 1)
- Rusalii (varies — Orthodox Pentecost Sunday + Monday)
- Adormirea Maicii Domnului (Aug 15)
- Sfantul Andrei (Nov 30)
- Ziua Nationala a Romaniei (Dec 1)
- Craciunul (Dec 25-26)

## User Flows

### Get Holidays by Year
```
GET /api/holidays?year=2026 (any authenticated user)
  → Returns all Romanian holidays for the given year
  → Sorted by date ASC
```

## Seed Flow
```
auth.service.register()
  → transaction
    → create Company
    → create User (admin)
    → leaveTypesService.seedDefaults()
    → holidaysService.seed()   ← idempotent upsert for all years
    → leaveBalancesService.createDefaults()
```

## Backend Files
- `apps/api/src/holidays/holidays.module.ts`
- `apps/api/src/holidays/holidays.controller.ts` — GET /holidays?year=
- `apps/api/src/holidays/holidays.service.ts` — seed, findByYear, isHoliday, getHolidayDatesForRange
- `apps/api/src/holidays/data/romanian-holidays.ts` — static holiday data 2024-2028

## Used By (Phase 4)
- Working days calculator excludes public holidays
- Calendar/wallchart marks holidays

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/holidays?year= | JWT | List holidays for a year |
