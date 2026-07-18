# Imported HitFlag default provenance research

## Question

Which omitted `HitDef.hitflag` default can be restored at the imported-source
boundary without widening the sandbox's existing demo and synthetic contracts?

## Primary source evidence

- The [Elecbyte HitDef reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  documents the `H/L/A/M/F/D` and `+/-` HitFlag tokens and states that an
  omitted HitFlag defaults to `MAF`.
- The [Elecbyte Projectile reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  says Projectile takes HitDef parameters. This confirms that projectile
  default inference is related, but it remains separate from this direct/Helper
  tranche because T263 deliberately preserved omitted projectile state.
- The pinned [IKEMEN HitDef initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go)
  establishes the upstream nested HitDef default path; the repository keeps
  the pinned revision in `.scratch/external/Ikemen-GO`.

## Local ownership audit

- `createImportedFighterDefinition` already owns the imported source boundary
  and builds `stateMoves` from authored state HitDefs.
- `RuntimeStateEntryRouteWorld` can select an imported `stateMove`, but active
  `ChangeState` dispatch enters states without a move payload. Therefore a
  state-map-only patch would leave `HitDefSystem` with no default on that path.
- `RuntimeHitDefControllerDispatchWorld` currently resolves
  `operation.hitFlag`, raw `hitflag`, then the existing move field. It has no
  source-scoped default input.
- Direct PlayableMatchRuntime dispatch has `actor.definition.source`, while
  Helper advancement is created from the owning root's effect lifecycle
  options. Those are the two narrow provenance boundaries available without
  changing synthetic actors globally.
- Existing direct-admission tests deliberately use omitted `hitFlag` as an
  unrestricted synthetic field. A global `MAF` fallback would silently change
  those tests and the demo sandbox.

## Decision for T264

1. Add one optional `defaultHitFlag` dispatch field.
2. Use `MAF` only for `source: "imported"` direct and Helper HitDef routes.
3. Resolve authored/static and raw fields before the source default; retain the
   existing fallback only for legacy/demo callers with no source default.
4. Materialize the same value in imported state moves for snapshots and routes
   that already have a move payload.
5. Leave projectile omission, reversal admission, dynamic string evaluation,
   and exact temporal parity out of scope.

## Non-claims

- This is not a claim that every imported attack has a complete authored
  HitDef, nor that fallback demo moves should become source-authored moves.
- It does not prove projectile default inference even though Projectile
  inherits HitDef parameters.
- It does not prove exact IKEMEN `acttmp`/`hittmp`, pause, invulnerability,
  clash, reversal, or custom-state timing.
