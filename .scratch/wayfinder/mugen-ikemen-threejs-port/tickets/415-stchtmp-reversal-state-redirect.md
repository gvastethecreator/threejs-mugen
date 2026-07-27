# T415 - IKEMEN `stchtmp` ReversalDef state-redirection admission

Status: resolved bounded in `40c297aa`.

Question: carry the pending state-change rule into ReversalDef state redirects
and ReversalDef clashes while keeping the source/getter roles explicit.

Answer: use the shared predicate with the active ReversalDef as the source
actor. A defender-side reversal swaps the local direct input roles before the
gate; a ReversalDef clash uses the reverser as source and the getter as target.
Both routes fail closed after contact/depth admission and before state,
target, hitpause, or power mutation.

Scope:

- `RuntimeCombatResolutionWorld` gates active ReversalDef direct contacts.
- ReversalDef clash resolution returns `state-change-pending` before apply.
- `RuntimeRootDirectHitAdmissionWorld` uses the active reversal payload and
  source/getter role mapping for direct and clash diagnostics.
- Optional runtime fields preserve legacy handcrafted fixtures.

Evidence: 3 focused files / 75 tests passed; the suite covers both redirect
owners, direct role swapping, root clash admission, and pre-mutation clash
resolution. `node --check scripts/qa_traces.cjs` and `git diff --check`
passed. `pnpm typecheck` reaches only the known unrelated unused `advanced` at
`src/mugen/da32/ClauseAdjudicationSample.ts:149`.

Research: `docs/research/2026-07-27-ikemen-stchtmp-reversal-state-redirect.md`.

Out of scope: Projectile-to-ReversalDef tri-state routing, Helpers, exact
state-owner/source ordering, MUGEN, global pause, persistent cleanup, camera,
teams outside this clash gate, scores, and full parity.
