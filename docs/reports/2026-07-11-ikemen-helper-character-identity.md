# IKEMEN Helper character identity checkpoint

## Outcome

Root-created Helpers now join the explicit IKEMEN numeric character registry before same-tick execution and leave it through every world-owned removal route.

## Evidence

- `RuntimeEffectActorWorld` emits lifecycle notifications for spawn, explicit remove, destroy, expiry/out-of-bounds advance, bounded-store eviction, and reset.
- Each registered Helper receives the next global PlayerID, inherits root PlayerNo, and retains separate effect `serialId`, parent actor id, and root actor id.
- Registry validation rejects missing parent/root identity and cross-PlayerNo ancestry.
- Helper trigger and runtime-controller evaluation receives explicit self, Parent, and Root PlayerID/PlayerNo fields.
- End-to-end CNS proves a newly spawned Helper reads `58/1`, `Parent = 56/1`, and `Root = 56/1` in the same tick.
- Removal unregisters PlayerID without reuse inside the current epoch; a later Helper receives the next ID.
- Match reset clears stale Helpers and rebuilds the official-style identity epoch from baseline while root IDs remain `56/57` by value.
- `mugen-1.1` exposes zero-valued unsupported reads and no identity diagnostic.
- Root Tag RedirectID can find but deliberately rejects a Helper before mutation or successful telemetry.
- Focused verification: 9 files / 243 tests passed.
- Full verification: 170 files / 1700 tests passed.
- TypeScript 7 typecheck and production build passed; the known Vite chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; no renderer, Studio, sprite, CSS, or visible presentation path changed.

## Global Port Status

- Runtime/IKEMEN: roots and root-created Helpers now share numeric identity; exact Helper Tag redirect semantics are the next research frontier.
- Match/gameplay: P1/P2 remain playable; reserve roots and Helpers do not gain input, round, score, or presentation ownership from this feature.
- Compatibility: all 538 deterministic trace artifacts remain green with no checksum regression.
- Three.js renderer: unchanged; Helper identity is diagnostic/runtime state, not a visual-parity claim.
- Studio editor: unchanged; no new identity authoring or evidence UI is claimed.
- Toolchain/quality: TypeScript 7, production build, boundaries, tests, and deterministic traces are green; bundle chunking remains known debt.

## Audit

Primary risks were registering after same-tick Helper execution, conflating PlayerID with effect serial/helper id, losing Parent/Root ownership, leaking identity into legacy, retaining stale lookup after removal, or crashing when reset reuses effect serials. Layered tests cover registry invariants, every world lifecycle route, same-tick CNS, no-reuse, reset epoch, legacy isolation, and blocked Helper Tag mutation. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Helper-created Helpers, exact Helper TagIn/TagOut mutation, generic RedirectID controllers, Helper opponent/target numeric redirects, gameplay participation, score movement, and full IKEMEN parity.
