# T414 - IKEMEN `stchtmp` direct state-redirection admission

Status: resolved bounded in `4dc23da4`.

Question: carry the pending state-change gate into direct `p1stateno` and
`p2stateno` admission without widening the claim to the full IKEMEN hit VM.

Answer: share a typed `stateChangeTmp` predicate across root admission,
direct resolution, and equal-priority preparation. Target-owned redirects use
the pending marker with positive `hitTmp` or `actTmp`; attacker-owned redirects
use the bounded pending marker or positive `hitTmp` rule. The root diagnostic
checks the gate after spatial contact, and the resolver fails closed before
HitOverride, damage, or bilateral preparation.

Scope:

- `RuntimeStateChangeTmpWorld` owns the target/self redirect predicates.
- `RuntimeRootDirectHitAdmissionWorld` reports `state-change-pending` after
  contact and depth admission.
- `RuntimeCombatResolutionWorld` rejects direct and equal-priority custom-state
  mutations before they can alter targets, life, or state.
- Optional runtime fields preserve legacy handcrafted fixtures.

Evidence: 3 focused files / 70 tests passed; the suite covers both redirect
owners, a no-contact negative case, and equal-priority non-mutation.
`node --check scripts/qa_traces.cjs` and `git diff --check` passed.
`pnpm typecheck` reaches only the known unrelated unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`.

Research: `docs/research/2026-07-27-ikemen-stchtmp-direct-state-redirect.md`.

Out of scope: exact state-owner identity and source ordering, ReversalDef,
Projectile, Helper, MUGEN, global pause, persistent-controller cleanup,
camera, teams, scores, and full parity.
