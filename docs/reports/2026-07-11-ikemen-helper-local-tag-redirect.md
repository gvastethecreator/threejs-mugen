# IKEMEN Helper-local Tag redirect checkpoint

## Outcome

Explicit IKEMEN root controllers can now redirect a bounded TagIn/TagOut state/control operation to a live Helper without enabling Helper standby or root-team aggregate effects.

## Evidence

- RedirectID still evaluates first in the original root caller and resolves through the shared root/Helper numeric registry.
- Helper execution requires explicit `self = 0` or a dynamic self expression resolving false.
- TagIn supports Helper-local `stateno` and `ctrl`; TagOut supports Helper-local `stateno`.
- Dynamic self/state/control expressions read the original caller. A same-tick fixture uses root `ID = 56` to select Helper state `1201` and control.
- Helper state availability is validated before control evaluation/mutation; state metadata applies before explicit TagIn control.
- Default/true self, partner, partner state/control, member, leader, no-op-only routes, and unavailable state fail atomically.
- Removed and disabled Helper identities fail lookup before local mutation. Legacy remains registry-free and rejects the controller.
- Successful typed telemetry remains owned by the original root caller; blocked operations emit none.
- Focused verification: 2 files / 169 tests passed.
- Full verification: 170 files / 1710 tests passed.
- TypeScript 7 typecheck and production build passed; the known Vite large-chunk warning remains at 1,589.08 kB JS.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; no renderer, Studio, sprite, CSS, or visible presentation path changed.

## Global Port Status

- Runtime/IKEMEN: roots and root-created Helpers share numeric identity; bounded root-to-Helper Tag state/control now executes.
- Match/gameplay: Helper standby, partner/root mutation, team order, input, round, and score participation remain blocked.
- Compatibility: all 538 deterministic trace artifacts remain green with no checksum regression.
- Three.js renderer: unchanged; no visibility or presentation behavior is claimed.
- Studio editor: unchanged; no new authoring or evidence workflow is claimed.
- Toolchain/quality: TypeScript 7, 1710 tests, build, boundaries, and traces are green; bundle chunking remains known debt.

## Audit

Primary risks were evaluating local expressions in the Helper context, applying control before state metadata, allowing default self to toggle an incomplete standby flag, leaking aggregate axes into root teams, or retaining stale Helper lookup. Focused tests cover each route and the full runtime/trace baselines show no regression. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Helper standby participation, partner/root aggregate mutation, member/leader order, Helper-originated Tag, custom state ownership, exact incremental behavior, gameplay/round/score participation, and full IKEMEN parity.
