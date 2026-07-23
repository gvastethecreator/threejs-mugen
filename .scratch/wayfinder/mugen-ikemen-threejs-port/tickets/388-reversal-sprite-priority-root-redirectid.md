# T388 Reversal Sprite Priority Root RedirectID

Type: task

Status: resolved in `b245afb0`

Follow-up: T389 `188c4462` closes bounded direct `missonoverride` arbitration.
Projectile/Helper routes and wider HitOverride parity remain separate.

## Question

Can static `p1sprpriority` and `p2sprpriority` on ReversalDef and root
ModifyReversalDef RedirectID reach the accepted reversal contact through the
same profile-aware priority policy used by direct HitDef contact?

## Source evidence

- Pinned [IKEMEN ReversalDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
  lowers inherited HitDef fields through the ReversalDef path.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
  delegates ReversalDef fields to the HitDef implementation.
- Pinned [IKEMEN ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  writes inherited HitDef fields to an already-active reversal.
- Pinned [IKEMEN accepted-contact priorities](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10823-L10850)
  applies `p1sprpriority` to the source and `p2sprpriority` to the target
  after an accepted HitDef-family contact.
- Pinned [IKEMEN HitOverride arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10765-L10770)
  shows why `missonoverride` needs an active HitOverride query before a
  ReversalDef can claim that behavior.

## Local finding

Direct HitDef contact already uses `HitDefPriorityPolicy` to apply authored
priority values and retain actor-frame provenance. ReversalDef stores its
active payload as a `DemoMove`, so it can use the same policy after a counter
is accepted. The local direct combat resolver chooses reversal before its
HitOverride path, and `RuntimeReversalWorld` has no HitOverride query. That
blocks `missonoverride` from this cut.

## Candidate contract

Under explicit `ikemen-go`, static ReversalDef and root ModifyReversalDef
RedirectID accept integer `p1sprpriority` and `p2sprpriority`. A successful
reversal applies the current shared authored-priority policy, where the
reverser is the `p1` role and the incoming attacker is the `p2` role. Redirect
mutation keeps the active reversal object and its contact state.

## In scope

- Static `p1sprpriority` and `p2sprpriority` on ReversalDef activation.
- Static root ModifyReversalDef RedirectID mutation on one verified active
  root reversal.
- Shared accepted-HitDef priority application and actor-frame provenance.
- Compiler, ReversalSystem, imported match, and required trace evidence.

## Out of scope

Dynamic values, `SprPriority` aliases, omitted IKEMEN default-policy claims,
Helpers as RedirectID receivers, HitOverride or `missonoverride` arbitration,
renderer draw order, teams, source scheduling, rollback, and full
MUGEN/IKEMEN parity.

## Result

`HitDefSpritePrioritySystem` now owns the shared accepted-contact application
used by direct HitDef and ReversalDef. Typed ReversalDef and
ModifyReversalDef operations retain static priorities. Active mutation updates
the same move and reversal metadata. A successful counter applies the latest
values with current profile, source role, previous value, and supported/source
provenance.

## Verification

- Focused compiler, reversal, playable-match, trace, and DirectCombat coverage
  passes 5 files / 1052 tests.
- `pnpm typecheck`, `node --check scripts/qa_traces.cjs`, and diff hygiene
  pass.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-sprite-priority-redirect`
  changes an active receiver from `4/-3` to `5/-4` before counter contact and
  proves both final priorities with authored provenance.
- Full Vitest, trace aggregate, build, and boundary checks remain for the next
  grouped runtime checkpoint.
