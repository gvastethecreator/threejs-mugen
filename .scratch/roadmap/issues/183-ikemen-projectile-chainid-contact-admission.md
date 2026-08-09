# Issue 183 — Ikemen Projectile ChainID contact admission

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Enforce selected live Projectile `chainid` at contact admission. Static spawn
and bounded dynamic root/helper `ModifyProjectile chainid` values already reach
the live Projectile; contact must now reject a non-negative chain ID unless the
defender's previous `GetHitVar(id)` matches it.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `chainid` as one integer,
lets `ModifyProjectile` replace the selected Projectile HitDef field, and checks
`ghd.chainid >= 0 && target.gethit.hitid != ghd.chainid` before accepting
contact.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub` / `projectileSub`
- `src/bytecode.go`: `hitDef_chainid` and `modifyProjectile.Run`
- `src/char.go`: `Char.HitDef` ChainID check

## Port ledger

| Item | Decision |
| --- | --- |
| Static Projectile `chainid` | retain existing typed field |
| Static/dynamic root/helper ModifyProjectile mutation | retain existing typed mutation |
| Non-negative previous-hit admission | adapt to current `CharacterRuntimeState.hitVars.hitId` |
| Omitted or negative `chainid` | unrestricted |
| Rejected-contact observability | adapt to current Projectile combat log/telemetry seam |
| `nochainid` | defer to a separate source-gated slice |

## Acceptance fixture

- Prove matching previous hit ID accepts contact.
- Prove mismatched or missing previous hit ID rejects contact without damage,
  target memory, or Projectile consumption.
- Prove omitted and negative values remain unrestricted.
- Prove a selected static/dynamic ModifyProjectile change controls later
  admission, including one root and one helper expression route.

## Claim ceiling

Do not claim `nochainid`, exact `targetedBy` or hitshake timing, cross-player
chain ownership, chain/override/reversal priority, or full HitDef chain parity.

## Closure evidence

- Static Projectile `chainid` is normalized onto the live Projectile.
- Selected root/helper ModifyProjectile mutations control later admission.
- Matching previous HitDef IDs accept; missing/mismatched IDs reject without
  damage, target memory, or Projectile consumption.
- Omitted and negative values remain unrestricted.
- Player and helper trace fixtures use a real seed hit ID before the chained
  Projectile contact.
- Focused tests: `150/150`.
- Full suite: `3438/3496`; the same 58 character-package failures are inherited.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (`686/686`), boundaries,
  redirect-boundary, and `git diff --check` pass.
