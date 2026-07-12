# IKEMEN initial Helper standby checkpoint

## Outcome

Explicit IKEMEN root controllers can now create a Helper with caller-evaluated initial `standby` before identity visibility and first-tick CNS execution.

## Evidence

- Helper IR carries either a static zero/non-zero standby boolean or one supported deferred scalar expression.
- Deferred standby evaluates once in the original spawning root context, including same-tick variable state.
- Omission and zero create a non-standby Helper; non-zero and dynamic truth create a standby Helper.
- Invalid or unresolved authored standby blocks the explicit IKEMEN spawn without partial runtime mutation.
- `mugen-1.1` and `unknown` ignore the IKEMEN-only parameter and preserve existing raw Helper creation.
- Helper construction stores final standby before lifecycle observers register numeric identity.
- Initial control uses authored StateDef `ctrl`; omission falls back to true. Standby projects effective `Ctrl = 0` without erasing stored control.
- First-tick Helper CNS, state time, identity lookup, snapshots, and Helper-parented Projectile creation continue while direct Helper interaction remains suppressed.
- Focused verification: 5 files / 287 tests passed.
- Full verification: 170 files / 1721 tests passed.
- TypeScript 7 typecheck and production build passed; the known Vite large-chunk warning remains at 1,590.47 kB JS.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; renderer, Studio, CSS, sprite, and visible presentation code did not change.

The implementation follows the contract derived from the pinned [IKEMEN Helper compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L735-L810), [Helper runtime creation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5579-L5718), and [Helper initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6753-L6845).

## Global Port Status

- Runtime/IKEMEN: root-created Helper identity, local Tag state/control, standby participation, and initial standby creation are closed as bounded executable cuts.
- Match/gameplay: standby suppresses direct Helper interaction and effective control; aggregate Helper Tag, incoming hurt/push/camera/opponent breadth, active gameplay, round, and score ownership remain blocked.
- Compatibility: all 538 deterministic trace artifacts remain green; this cut intentionally adds integration proof without a new trace oracle.
- Three.js renderer: unchanged; existing Helper snapshots continue to draw regardless of standby.
- Studio editor: unchanged; the authoring-spine ticket remains an independent frontier.
- Toolchain/quality: TypeScript 7, 1721 tests, build, boundaries, traces, and diff check are green; bundle chunking remains known debt.

## Audit

The main risks were evaluating standby in the wrong actor context, exposing transient false standby to identity observers, defaulting omitted StateDef control to false, erasing stored control, running invalid IKEMEN syntax through raw fallback, and leaking the parameter into legacy profiles. Compiler, dispatch, construction, lifecycle, and end-to-end tests falsify those risks. Internal adversarial review found no remaining blocker or P1 in the accepted slice. Independent review was omitted because this task did not authorize subagent delegation.

## Blocked

Exact source-side incremental failure after identity allocation, Helper aggregate Tag, Helper-originated Tag, Helper-created Helpers, incoming Helper hurt/push/camera/opponent breadth, gameplay/round/resource/score ownership, and full MUGEN/IKEMEN parity.
