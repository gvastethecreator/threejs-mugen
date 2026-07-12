# Execute initial Helper standby creation

Type: implementation
Status: claimed
Blocked by: None

## Question

How can explicit IKEMEN root-created Helpers apply static or dynamic initial standby before identity registration and first-tick CNS while preserving source-backed control and participation behavior?

## Acceptance

- Compile Helper `standby` as an optional static boolean or supported deferred expression with zero/non-zero coercion.
- Evaluate dynamic standby in the original spawning root context before Helper construction; preserve same-tick variable/RNG semantics.
- Apply initial standby only in explicit `ikemen-go`; omitted and zero remain false, non-zero remains true, and legacy/unknown profiles preserve existing behavior.
- Block an explicit IKEMEN Helper spawn when authored standby cannot compile or resolve instead of silently creating an interactive Helper.
- Initialize stored Helper control from authored StateDef `ctrl`, with source fallback true when omitted; project effective `Ctrl = 0` while standby without erasing it.
- Ensure lifecycle registration and identity diagnostics observe final standby before same-tick Helper discovery.
- Preserve first-tick CNS/state time, target controllers, snapshots/drawing, and Helper-parented projectile spawn/advance while direct Helper HitDef remains suppressed.
- Keep Helper-created Helpers, generic Helper RedirectID, aggregate Tag, incoming Helper hurt, push/camera/opponent breadth, exact incremental parameter failure, and gameplay/score ownership blocked.
- Prove compiler static/dynamic/malformed cases; omitted/zero/non-zero/dynamic runtime cases; caller ownership; identity timing; first-tick CNS/projectile/direct-combat behavior; and legacy isolation.
- Close with focused tests, full tests, TypeScript 7 typecheck/build, stable traces, boundaries, diff check, docs, audit, and a feature commit.
