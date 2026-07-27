# IKEMEN `stchtmp` direct state-redirection admission

Date: 2026-07-27

Question: which direct `p1stateno`/`p2stateno` admission checks can consume the
pending state-change marker without claiming full `hitResultCheck` parity?

## Source

The pinned source is commit
`4aa0ba38f851c52549ba182310e9e53361cd472a`.

- `hitResultCheck` rejects target-owned `p2stateno` when the getter has a
  pending state change and is in get-hit or active action phase:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10097-L10110>
- The same source rejects attacker-owned `p1stateno` for the source get-hit
  or pending state-owner case:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10097-L10110>
- Later state-change cleanup clears the marker after the active state-change
  work has settled:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10578-L10589>
- The marker lifetime and projectile branch remain anchored by the previous
  `stchtmp` note:
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L6286-L6306>
  and
  <https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L12908-L12920>.

## Findings

The direct source gate is conditional on the authored custom-state redirect.
The target-owned path needs the pending marker plus a positive get-hit or
action phase. The attacker-owned path also depends on state-owner identity in
the source. The local root runtime has no complete state-owner equivalent in
this admission boundary, so the self redirect rule uses the conservative
pending marker or positive explicit `hitTmp` projection.

The check belongs after contact admission. A pending state change must not
turn a spatial miss into a state-change decision. Equal-priority preparation
must use the same predicate before queuing a bilateral mutation.

## Local contract

`RuntimeStateChangeTmpWorld` now exposes one shared
`runtimeStateChangeTmpBlocksDirectStateRedirect` predicate. It maps source
`stchtmp` to optional local `stateChangeTmp`, target `p2stateno` to
`runtimeHitTmpValue`/`actTmp`, and attacker `p1stateno` to the bounded
self-state rule.

`RuntimeRootDirectHitAdmissionWorld` returns `state-change-pending` only after
contact and depth checks. `RuntimeCombatResolutionWorld` applies the same
gate before direct HitOverride/damage and before equal-priority preparation.
Older fixtures without the optional fields keep their prior behavior.

## Result

Commit `4dc23da4` adds the direct root and resolution gates. Focused
verification passed 3 files / 70 tests, including target-owned and
attacker-owned redirects, a spatial-miss negative case, and equal-priority
non-mutation. `node --check scripts/qa_traces.cjs` and `git diff --check`
passed.

`pnpm typecheck` still reports only the known unrelated unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Claim ceiling

Allowed: bounded root direct `p1stateno`/`p2stateno` admission, direct
resolution, and equal-priority preparation under the local `stateChangeTmp`,
`hitTmp`, and `actTmp` fields.

Blocked: exact IKEMEN state-owner identity, full `hitResultCheck` order,
ReversalDef custom-state admission, Projectile and Helper custom-state routes,
MUGEN behavior, global pause, persistent controller cleanup, camera,
teams/clashes, score movement, full state VM parity, and full port parity.
