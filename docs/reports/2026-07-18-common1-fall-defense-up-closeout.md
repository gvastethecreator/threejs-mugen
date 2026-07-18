# Common1 fall defense-up closeout report

- Date: 2026-07-18
- Ticket: [T257](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/257-common1-fall-defense-up.md)
- Planning commit: `1adebc17`
- Feature commit: `064e2db0`
- ADR: [`0024-common1-fall-defense-up`](../adr/0024-common1-fall-defense-up.md)
- Source note: [`2026-07-18-common1-fall-defense-up`](../research/2026-07-18-common1-fall-defense-up.md)

## Result

The imported root runtime now derives the canonical fall-defense factor from
character `[Data]` values, applies it once in Common1 states `5070` and `5100`
on the bounded first fall tick, honors `NoFallDefenceUp`, composes incoming
damage through the existing defense boundary, and clears the transient factor
when the actor leaves `Hit`. The loader preserves character constants and
derives `data.fall.defence_mul` only when it is absent.

The older synthetic `HitDef`-level `hitFall.defenceUp` route remains unchanged
when no canonical `[Data]` factor is available. This was intentional: it keeps
existing deterministic fixtures stable while the two contracts remain
separately observable.

## Verification

- Focused: `7` files, `56/56` tests passed.
- Full: `230/230` files, `2394/2394` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional).
- `git diff --check`: passed for the implementation and closeout patch.
- Browser smoke: N/A; no visual or Studio surface changed.

The trace runner logs WebSocket port `24678` already occupied by an unrelated
Node process from `D:\DEV\moklos.club`; it does not change the final trace
status.

## Quality audit

- Artifact verdict: better. Canonical `[Data]` fall defense is now distinct
  from synthetic `HitDef` metadata and reaches both direct and fall damage
  scaling through the same incoming boundary.
- Adversarial cases covered: missing canonical data remains legacy-compatible;
  duplicate application is blocked; leaving `Hit` restores the transient
  state; `NoFallDefenceUp` is explicit; character-derived constants are tested.
- Verification state: verified for the bounded runtime contract. Browser gate
  is N/A, not silently green.
- Residual risk: there is no dedicated trace artifact for this new factor yet,
  and exact Common1 source-file timing remains represented by unit/runtime
  ownership rather than a new golden trace.

## Claim boundary

Allowed: imported root Common1 fall defense-up lifecycle, canonical Data
derivation, opt-out handling, incoming-damage composition, and legacy-path
preservation.

Blocked: full Common1 merge, fall-count/invulnerability parity, later-state
restoration choreography, helper/custom-state ownership, ZSS/Lua, rollback,
visual/audio parity, score movement, and full MUGEN/IKEMEN parity.

## Next frontier

Select the next isolated Common1/default-table rule only after a source-pinned
fixture can prove its ownership. Keep fall-count and later restoration as
separate slices so this lifecycle remains auditable.
