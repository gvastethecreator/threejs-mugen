# IKEMEN Helper standby participation checkpoint

## Outcome

Explicit IKEMEN root controllers can now use TagIn/TagOut RedirectID to clear or set a live Helper's standby flag without stopping its CNS, identity, presentation, or projectiles.

## Evidence

- Static/default and dynamic-true self execute after Helper-local state/control validation and mutation.
- `runtimeHelperCanDirectlyInteract` rejects destroyed, disabled, and standby Helpers from direct HitDef.
- TagIn clears standby and restores direct Helper contact without reconstructing the actor.
- Helper expressions project effective `Ctrl = 0` while standby; the stored control flag survives and becomes observable again after TagIn.
- Standby Helpers continue state time, variable controllers, target state, animation, identity lookup, and snapshots.
- Helper-parented projectiles spawn with Helper provenance and advance while the parent remains standby.
- The IKEMEN single-Helper RunOrder path now uses the same default effect context as bulk Helper advancement, closing the spawn/count/modify scheduler gap exposed by this regression.
- Partner/member/leader axes, self-false no-op, invalid state, removed/disabled identity, and legacy profile remain fail-closed.
- Focused runtime verification: 3 files / 179 tests passed.
- Adjacent effect/projectile/expression verification: 3 files / 73 tests passed.
- Full verification: 170 files / 1714 tests passed.
- TypeScript 7 typecheck and production build passed; the known Vite large-chunk warning remains at 1,589.44 kB JS.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; renderer, Studio, CSS, sprites, and visible drawing policy were not changed.

## Global Port Status

- Runtime/IKEMEN: root-to-Helper Tag now covers local state/control and bounded self standby participation.
- Match/gameplay: direct Helper attacks honor standby; incoming Helper hurt, push, camera, active opponent breadth, aggregate Tag, round, and score participation remain blocked.
- Compatibility: all 538 deterministic trace artifacts remain green.
- Three.js renderer: unchanged; existing Helper snapshots remain visible while standby.
- Studio editor: unchanged; no authoring workflow moved in this cut.
- Toolchain/quality: TypeScript 7, 1714 tests, build, boundaries, and traces are green; bundle chunking remains known debt.

## Audit

The main risks were erasing stored control, globally disabling Helper CNS/controllers, filtering Helper-parented projectiles, mutating standby before state validation, and letting aggregate Tag axes leak into root-team ownership. Focused tests falsify each risk. The projectile test also exposed and closed the single-Helper scheduler's missing effect context. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Initial Helper `standby`, Helper aggregate Tag, Helper-originated Tag, incoming Helper hurt/push/camera/opponent breadth, exact incremental IKEMEN mutation, gameplay/round/score participation, and full MUGEN/IKEMEN parity.
