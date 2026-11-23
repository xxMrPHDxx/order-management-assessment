# AI Usage

This assessment allowed and encouraged AI tools. This file records the tools used, what they were
used for, prompts that worked well, and a concrete case where the AI output was wrong and how it was
caught.

## Tools used

| Tool                                                      | Used for                                                                                                                |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **OpenCode** coding agent (DeepSeek V4.1 Flash)           | Planning, scaffolding, code generation, refactoring, test writing, documentation drafts, and command-level verification |
| **Prisma CLI skill reference** (loaded through the agent) | Prisma 7 configuration, migration, and seed command syntax                                                              |
| **VS Code 1.117** + Markdown Checkboxes extension         | Reading and previewing the Markdown deliverables                                                                        |
| npm, Docker Compose, psql, PyMuPDF                        | Running the app, database inspection, and PDF text verification (not AI)                                                |

The agent ran commands in the repository, so every generated file was executed, type-checked, and
reviewed rather than accepted on trust.

## How AI was used

| Task                    | AI contribution                                                      | Human review                                                                          |
| ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Requirements → plan     | Extracted `docs.pdf`, produced `PLAN.md` with phases and checklists  | Scope, ordering, and acceptance criteria checked against the brief                    |
| Database schema         | Drafted Prisma models, enums, indexes, and migration custom SQL      | Reviewed relationships, `DECIMAL`/`timestamptz` choices, trigram indexes, and trigger |
| Seed data               | Generated deterministic 36-order dataset with history chains         | Verified status counts, totals, final statuses, and idempotency with SQL              |
| Auth/RBAC               | Drafted JWT session helpers, guards, proxy, login form/action/API    | Tested forged cookies, role matrix, and ownership paths                               |
| Customer ordering + PDF | Drafted order API, server pricing, form, and react-pdf document      | Re-checked cent arithmetic, transaction boundaries, invoice gate, and PDF text        |
| Supplier dashboard      | Drafted query parsing, Prisma filter builder, pagination, actions UI | Verified combined filters, date bounds, clamp behaviour, and illegal transitions      |
| Tracking                | Drafted stepper derivation, timeline, and tracking page              | Checked rejected/terminal behaviour and human-readable timestamps                     |
| Hardening               | Drafted error envelope, headers, and tests                           | Audited every order-scoped route and ran concurrent double-submit                     |
| Documentation           | Drafted README sections, this file, and the demo storyboard          | Corrected claims to match verified behaviour                                          |

## Prompts that worked well

### 1. Plan first, code second

> Read the assessment PDF and produce `PLAN.md` with phased development stages and a checklist.
> Include stack decisions, ER model, API surface, risks, and a definition of done. Keep scope
> honest: a smaller correct solution beats a larger fragile one.

Why it worked: forcing an explicit plan and acceptance criteria before code made later phases
reviewable and prevented scope creep (no real auth, no payments, no multi-tenant).

### 2. Specify the backend contract precisely

> Implement the supplier order query with server-side pagination (10 per page), partial
> case-insensitive search over order number and customer name, the dashboard `PENDING` label mapped
> to stored `PENDING_SUPPLIER_APPROVAL`, inclusive UTC date bounds, and all filters combinable.
> Return `totalItems`, `totalPages`, and the clamped page. Use Zod and make invalid URL values fall
> back to defaults. Add unit tests for the filter builder, mapping, date boundaries, and page math.

Why it worked: naming the exact response meta, mapping rule, and edge cases produced code that
matched the brief on the first pass and was straightforward to test.

### 3. Demand transactional concurrency safety

> Implement supplier status transitions: reject transitions that violate the state machine, update
> the order with a conditional `WHERE status = expected`, and insert the audit row in the same
> transaction. Return `409` for illegal or stale transitions. Then verify two concurrent accepts
> produce one success, one conflict, and exactly one audit row.

Why it worked: stating the concurrency mechanism and the verification step, rather than just
"add accept/reject", produced a defensible design and an explicit test to prove it.

## Case where the AI output was wrong

**Problem:** after implementing order creation, the `POST /api/orders` response reported
`itemCount: 0` for a newly created order, even though the database had two order items.

**Cause:** the AI reused `serializeOrderSummary()` from the dashboard list path. That function reads
Prisma's `_count.items`, which exists on the list query but not on the create query, so it silently
fell back to `0`.

**How it was caught:** the first integration check after building compared the POST response with a
psql query:

```
POST /api/orders → itemCount: 0
SELECT count(*) FROM order_items ... → 2
```

The mismatch was visible immediately, and the order detail API returned both lines correctly.

**Fix:** the create route now overrides the count from the loaded relation:

```ts
data: {
  ...serializeOrderSummary(order),
  itemCount: order.items.length,
}
```

The manual verification checklist now explicitly compares API summary fields with database rows
before a phase is marked complete. A smaller earlier case is also worth noting: the AI initially
claimed the VS Code built-in Markdown preview would render `- [ ]` task lists; it does not, which
was confirmed by testing a minimal file, and fixed by installing the Markdown Checkboxes extension.

## Verification habits

- `npm run verify` (lint, typecheck, 67 tests) and `npm run build` after every phase.
- Curl checks for role matrix, validation envelopes, invoice gates, filters, and transitions.
- psql checks for totals, history chains, final statuses, and single-audit-row concurrency.
- PyMuPDF extraction to confirm invoice content, not just the PDF content type.
- Fresh-clone run (install → migrate → seed → build → start) before calling the POC complete.

## Attribution

AI assisted with implementation and documentation. Every committed line was reviewed, executed, and
explained; no complete existing project was copied. The commit history reflects incremental,
reviewed phases rather than one generated drop.
