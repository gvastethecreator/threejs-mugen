# IKEMEN Helper-relative Partner Tag Runtime Report

Date: 2026-07-11  
Scope: Wayfinder 087  
Runtime profile: explicit `ikemen-go`

## Delivered

- TagIn/TagOut can redirect to a live Helper and select a same-side root partner relative to the Helper's exact `rootId` anchor.
- Static and deferred partner identity/state/control evaluate once in original-caller source order.
- The compiler now admits source-valid combined caller `stateno` plus `partner`; Helper-local and partner-root state/control/self can compose in one typed operation.
- Helper state/control and optional self standby apply before partner-root standby/state/control.
- Missing Helper root, missing/disabled partner, invalid expression, and unavailable Helper or partner state fail before every mutation and success telemetry.
- Static/dynamic `memberno` and `leader` remain blocked.

## Evidence

- Focused: 3 files / 211 tests.
- Full: 170 files / 1727 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,590.45 kB for the main JS chunk.
- Trace compatibility: 538/538 passed, including 507 required and 31 optional artifacts.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed before documentation closeout.
- Browser smoke: N/A; no renderer, Studio, CSS, sprite, or visible presentation path changed.

## Adversarial Audit

- Checked cross-root fallback, absent partner, unavailable partner state, dynamic caller ownership, post-state control precedence, order-axis blocking, and rollback telemetry.
- The audit found and closed one compiler debt: the old partner-plus-caller-state prohibition contradicted pinned source and blocked the intended composition.
- Independent review was omitted because no authorized independent agent was available; focused hostile tests and full gates provide the closing proof.

## Quality Record

Task state: completed  
Artifact verdict: win against Wayfinder 087 acceptance  
Verification state: verified  
Deferred: Helper leader/member order, exact incremental partial failure, Helper-originated Tag, gameplay/round/resource ownership, and full parity
