# MUGEN-lite Journey Research

Date: 2026-07-12
Scope: legal loader-to-runtime acceptance fixture

## Official basis

- Elecbyte's MUGEN 1.1 overview identifies DEF, CMD, CNS, AIR, and SFF as the core character package surfaces: https://www.elecbyte.com/mugendocs-11b1/mugen.html
- Elecbyte's CNS reference defines states as per-tick behavior, state `-1` as command-driven transition logic, and `ChangeState` as the transition primitive: https://www.elecbyte.com/mugendocs/cns.html
- Elecbyte's controller reference defines the `HitDef`, `ChangeState`, and hit/fall params used by the fixture: https://www.elecbyte.com/mugendocs/sctrls.html
- Elecbyte's AIR reference defines action blocks and collision boxes used by the generated animations: https://www.elecbyte.com/mugendocs-11b1/air.html

## Decision

Use one deterministic repository-owned package assembled in a `VirtualFileSystem`. Keep every authored surface MUGEN-format and route it through `MugenCharacterLoader`; avoid copyrighted third-party assets and private fixture availability. Generate minimal SFF v1/PCX bytes in code so CI needs no binary download.

The journey must prove ordered movement and combat behavior, not merely successful parsing. It therefore requires command evidence, actor-frame sequences, controller execution, guard/hit events, life deltas, fall/recovery states, final control, and one intentional unsupported controller visible in the compatibility report.

## Claim boundary

Allowed: one legal deterministic package crosses the production loader/import/runtime/trace path.

Blocked: ZIP reader transport, exact Common1 tables/timing, third-party or commercial character compatibility, visual/audio parity, and full MUGEN/IKEMEN behavior.
