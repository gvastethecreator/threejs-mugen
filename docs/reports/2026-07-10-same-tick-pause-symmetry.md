# Same-tick Pause symmetry closeout

Date: 2026-07-10
Area: R1 runtime scheduling / Pause and SuperPause

## Outcome

P1-started Pause/SuperPause no longer cancels P2's already-prepared active pass on the same tick. Both root players receive their pre-controller automatic guard checkpoint, active fighter pass, and post-controller checkpoint; the Pause/SuperPause branch takes effect on the next tick.

## Evidence

- Primary-source decision: `docs/research/2026-07-10-same-tick-pause-player-order.md` against IKEMEN GO revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Focused runtime tests: 2 files / 75 tests passed.
- Full unit/integration suite: 157 files / 1550 tests passed.
- TypeScript 7 compiler: `pnpm typecheck` passed on `tsc 7.0.2`.
- Production build and modular boundary check passed; Vite retains the existing large-chunk warning.
- Runtime trace gate: `pnpm qa:trace` passed 529/529 artifacts, 498 required and 31 optional.
- Corrected oracle: required `synthetic-imported-superpause-p2defmul` checksum `b25711b6` / final checksum `623b19fe` now requires 4 P2 frozen SuperPause frames after the same-tick active pass.

## Global port report

- Runtime scheduling: advanced. Fixed-slot P1 Pause no longer has a same-tick cancellation privilege over P2.
- Automatic guard: preserved. Both pre/post checkpoints remain active-tick-only; paused ticks do not enter guard states through these checkpoints.
- Studio editor: unchanged by this slice; existing authoring/evidence work remains available.
- Renderer/Three.js: unchanged; no visual surface changed, so browser smoke was not applicable.
- IKEMEN breadth: still partial. This proves two root players, not dynamic RunOrder, helpers, teams, simul/tag, or rollback scheduling.
- Toolchain: TypeScript 7 direct route remains green.
- Scores: unchanged. This closes correctness debt inside partial runtime compatibility but does not satisfy a horizon exit gate.

## Claims

Claim allowed: bounded two-root-player active ticks follow IKEMEN's prepared-pass boundary when P1 starts Pause/SuperPause, with next-tick freeze behavior and full current trace aggregate green.

Claim blocked: exact dynamic RunOrder, simultaneous competing Pause/SuperPause overwrite semantics, helper insertion/advance order, team/simul/tag actors, rollback timing, exact MUGEN scheduling, and full IKEMEN actor-loop parity.
