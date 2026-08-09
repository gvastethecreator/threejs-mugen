# Issue 206 — HitDef contact PalFX

- Status: `closed-bounded`
- Lane: `R2 HitDef presentation consequences`
- Priority: `P1`

## Objective

Carry positive-time HitDef, `ModifyHitDef`, and Projectile `palfx.time/add/mul/
color/invertall` payloads through accepted hits and apply them to the
defender's existing runtime PalFX/render state.

## Source gate

M.U.G.E.N 1.1 documents `palfx.time`, `palfx.add`, `palfx.mul`,
`palfx.sinadd`, `palfx.invertall`, and `palfx.color` inside both HitDef and
Projectile. Pinned Ikemen GO classifies these as HitDef parameters and applies
the resulting payload to accepted hit recipients.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:239-258`
- M.U.G.E.N 1.1 `sctrl.projectile.html:326-345`
- pinned Ikemen `hitDefSub`, `isPalFXParam`, and accepted-contact PalFX path

## Acceptance fixture

- Compile and resolve positive `time`, `add`, `mul`, `color`, and `invertall`
  for direct HitDef, live `ModifyHitDef`, and Projectile creation.
- Apply it only after an accepted unguarded hit to the defender; guard does not
  apply contact PalFX in the pinned source.
- Reuse the existing PalFX renderer state; do not create a second effect path.
- Prove no application on whiff, admission reject, or unsupported override.
- Add required trace evidence for defender PalFX state after contact.

## Claim ceiling

Do not claim `sinadd`, `time = -1/0`, ModifyProjectile PalFX, guarded-contact
PalFX, the disputed `mul` 255/256 default, complete blend/color math parity,
exact pause/hitpause timing, teams, rollback, or full contact-presentation
parity.

## Closeout evidence

- Typed compiler/runtime coverage passes for root/Helper HitDef, root or
  redirected `ModifyHitDef`, and root/Helper Projectile creation.
- Accepted direct and Projectile hits apply the resolved payload to the
  defender. Guard leaves the PalFX state unchanged.
- Required artifact `synthetic-imported-hitdef-contact-palfx` passes with trace
  checksum `2227beb9` and records the expected defender PalFX payload.
- `pnpm qa:trace` passes 704/704 (670 required, 34 optional).
- The full suite passes 3528/3586 with the same 58 inherited retired-roster
  failures. Typecheck, the 363-module build, boundaries, redirected-target
  boundaries, and diff hygiene pass.
