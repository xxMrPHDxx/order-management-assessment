# Order Management & Logistics POC

Full-stack proof of concept for B2B ordering: customers place orders, track deliveries, and
download invoices; suppliers approve orders and progress them through logistics, with every status
change audited.

Built with Next.js (App Router), TypeScript, PostgreSQL, Prisma, Zod, and Tailwind CSS.

Current status: **Phase 0 — project foundation**. See [PLAN.md](./PLAN.md) for the phased roadmap.

## Getting Started

### Prerequisites

- Node.js 20.9+ and npm
- Docker Desktop (for the PostgreSQL container)
- Git

### 1. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate`, so the Prisma Client is created automatically.

### 2. Configure environment

```bash
cp .env.example .env
```

Generate a session secret and paste it into `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env`; it is ignored by Git. `.env.example` documents every variable.

### 3. Start PostgreSQL

```bash
docker compose up -d
docker compose ps
```

The database listens on `localhost:5432` with the development credentials defined in
`docker-compose.yml` (user/password/database: `assessment`). Data persists in the
`postgres_data` volume.

### 4. Apply database migrations

```bash
npm run db:migrate    # creates/applies a migration during development
```

The first migration is added in Phase 1 together with the data model. To reset local data later:

```bash
npm run db:reset      # drops, recreates, migrates, and seeds the database
```

### 5. Run the app

```bash
npm run dev
```

Open <http://localhost:3000>.

### Available scripts

| Command              | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Start the development server                        |
| `npm run build`      | Production build                                    |
| `npm run start`      | Serve the production build                          |
| `npm run lint`       | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck`  | TypeScript with no emit                             |
| `npm run test`       | Vitest unit tests                                   |
| `npm run format`     | Prettier (includes Tailwind class sorting)          |
| `npm run db:migrate` | Create and apply a development migration            |
| `npm run db:deploy`  | Apply committed migrations (CI/production)          |
| `npm run db:seed`    | Seed the database                                   |
| `npm run db:reset`   | Reset the database and re-run seed data             |
| `npm run db:studio`  | Open Prisma Studio                                  |

### Project structure

```text
.
├── prisma/
│   ├── schema.prisma        # Data model and migrations
│   ├── seed.ts              # Deterministic seed data
│   └── migrations/          # Versioned SQL migrations (committed)
├── src/
│   ├── app/                 # Next.js App Router pages and API route handlers
│   ├── components/          # Reusable UI and layout components
│   ├── config/              # Static app configuration
│   ├── lib/                 # Server-side domain, auth, validation, and DB code
│   └── generated/prisma/    # Generated Prisma Client (not committed)
├── tests/                   # Cross-cutting integration tests
├── docker-compose.yml       # Local PostgreSQL 16
├── prisma.config.ts         # Prisma CLI configuration
└── PLAN.md                  # Phased delivery plan
```

### Architecture notes

- Server Components render pages by default; client components are used only where interaction
  requires them.
- Route handlers under `src/app/api/**` validate every request with Zod before calling the domain
  layer.
- The Prisma Client is a singleton in development (`src/lib/db/prisma.ts`) to survive hot reloads.
- Environment variables are validated at startup (`src/lib/env.ts`).

### Database & indexing

- Migrations live in `prisma/migrations` and are committed. Apply them with `npm run db:migrate`
  in development or `npm run db:deploy` in CI/production.
- Money is stored as `DECIMAL(10,2)`; every timestamp is `timestamptz` in UTC.
- Order numbers are generated inside the database by `next_order_number()`, producing values such
  as `ORD-2026-000042` from a dedicated sequence. The UUID remains the internal primary key.
- Dashboard queries use `orders(status, created_at DESC)`, the customer view uses
  `orders(customer_id, created_at DESC)`, and the timeline uses
  `order_status_history(order_id, created_at)`.
- Partial, case-insensitive search is supported by `pg_trgm` GIN indexes on `customers.name` and
  `orders.order_number`, in addition to the btree indexes.
- `order_status_history` is append-only. A database trigger rejects `UPDATE` and `DELETE`, and the
  application exposes no mutation routes for history.
- `CHECK` constraints reject non-positive quantities and negative money values at the database
  boundary.

`EXPLAIN` sanity checks: the status/date dashboard query uses
`orders_status_created_at_idx`, and the customer join uses the primary key. With only a handful of
rows PostgreSQL may choose a sequential scan for the free-text predicate after the join; the
trigram indexes are in place for growth and should be re-checked once the order seed is loaded.

### Seed data

`npm run db:seed` is deterministic and idempotent (upserts by stable IDs). It currently creates:

- 2 customers (Acme Logistics Ltd, Northwind Traders)
- 10 catalog products with SKUs `OF-1001` to `OF-1010`

Phase 2 extends the same script with 30+ orders, order items, and status history.

---

# Assessment POC Details

## 1. Objective

Design and build a full-stack POC for a B2B order management and logistics tracking platform.

Assessment criteria:

- Architectural decisions
- Database modelling
- API design
- Validation
- Ability to ship production-ready features
- Use of modern AI development tools

## 2. Personas

| Persona  | Goal                                                                     |
| -------- | ------------------------------------------------------------------------ |
| Customer | Place purchase orders, track delivery, download invoices                 |
| Supplier | Review incoming orders, accept/reject, progress logistics, search/filter |

## 3. Functional Requirements

### 3.1 Customer: Order Creation & Invoice

- Select products from a static mock catalog (minimum 8 products with ID, name, unit price).
- Submit a purchase order capturing: customer details, product IDs, quantities, shipping address, order timestamp.
- New orders start as `PENDING_SUPPLIER_APPROVAL`.
- Once the supplier accepts, show a **Download Invoice** button. It must generate a PDF server-side containing:
  - Order ID
  - Mock invoice number
  - Order lines
  - Line and grand totals
  - Customer name and shipping address
  - Issue date
- The invoice button must be unavailable for orders that are not accepted or later.

### 3.2 Supplier: Order Management Dashboard

- Table of all incoming and historical orders.
- **Global search:** by Order ID or Customer Name (partial, case-insensitive).
- **Status filter:** `PENDING`, `ACCEPTED`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `REJECTED`.
- **Date range filter:** orders created between a start and end date (inclusive).
- Filters must be combinable and reflected in the URL (shareable/refresh-safe).
- **Pagination:** 10 records per page, with total count and page controls. Server-side pagination is preferred. Client-side is acceptable if justified in the README.
- **Actions:** Accept or Reject pending orders; advance accepted orders step by step through `DISPATCHED` → `IN_TRANSIT` → `DELIVERED`.

### 3.3 Logistics Tracking Screen

- Customer enters an Order ID to view its lifecycle.
- **Visual stepper:** Placed → Accepted → Dispatched → In Transit → Delivered. A rejected order must be shown clearly as terminated, not as a stalled stepper.
- **Audit trail:** chronological timeline of every status change with its timestamp (e.g. "Status updated to IN_TRANSIT on Nov 11, 2026, 14:00"). Include who made the change (role).

### 3.4 Authentication Simulation (RBAC mock)

- Login screen with a Customer / Supplier toggle or dropdown that sets the session role.
- Enforce role access on the server, not only by hiding UI. Examples:
  - Customers cannot call accept/reject/status APIs.
  - Suppliers do not place orders.
- Customers may only view or track their own orders (use a mock customer identity).

## 4. Status Model & Business Rules

Allowed transitions (all others must be rejected by the API with a clear error):

```
PENDING_SUPPLIER_APPROVAL → ACCEPTED | REJECTED
ACCEPTED                  → DISPATCHED
DISPATCHED                → IN_TRANSIT
IN_TRANSIT                → DELIVERED
REJECTED, DELIVERED       → (terminal)
```

- Every transition writes an immutable audit record (never update or delete history).
- Status changes and their audit record must succeed or fail together (transaction).
- **Note:** the dashboard filter label `PENDING` maps to the stored status `PENDING_SUPPLIER_APPROVAL`. Handle this deliberately and document your choice.

## 5. Technical Constraints

| Area       | Requirement                                                               |
| ---------- | ------------------------------------------------------------------------- |
| Frontend   | Next.js (React) with Tailwind CSS, MUI, or similar                        |
| Backend    | Node.js: Next.js API routes or Express                                    |
| Database   | PostgreSQL (local, Docker, or cloud)                                      |
| ORM        | Prisma or TypeORM, with versioned migrations (no manual DDL only)         |
| Validation | Zod or Joi on every API request (body, query, params)                     |
| PDF        | pdfkit, puppeteer, or @react-pdf/renderer                                 |
| Language   | TypeScript strongly preferred                                             |
| Run        | Must start with documented commands. `docker compose up` preferred for DB |

## 6. Data Modelling Expectations

Provide an ER diagram (Mermaid in the README is fine). At minimum consider: `Customer`, `Product`, `Order`, `OrderItem`, `OrderStatusHistory`. Consider:

- Indexes supporting the search/filter/sort queries.
- Human-friendly Order ID vs internal primary key.

## 7. Deliverables

1. Git repository (GitHub/GitLab link or zip with history) with meaningful commits.
2. `README.md` covering:
   - Setup and run steps
   - Seed data
   - Architecture overview
   - ER diagram
   - API summary
   - Key decisions and trade-offs
   - Known gaps
   - What you would do with more time
3. Seed script producing at least 30 orders across all statuses and varied dates, so filters and pagination can be tested.
4. `AI_USAGE.md`: which AI tools you used, for which tasks, 2–3 prompts that worked well, and one case where the AI output was wrong or needed correcting and how you caught it.
5. Optional: a 3–5 minute screen recording walking through the app.

## Submission & Presentation

- You must submit the GitHub repository details of your POC (repository URL, plus read access for the reviewers if the repository is private) before the deadline.
- You will also be required to present the project to the interview panel. Expect to demo the working application, walk through your architecture and key decisions, and answer questions on your code.
- AI tools are allowed and encouraged, but you must understand and be able to defend every line. Expect to explain and modify your code live in the interview.
- Do not copy a complete existing project. Libraries and boilerplate are fine.
- Keep scope honest: a smaller, correct, well-explained solution beats a larger, fragile one.
- Do not commit secrets. Provide an `.env.example`.
- Questions on requirements are welcome. State any assumptions in the README.
