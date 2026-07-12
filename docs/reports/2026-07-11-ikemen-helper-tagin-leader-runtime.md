# IKEMEN Helper-relative TagIn Leader Runtime Report

Date: 2026-07-11  
Scope: Wayfinder 088  
Runtime profile: explicit `ikemen-go` Tag mode

## Delivered

- Static and deferred TagIn `leader` execute against a live Helper RedirectID.
- Leader expressions remain original-root-caller-owned and truncate toward zero through the shared source-ordered resolver.
- The Helper's exact root anchors team side; stable same-side PlayerNo selects the leader root.
- Helper and optional partner targets prevalidate before mutation.
- Mutation order is Helper state/control, root leader rotation, Helper self standby, then partner-root standby/state/control.
- Existing Tag order rotation preserves stable slots, sinks dead non-leaders, updates leader/member order, and remains reset-deterministic.
- Static/dynamic Helper `memberno` remains blocked.

## Evidence

- Focused: 2 files / 174 tests.
- Full: 170 files / 1730 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,591.07 kB for the main JS chunk.
- Trace compatibility: 538/538 passed, including 507 required and 31 optional artifacts.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed before documentation closeout.
- Browser smoke: N/A; no renderer, Studio, CSS, sprite, or visible presentation path changed.

## Adversarial Audit

- Checked static/dynamic caller ownership, full Helper/self/partner composition, opposing and missing leaders, non-Tag mode, stable slots, atomic rollback, and member-axis isolation.
- Rotation reuses the established Tag order owner; no parallel leader state was introduced.
- Independent review was omitted because no authorized independent agent was available; hostile integration cases plus full gates provide the closing proof.

## Quality Record

Task state: completed  
Artifact verdict: win against Wayfinder 088 acceptance  
Verification state: verified  
Deferred: Helper `memberno`, exact incremental partial failure, Helper-originated Tag, gameplay/round/resource ownership, and full parity
