# Ticket 265: imported Projectile HitFlag default provenance

- Status: planned
- Date: 2026-07-18
- Scope: omitted `Projectile.hitflag` default `MAF` at imported root and Helper
  projectile spawn boundaries
- Depends on: T263 explicit projectile transport and T264 imported direct/Helper
  HitFlag default provenance
- Research: [`docs/research/2026-07-18-imported-projectile-hitflag-defaults.md`](../../../../docs/research/2026-07-18-imported-projectile-hitflag-defaults.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`

## Question

How can Projectile inherit the imported `HitDef` omitted `MAF` default at the
actual root and Helper spawn boundaries without turning dynamic string
expressions or synthetic fixtures into authored values?

## Repository audit

- Elecbyte documents that Projectile takes all HitDef parameters and that an
  omitted HitDef `hitflag` defaults to `MAF`.
- `createRuntimeProjectile` already distinguishes typed/static values from raw
  controller parameters through `staticHitFlag`; a dynamic raw value such as
  `var(0)` must remain unresolved rather than being replaced by `MAF`.
- Root and state-owner projectile creation is centralized in
  `RuntimeEffectSpawnWorld.spawnProjectile`, where the source definition is
  available.
- Helper projectile creation is centralized in
  `spawnRuntimeHelperProjectileActor`; T264 already carries an optional
  `defaultHitFlag` through Helper advancement but the spawn input does not yet
  forward it.
- `ModifyProjectile` omission must preserve the existing live projectile flag;
  it is not a new spawn and is outside default inference.

## Bounded contract

1. Add an optional source-scoped default to `RuntimeProjectileSpawnInput`.
2. Resolve an explicit typed operation HitFlag first, then a static raw
   controller HitFlag, then the source default only when the raw field is
   omitted.
3. Pass the imported default from the root/state-owner effect spawn boundary.
4. Forward the existing Helper default into Helper-origin projectile spawn.
5. Preserve demo/synthetic omission and dynamic raw string behavior.
6. Leave projectile timing, `acttmp`/`hittmp`, reversals, clash policy, and full
   MUGEN/IKEMEN parity outside this tranche.

## Acceptance evidence

- Projectile unit coverage proves imported omission becomes `MAF`, explicit
  static values win, and dynamic raw strings do not silently become `MAF`.
- Effect-spawn coverage proves an imported source reaches root projectile
  creation; Helper coverage proves the existing default reaches Helper spawn.
- Focused runtime tests, TypeScript 7, boundaries, redirect boundary, and diff
  hygiene pass. Full suite, build, and trace QA run at the grouped checkpoint.
- Browser smoke is expected to be N/A because no visible renderer or Studio
  surface changes.

## Claim ceiling

This ticket only restores imported omitted Projectile HitFlag provenance at
spawn. It does not claim dynamic expression evaluation, ModifyProjectile
defaulting, projectile pause/contact timing, reversals/clashes, or complete
MUGEN/IKEMEN parity.
