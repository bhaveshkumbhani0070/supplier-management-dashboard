# Supplier Management Dashboard

Standalone supplier management dashboard built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui primitives, RTK Query with `fakeBaseQuery`, React Hook Form, Zod, and TanStack Table.

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`, which redirects to `/suppliers`.

## Scripts

```bash
pnpm dev
pnpm lint
pnpm type-check
pnpm build
```

## Tech Decisions

- RTK Query powers all supplier CRUD and list data flow. A local in-memory mock database simulates server-side filtering, sorting, and pagination.
- TanStack Table handles column rendering and row selection while server-style state stays externalized through reusable hooks.
- shadcn-style UI primitives are kept local so the app remains self-contained and easy to extend without additional runtime dependencies.
- Tailwind uses CSS variables for the design tokens, matching the requested theming approach.

## Time Spent
Approximately 5-6 hours including
- Setup
- Table and filters
- RTK CRUD
- Dialog forms
- Data modeling
- Reusable hooks
- Polish and QA

## Trade-offs

- The API layer is intentionally mocked in-memory, so data resets on refresh and there is no persistence layer.
- The shadcn components were implemented directly in-repo to keep the exercise portable in an offline-friendly environment.
- Bulk delete is executed as parallel single-delete mutations because the brief only required the five core CRUD endpoints.

## Submission Notes

- Public GitHub repo link: not included in this local workspace
- Deployed preview URL: not included in this local workspace

The app is intended to satisfy:

- `/suppliers` list view with search, filters, sorting, selection, bulk delete, and responsive pagination
- Add, edit, and view flows via dialog form with Zod validation
- Empty states and delete confirmation dialogs
- `pnpm lint`, `pnpm type-check`, and `pnpm build` verification

