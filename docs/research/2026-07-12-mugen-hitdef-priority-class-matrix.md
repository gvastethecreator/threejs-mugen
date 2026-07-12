# MUGEN HitDef Priority-class Matrix

Date: 2026-07-12
Wayfinder: 118

## Sources

- Elecbyte HitDef controller reference: https://www.elecbyte.com/mugendocs/sctrls.html#hitdef
- Ikemen-GO `hittableByChar`, pinned SHA `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`: https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10532-L10617

## Contract

Elecbyte defines equal-priority classes as:

| P1 | P2 | Result |
| --- | --- | --- |
| Hit | Hit | both hit |
| Hit | Miss | P1 hits |
| Hit | Dodge | both miss |
| Dodge | Dodge | both miss |
| Dodge | Miss | both miss |
| Miss | Miss | both miss |

Reverse ordering is symmetric. In no-hit ties, HitDefs remain enabled.

## Implementation Decision

- Normalize the optional second `priority` token into `hit | miss | dodge` at controller compilation.
- Preserve it through runtime HitDef authoring and `DemoMove`; each omitted/invalid authored priority resets to `4, hit` and never inherits from the previous move.
- Keep unequal numeric priority behavior unchanged.
- At equal priority, batch Hit/Hit contacts, temporarily skip only Miss in Hit/Miss, and temporarily skip both directions for every other pairing.
- Frame-local skips retain exact move identity and clear before the next arbitration batch; they never enter committed/pending contact memory.
- Classify all `HitDef priority clash` logs as runtime evidence before generic `" hit "` log detection.
- Consume frame-local outcomes for Pair as well as Tag; emit Hit/Miss victory telemetry only if the winning direction reaches accepted HitOverride or normal contact.

## Blocked

Ikemen's ReversalDef precedence, HitOverride and guard interaction, throw randomization via unhittable time, projectile class parity, and immutable reduction of secondary state/sprite effects remain separate cuts.
