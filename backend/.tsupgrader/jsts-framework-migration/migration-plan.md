# Migration plan

Source: Express REST + Supabase JS. Target: Apollo Server GraphQL + Prisma Client. Source and target remain in the same backend package. No curated migration guide exists for this framework pair; current official Apollo Server integration guidance and Prisma Client documentation are the references for implementation.

| # | Work item | Source evidence | Target design | Dependencies | Validation | Status |
|---|---|---|---|---|---|---|
| 1 | Capture source baseline | Backend scripts, Express entrypoint, routes, current frontend calls | Record current typecheck, representative health behavior, and tests before migration | Runtime-validation eval plan | Standalone baseline on current source tree | pending |
| 2 | Establish Prisma client and types | Incomplete `src/db/client.ts`; Prisma schema fragments; Supabase types | Configure one generated Prisma client and database JSON types; ensure process lifecycle closes Prisma | 1 | Backend typecheck; unit tests | pending |
| 3 | Replace Supabase repository operations | `src/modules/audits/repositories/audits.repository.ts` uses Supabase CRUD/upsert | Implement equivalent typed Prisma CRUD/upsert operations and preserve status/field mapping | 2 | Typecheck and repository tests | pending |
| 4 | Replace JSON helper and remove Supabase module | `src/shared/database/json.ts`, `database.types.ts`, `supabase.ts`; their consumers | Move shared JSON types/conversion to Prisma-appropriate shared types; remove Supabase imports/dependency and stale database type files | 2, 3 | Repository search; typecheck; tests | pending |
| 5 | Add Apollo GraphQL server | Express `app.ts` currently mounts feature routers | Add typed Apollo schema/resolvers for audit creation, list, status, and preview; use existing service and validation behavior | 3 | GraphQL operation tests; server startup/probe | pending |
| 6 | Migrate frontend consumers and docs | Frontend audit form, query functions, report links, endpoint docs and workflow docs | Send audit operations to GraphQL; retain HTTP PDF, health, and cron paths; update frontend proxy and documentation | 5 | Frontend/backend builds and smoke checks | pending |
| 7 | Reconcile runtime/deployment config | `backend/index.ts`, Dockerfiles, `vercel.json`, root README | Preserve worker behavior and operational routes; update env/configuration and startup only as needed | 5, 6 | Typecheck, server probes, worker build/start check | pending |
| 8 | Remove source database and REST API dependencies | Remaining Supabase imports, REST audit routes/controllers, package/config/docs | Remove superseded Supabase persistence and REST UI endpoints only after all consumers use GraphQL | 4, 6, 7 | Search, builds, tests, final runtime validation | pending |
| 9 | Final parity review | All preceding work items | Produce completion report with unresolved blockers and verified contracts | 8 | Fresh standalone runtime validation | pending |

## Contract changes

| Contract | Source value | Target value | Why required | Alternatives considered | Validation evidence | Approval status |
|---|---|---|---|---|---|---|
| Core API protocol | REST | Apollo GraphQL | User requested GraphQL API design | Preserve REST; expose both | Pending | approved change |
| Database access | Supabase JS | Prisma Client | User requested Prisma throughout backend | Keep Supabase; replace with SQL client | Pending | approved change |
| Cron trigger | Authenticated HTTP GET | Preserved | Existing cron-job.org integration | GraphQL mutation | Pending | preserved |
| PDF response | HTTP PDF/redirect | Preserved | Binary download transport | GraphQL encoded file | Pending | preserved |
| Health probe | HTTP JSON | Preserved | Deployment health check | GraphQL health query | Pending | preserved |
| Frontend proxy | `/api/*` | `/graphql` plus preserved `/api/*` operational routes | GraphQL transport and preserved operations | Browser direct backend URL | Pending | approved change |
| Runtime floor | Node.js 20+ | Node.js 20+ | No increase required | Raise to Apollo's minimum if evidence requires it | Pending | preserved |

