# IKEMEN `stchtmp` Projectile ReversalDef state-redirection admission

Date: 2026-07-27

Question: how far can the pending state-change rule move into the local
Projectile-to-ReversalDef route without claiming full projectile parity?

## Source

The pinned source is commit
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- `hitResultCheck` applies pending state-change checks before HitOverride and
  state entry:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10072-L10110>
- Projectile detection resolves the projectile owner and calls the owner's
  hit-result path with the projectile HitDef payload:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12784-L12939>
- ReversalDef fields and state-number ownership are declared on the HitDef
  payload:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L527-L596>

## Findings

The official projectile route starts from the projectile owner's HitDef and
passes the getter plus projectile payload into `hitResultCheck`. That source
route does not prove the exact local callback role mapping for an active
defender ReversalDef.

The local runtime already had a Projectile contact callback that resolves an
active ReversalDef before normal projectile HitDef damage. T416 carries the
shared pending state-change predicate into that callback. The active
ReversalDef remains the redirect source; the projectile owner remains the
getter for the bounded local predicate.

## Local contract

`RuntimeCombatResolutionWorld` returns a tri-state result from the projectile
ReversalDef callback. A pending redirect logs `via pending state change`,
leaves the projectile active, and skips normal projectile HitDef mutation.
The gate checks both redirect owners before `RuntimeReversalWorld.apply` can
change state, targets, hitpause, or power.

`ProjectileCombatSystem` owns the tri-state continuation so a rejected
ReversalDef does not consume the projectile's hit budget or mark it as hit.

## Verification

Commit `b07c4e88` adds the runtime route and two focused regression cases:
projectile-level active retention and both redirect-owner pending cases.
The named tests passed (`2 passed`, `92 skipped` by filter); the focused
runtime batch passed 4 files / 123 tests. `node --check scripts/qa_traces.cjs`
and `git diff --check` passed.

The later T417 correction restored the first falling-contact air-juggle spend
that the global trace exposed after T416. The final batch `pnpm qa:trace`
passed 667 artifacts: 633 required, 34 optional, and 0 failed.

## Claim ceiling

Allowed: bounded local Projectile-to-active-ReversalDef pending redirect
admission, with projectile retention and no normal hit mutation.

Blocked: exact official projectile HitDef `statePN` and source-owner order,
persistent state-owner identity, Helpers, MUGEN behavior, global pause,
projectile target-list parity, camera, teams, scores, and full port parity.
