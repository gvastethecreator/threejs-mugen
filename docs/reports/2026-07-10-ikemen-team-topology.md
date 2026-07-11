# IKEMEN team-topology checkpoint

## Outcome

`RuntimeTeamTopologyWorld` now owns interleaved IKEMEN team identity and stable complete-character enumeration. CNS `TeamSide` and explicit-IKEMEN SuperPause defense use the shared policy; current 1v1 behavior and required trace checksums remain stable.

## Evidence

- `pnpm test`: 163 files / 1599 tests. TypeScript 7.0.2 typecheck/build and boundaries pass; build retains the known Vite large-chunk warning.
- `pnpm qa:trace`: 538/538, 507 required and 31 optional.
- `synthetic-imported-ikemen-superpause-team-defense.json` remains checksum `76873f0d`, final `b4425c66`.

## Global areas

| Area | Status this checkpoint |
| --- | --- |
| Playable runtime | Structural advance: team identity/enumeration is no longer hardcoded to P1/P2 prefixes. |
| IKEMEN compatibility | Advanced for P3-P8 TeamSide identity and complete opposing-character policy. |
| Studio/renderer/assets/scanner | Unchanged. |
| Overall score | Unchanged; no multi-root match is playable yet. |

## Blocked

Active/standby eligibility, multi-root construction/scheduling/input/combat/round/presentation, partner redirects, tag transitions, life/power sharing, rollback, and full IKEMEN parity.
