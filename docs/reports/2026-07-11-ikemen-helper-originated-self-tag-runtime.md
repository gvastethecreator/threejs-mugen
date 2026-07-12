# IKEMEN Helper-originated Self Tag Runtime Report

Date: 2026-07-11
Scope: Wayfinder 091
Runtime profile: explicit `ikemen-go`

## Delivered

- Unredirected TagIn/TagOut authored by a Helper now reaches an explicit Helper-to-match standby hook.
- Omitted, static, and deferred `self` resolve once in the calling Helper's live context; successful operations are concrete before telemetry.
- True/default self changes only the calling Helper standby flag. False self succeeds as an authored no-op and records execution.
- RedirectID plus partner, state, control, member, and leader payloads fail closed before any match mutation.
- Standby continues Helper CNS, state time, projectiles, identity, snapshots, and presentation while existing effective-control and direct-HitDef filters remain active.
- Match reset now removes stale optional actor fields while preserving actor identity and reattaches every Helper target, telemetry, team-standby, pause, and damage hook.

## Evidence

- Focused: 6 files / 212 tests.
- Full: 170 files / 1748 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,593.97 kB for the main JS chunk.
- Trace compatibility: 538/538 passed, including 507 required and 31 optional artifacts.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed before documentation closeout.
- Browser smoke: N/A; no renderer, Studio, CSS, sprite, or visible presentation path changed.

## Adversarial Audit

- Covered omitted/static/deferred self, true/false TagOut, default TagIn re-entry, same-tick effective control, continued CNS/projectile execution, identity eligibility, telemetry, legacy profile, aggregate payloads, invalid expressions, disabled Helpers, and reset replay.
- The reset replay exposed stale optional fighter state retained by `Object.assign`; content replacement plus complete Helper-hook rebinding closes that recovery defect.
- Inspected active, Pause, SuperPause, and hitpause transport: all Helper advancement paths consume the same lifecycle-generated callback context.
- Strongest remaining objection: the behavior is integration-tested but not yet a required trace artifact. Wayfinder 092 owns that P2 proof gap; runtime semantics do not need widening.
- Independent review was omitted because no authorized independent agent was available; internal adversary, runtime specialist, proof, and simplifier lenses plus full gates provide current proof.

## Quality Record

Task state: completed
Artifact verdict: win against Wayfinder 091 acceptance
Verification state: verified
Deferred: required Tag trace promotion, Helper-originated RedirectID/aggregate axes, active-root gameplay, incoming Helper breadth, exact incremental failure, score movement, and full parity
