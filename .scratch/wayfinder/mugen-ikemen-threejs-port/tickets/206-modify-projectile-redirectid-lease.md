# Implement ModifyProjectile RedirectID lease/v1

Type: task
Status: completed
Blocked by: None

## Question

Can root active CNS `ModifyProjectile` controllers use the existing
RedirectID lease to mutate the destination root's projectile store while
keeping dynamic parameter evaluation in the caller context?

## Source boundary

IKEMEN documents `RedirectID` as an optional feature available to all state
controllers, while warning that processing order can make some controllers
unredirectable in practice. The repository already has a synchronous root
lease for destination identity and freshness, plus a typed `ModifyProjectile`
operation and caller-side dynamic numeric resolvers. This ticket tests the
smallest projectile RedirectID mutation surface that fits those contracts.

## Scope

- lower a validated `ModifyProjectile` `redirectid` expression into the typed
  controller operation;
- resolve the destination root through the existing lease during active CNS;
- mutate only the destination root's projectile store;
- evaluate dynamic `ModifyProjectile` values against the caller runtime;
- keep omitted RedirectID local and preserve the existing local path;
- fail closed for invalid, missing, stale, or unavailable destinations;
- record bounded redirected controller/operation telemetry without claiming
  projectile parity beyond the mutation itself.

Do not widen `Projectile` spawn RedirectID, State -1/global-state routing,
helper-owned projectiles, `OwnProjectile`, `ProjTypeCollision`, recursive
redirects, score, rollback/netplay, renderer behavior, or full parity.

## Evidence required

- compiler coverage for valid and invalid `ModifyProjectile` RedirectID;
- runtime coverage proving destination-store mutation and caller-context
  dynamic values;
- local, invalid, and non-IKEMEN behavior remains bounded;
- TypeScript 7 check, focused effect/runtime batch, and diff hygiene;
- closeout report with explicit score impact and remaining debt.

## Research basis

- [IKEMEN state controllers (new)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
- [IKEMEN state controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
- `docs/research/2026-07-16-modify-projectile-redirectid.md`
- `docs/adr/0006-runtime-redirected-target-dispatch.md`

## Exit

Root active CNS `ModifyProjectile RedirectID` has a typed, lease-backed,
caller-evaluated destination mutation path with focused evidence. Unsupported
projectile RedirectID surfaces remain visible and fail closed.

## Outcome

- `ModifyProjectile` now lowers a validated `redirectid` expression into its
  typed operation; malformed expressions do not produce an executable
  operation.
- Root active CNS resolves the destination through the existing synchronous
  lease and delegates mutation to that root's projectile store.
- Dynamic mutation values remain caller-evaluated; the required fixture proves
  caller `var(0)=52` changes only the destination projectile.
- Omitted RedirectID keeps the local path; invalid or unavailable targets fail
  closed without mutation.

## Verification

- `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  -> 3 files, `304/304` tests passed.
- `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed for the changed implementation and test files.
- Browser/renderer smoke: N/A; this is compiler/runtime-only.

## Closeout

Report: `docs/reports/2026-07-16-modify-projectile-redirectid-v1-closeout.md`

Commit: `e5a32bd4 feat(runtime): lease ModifyProjectile redirects`
