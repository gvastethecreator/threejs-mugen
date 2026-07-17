# Implement bounded helper State -1 keyctrl

Type: task
Status: resolved
Blocked by: None

Research: `docs/research/2026-07-16-helper-state-minus-one-keyctrl.md`

## Question

Can imported helpers execute the owning program's CMD State -1 controllers
only when the Helper controller explicitly enables `keyctrl`, while keeping
helper-local state ownership and command evaluation bounded?

## Acceptance

- Helper parses and stores static `keyctrl`.
- State -1 `stateEntries` reach helper runtime actors without changing existing
  direct helper fixtures.
- A keyctrl-enabled helper runs State -1 before its current state.
- A keyctrl-disabled helper skips State -1.
- `command =` and `selfcommand =` use the owning root command buffer.
- State -2/-3/-4/+1 and helper-specific input remain explicit non-goals.
- Focused helper/compiler/runtime tests, TypeScript 7, build, boundaries, and
  diff hygiene pass.

## Claim ceiling

This ticket does not claim full MUGEN/IKEMEN global-state parity, common-file
merge precedence, exact negative-state tick ordering outside the bounded pass,
helper input buffers, or score/parity movement.

## Answer

Accepted as a bounded `HelperStateMinusOne/v0` route in commit `be951e9a`.
`Helper` now compiles static `keyctrl`, carries the owner's compiled
`stateEntries`, and runs them before the helper's current state only when the
flag is enabled. `command` and `selfcommand` resolve through the owning root
fighter's `CommandBuffer`; the existing pause gate surrounds both passes.

State -2/-3/-4/+1, helper-owned input buffers, Common1/global merge semantics,
exact negative-state ordering outside this pass, rollback/netplay, and full
MUGEN/IKEMEN parity remain outside the claim.

## Evidence

- `pnpm exec vitest run src/tests/HelperSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/EffectActorSystem.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/RuntimeEffectHelperContextSystem.test.ts`: 404/404.
- `pnpm build`: TypeScript 7 typecheck and Vite production build passed; only the existing large-chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed for the feature slice.
