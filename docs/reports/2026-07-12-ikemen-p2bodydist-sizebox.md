# P2BodyDist X compatibility report

Date: 2026-07-12
Lane: runtime compatibility
Checkpoint: Entry 452

## Delivered

- Replaced fixed 48-unit `P2BodyDist X` proxy with current S/C/A/L size-box geometry.
- Added facing-aware opponent front/back edge selection.
- Added cross-localcoord conversion and signed results.
- Added IKEMEN-only `Width` composition while retaining MUGEN behavior.
- Preserved size-box ownership through current-opponent, `EnemyNear`, and target redirects.
- Rebaselined the optional private KFM QCF route from the old proxy-selected 90-damage/fall HitDef to its size-box-selected 85-damage HitDef; command, contact, sound, spark, target, and controller/operation sequence gates remain required by that artifact.

## Evidence

- Focused runtime expression suite covers state boxes, 320/640 localcoord, opposite/same facing, IKEMEN Width, and MUGEN Width exclusion.
- Full verification passes 180 files / 1895 tests, TypeScript 7 typecheck, production build, modular boundaries, and 563/563 traces (532 required, 31 optional).
- Required `synthetic-imported-p2-distance.json` remains checksum `2c584be0`; optional private `kfm-official-qcf-x.json` moves to `5242ac11` after the source-backed branch selection.
- Independent source review found and closed caller-local output scaling across redirects, caller-owned MUGEN/IKEMEN Width policy for both boxes, and one stale KFM ledger entry.

## Claim boundary

Allowed: bounded root/current-opponent `P2BodyDist X` geometry parity for covered size-box, facing, localcoord, and Width policy cases.

Blocked: helpers, complete teams/simul selection, Height/OverrideClsn geometry, exact push/corner interaction, persistent-controller timing, and full parity.
