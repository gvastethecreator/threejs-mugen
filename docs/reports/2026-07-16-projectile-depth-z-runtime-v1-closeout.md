# Projectile Depth Z Runtime/v1 Closeout

Date: 2026-07-16

Wayfinder ticket: `211-projectile-depth-z-runtime.md`
Research: `docs/research/2026-07-16-projectile-depth-z-runtime.md`

## Task state

Completed for the bounded root/player projectile depth contract.

## Artifact verdict

Win against the ticket acceptance target. Authored projectile Z state now
survives compiler lowering and root spawn, advances in runtime, and gates the
three selected combat routes before XY admission.

## Delivered

- Triple projectile offset, position, velocity, and acceleration support.
- Projectile `attack.depth` lowering with controller and actor-default
  precedence.
- Local-coordinate metadata and shared inclusive Z overlap admission.
- Projectile/player contact admission.
- HitFlag P cancellation admission.
- Current-frame Clsn2 projectile trade admission.
- Snapshot depth payload only when authored depth state is observable, keeping
  legacy XY-only snapshot shapes stable.

## Verification state

Verified for the bounded claim set.

## Evidence

- Focused batch: 6 files, `147/147` tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Full suite: `216/216` files, `2279/2279` tests passed.
- Production build: `pnpm build` passed. Vite emitted the existing large-chunk
  advisory for the main JavaScript bundle.
- Boundary check: `pnpm check:boundaries` passed.
- Trace QA: `pnpm qa:trace` passed with `633/633` artifacts and `0` skipped;
  artifact summary is under `.scratch/qa/trace-gates`.
- Feature diff: `git diff --cached --check` passed before commit.
- Browser/renderer gate: N/A; no visible UI or renderer surface changed.

## Quality audit

The key regression risk was silently treating an authored third Z component as
XY-only data. Independent literal fixtures cover compiler preservation, root
spawn, Z movement, localcoord metadata, separated depth, touching depth edges,
HitFlag P separation, and projectile trade separation. Legacy two-component
fixtures remain covered by the full suite.

No independent reviewer was available in this run. A fresh local autopsy found
no blocker or P1 inside the ticket boundary. Deferred depth ownership and
presentation concerns remain visible in the claim ceiling rather than being
promoted to parity claims.

## Claim ceiling

Verified: authored root/player projectile Z position and velocity, localcoord
scaling, attack depth, inclusive depth admission for projectile/player contact,
HitFlag P, and current-frame Clsn2 projectile trades.

Deferred: helper/proxy-owned depth, exact depth-bound removal, perspective or
render ordering, cancel tick ordering, rollback/netplay, score, renderer/audio,
and complete MUGEN/IKEMEN parity.

## Commit

- `723f9a4a feat(runtime): implement projectile depth admission`

## Next frontier

Select the next independent source-backed projectile ordering or ownership
contract. Keep helper/proxy depth separate until its runtime identity and
coordinate path are characterized.
