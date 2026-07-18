# Common1 repeated-fall recovery research

## Question

Which repeated-fall behavior can be promoted from the pinned IKEMEN source
without conflating the current controller-bound `fallCount` with complete
Common1 or generic hitflag parity?

## Primary source evidence

- The pinned [IKEMEN GO character loop](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L12122-L12143)
  sets `hittmp` from the fall flag, then in Common1 states `5070` and `5100`
  applies fall defense, increments `fallcount` unless `NoFallCount`, and for a
  second `5100` fall halves positive `down_recovertime`.
- The same block installs the first `HitBy` slot as a deny-all `SCA` window
  for `180` ticks when the shortened down-recovery timer is `<= 10`. IKEMEN's
  comment notes that MUGEN uses an infinite duration, so this tranche adopts
  the pinned IKEMEN finite value and does not claim exact MUGEN duration parity.
- The pinned [IKEMEN Common1 ZSS source](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/data/common1.cns.zss#L739-L767)
  places `HitFallDamage` at state `5100` time `3`, after the state-entry
  mechanics at time `1`. That ordering is the reason the counter cannot remain
  exclusively inside `HitFallDamage` if the runtime is to expose the same
  `GetHitVar(fallcount)` timing boundary.
- The [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html#NotHitBy)
  documents `NotHitBy` as a timed hit-eligibility controller. The repository's
  typed `HitBy`/`NotHitBy` runtime already owns the corresponding deny/allow
  admission and finite-slot expiry.

## Repository boundary

The runtime currently increments `RuntimeHitFall.fallCount` inside
`HitFallControllerSystem.applyHitFallDamage` when state `5100` executes
`HitFallDamage`. `RuntimeRecoverySystem.applyCommon1FallDefenseUp` already runs
after active controllers on state entry, has access to canonical `[Data]` fall
constants, and is the existing Common1 boundary for `NoFallDefenceUp`.
`RuntimeHitEligibilitySystem` ticks finite `HitBy` slots before the next actor
advance, so a slot installed on the current state-entry pass survives the
current frame and expires deterministically.

## Decision for T259

Extend the imported-root Common1 recovery boundary to perform the per-entry
fall mechanics at `stateElapsed = 1`:

1. Count the entry unless `NoFallCount` is asserted, using a per-entry marker.
2. On the second counted `5100` entry, ensure a configured/default down
   recovery timer, halve it, and install `deny SCA / 180` when the result is at
   most `10`.
3. Keep `HitFallDamage` as a compatibility fallback for isolated callers and
   avoid double counting when the state-entry boundary already marked the
   entry.

This keeps the change root-owned and source-backed while reusing existing
typed eligibility semantics. It deliberately does not add the upstream
`acttmp` predicate or generic `F` hitflag admission; those require a separate
phase/ownership decision.

## Uncertainty and non-claims

- The runtime has no complete upstream `acttmp`/`hittmp` model, so the entry
  predicate is bounded to imported roots in the current Common1 state route.
- `HitBy` slot 1 replacement follows the pinned IKEMEN behavior and preserves
  slot 2, but exact authored-slot conflict timing is not claimed.
- The finite `180` tick window is IKEMEN-style; MUGEN's infinite-duration note
  remains outside this slice.
- Helpers, projectiles, custom states, ZSS/Lua execution, rollback/netplay,
  browser presentation, and full MUGEN/IKEMEN parity remain outside scope.

## Implementation outcome

The bounded state-entry mechanics were implemented in `33ead1f9`. A follow-up
fix in `9a47e635` preserves an earlier legacy `HitFallDamage` count so the same
Common1 entry is not replayed as a second fall. Focused and full runtime gates
remain green, and the claim ceiling above is unchanged.
