# Migration inventory

## Scope and baseline

- Repository: `seo-audit-dashboard`
- Package: `backend`
- Source API: Express REST endpoints with Supabase JS persistence
- Target API: Apollo Server GraphQL with Prisma persistence
- Runtime: Node.js; repository documentation declares Node.js 20+
- Source-versus-target pair guidance: no curated guide exists for Express REST to Apollo GraphQL.
- Baseline: pending runtime-validation capture. The working tree already contains an in-progress backend restructuring, so its current files—not the earlier tracked layout—are the source reference.

## Repository/package topology

The backend is an independent npm package under `backend/`, with a separate Next.js frontend under `frontend/`. The backend serves the API and runs a separate BullMQ worker. The frontend proxies backend requests through `next.config.mjs`.

## Source API units

Express routes discovered in `backend/app.ts` and the feature routers:

| Family | Units | Current behavior |
|---|---:|---|
| Health | 1 | `GET /health` returns service status |
| Audits | 4 | List audits, queue an audit, read queue status, download a PDF |
| Audit preview | 1 | Run an on-demand preview |
| Scheduled audits | 1 | Authenticated cron trigger that queues configured audits |
| Not found/error handling | 2 | JSON 404 fallback and JSON 500 handling |

The frontend currently consumes the audit list, audit status, audit creation, and report download. The Next.js rewrite forwards `/api/*` to the backend. In-app documentation also describes the REST endpoints.

## Backend feature and infrastructure units

- `backend/app.ts` mounts Express routers and defines health/error behavior.
- `backend/index.ts` starts the API and closes the BullMQ queue on shutdown.
- `src/modules/audits/repositories/audits.repository.ts` uses Supabase for audit persistence and provides the JSON type used in persistence operations.
- `src/modules/audits/repositories/audit-report.repository.ts` re-exports report persistence operations.
- `src/modules/audits/repositories/audit-queue.repository.ts` uses BullMQ/Redis and is independent of database persistence.
- `src/modules/audit-preview/` gathers crawl, PageSpeed, Search Console, rankings, and AI analysis; it does not persist audit rows.
- `src/modules/scheduled-audits/` validates cron configuration and uses BullMQ/Redis to enqueue recurring jobs.
- `src/modules/worker/services/audit-processing.service.ts` persists processing/results/status via audit repository functions and serializes JSON through `shared/database/json.ts`.
- `src/shared/database/` contains the Supabase client, hand-maintained Supabase database types, and a JSON conversion helper.
- `src/db/client.ts` is an incomplete Prisma client module: it imports the PostgreSQL adapter but references `PrismaClient` without importing it.
- Prisma schema fragments are under `src/prisma/`; Prisma client output is configured under `src/generated/prisma`.

## Commands and deployment contracts

- Backend package scripts: `dev`, `api`, `api:watch`, `worker`, `worker:watch`, and `typecheck`.
- Backend validation: `npm run typecheck`.
- API startup: `npm run api` (`index.ts`), port 4000 by default.
- Worker startup: `npm run worker`.
- Frontend dev startup: `npm run dev --prefix frontend`, port 3000.
- Deployment config and Dockerfiles currently describe an Express API container and worker; they must be reconciled with the final backend startup.
- Root README currently documents Supabase JS, Supabase CLI migrations, `/api/*` proxying, and the Express deployment.

## Contract changes

| Contract | Source value | Target value | Why required | Alternatives considered | Validation evidence | Approval status |
|---|---|---|---|---|---|---|
| Core API protocol | Express REST for audit UI operations | GraphQL via Apollo Server | Explicitly requested by the user | Retain REST; add GraphQL alongside REST | Pending frontend and API runtime validation | approved change |
| Database access | Supabase JS/Data API | Prisma Client/PostgreSQL | Explicitly requested by the user | Keep Supabase; use SQL client | Pending typecheck, unit tests, and runtime validation | approved change |
| Cron trigger | Authenticated `GET /api/cron/audits` | Preserve authenticated HTTP trigger | External cron-job.org integration requires an HTTP trigger; GraphQL is not an appropriate scheduled-job transport | Convert trigger to GraphQL, requiring an external cron contract change | Pending route validation | preserved |
| PDF download | REST route returning a PDF or redirect | Preserve HTTP PDF download | Binary file transfer is more suitable as an HTTP response than a GraphQL field | Return an encoded PDF in GraphQL | Pending route validation | preserved |
| Health endpoint | `GET /health` JSON response | Preserve health endpoint | Deployment and operators rely on a stable readiness probe | Move health into GraphQL | Pending startup/health validation | preserved |
| Frontend API path | Next rewrite of `/api/*` to backend | Rewrite `/graphql` to backend; retain `/api/*` for operational/file routes | Required to route GraphQL requests while preserving operational contracts | Direct backend URL from browser | Pending frontend build and HTTP validation | approved change |
| Runtime floor | Node.js 20+ | Node.js 20+ | No target-framework requirement to raise it | Raise runtime floor | Must validate on available runtime; declared contract remains unchanged | preserved |

