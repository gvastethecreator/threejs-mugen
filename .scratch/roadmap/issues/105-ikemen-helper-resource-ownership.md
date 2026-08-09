# Issue 105 — IKEMEN Helper resource ownership

Status: closed-bounded
Lane: I2 resources
Priority: P1

## Scope

Map Helper `LifeAdd`/`LifeSet`/`PowerAdd`/`PowerSet` and red-life writes to the
root/team resource policy without conflating Helper identity, parent/root
expression ownership, or team `LifeShare`/`PowerShare` banks.

## Current evidence

Helpers execute local resource writes by default. The explicit
`helperResourceShareContractEnabled` path now routes Life/Power and red-life
writes into the root team bank; issue 108 owns the bounded red-life extension.
Existing local traces remain the compatibility baseline when the contract is
disabled.

## Implemented in this slice

- Added `RuntimeHelperResourceOwnershipWorld/v0` as a read-only ownership
  diagnostic.
- Helper resources remain local until a sourced team-share contract exists.
- Helper `RedirectID` and malformed lifecycle identity reject fail-closed.
- Exposed the diagnostic through `RuntimeMatchRoundWorld` without mutating
  resource banks.
- `PlayableMatchRuntime.getHelperResourceOwnershipDiagnostics()` now projects
  live non-destroyed Helpers across life/power/red-life kinds under IKEMEN.
- `RuntimeHelperResourceOwnershipWorld.matrix(...)` now detects duplicate local
  owners per resource kind and rejected Helper routes before any shared-bank
  mutation; a Helper owning life and power is not falsely treated as a conflict.
- `PlayableMatchRuntime.getHelperResourceOwnershipMatrix()` now builds that
  matrix from every live IKEMEN Helper in the active runtime.
- `admitLocalWrite(...)` is the fail-closed mutation gate: only a Helper whose
  owner id is itself can proceed; RedirectID/shared routes are rejected.
- Wired `admitResourceWrite` through `RuntimeEffectLifecycleWorld` into the
  real Helper controller dispatcher. `LifeAdd/LifeSet`, `PowerAdd/PowerSet`,
  and red-life writes now pass the ownership gate before mutating helper state;
  non-resource controllers and redirected target writes retain their existing
  routes.
- Extended `RuntimeAuxiliaryResourceProjection/v0` with Helper/root power and
  `powerMax` values. The projection records actor-local ownership and marks
  team `PowerShare` reconciliation as deferred instead of silently omitting it.
- Added `RuntimeTeamResourceBankWorld.resolveBinding(...)` so runtime callers
  can resolve the effective `life`/`power` owner for a root without mutating
  the bank diagnostic; missing actors fail closed.
- Added `resolveHelperBinding(...)` and the live runtime projection
  `getHelperTeamResourceBindings()`. Helpers remain local when sharing is off;
  when root sharing is enabled they are explicitly `deferred` until a sourced
  Helper-bank contract exists, preventing accidental team-bank mutation.
- `resolveHelperBinding` now has an explicit `contractEnabled` opt-in. Only
  that sourced path returns `shared` with the root bank owner; production
  runtime calls remain `deferred` until the full Helper bank is wired.
- `PlayableMatchRuntimeOptions.helperResourceShareContractEnabled` exposes the
  same opt-in and the bounded sink applies Life/Power writes to the root bank
  without mutating Helper-local resources.
- `MatchWorldOptions` now forwards the same opt-in, making it available to
  application/browser fixtures without reaching into the runtime instance.

## Verification

- Ownership + resource-bank focused tests: 10/10 in the bank slice, plus the
  Helper/Playable shared contract regression (24 focused tests).
- `pnpm typecheck`: pass.
- `pnpm qa:trace`: 685/685 artifacts passed (651 required).
- `git diff --check`: pass.

## Closed-bounded boundary

- Root-local, team-shared, and rejected Helper routes are covered separately.
- RedirectID ownership, score, replacement, rollback/netplay, and full
  auxiliary-resource parity remain outside this bounded slice. The opt-in
  red-life bank mutation is closed separately by issue 108.
