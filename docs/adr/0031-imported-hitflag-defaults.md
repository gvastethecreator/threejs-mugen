# ADR 0031: imported HitFlag default provenance

- Status: accepted bounded
- Date: 2026-07-18
- Planning: `08c157d2`
- Implementation: `66c21cac`

## Context

The Elecbyte HitDef contract documents omitted `hitflag` as `MAF`. The
importer already knows whether a fighter came from an imported source, but
omitted fields previously remained undefined on imported state moves and on
runtime dispatch entered through active `ChangeState` paths. A global fallback
would change the intentionally permissive demo and synthetic runtime contract.

## Decision

Use one source-scoped default helper that returns `MAF` only for
`source: "imported"`. Materialize it on imported state moves and pass it
through the existing direct and Helper effect ownership boundaries. Resolve
authored/static/raw HitFlags before the provenance default, then preserve the
legacy existing-field fallback for callers without a source default. Projectile
defaults remain a separate tranche because their spawn boundary and dynamic
string handling are distinct.

## Evidence

- [Elecbyte State Controller Reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  documents the omitted HitDef default.
- [Pinned IKEMEN GO source](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go)
  anchors the upstream HitDef initialization contract.
- Focused verification passes `3` files / `60` tests, TypeScript 7,
  repository boundaries, redirect boundary, and diff hygiene.

## Claim ceiling

This ADR covers imported direct and Helper HitDef omission only. It does not
claim projectile defaults, dynamic expression evaluation, reversal/clash
ordering, exact `acttmp`/`hittmp`, pause/contact timing, or full parity.
