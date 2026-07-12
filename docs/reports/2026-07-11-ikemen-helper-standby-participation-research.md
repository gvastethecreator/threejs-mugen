# IKEMEN Helper standby participation research checkpoint

## Outcome

Pinned IKEMEN source and local audit reduce the next Helper standby implementation to a direct-character interaction gate plus effective-control projection. Standby must not stop CNS, projectiles, target controllers, identity, snapshots, animation, or drawing.

## Evidence

- Official wiki checked on 2026-07-11; runtime source pinned to `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Source checks cover scheduler, effective control, direct hit/hurt, projectile/player contact, projectile clashes, push, camera, Enemy/P2, drawing, and Helper creation.
- Local audit covers `HelperSystem`, `RuntimeHelperCombatSystem`, `EffectActorSystem`, `MatchInteractionSystem`, `RuntimeTeamTopologySystem`, `RuntimeMatchPresentationSnapshotSystem`, and `EffectLifecycleSystem`.
- Critical negative decision: no projectile standby filter. Pinned IKEMEN lets projectiles from a live standby owner continue to interact.
- Verification: 170 files / 1710 tests, TypeScript 7 typecheck, production build, boundaries, and `git diff --check` passed. Trace and visual smoke are N/A because execution and presentation are unchanged; the known 1,589.08 kB Vite chunk warning remains.

## Global Port Status

- Runtime/IKEMEN: root-to-Helper Tag state/control executes; Helper standby behavior is now implementation-ready.
- Match/gameplay: direct Helper HitDef needs one participation gate; incoming Helper hurt, push, camera, and player-type opponent breadth remain unmodeled.
- Three.js renderer: source and local paths agree that standby alone does not hide a Helper; no renderer change is needed.
- Studio editor: unchanged.
- Toolchain/quality: TypeScript 7 baseline remains unchanged; no score movement from research.

## Audit

Strongest avoided regression: treating standby as deactivation and filtering helper-parented projectiles or snapshots. That would contradict pinned source and visibly erase still-running entities. Independent review was unavailable in this host; source/runtime comparison and a fresh internal adversarial pass were used.

## Next

Wayfinder 083: execute Helper standby plus direct-character participation and effective-control semantics, with focused end-to-end tests and full runtime gates.
