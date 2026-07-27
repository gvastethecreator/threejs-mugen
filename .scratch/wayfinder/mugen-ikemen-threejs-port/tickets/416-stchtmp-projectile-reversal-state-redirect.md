# T416 - IKEMEN `stchtmp` Projectile ReversalDef state-redirection admission

Status: resolved bounded in `b07c4e88`.

Question: carry the pending state-change gate into the local Projectile to
active ReversalDef route while preserving projectile lifetime and ownership.

Answer: use a tri-state ReversalDef callback. A pending redirect returns a
dedicated result before normal projectile hit mutation, so the projectile
stays active and its hit budget remains available.

Scope:

- `RuntimeCombatResolutionWorld` checks the active ReversalDef with the
  ReversalDef as source and the projectile owner as getter.
- `ProjectileCombatSystem` continues after a pending redirect without
  setting `hasHit`, consuming hits, applying damage, or applying normal hit
  state.
- Focused tests cover the projectile-level continuation and both redirect
  owners carrying pending state.

Evidence: commit `b07c4e88`; filtered tests passed 2 cases, the focused
runtime batch passed 4 files / 123 tests, `node --check scripts/qa_traces.cjs`
passed, and `git diff --check` passed. The final global trace gate passed 667
artifacts after the separate T417 air-juggle correction.

Research: `docs/research/2026-07-27-ikemen-stchtmp-projectile-reversal-state-redirect.md`.

Out of scope: exact official projectile HitDef source order and `statePN`
mapping, persistent state-owner identity, Helpers, MUGEN, global pause,
target-list transfer, camera, teams, scores, and full parity.
