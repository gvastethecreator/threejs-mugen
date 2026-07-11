# IKEMEN root character identity integration checkpoint

## Outcome

Explicit IKEMEN matches now connect present P1-P8 roots to the numeric identity registry and expose source-backed `ID` / `PlayerNo` expression reads without replacing stable sandbox actor ids.

## Evidence

- Present roots receive explicit one-based PlayerNo before the registry is built.
- PlayerID allocates from `56` in present odd-PlayerNo then even-PlayerNo order; P1-P4 prove `p1=56`, `p3=57`, `p2=58`, and `p4=59`.
- `PlayableMatchRuntime.getCharacterIdentity()` returns detached, deeply frozen `RuntimeCharacterIdentity/v0` diagnostics.
- Diagnostics read disabled/standby eligibility live; standby roots remain lookup-eligible.
- Reset recreates fighter state while preserving PlayerNo and PlayerID.
- `ID` and `PlayerNo` compile and execute from explicit caller/opponent/Parent/Root/EnemyNear/Target context fields. The evaluator never parses `pN` actor ids.
- End-to-end imported CNS routes P1 only when caller identity is `56/1` and EnemyNear identity is `58/2`.
- `mugen-1.1` creates no profile-owned identity registry and the same gated route remains closed.
- Focused verification: 7 files / 226 tests passed.
- Full verification: 170 files / 1690 tests passed.
- TypeScript 7 typecheck and production build passed; the known Vite chunk warning remains.
- `pnpm qa:trace`: 538/538 artifacts passed (507 required, 31 optional).
- `pnpm check:boundaries` and `git diff --check`: passed.
- Visual smoke: N/A; no renderer, Studio, sprite, CSS, or visible presentation path changed.

## Global Port Status

- Runtime/IKEMEN: numeric root identity is integrated; root-only Tag RedirectID is the next claimed frontier.
- Match/gameplay: P1/P2 remain playable; P3-P8 remain controller-only reserves without input, combat, round, or presentation ownership.
- Compatibility: the complete trace corpus is green with no checksum regression.
- Three.js renderer: unchanged in this checkpoint; no visual claim added.
- Studio editor: unchanged in this checkpoint; no authoring workflow claim added.
- Toolchain/quality: TypeScript 7, production build, boundaries, tests, and deterministic traces are green; bundle chunking remains known debt.

## Audit

Primary risks were conflating PlayerID with PlayerNo/string ids, allocating by constructor order, losing identity on reset, filtering standby, and leaving redirects on caller identity. Focused and end-to-end tests cover those routes. Keeping diagnostics out of `MugenSnapshot` avoids changing behavior checksums while preserving an equivalent public read path. Independent review was unavailable in this host; this is an internal adversarial audit.

## Blocked

Helper identity lifecycle, PlayerID redirect lookup in controllers, Tag RedirectID mutation, exact IKEMEN incremental partial-mutation behavior, gameplay participation, score movement, and full IKEMEN parity.
