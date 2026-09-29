# Production Monitoring System

<div dir="rtl">

**نظام مراقبة الإنتاج** — تطبيق ويب لمتابعة إنتاج مصنع أكياس، مبني بالكامل
كموقع عربي (RTL) يهتم بتصميم الموبايل أولاً.

</div>

A mobile-first, right-to-left (Arabic) web app for tracking bag production on a
factory floor. Supervisors open a job on a line, log output as it is produced, and
watch live progress toward the required quantity — from a phone, one-handed.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TanStack Start (file-based routing, SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | Radix UI primitives (shadcn/ui), Lucide icons, Sonner toasts |
| Data | React Query, Recharts |
| Build | Vite, ESLint, Prettier |

## Features

- **Four production lines** (`line.$lineId`) with per-line job boards.
- **Job tracking** — each job has a required quantity, a bag type, and an assigned
  supervisor. Names are snapshotted onto the job so historical records stay accurate
  when a supervisor is later renamed or reassigned.
- **Production log** — every logged unit is stored as a timestamped
  `ProductionEntry`. Quick-add buttons remove the keypad from the common case.
- **Derived state** — current output, remaining quantity, percentage, and status
  (`not_started` / `in_progress` / `completed`) are all computed from entries rather
  than stored, so they can never drift out of sync.
- **Daily log** (`/log`) with a running-total ledger per job.
- **Reports** (`/reports`) aggregating output and progress across all lines.
- **Settings** — full CRUD for supervisors and bag types via Radix alert dialogs.
- **Mobile-first UX** — bottom navigation, bottom sheets, 44–48px touch targets,
  and layouts verified at 360 / 375 / 390 / 430px.
- **Offline-friendly** — state persists to `localStorage`.

## Domain model

```ts
interface ProductionJob {
  id: ID;
  dayId: string;
  lineId: number;
  supervisorId: ID | null;
  supervisorNameSnapshot: string;   // denormalised on purpose
  bagTypeId: ID | null;
  bagTypeNameSnapshot: string;      // denormalised on purpose
  requiredQuantity: number;
  createdAt: number;
  completedAt: number | null;
  entries: ProductionEntry[];
}
```

Business rules live in `src/lib/production/types.ts` (`jobStatus`, `jobProgress`,
`jobRemaining`, `entryRunningTotal`) as pure functions, so they are testable in
isolation from the UI.

## Project structure

```
src/
  components/production/   JobCard, AddJobSheet, AddProductionSheet, BottomNav, StatusBadge
  components/ui/           Radix / shadcn primitives
  lib/production/          types, store, seed data, formatting
  routes/                  index, line.$lineId, log, reports, settings
```

## Getting started

Requires Node.js 18+.

```sh
git clone https://github.com/abdullahkhaled11/production-monitoring.git
cd production-monitoring
npm install
npm run dev
```

## Scripts

```sh
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # ESLint
npm run format   # Prettier
```

## License

MIT
