# Issue 108 — IKEMEN Helper red-life LifeShare

Status: closed-bounded
Lane: I2 resources
Priority: P1

## Objective

Route an explicitly opted-in Helper `RedLifeAdd`/`RedLifeSet` write through the
root/team LifeShare bank while keeping the Helper-local red-life pool
immutable. The route is observable through the same controller and operation
telemetry used by the Life/Power contract.

## Source decision

The pinned Ikemen-GO `char.go` resource model keeps red life on the fighter
resource path; the port therefore treats a Helper write as team-shared only
when the existing `helperResourceShareContractEnabled` and root
`teamLifeShare` policy are both active. This is a bounded extension of
issues 105/107, not a claim of general Helper parity.

Reference: [Ikemen-GO pinned `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go).

## Implemented contract

- `HelperSystem` accepts `redlifeadd` and `redlifeset` on the shared sink and
  exposes an ephemeral red-life expression shadow for chained triggers.
- `PlayableMatchRuntime` admits Helper red-life only through the opt-in team
  LifeShare route, mutates the owning root bank, reconciles reserve roots, and
  leaves the Helper-local value unchanged.
- The plain `RedLife` expression reads the mutable resource/shadow, so an
  imported Helper can observe the accepted value without double mutation.
- `RuntimeTraceGatePresets` and `qa:trace` contain a deterministic imported Tag
  artifact covering add/set, active and reserve roots, telemetry, and local
  immutability.

## Evidence

- Focused Helper, expression-context, PlayableMatchRuntime, and trace-preset
  tests pass (6 targeted tests in the red-life/resource selection run, plus the
  dedicated preset).
- `pnpm qa:trace`: `686/686` artifacts passed (`652` required, `34` optional).
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `git diff --check`: pass.

## Claim ceiling

This closes only the explicit imported Helper red-life LifeShare mutation and
its trace. RedirectID ownership, guard/dizzy choreography, round reset and
persistence, rollback/netplay, Helper bank bindings for every auxiliary
resource, and full IKEMEN parity remain separate work.
