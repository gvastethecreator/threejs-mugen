# IKEMEN OverrideClsn implementation report

Date: 2026-07-12
Roadmap entry: 454

## Delivered

- Typed static and dynamic `OverrideClsn` controller route for groups None/Clsn1/Clsn2/Size.
- Ordered normalize, replace-all, replace-index, append, delete-index, delete-all, and clear-all behavior.
- Root RedirectID and caller-to-target localcoord scaling.
- Per-frame reset before normal/pause/hitpause branch selection.
- Clsn1/Clsn2 snapshot and collision projection plus group-3 PlayerPush size geometry.
- Active-motion Tag root capability without widening combat/effects/round/resources ownership.

## Global status

- Runtime port: collision geometry gains one IKEMEN controller and shared projection primitive.
- Studio/editor: unchanged.
- Three.js: snapshot Clsn1/Clsn2 consumers receive projected boxes; no renderer layout/material surface changed.
- QA/docs: source contract, registry, architecture, roadmap ledger, focused/full tests, trace gate, and adversarial review form the closeout.

## Remaining debt

Exact Clsn1-after-HitDef/ReversalDef ordering, helpers, proxies, transforms, projectiles, broad redirects, collision triggers, renderer debug parity, scores, and full MUGEN/IKEMEN parity remain open.

## Verification

- Focused: 8 files / 302 tests.
- Full: 181 files / 1909 tests.
- TypeScript 7 typecheck, production build, architecture boundaries, and `git diff --check`: passed. Build retains the existing large-chunk advisory.
- Trace gate: 563/563 artifacts, 532 required and 31 optional, no checksum drift.
- Independent review found two P2 defects: synthetic no-frame Clsn2 replacement and loss of additional AIR Clsn1 boxes during active moves. Both were fixed with regression tests. Its P3 documentation finding expanded late-order debt to ReversalDef.
- Browser smoke: N/A; no Studio, CSS, layout, or material surface changed. Collision snapshot behavior is runtime-tested.
