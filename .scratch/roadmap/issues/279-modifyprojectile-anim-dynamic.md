# T705 — ModifyProjectile `projanim` dinámico

## Status

`closed-bounded` — implementation, required trace, and aggregate QA pass.

## Goal

Port the bounded Ikemen-GO `ModifyProjectile projanim` path for root-owned
active Projectiles. Preserve the authored expression in the typed controller
operation. Resolve it once in the original caller context. Replace the selected
Projectile AIR action through the existing action lookup and reset its playback
cursor.

## Official reference

- Ikemen-GO pin `149402fa`:
  - `src/compiler_functions.go:2513-2517` compiles `projanim` as one `VT_Int`
    expression.
  - `src/bytecode.go:8650-8662` evaluates the value once in the caller and
    broadcasts it to selected Projectiles. It refreshes `p.anim` after the
    replacement.
  - `src/bytecode.go:3960-3962` exposes the resulting action number through
    `ProjVar(projanim)`.
- M.U.G.E.N 1.1 has no `ModifyProjectile` controller. This is an Ikemen-only
  compatibility claim.

## Local contract

Allowed:

- Root-owned active Projectiles selected by the existing `id`/`index` path.
- Static or dynamic one-value `projanim`.
- Caller-context evaluation with finite integer truncation.
- Existing AIR lookup, action replacement, frame reset, lifecycle, ownership,
  target, and `ProjVar(projanim)` telemetry.
- Omitted `projanim` keeps the current action.

Blocked:

- FFX prefixes and exact `anim_ffx` semantics.
- Negative/overflow warning parity and exact invalid-action removal timing.
- Helper-owned mutation, multi-projectile broadcast order, terminal playback,
  team topology, rollback, and complete Projectile parity.

## Evidence required

1. Compiler test: static, dynamic, malformed, and three-component rejection.
2. Runtime test: caller variable resolves once and selected action resets.
3. Required root trace: spawn action A, execute `ModifyProjectile` with a
   caller variable, observe action B and `ProjVar(projanim)=B`, and prove
   selection, active lifecycle, owner, and target payload.
4. Closeout gates: focused tests, `pnpm typecheck`, `pnpm qa:trace`, full
   `pnpm test`, `pnpm build`, and `git diff --check`.

## Closeout

Required trace `synthetic-imported-modifyprojectile-dynamic-anim.json` passes
with checksum `ed1f6e8a` / final `43956cf2`; it proves root ownership,
caller-context `var(0)` evaluation, AIR action replacement/reset, `ProjVar`
readback, and spawn/active/remove lifecycle. Focused compiler/spawn coverage
is `162/162`; `pnpm typecheck`, `pnpm qa:trace` (`790/790`, `756` required,
`34` optional), and `git diff --check` pass. The implementation is
closed-bounded to root-owned live Projectiles and existing AIR action lookup.
FFX prefixes, exact invalid-action and negative/overflow behavior,
Helper-owned mutation, broadcast order, terminal playback, teams, rollback,
and full Projectile parity remain blocked. Do not claim full MUGEN or Ikemen
parity.
