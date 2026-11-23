# Demo & Defence Guide

A 3–5 minute walkthrough plus the questions most likely to come up in the panel.

## Before the demo

```bash
docker compose up -d
npm run db:seed -- --force     # clean 36-order dataset
npm run dev                    # http://localhost:3000
```

Both demo identities are seeded:

- Customer: **Acme Logistics Ltd** (`procurement@acme.example`)
- Supplier: **Sam Patel**

Order reference after a fresh seed:

| Range                        | Status                    |
| ---------------------------- | ------------------------- |
| `ORD-2026-000001` – `000008` | Pending supplier approval |
| `000009` – `000013`          | Accepted                  |
| `000014` – `000018`          | Dispatched                |
| `000019` – `000023`          | In transit                |
| `000024` – `000032`          | Delivered                 |
| `000033` – `000036`          | Rejected                  |

Customers own orders by seeded customer; use Acme for odd-numbered orders in the demo.

## Storyboard (≈4 minutes)

### 0:00–0:35 — Context and stack

- B2B ordering POC: customer places and tracks orders, supplier approves and progresses them.
- Next.js App Router + TypeScript + PostgreSQL 16 + Prisma 7 + Zod + Tailwind.
- One deployable; server-enforced RBAC; audited state machine.

### 0:35–1:35 — Customer places an order

1. Sign in as **Customer → Acme Logistics Ltd**.
2. Open **New order**, set quantities for two products, keep the prefilled address, show the live
   total, place the order.
3. Land on the confirmation page: status **Pending approval**, invoice button hidden.
4. Point out the server rule: prices are re-read from the DB; the client only sends IDs and
   quantities.

### 1:35–2:35 — Supplier dashboard

1. Sign out, sign in as **Supplier**.
2. Show the seeded dataset: **36 orders, 4 pages**.
3. Filter by `status=PENDING`, search `acme`, add a date range; show the URL updating and the
   combined count.
4. Accept the new order. Show the status badge change.
5. On an accepted order, advance Dispatched → In Transit → Delivered one step at a time.
6. Try an illegal action (or a second accept in another tab): show the inline `409` message.

### 2:35–3:25 — Tracking and invoice

1. Sign in as customer again, open **Track**, enter the order number.
2. Walk the stepper; open **Audit trail** and read a line: status, timestamp, actor role/name.
3. Open a rejected order (`ORD-2026-000033`): show the red **Order rejected** termination card.
4. Return to the accepted order and download the invoice; open the PDF and point at the order
   number, mock invoice number, lines, totals, address, issue date.
5. Show that a pending order's invoice returns `409` if requested directly.

### 3:25–4:15 — Decisions and trade-offs

- State machine is one source of truth; transitions use a conditional update plus audit insert in
  one transaction; concurrent accept → one `200`, one `409`, one audit row.
- `PENDING` is a dashboard label mapped to `PENDING_SUPPLIER_APPROVAL` at the query boundary.
- Server pagination gives correct totals and clamped pages.
- Money uses `DECIMAL(10,2)` with integer-cent calculation.
- Ownership: customer list filtered by session; order reads through `getOrderForViewer`.

### 4:15–4:45 — What I would improve

- Real auth/SSO, rate limiting, CSP nonce, structured logging.
- Cancellations/returns/partial fulfilment, inventory, payments.
- Playwright E2E in CI and pagination for the customer list.

## Likely panel questions

**Why server-side pagination?**
Correct total counts and page clamping require the server to know the full result size. It also
avoids shipping all rows to the browser and matches how the query will behave at scale.

**How do you prevent skipping statuses?**
`ALLOWED_TRANSITIONS` is the single source of truth. The API validates `toStatus` against the current
status, and the DB update is conditional on the status it read, so a race loses with `409`.

**Why 403 rather than 404 for another customer's order?**
It is an explicit, debuggable authorisation error and the brief asks for clear errors. A production
system might prefer `404` to avoid revealing that an order exists; the helper makes that a one-line
change.

**How is the audit trail protected?**
No update/delete routes exist, and a database trigger raises on `UPDATE` or `DELETE` of
`order_status_history`. Inserts happen only inside the transition transaction.

**Why is `PENDING` not stored?**
The requirement explicitly distinguishes the dashboard label from the stored status. Storing
`PENDING_SUPPLIER_APPROVAL` keeps the lifecycle unambiguous; the UI/filter mapping is deliberate and
tested.

**What happens if two suppliers accept at the same time?**
Both read the pending status; only one conditional update matches. The loser gets `409
ILLEGAL_TRANSITION`, and the transaction rolls back before any audit row is written.

**How is invoice access controlled?**
The route requires a session, loads the order through the ownership check, and returns `409` unless
the status is accepted or later. Hiding the button is only a UX nicety.

**Why Prisma 7 and the driver adapter?**
It is the current stable ORM line with typed queries and versioned migrations. The `pg` adapter keeps
the runtime on a standard PostgreSQL driver; generated client output is gitignored and recreated by
`postinstall`.

**What did AI do, and how do you know the code is correct?**
See `AI_USAGE.md`: plan-first prompts, then tests, curl matrices, SQL invariants, PDF extraction, and
a fresh-clone build. The wrong-output example is documented with the failing check and the fix.

**What would break first at scale?**
Search across two tables with `OR`, and dashboard count/rows as the order table grows. Next steps
would be a dedicated search column/UNION and covered indexes; the trigram and composite indexes are
already in place.

## Clean-up before submitting

```bash
npm run db:seed -- --force
npm run verify
npm run build
git status   # should be clean except intentional local files
```

Do not commit `.env`; provide repository access to reviewers if private.
