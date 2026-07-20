# FightScreen hit-state ownership

Date: 2026-07-20  
Ticket: T328  
Status: implemented at bounded root hit-source scope

## Official source findings

Ikemen-GO uses the hit context player number at the life-zero transition.
Matching the victim player gives suicide. A source player on the victim's team
gives teammate. An opposing source keeps the guard or attack cause branch.

## Port slice

The existing root resource KO hook now checks `GetHitVar` source metadata when
the victim is still in hit state. Explicit same-player identity records
`suicide`; explicit same-side root identity records `teammate`. The source
must be root-owned and have a known player number. Rival and incomplete
metadata paths do not overwrite the result.

## Evidence

- Classifier coverage proves hit-state self KO maps to `suicide`.
- Classifier coverage proves same-side hit-state KO maps to `teammate`.
- Coverage rejects helper-parented, rival, missing, and still-alive cases.
- Existing Playable, direct, and projectile routes remain green.
- Focused result: 4 files / 347 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is root hit-source ownership evidence. Rival attr reconstruction after a
later hit-state resource KO, helpers, redirected targets, reversals, browser
FightScreen proof, and full MUGEN/IKEMEN parity remain open.

## Source link

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
