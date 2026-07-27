# T413 - IKEMEN `stchtmp` materialization

Status: resolved bounded in `c7214b50`.

Question: carry the source pending state-change flag into the root runtime and
the Projectile admission path.

Answer: add optional typed `stateChangeTmp`, mark it from root state entry,
settle it immediately outside hitpause, retain it through hitpause, and reject
the source get-hit/active-action Projectile case before HitOverride and damage.

Scope:

- `RuntimeStateChangeTmpWorld` owns the marker lifetime and combined predicate.
- `RuntimeStateEntryWorld` marks state changes and uses the actor hitpause value
  to settle ordinary entries.
- `RuntimeFighterAdvanceWorld` settles the root marker after state and recovery
  work.
- `RuntimeProjectileCombatWorld` consumes the marker with `hitTmp` and
  `actTmp`.

Out of scope: Helpers, MUGEN, direct contacts, full `stateChange2` cleanup,
persistent controllers, global pause, camera, teams, scores, and full parity.

Evidence: 5 focused files / 60 tests passed; the selected PlayableMatchRuntime
smoke passed 2 tests with 318 filtered; `node --check scripts/qa_traces.cjs`
and `git diff --check` passed. The global typecheck was deferred by the batch
policy; the known pre-existing unused `advanced` remains at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`.

Research: `docs/research/2026-07-27-ikemen-stchtmp-materialization.md`.
