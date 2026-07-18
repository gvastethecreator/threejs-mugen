# Implement bounded helper State -2/-3 keyctrl

Type: task
Status: resolved
Blocked by: None

Research: `docs/research/2026-07-18-helper-negative-states-keyctrl.md`
Decision: `docs/adr/0009-helper-negative-states-keyctrl.md`
Closeout: `docs/reports/2026-07-18-helper-negative-states-keyctrl-closeout.md`

## Question

Can IKEMEN helpers execute owner States -2/-3 after `keyctrl` is enabled,
without changing MUGEN behavior or fabricating helper input, Common1 merge,
or a complete global-state VM?

## Answer

Accepted as bounded `HelperNegativeStates/v0` in commit `12f483ec`.
When the runtime profile is `ikemen-go` and the helper has `keyctrl = 1`, the
existing helper advance executes owner `State -3`, then `State -2`, then the
existing owner `State -1` pass, and finally the helper's current state. The
negative states reuse the owner's compiled `RuntimeProgramIr.states` table and
the helper-local controller context. MUGEN and `unknown` profiles leave
States -2/-3 closed. The active MUGEN post-fighter path now also forwards the
owner command callback, preserving the prior State -1 contract there.

## Acceptance

- Official MUGEN/IKEMEN restrictions and order are recorded.
- Repository facts show negative StateDefs already represented in `states`.
- IKEMEN + `keyctrl` executes -3 before -2, then -1 and current state.
- MUGEN and `unknown` do not execute -2/-3.
- Pause gate and helper-local mutation remain unchanged.
- Focal tests, TypeScript 7/build, boundaries, and diff hygiene pass.

## Evidence

- `pnpm exec vitest run src/tests/HelperSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/EffectActorSystem.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/RuntimeEffectHelperContextSystem.test.ts`: `405/405`.
- `pnpm build`: passed; existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Claim ceiling

This ticket does not claim root State -2/-3 scheduling, Common1 or multi-file
merge precedence, helper-specific input buffers, exact full-engine tick order,
IKEMEN State +1, rollback/netplay, or full MUGEN/IKEMEN parity.
