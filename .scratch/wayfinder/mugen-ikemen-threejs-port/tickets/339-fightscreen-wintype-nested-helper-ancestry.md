# T339 - FightScreen WinType nested Helper ancestry

Status: resolved at bounded nested-helper source scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO runtime evaluates redirected target controllers against a
resolved character and then applies the target-life result to the selected
target. The local source checkout preserves Helper `root` and `parent`
identity while allocating a distinct PlayerID for each live Helper.

Primary references:

- `src/bytecode.go`: target controller dispatch and RedirectID evaluation.
- `src/char.go`: target life mutation, kill state, and receiver-side effects.
- Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- `verifiedRootForHelper` now walks every live Helper parent link until the
  declared root.
- Each link must agree with the live effect-actor world and the IKEMEN
  character identity registry: root, parent PlayerID, inherited PlayerNo, and
  root PlayerID are checked.
- Root self-KO attribution through a Helper resource redirect uses the same
  verified ancestry gate.
- Broken, cyclic, missing, destroyed, or cross-root chains remain fail-closed.
- Helper-to-Helper `TargetLifeAdd` cause attribution remains fail-closed; this
  slice admits nested source ancestry only when the selected victim is a root.

## Verification

- `pnpm exec vitest run src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  passed: 1 file / 280 tests.
- `pnpm typecheck` passed with TypeScript 7.
- `git diff --check` passed for the feature files.
- No renderer or Studio UI file changed; visual smoke is deferred.

## Claim ceiling

This closes nested Helper ancestry for bounded root-victim WinType cause
attribution. Recursive RedirectID resolution, Helper-victim attribution,
other target-resource causes, reversal ownership, direct screenpack evidence,
and complete MUGEN/IKEMEN parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
