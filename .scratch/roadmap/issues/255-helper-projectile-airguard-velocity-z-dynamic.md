# Issue 255 — Helper-authored Projectile airguard.velocity dynamic XYZ

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Close the Helper-authored Projectile breadth left outside issue 254. A
Projectile created from a live Helper must resolve dynamic
`airguard.velocity` X/Y/Z in the original Helper caller context, retain the
pinned fresh defaults for omitted components, and expose the final vector on
an accepted airborne guard.

## Source gate

The pinned Ikemen path compiles up to three `airguard.velocity` float
expressions, evaluates them before Projectile ownership is materialized, and
finalizes missing fresh components from `air.velocity`, including the pinned
Z derivation. A Helper-created Projectile is stored under the root player
while retaining its Helper parent identity and later publishes all three
components through guard contact/GetHitVar.

Sources:

- Ikemen `149402f`: `compiler_functions.go:2007-2013`
- Ikemen `149402f`: `bytecode.go:7627-7642,7902-7915,8120-8133`
- Ikemen `149402f`: `char.go:713-717,802-861,7492-7505,10403-10407`
- M.U.G.E.N 1.1 Projectile docs state that Projectile inherits HitDef
  parameters; documented airguard defaults remain X/Y-only.

## Bounded acceptance proposal

- Helper-authored fresh Projectile resolves finite dynamic X/Y/Z values in
  the Helper caller context; omitted fresh components use the pinned
  `air.velocity` defaults.
- The effect remains root-owned with `parentId` identifying the Helper and
  proves spawn/active/remove lifecycle, effect-store payload, and target
  links.
- Accepted airborne Projectile guard exposes the final XYZ through physics
  and `GetHitVar(xvel/yvel/zvel)` evidence.
- Root-authored Projectile, live `ModifyProjectile`, dynamic `n` syntax,
  exact landing timing, nested/team ownership, rollback, and full
  M.U.G.E.N/Ikemen parity remain out of scope.

## Next bounded slice

Implemented the Helper effect-spawn resolver and a required runtime trace.

Closure evidence:

- `src/tests/EffectActorSystem.test.ts` Helper caller-context test passes.
- `src/tests/RuntimeTraceGatePresets.test.ts` dynamic Helper Projectile gate
  passes (`1/1`; global file suite `725/725`).
- `pnpm test`: `3746/3746` tests across `328` files.
- `pnpm typecheck`: pass.
- `pnpm build`: pass (`363` modules; Vite chunk-size warning only).
- `pnpm qa:trace`: `754/754` artifacts (`720` required, `34` optional),
  `0` failures. Required trace
  `synthetic-imported-helper-projectile-dynamic-airguard-velocity.json` has
  trace checksum `741d884e` and final checksum `652a67f0`.
- Commits: `f0e5eeb2` (runtime/tests), `e65b559a` (trace/evidence).

The bounded claim is Helper-authored/root-owned fresh Projectile dynamic
airguard.velocity XYZ in Helper caller context, with VarSet evidence, pinned
fresh defaults, Helper parent/lifecycle/effect-store/target-link evidence, and
accepted airborne guard physics/GetHitVar. Live ModifyProjectile, `n`, nested
or team ownership, exact landing timing, rollback, and full M.U.G.E.N/Ikemen
parity remain excluded.

## Next bounded slice

Source-map T682 for fresh Projectile `air.velocity` dynamic X/Y/Z in root and
Helper caller contexts. Keep live ModifyProjectile, dynamic `n`, and full
Projectile/Helper parity outside that cut.
