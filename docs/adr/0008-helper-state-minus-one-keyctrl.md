# ADR 0008: Bounded helper State -1 keyctrl

Status: Accepted (bounded helper State -1 route)

Date: 2026-07-16

Last reviewed: 2026-07-16 at HEAD `be951e9a`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related decision: [`docs/adr/0007-helper-targetstate-redirect-ownership.md`](0007-helper-targetstate-redirect-ownership.md)

Research: [`docs/research/2026-07-16-helper-state-minus-one-keyctrl.md`](../research/2026-07-16-helper-state-minus-one-keyctrl.md)

Closeout: [`docs/reports/2026-07-16-helper-state-minus-one-keyctrl-closeout.md`](../reports/2026-07-16-helper-state-minus-one-keyctrl-closeout.md)

## Context

The runtime already compiles character CMD State -1 controllers into
`RuntimeProgramIr.stateEntries`, but helper actors previously retained only
positive state programs. The helper expression context also had no route to
the owning root's live command buffer. This made the official `keyctrl`
boundary invisible: a helper could not opt into command-gated State -1
behavior, while copying the complete global-state VM would overclaim ownership
and ordering semantics.

The official IKEMEN-GO miscellaneous reference documents that helpers access
State -1 only when `keyctrl` is enabled. The Elecbyte controller reference is
the compatibility baseline for helpers without command control.

## Decision

Accept one bounded `HelperStateMinusOne/v0` route:

1. Compile static `keyctrl` from the Helper controller, defaulting to false.
2. Carry the owning runtime program's compiled `stateEntries` into spawned
   helpers.
3. When `keyctrl` is true, execute those State -1 controllers before the
   helper's current positive state in the same helper advance.
4. Evaluate `command` and `selfcommand` through the owning root fighter's
   `CommandBuffer` and command definitions.
5. Keep controller mutation, variables, state clock, and expression ownership
   helper-local; preserve the existing pause gate around both passes.
6. Reuse existing trigger/dispatch behavior, including fail-closed handling
   for unsupported or malformed operations.

This decision does not add a helper-specific input buffer. It does not merge
Common1 or other negative-state sources, and it does not reorder or emulate
the complete global-state VM.

## Alternatives rejected

### Keep State -1 blocked for every helper

Rejected because it would contradict the source-backed `keyctrl` opt-in and
leave a representable command-gated route absent.

### Copy the complete root negative-state VM into helpers

Rejected because it would fabricate Common1 merge, global ordering, ownership,
and helper-input semantics that are not represented by the current runtime.

### Give helpers their own command buffer

Deferred. The current official route is owner command control; a helper-local
buffer needs a separate input ownership and tick decision.

## Consequences

Positive:

- imported helpers can opt into a source-backed State -1 route;
- current-state execution remains active after the State -1 pass;
- command evaluation has one explicit root-owner callback;
- disabled and paused helpers remain fail-closed and local.

Negative:

- States -4/+1 remain separate decisions; State -2/-3 is extended by
  ADR 0009 at bounded IKEMEN profile scope;
- helper input buffers, Common1 lookup/merge, exact negative-state order,
  recursive redirects, rollback/netplay, and full parity remain open;
- no compatibility score movement is claimed.

## Evidence

- Implementation: `be951e9a`.
- Focal: `pnpm exec vitest run src/tests/HelperSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/EffectActorSystem.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/RuntimeEffectHelperContextSystem.test.ts` -> `404/404`.
- `pnpm build` passed, including TypeScript 7 and Vite production build.
- `pnpm check:boundaries` passed.
- `pnpm check:redirect-boundary` passed.
- `git diff --check` passed for the feature slice.

## Claim boundary

Allowed:

- static `keyctrl` helper opt-in;
- owner `stateEntries` State -1 execution before helper current state;
- owner-root `command`/`selfcommand` evaluation;
- helper-local mutation and existing pause/fail-closed behavior.

Blocked:

- helper States -4/+1;
- exact Common1/global merge and root negative-state scheduling;
- helper-specific input buffers and Common1/global merge semantics;
- exact negative-state tick ordering beyond this bounded prepass;
- recursive RedirectID, rollback/netplay, and complete MUGEN/IKEMEN parity.
