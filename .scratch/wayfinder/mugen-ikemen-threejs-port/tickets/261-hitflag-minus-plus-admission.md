# Ticket 261: explicit HitFlag minus/plus admission

- Status: resolved bounded
- Date: 2026-07-18
- Scope: bounded direct HitDef admission for explicit `HitFlag -` and `HitFlag +`
- Depends on: `DemoMove.hitFlag`, `CharacterRuntimeState` move/state metadata,
  root hit admission, direct combat resolution, equal-priority preparation, and
  helper direct combat
- Research: [`docs/research/2026-07-18-hitflag-minus-plus-admission.md`](../../../../docs/research/2026-07-18-hitflag-minus-plus-admission.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`
- Planning commit: `bf5f296c`
- Implementation: `c88fd483`
- ADR: [`0028-hitflag-minus-plus-admission`](../../../../docs/adr/0028-hitflag-minus-plus-admission.md)
- Closeout: [`2026-07-18-hitflag-minus-plus-closeout`](../../../../docs/reports/2026-07-18-hitflag-minus-plus-closeout.md)

## Question

What is the smallest source-backed `HitFlag -/+` slice that makes explicit
chain/throw admission agree across the current direct paths without pretending
that the runtime already has complete `hittmp`, `acttmp`, or default hitflag
inference?

## Bounded contract

- Parse explicit hitflag strings as compact MUGEN flag combinations, including
  comma and whitespace separated forms already emitted by imported data.
- Project IKEMEN `hittmp` at the current admission boundary:
  `moveType = H` is get-hit (`hittmp = 1`) and becomes falling (`hittmp = 2`)
  only when `hitFall.falling = true`; non-`H` states are idle (`hittmp = 0`).
- Reject `-` when the projected target is in any get-hit/falling state.
- Require `+` to target a projected get-hit/falling state, while rejecting the
  source-defined Common1 guard-state range and the runtime guard latch.
- Preserve omitted hitflags and existing `F` / `NoFallHitFlag` behavior.
- Apply the same predicate to root admission, regular direct resolution,
  equal-priority preparation, and helper direct resolution.

## Out of scope

Projectile hitflag ownership, reversal `hittmp = -1`, default `MAF` inference,
full state-type `H/L/A/D` admission, exact `acttmp` pause/hitpause timing,
custom-state breadth, ZSS/Lua, rollback/netplay, and complete
MUGEN/IKEMEN parity remain open.

## Acceptance evidence

- Focused pure-predicate tests cover compact/comma flags, idle/get-hit/falling
  targets, guard-state exclusion, omitted flags, and the existing F path.
- Root, regular direct, equal-priority, and helper tests prove reject/allow
  decisions without mutation and preserve existing fall behavior.
- TypeScript 7, build, repository boundaries, trace gates, and diff hygiene are
  run together after the implementation rounds.
- Browser smoke is N/A unless the runtime change affects renderer, Studio, or
  another visible surface.

## Claim ceiling

This ticket closes only explicit direct `HitFlag -/+` admission over the
runtime's bounded `hittmp` projection. It does not close generic hitflag
defaults, projectile/reversal parity, exact pause scheduling, or full
MUGEN/IKEMEN compatibility.

## Implementation outcome

The shared direct predicate now normalizes compact, comma-delimited, and
whitespace-delimited explicit hitflags, projects `hittmp` as `0/1/2` from the
current runtime metadata, and enforces `-`/`+` across root admission, regular
direct combat, equal-priority preparation, and helpers. Focused coverage passed
`4` files / `79` tests before T262; the grouped closeout passes `230` files /
`2416` tests, TypeScript 7, build, boundaries, redirect boundary, trace QA,
and diff hygiene. Browser smoke is N/A.
