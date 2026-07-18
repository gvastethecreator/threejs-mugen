# Ticket 264: imported HitFlag default provenance

- Status: resolved bounded
- Date: 2026-07-18
- Scope: omitted `HitDef.hitflag` default `MAF` for imported direct and Helper
  controller dispatch
- Depends on: T260/T261/T262 shared admission, T263 explicit projectile
  transport, and existing imported source identity
- Research: [`docs/research/2026-07-18-imported-hitflag-defaults.md`](../../../../docs/research/2026-07-18-imported-hitflag-defaults.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`
- Planning commit: `08c157d2`
- Implementation commit: `66c21cac`
- ADR: [`docs/adr/0031-imported-hitflag-defaults.md`](../../../../docs/adr/0031-imported-hitflag-defaults.md)
- Closeout report: [`docs/reports/2026-07-18-imported-hitflag-defaults-closeout.md`](../../../../docs/reports/2026-07-18-imported-hitflag-defaults-closeout.md)

## Question

How can the sandbox restore the source-backed omitted `HitDef.hitflag` default
without changing the intentionally permissive behavior of demo actors and
synthetic runtime unit actors?

## Repository audit

- The Elecbyte HitDef reference documents omitted `hitflag` as `MAF`; the
  Projectile reference inherits HitDef parameters, but projectile defaults are
  intentionally a separate follow-up after T263.
- `createImportedFighterDefinition.buildStateMoves` currently copies an
  omitted authored value as `undefined`, even though the source identity is
  already `source: "imported"`.
- Active `ChangeState` dispatch enters a state without a `DemoMove`, so fixing
  only the imported `stateMoves` map would miss runtime `HitDef` activation.
- Direct PlayableMatchRuntime actors already expose the definition source;
  Helper advancement already receives the owning root context at the effect
  lifecycle boundary.
- Existing demo/synthetic tests intentionally assert that an omitted field
  remains unrestricted. A global fallback would be a compatibility regression
  in this repository's test and fixture contract.

## Bounded contract

1. Materialize `MAF` for imported state moves whose authored HitDef omits the
   field.
2. Carry an optional source-scoped default into direct HitDef dispatch.
3. Carry the same default through the Helper effect context and use it only
   when the Helper HitDef omits the field.
4. Preserve authored/static and raw values ahead of the source default.
5. Leave demo, synthetic, projectile, reversal, and dynamic string behavior
   outside this tranche unless an explicit value already exists.

## Acceptance evidence

- Imported state-move tests prove omitted `hitflag` becomes `MAF` and explicit
  values remain unchanged.
- HitDef dispatch tests prove source default precedence and legacy omission
  compatibility.
- Helper advancement tests prove the root-provided default reaches Helper
  HitDef state execution.
- Focused runtime tests, TypeScript 7, boundaries, trace QA, and diff hygiene
  will run at the next grouped checkpoint.
- Browser smoke is expected to be N/A because no visible renderer or Studio
  surface changes.

## Implementation outcome

- Imported state moves now materialize `MAF` for omitted `HitDef.hitflag`.
- Direct and Helper dispatch receive the default only from an imported fighter
  source; authored/static/raw values retain precedence.
- Demo and synthetic callers keep their previous omitted-field behavior.
- Focused verification passes `3` files / `60` tests, TypeScript 7,
  repository boundaries, redirect boundary, and diff hygiene.
- Full suite and trace QA are intentionally grouped with the next runtime
  tranche; browser smoke is N/A because no visible renderer or Studio surface
  changed.

## Claim ceiling

This ticket only restores imported direct/Helper HitDef default provenance. It
does not close projectile default inference, dynamic string expressions,
reversal/clash ordering, exact `acttmp`/`hittmp`, pause/contact timing, or full
MUGEN/IKEMEN parity.
