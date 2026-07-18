# Common1 NoFallCount research

## Question

What is the smallest source-backed implementation for IKEMEN's
`AssertSpecial, NoFallCount` flag given that this repository already exposes a
bounded Common1 `fallCount` path?

## Primary source evidence

- The pinned [IKEMEN GO character source](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go)
  defines `ASF_nofallcount` and checks it in the Common1 fall-mechanics block
  for states `5070` and `5100` before incrementing `fallcount`.
- The same source keeps the broader repeated-fall behavior nearby: the
  `fallcount > 1` branch can shorten down recovery and establish temporary
  hit rejection. Those effects are intentionally not part of this slice.
- The local official KFM fixture at `.scratch/fixtures/kfm-official.zip`
  contains Common1 fall states and is already used by the repository's
  `GetHitVar(fallcount)` and recovery evidence. It provides provenance for the
  existing counter, not a claim that the complete IKEMEN fall loop is ported.

## Repository boundary

`HitFallControllerSystem` currently increments `RuntimeHitFall.fallCount` once
when `HitFallDamage` executes in state `5100`, guarded by
`fallCountedGroundImpact`. `RuntimeHitVarSystem` already exposes that value as
`GetHitVar(fallcount)`. The missing contract is only the typed flag that skips
that bounded increment.

## Decision for T258

Add `noFallCount` to `RuntimeAssertSpecial`, normalize the flag in
`StateControllerExecutor`, and pass the active flag into the existing
Common1 ground-impact counter. With the flag active, the controller preserves
fall damage and all other hit-fall metadata but does not increment
`fallCount`. Without the flag, the current one-shot increment remains
unchanged.

This is deliberately a controller-boundary implementation. It does not move
the counter to the upstream character-loop timing because doing so would also
require a separate ownership decision for `acttmp`, repeated-fall
invulnerability, and the existing synthetic traces.

## Uncertainty and non-claims

- IKEMEN's full state-loop increment occurs beside `fallDefenseMul` and has
  additional `acttmp`/recovery behavior that the current runtime does not
  model.
- No official MUGEN 1.1 equivalent is claimed for this IKEMEN-only flag.
- Helpers, custom states, projectiles, ZSS/Lua, rollback, netplay, and full
  parity remain outside this decision.

## Next action

Implement the typed flag and controller guard, add focused tests, run the
batched gates, and close the ticket only if the existing fall-count traces stay
stable.
