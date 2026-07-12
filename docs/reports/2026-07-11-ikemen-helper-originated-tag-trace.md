# IKEMEN Helper-originated Tag Trace Report

Date: 2026-07-11
Scope: Wayfinder 092
Runtime profile: explicit `ikemen-go`

## Delivered

- Added required `synthetic-imported-ikemen-helper-self-tag` through the public runtime trace harness.
- The synthetic imported Helper spawns a parented Projectile, executes default-self TagOut, executes default-self TagIn on the following frame, then continues CNS into state `1283`.
- Actor-frame evidence now exposes Helper team standby and counts effective-control enabled/disabled frames without changing the historical grouping of unrelated traces.
- The gate requires concrete `TagOut`, `TagIn`, and `Projectile` controller telemetry plus `team-standby:tagout`, `team-standby:tagin`, and `projectile` operation telemetry.
- Literal trace checksum `08014285` and frame checksums `17bffcaa`, `750da07e`, `6cde1d19`, and `910fa3f3` own the expected behavior.

## Source Basis

- Pinned IKEMEN Tag compilation/runtime order: [bytecode.go at 05b7d98](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5398).
- Pinned Tag order/standby behavior: [char.go at 05b7d98](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6113-L6250).
- Public controller reference: [IKEMEN TagIn documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin).

## Evidence

- Focused trace suite: 3 files / 557 tests.
- Full suite: 170 files / 1749 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,594.61 kB for the main JS chunk.
- Trace compatibility: 539/539 passed, including 508 required and 31 optional artifacts.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed after documentation closeout.
- Browser smoke: N/A; no renderer, Studio, CSS, sprite, or visible presentation path changed.

## Adversarial Audit

- The first evidence model partitioned actor frames by effective control. That reduced a historical KFM air-guard `minFrames` bucket and failed the full trace matrix. Effective control is now counted inside standby-delimited buckets, preserving prior evidence semantics.
- The first count-aware sorting key changed which equivalent AssertSpecial actor frame appeared first. Counts were removed from identity/order because they are evidence, not frame identity.
- The final required artifact proves standby suppression, control restoration, CNS continuation, and Projectile survival together; no test reimplements Tag runtime logic.
- Independent review was omitted because no authorized independent agent was available. Internal adversary, trace-contract, regression, and simplifier passes plus all gates provide current proof.

## Quality Record

Task state: completed
Artifact verdict: win against Wayfinder 092 acceptance
Verification state: verified
Deferred: Helper-originated RedirectID/aggregate axes, active-root gameplay, incoming Helper breadth, exact incremental failure, score movement, and full parity

Claim allowed: required `synthetic-imported-ikemen-helper-self-tag` proves one bounded Helper-owned default-self TagOut/TagIn cycle with standby/effective-control transition, continued CNS, and preserved parented Projectile.

Claim blocked: active P3-P8 gameplay ownership, Helper-originated RedirectID/aggregate mutation, incoming Helper combat breadth, exact incremental failure, score movement, and full MUGEN/IKEMEN parity.
