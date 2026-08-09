# T694 — Helper-owned fresh Projectile `down.hittime`

Status: closed-bounded (2026-08-09)

## Scope

Close the Helper-owned fresh Projectile `down.hittime` caller-context seam
without claiming live `ModifyProjectile`, non-zero down launch, or exact
countdown/landing parity.

## Contract

- Helper `Var(0)=17` resolves once when the fresh Projectile is spawned.
- Accepted lying-target contact exposes `GetHitVar(hittime)=17`.
- Helper, root, parent, Projectile payload, lifecycle, and target links remain
  observable in the trace.
- Omitted/invalid values, live `ModifyProjectile`, non-zero down launch,
  negative/overflow values, exact timer tick order, teams, rollback, and full
  Projectile parity remain outside the claim.

## Evidence

- Required trace: `synthetic-imported-helper-projectile-dynamic-down-hittime`.
- Trace checksum: `258bc45a`.
- Final checksum: `bd70be12`.
- `pnpm qa:trace`: `769/769` artifacts (`735` required, `34` optional).
- Focused gate: `1/1`.
- Full suite: `3794/3794` tests across `328` files.
- Typecheck, build, and `git diff --check`: pass.

## Next queue

T695 maps the next unclaimed Projectile/Helper timing parameter against the
pinned Ikemen source before implementation. Live `ModifyProjectile` timing is
not assumed supported merely because fresh Projectile timing is now covered.
