# Issue 207 — Direct HitDef contact EnvShake

- Status: `closed-bounded`
- Lane: `R2 HitDef presentation consequences`
- Priority: `P1`

## Objective

Carry direct HitDef and live `ModifyHitDef` `envshake.time/freq/ampl/phase`
through an accepted unguarded hit and emit it through the existing runtime
camera-shake system.

## Source gate

M.U.G.E.N 1.1 documents contact `envshake.time`, `envshake.freq`,
`envshake.ampl`, and `envshake.phase` inside HitDef. Pinned Ikemen GO also
compiles `envshake.mul` and `envshake.dir`, and applies the payload only inside
the successful-hit branch when `time > 0`.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:260-267`
- pinned Ikemen `hitDefSub` contact EnvShake parameters
- pinned Ikemen accepted-contact EnvShake path at `char.go:11566-11577`

## Acceptance fixture

- Compile and resolve direct HitDef `time`, `freq`, `ampl`, `phase`, `mul`, and
  `dir` in root and Helper caller contexts.
- Let root or redirected `ModifyHitDef` replace only supplied live fields.
- Emit the payload through the existing camera-shake world after an accepted
  unguarded direct hit. Guard and rejected contact must not emit it.
- Keep the already supported Projectile EnvShake path unchanged.
- Add one required imported direct-HitDef trace.

## Claim ceiling

Do not claim guarded-contact EnvShake, ReversalDef, `ModifyProjectile` changes,
exact local-coordinate amplitude truncation, `diradd`, `decay`, hitpause/tick
order, teams, rollback, or full camera parity.

## Closeout evidence

- Typed static and caller-context dynamic fields pass for root/Helper HitDef
  and root or redirected `ModifyHitDef`.
- Accepted unguarded direct hits emit through the existing camera-shake event
  path. Guard does not emit.
- Required artifact `synthetic-imported-hitdef-contact-envshake` passes with
  trace checksum `46bdbe87` and records time 14, frequency 72, amplitude -11,
  and phase 30 from the direct HitDef caller.
- `pnpm qa:trace` passes 705/705 (671 required, 34 optional).
- The full suite passes 3531/3589 with the same 58 inherited retired-roster
  failures. Focused coverage passes 290/290; typecheck, the 363-module build,
  boundaries, redirected-target boundaries, and diff hygiene pass.
