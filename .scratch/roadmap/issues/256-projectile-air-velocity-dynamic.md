# Issue 256 — fresh Projectile air.velocity dynamic XYZ

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the next fresh-Projectile gap after T680/T681: resolve authored
`air.velocity` X/Y/Z expressions when a Projectile is created by a root actor
or a Helper, then expose the vector through accepted airborne hit physics and
`GetHitVar`.

## Source gate

The pinned Ikemen path compiles up to three `air.velocity` float expressions,
evaluates them in the original caller before Projectile materialization, and
stores the resulting vector on the fresh HitDef. M.U.G.E.N 1.1 documents the
X/Y form and zero defaults; the pinned Ikemen extension carries Z through the
same vector/contact path.

Sources:

- Ikemen `149402f`: `compiler_functions.go:2049-2051`
- Ikemen `149402f`: `bytecode.go:7787-7794,7902-7915,8120-8133`
- Ikemen `149402f`: `char.go:737-741,11027-11029,11192-11194`
- M.U.G.E.N 1.1: `sctrl.hitdef.html` `air.velocity` X/Y and zero defaults;
  Projectile inherits HitDef parameters.

## Bounded acceptance proposal

- Root-authored and Helper-authored fresh Projectiles preserve static
  `air.velocity` behavior and additionally resolve finite dynamic/mixed X/Y/Z
  expressions in caller context.
- A single dynamic component uses the official fresh zero default for omitted
  siblings; a two-component form defaults only Z to zero; a full triple wins
  component-wise.
- Accepted airborne hits expose the resolved XYZ through Projectile physics,
  contact metadata, and `GetHitVar(xvel/yvel/zvel)` evidence.
- Fresh Projectile lifecycle, root/Helper ownership, parent links, target
  memory, and removal behavior stay on the existing seams.

## Explicit exclusions

Live `ModifyProjectile` mutation, dynamic `n` syntax, airguard derivation,
lying/ground selection, exact landing/tick order, localcoord/facing edge cases,
nested/team topology, rollback, and full M.U.G.E.N/Ikemen Projectile parity.

## Next implementation step

Implemented in `68580d34` (`feat(mugen): resolve dynamic projectile air
velocity`) and `9011a38d` (`test(evidence): gate dynamic projectile air
velocity`). Typed compiler fields and root/Helper caller-context resolvers now
support one-, two-, and three-component dynamic/mixed vectors; fresh omitted
components default to zero while static behavior remains unchanged.

Evidence closed-bounded:

- focused compiler/Projectile/Helper tests pass;
- full Vitest suite passes `3751/3751` across `328` files;
- `pnpm typecheck`, `pnpm build`, and `git diff --check` pass;
- `pnpm qa:trace` passes `756/756` artifacts (`722` required, `34`
  optional, `0` failed);
- required root trace
  `synthetic-imported-projectile-dynamic-air-velocity` passes with trace
  checksum `02d2aec0` and final checksum `fb8dd4a0`;
- required Helper trace
  `synthetic-imported-helper-projectile-dynamic-air-velocity` passes with
  trace checksum `306e3c87` and final checksum `0de9b71b`.

The bounded claim covers fresh root/Helper Projectile `air.velocity` XYZ
caller evaluation, zero defaults for omitted dynamic siblings, accepted
airborne hit physics, GetHitVar readback, and root/Helper ownership evidence.
Live ModifyProjectile, dynamic `n`, down/airguard derivation, lying/ground
selection, exact landing/tick parity, nested/team topology, rollback, and full
M.U.G.E.N/Ikemen Projectile parity remain excluded.

Next source-mapped cut: T683 / issue 257, fresh Projectile `down.velocity`
dynamic XYZ and air-velocity inheritance.
