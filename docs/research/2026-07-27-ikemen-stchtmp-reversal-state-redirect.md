# IKEMEN `stchtmp` ReversalDef state-redirection admission

Date: 2026-07-27

Question: how should the pending state-change gate map onto ReversalDef
`p1stateno`/`p2stateno` when the reverser becomes the source actor?

## Source

The pinned source is commit
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- `hitResultCheck` applies the pending state-change checks before HitOverride
  and state entry. `p1stateno` belongs to the source actor and `p2stateno`
  belongs to the getter:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10072-L10110>
- Player hit detection invokes that result for direct contacts, including the
  ReversalDef branch:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12655-L12705>
- The source stores ReversalDef `p1stateno` and `p2stateno` on the same HitDef
  payload, so the local gate must swap direct input roles when a defender's
  active ReversalDef becomes the source:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L527-L596>

## Findings

For a normal direct HitDef, the local input order already matches source
`p1`/`p2`: attacker is the source and defender is the getter. When the
defender's ReversalDef wins, the active reversal payload changes that order:
the defender becomes the source (`p1`) and the original attacker becomes the
getter (`p2`). ReversalDef clashes use the same source/getter order directly.

The gate must run after contact and depth admission. A pending state change
should reject the custom-state mutation while keeping a spatial miss and a
non-matching clash distinguishable.

## Local contract

`RuntimeCombatResolutionWorld` now applies the shared
`runtimeStateChangeTmpBlocksDirectStateRedirect` predicate to the active
ReversalDef payload before HitOverride or reversal mutation. Its clash result
also exposes `state-change-pending` before `RuntimeReversalWorld.apply` can
change state, targets, hitpause, or power.

`RuntimeRootDirectHitAdmissionWorld` selects the active ReversalDef move and
swaps source/getter runtime roles for direct admission. Reversal clash
admission consumes the reverser payload after contact. Older fixtures without
the optional runtime fields retain their prior behavior.

## Result

Commit `40c297aa` adds the ReversalDef direct and clash gates. Focused
verification passed 3 files / 75 tests, including reverser-owned and
target-owned redirects, direct admission role swapping, clash admission, and
pre-mutation resolution. `node --check scripts/qa_traces.cjs` and
`git diff --check` passed.

`pnpm typecheck` still reports only the known unrelated unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Claim ceiling

Allowed: bounded root direct ReversalDef and ReversalDef-clash admission plus
local state-redirection rejection under `stateChangeTmp`, `hitTmp`, and
`actTmp`.

Blocked: exact state-owner identity and source ordering, Projectile-to-
ReversalDef tri-state routing, Helper routes, MUGEN behavior, global pause,
persistent controller cleanup, camera, teams/clashes beyond this clash gate,
score movement, full state VM parity, and full port parity.
