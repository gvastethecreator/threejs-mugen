# Common1 fall defense-up research

## Question

What is the smallest source-backed Common1 rule that can be implemented in the
Three.js runtime while preserving existing synthetic fixtures and keeping the
parity claim bounded?

## Primary source evidence

- The pinned [IKEMEN GO `Char` implementation](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go)
  initializes `fall.defence_up` to `50`, derives the internal defense factor as
  `(value + 100) / 100`, applies it when entering Common1 state `5070` or
  `5100`, skips it when `AssertSpecial` contains `NoFallDefenceUp`, and resets
  the factor after leaving `Hit`. The local source is pinned at commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3`.
- The official [MUGEN trigger reference](https://www.elecbyte.com/mugendocs/trigger.html)
  documents `data.fall.defence_mul` as the damage-facing inverse of
  `fall.defence_up`: `100 / (f + 100)`. The runtime therefore stores the
  incoming-damage factor at the combat boundary, while the imported constant
  remains the source-facing defense factor.
- The official [MUGEN state-controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  describes Common1's fall defense increase around states `5070`/`5100` and
  restoration around the later recovery states.
- The local official KFM fixture at `.scratch/fixtures/kfm-official.zip`
  contains `data/common1.cns` with comments identifying the special handling
  at `5070`, `5100`, `5120`, `5200`, and `5210`. That fixture is useful for
  source provenance, but this tranche only promotes the transient multiplier
  lifecycle.

## Repository boundary

The runtime already has a synthetic `HitDef` extension named
`hitFall.defenceUp`. It scales only the `HitFallDamage` controller and is used
by existing deterministic traces. It is not the same field as canonical
`[Data] fall.defence_up`; the implementation must preserve that compatibility
path while adding the imported-data path separately.

## Decision for T257

Add an optional transient incoming-damage multiplier to the runtime state.
`RuntimeRecoverySystem` owns its lifecycle, `StateControllerExecutor` exposes
`NoFallDefenceUp`, and `CombatResolver` composes the factor with the existing
base and super-pause defense factors. The promotion is gated on canonical
`data.fall.defence_up` or `data.fall.defence_mul` being present, so synthetic
fixtures without imported `[Data]` do not silently change behavior. The
loader derives `data.fall.defence_mul` only when the source did not provide it.

The application point is the first tick of Common1 state `5070` or `5100`,
after active controllers and before ground/liedown recovery. Repeated calls in
the same fall are prevented by a hit-fall marker; leaving `Hit` clears the
transient state.

## Uncertainty and non-claims

- The full Common1 source merge and exact later-state restoration coverage are
  separate tickets.
- This slice does not implement helper-owned or projectile-owned fall defense,
  ZSS/Lua equivalents, rollback serialization, or exact engine parity.
- The upstream and runtime multiplier naming differs intentionally: upstream
  stores a defense factor, while this runtime's `defenseMultiplier` family is
  damage-facing. Tests must assert the resulting incoming damage, not only the
  stored raw value.

## Next action

Implement the bounded lifecycle, add focused tests for the canonical and legacy
paths, then run the batched runtime/type/build/trace gates and write the
closeout audit.
