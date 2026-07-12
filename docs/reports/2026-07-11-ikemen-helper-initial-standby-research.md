# IKEMEN initial Helper standby research checkpoint

## Outcome

Pinned IKEMEN source makes initial Helper standby implementation-ready. `standby` is an optional caller-owned boolean expression applied after Helper allocation but before initial state entry and same-frame CNS execution. Omitted/zero values are false; non-zero values are true.

## Evidence

- Official wiki checked on 2026-07-11; it documents Helper TagIn/TagOut participation but not the Helper creation parameter.
- Runtime source is pinned to `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` across compiler, bytecode, Helper allocation/reset, state entry, and flag storage.
- Local audit covers typed IR, raw fallback, effect dispatch, Helper construction, identity notification, IKEMEN same-tick discovery, direct combat, snapshots, and projectiles.
- New source-backed finding: Helper init requests stored control enabled, then authored StateDef `ctrl` may override it during state entry. Standby changes only the effective `Ctrl` read.
- Failure policy: unsupported or unresolved authored standby blocks the explicit IKEMEN spawn; legacy/unknown profiles preserve existing non-standby behavior.

## Global Port Status

- Runtime/IKEMEN: redirected Helper standby participation is closed; initial root-created Helper standby is ready for Wayfinder 085.
- Match/gameplay: direct Helper HitDef already consumes standby; incoming Helper hurt, push, camera, player-type opponent breadth, aggregate Tag, and Helper-created Helpers remain blocked.
- Three.js renderer: unchanged; standby Helpers remain snapshot-visible.
- Studio editor: unchanged.
- Toolchain/quality: TypeScript 7 baseline unchanged; research adds no compatibility score movement.

## Audit

Strongest avoided regression: setting only `teamState.standby` while hardcoding stored control false. That diverges when StateDef omits `ctrl`; hardcoding true also diverges when it declares false. The implementation cut therefore owns initial standby timing plus StateDef-over-fallback control precedence. Independent review was unavailable in this host; pinned-source comparison plus internal adversarial review was used.

## Next

Wayfinder 085: execute source-backed initial Helper standby in explicit IKEMEN matches with focused compiler/runtime/end-to-end proof and full stable gates.
