# IKEMEN root Tag RedirectID checkpoint

## Outcome

Explicit IKEMEN TagIn/TagOut can now redirect the sandbox's bounded aggregate Tag operation to any live root PlayerID while preserving original-caller expression ownership.

## Evidence

- `redirectid` compiles as deferred expression metadata and rejects empty, comma-separated, or structurally malformed values.
- Runtime evaluates RedirectID first in the original caller context, truncates toward zero, and resolves it through the global numeric identity registry.
- Same-side, opponent, active, and standby roots are eligible; negative, missing, destroyed, or disabled identities abort before later expression evaluation and mutation.
- Remaining dynamic Tag parameters still evaluate from the original caller, while state, control, partner, member-order, leader, and standby mutation are relative to the redirected root.
- Partner selection and mutable order operate on the redirected root's side and position.
- Successful telemetry remains attached to the original caller and contains a concrete `redirectPlayerId`; rejected operations emit no successful telemetry.
- A failed RedirectID followed by authored `self = Random` preserves the next deterministic RNG result, proving redirect-first abort.
- `mugen-1.1` rejects RedirectID without mutation or telemetry.
- Focused verification: 2 files / 184 tests passed.
- Full verification: 170 files / 1696 tests passed.
- TypeScript 7 typecheck and production build passed; the known Vite chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; no renderer, Studio, sprite, CSS, or visible presentation path changed.

## Global Port Status

- Runtime/IKEMEN: root numeric identity and root-only Tag RedirectID execute; Helper identity is the next claimed frontier.
- Match/gameplay: P1/P2 remain playable; P3-P8 remain controller-only reserves without input, combat, round, or presentation ownership.
- Compatibility: all 538 deterministic trace artifacts remain green with no checksum regression.
- Three.js renderer: unchanged; this checkpoint adds no visual-parity claim.
- Studio editor: unchanged; this checkpoint adds no authoring-workflow claim.
- Toolchain/quality: TypeScript 7, production build, architecture boundaries, tests, and deterministic traces are green; bundle chunking remains known debt.

## Audit

Primary risks were evaluating later parameters against the target, resolving only teammates, using PlayerNo instead of PlayerID, selecting partner/order from the caller side, consuming RNG after failed lookup, or leaking the route into the legacy profile. Focused and whole-runtime coverage exercise each route. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Helper identity and RedirectID targets, generic controller RedirectID, exact IKEMEN incremental partial-mutation behavior, gameplay participation, score movement, and full IKEMEN parity.
