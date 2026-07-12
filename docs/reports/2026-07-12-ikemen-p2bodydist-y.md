# IKEMEN P2BodyDist Y implementation report

Date: 2026-07-12
Roadmap entry: 455

## Delivered

- IKEMEN signed vertical body-edge gap with overlap zero.
- Cross-localcoord self/P2/output conversion.
- Current S/C/A/L size boxes with Height then OverrideClsn Size composition.
- MUGEN output-context fallback to center-axis `P2Dist Y` semantics.
- EnemyNear/Target redirect geometry with original output policy and scale.
- Missing Size geometry propagation through `NaN` to public `undefined`.
- OverrideClsn Size projection added to `P2BodyDist X`.

## Global status

- Runtime compatibility advances current-opponent spacing and consumes the new Height/OverrideClsn geometry chain.
- Studio/editor and Three.js presentation unchanged.
- Independent review found and closed absent-P2 finite fallback behavior and added state, opponent-modifier, redirect-policy, and missing-P2 coverage.
- Focused verification: 4 files / 28 tests.
- Full verification: 181 files / 1916 tests, TypeScript 7 typecheck/build, boundaries, diff hygiene, and 563/563 traces (532 required, 31 optional).
- Build retains the existing 1,654.09 kB large-chunk advisory.
- Browser smoke is not applicable because no frontend, renderer, Studio, sprite, CSS, or presentation surface changed.

## Remaining debt

Helpers and full team/simul selection, MUGEN bind-position behavior, old-version decimal truncation, exact VM missing-value propagation, late controller ordering, scores, and full MUGEN/IKEMEN spacing parity remain open.
