# Quality audit

Date: 2026-08-15

## Current status

The maintained branch passes its deterministic engineering gates. The project is
still a public, partial MUGEN/IKEMEN compatibility sandbox rather than a claim of
full engine parity or release readiness.

| Area | Result | Evidence |
| --- | --- | --- |
| Package manager | PASS | `packageManager: pnpm@11.21.0`; pnpm lockfile; no Bun runtime dependency |
| Dependencies | PASS | `pnpm outdated` returned no pending packages |
| Security audit | PASS | `pnpm audit --audit-level=high` found no known vulnerabilities |
| Types | PASS | `pnpm typecheck` |
| CSS budget | PASS | 81,134/536,051 bytes, 597/2,364 rules, no duplicate selector or exact-rule violations |
| Production build | PASS | Vite 8.2.1 built 363 modules; the main JavaScript chunk is 2.54 MB before gzip and 627.74 kB gzip |
| Tests | PASS | 328 files and 4,063 tests passed |
| Trace gates | PASS | 870/870 artifacts passed, including 836 required artifacts and the Helper-owned active `EnvShake` ownership route |
| Browser smoke | PARTIAL | The smoke run produced current desktop, mobile, runtime, and Studio captures, but 10 compatibility/evidence gates remain unresolved |
| Pages preview | PASS | Local desktop and mobile browser checks passed with no missing images, console errors, or horizontal overflow |

## Maintained runtime boundary

The Helper-owned active `EnvShake` route now:

- evaluates `Parent,Var(...)` parameters in the Helper caller context;
- preserves fractional `mul`, `diradd`, and `decay` values;
- records Helper state execution and typed controller/operation telemetry;
- projects one event into the verified root presentation buffer;
- retains `sourceActorId`, `sourceRootId`, and `sourceParentId` provenance; and
- reaches the existing stage camera-shake calculation.

This proof does not claim nested or team Helper ownership, rollback parity,
contact/fall-shake parity, or complete MUGEN/IKEMEN camera behavior.

## Residuals

1. The browser smoke suite still has 10 compatibility/evidence failures. Its
   screenshots are valid product evidence, but the suite itself is not a pass.
2. The primary JavaScript bundle is large. A dedicated performance pass should
   introduce route- or feature-level dynamic imports without mixing that work
   into compatibility changes.
3. Full upstream MUGEN/IKEMEN compatibility remains the development objective.
   The current evidence proves only the documented subset. Full compatibility
   is incomplete and must not be inferred from these engineering gates.

## Evidence handling

- Current README captures are stored under `docs/assets/screenshots/` with
  provenance in the adjacent `README.md`.
- Generated trace and smoke artifacts stay under ignored `.scratch/qa/`.
- Tracked compatibility evidence remains under `docs/evidence/`. Operator
  roadmaps live in ignored `.scratch/architecture/` and `.scratch/roadmap/`.
  This audit does not authorize a release, push, or publication.
