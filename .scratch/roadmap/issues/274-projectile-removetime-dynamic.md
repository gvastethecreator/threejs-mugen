# T700 — fresh Projectile `projremovetime` dynamic expression

Status: closed-bounded

## Contract

Fresh root- and Helper-authored Projectiles now retain a typed
`projremovetime` expression. The expression resolves once in the original
caller context, truncates to the existing bounded Projectile-time domain, and
is stored in the fresh Projectile payload. Root and Helper Projectiles both
complete the timeout removal lifecycle while preserving root/Helper/parent
ownership. Static values and the existing unresolved fallback remain intact.

## Source mapping

- M.U.G.E.N 1.1: `sctrls.html:2474-2477` documents `projremovetime` as an
  integer with default `-1`.
- Ikemen GO pin `149402f`: `compiler_functions.go:2379-2380` compiles one
  integer expression; `bytecode.go:8098-8099` evaluates fresh Projectiles in
  the caller context; `char.go:2490,2561-2563,2819-2821` stores the default,
  removes on timeout, and decrements the live timer.
- Ikemen `ModifyProjectile` already has a separate live mutation path around
  `bytecode.go:8451-8455`; it is intentionally outside this fresh-spawn cut.

## Evidence

- Aggregate QA: `781/781` artifacts, `747` required, `34` optional, zero
  failures.
- Root trace: `synthetic-imported-projectile-dynamic-removetime`, checksum
  `63ef5373`, final `2824a6bb`; `var(0)=6` resolves to a Projectile payload
  with timeout removal and terminal removal animation.
- Helper trace: `synthetic-imported-helper-projectile-dynamic-removetime`,
  checksum `c35241e4`, final `23b1bac3`; `var(0)=6` resolves in Helper caller
  context, preserves root/Helper/parent ownership, records the timeout value,
  and emits the Helper Projectile remove lifecycle event.
- Full Vitest passes `3815/3815` across `328` files with one worker;
  typecheck, the `363`-module production build, and diff hygiene pass.

## Boundaries

Live `ModifyProjectile` mutation, exact terminal animation/tick preemption,
bounds-removal ordering, negative/overflow values, nested helper/team
topology, rollback, and full Projectile lifecycle parity remain unclaimed.
The claim is limited to fresh root/Helper caller-context resolution and the
bounded timeout removal seam.
