# Round Force-win Timeout Closeout

Date: 2026-07-18
Ticket: Wayfinder 281
Implementation commit: `1e8cdda`

## Result

Imported `over.forcewintime` now reaches the normalized round timing contract.
When an active imported root remains controllable, standing, idle, and outside
animation 5 at the wait boundary, `RuntimeRoundSystem` holds phase 3 with a
stable post-round frame/remaining clock. The boundary releases as soon as the
roots become ready or when the configured force window expires. Dead,
disabled, standby, and over-KO roots do not block it; time-over skips the
animation-5 portion of the proxy.

Rounds without a source or explicit force timeout keep the previous phase
behavior through a zero local default. No public snapshot or trace schema
changed.

## Evidence

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/RuntimeMatchRoundSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`: passed, `3` files / `295` tests.
- `pnpm typecheck`: passed with TypeScript `7.0.2`.
- `git diff --check`: passed before implementation commit.

## Ownership and risk

| Surface | Result |
| --- | --- |
| `RuntimeRoundSystem` | Owns normalized force budget, phase-boundary hold, stable clock, and release. |
| `RuntimeMatchRoundWorld` | Propagates readiness through the timer boundary without taking actor-state ownership. |
| `PlayableMatchRuntime` | Supplies the bounded active-root readiness proxy. |
| Loader/source timing | Already parsed `over.forcewintime`; now mapped into runtime when source timing is used. |
| Snapshot/trace schema | Unchanged; phase/frame stability is observed through existing fields. |

## Claim ceiling

Allowed: bounded imported/root force-win readiness hold and release.

Blocked: exact `activelyFighting` and Common1/ZSS semantics, exact frame-start
ordering, full `intro`/`winwaittime` parity, unavailable-state forcing, skip
input, fade/motif/dialogue, lifebars, teams/Turns, rollback/netplay, score
movement, and full MUGEN/IKEMEN parity.

## Global status

Compatibility scores do not move. Studio, generated assets, scanner, and
modular-boundary lanes remain separate. Full suite, production build,
`qa:trace`, and browser smoke were intentionally deferred to the next grouped
runtime checkpoint per the current work cadence.

## Next frontier

Audit the remaining round release boundary: exact `over.time`/fade ownership
and winpose/Common1 readiness, then decide whether a trace artifact can prove
the imported force window without widening the public snapshot schema.
