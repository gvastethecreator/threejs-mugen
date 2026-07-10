# IKEMEN root RunOrder closeout

Date: 2026-07-10
Area: IKEMEN runtime profile / root-player scheduling

## Outcome

Matches can now select an explicit `ikemen-go` runtime profile. Under that profile, the two current root players are prepared and advanced in source-backed previous-tick MoveType priority order: attacking before idle before remaining, then lower runtime id. `mugen-1.1` and `unknown` preserve prior pair order.

## Evidence

- Source decision: `docs/research/2026-07-10-ikemen-root-run-order.md`, IKEMEN GO revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Focused proof: 4 files / 86 tests.
- Full suite: 158 files / 1556 tests.
- TypeScript 7 typecheck and production build passed; Vite retains the existing large-chunk warning.
- `pnpm qa:trace`: 529/529 artifacts, 498 required and 31 optional, unchanged under default `unknown` profile.
- `pnpm check:boundaries` and `git diff --check` passed.

## Global port report

- IKEMEN runtime: advanced from scanner-only plus shared MUGEN behavior to one explicit, bounded executable scheduler policy for two roots.
- MUGEN runtime: preserved. No IKEMEN ordering is applied to `mugen-1.1` or `unknown` matches.
- Pause/guard scheduling: follows selected root order while retaining all-pre checks before either root advances and post checks after each root pass.
- Studio/renderer/assets: unchanged; no browser/visual gate applicable.
- Scores: unchanged. One root-order policy does not satisfy IKEMEN execution or full-runtime horizon gates.

## Claims

Claim allowed: an explicitly selected IKEMEN match can order two root players by previous-tick `A > I > H` and deterministic id tie-break through the public `MatchWorld` facade.

Claim blocked: MUGEN normative run order, `RunFirst` / `RunLast`, `RunOrder` trigger, helpers, appended actors, teams/simul/tag, simultaneous Pause ownership parity, rollback timing, and full IKEMEN actor-loop parity.
