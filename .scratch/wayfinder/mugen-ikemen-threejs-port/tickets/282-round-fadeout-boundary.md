# Imported Round Fade-out Boundary

Type: implementation
Status: resolved
Blocked by: None

## Goal

Carry the bounded `[Round]` `fadeout.time`/`fadeout.col` contract from an
imported `fight.def` into the post-round snapshot and Three.js renderer while
keeping motif animation, dialogue, skip input, and full release choreography
outside this slice.

## Acceptance

- Parse numeric `fadeout.time` and RGB `fadeout.col` without crashing on absent
  or malformed values.
- Use the source-backed effective terminal duration
  `max(over.time, fadeout.time)` when source timing is present.
- Expose an additive `RuntimeRoundFade/v0` snapshot with inactive, active, and
  terminal fade state.
- Render the active fade as a viewport overlay above the existing stage and
  pause/environment overlays.
- Preserve source-less/demo timing and existing explicit `postKoFrames`
  overrides.

## Research Input

- `docs/research/2026-07-18-round-fadeout-boundary.md`

## Claim Ceiling

Allowed: bounded imported round fade timing/color, effective terminal-window
extension, renderer overlay, and renderer-independent snapshot evidence.

Blocked: exact `intro` off-by-one ordering, lifebar animation/sound payloads,
motif fade ownership, match-end dialogue, skip/`RoundNoSkip`, Common1/ZSS
release, team/Turns choreography, rollback/netplay, and full parity.

## Outcome

- Implementation commit: `55e4eeca`.
- Grouped checkpoint and visible QA follow-up: `bf49f178`.
- `MugenFightScreenTiming` preserves `fadeout.time` and clamped RGB color.
- `RuntimeRoundSystem` extends source-derived terminal timing when fade lasts
  longer than `over.time` and publishes `RuntimeRoundFade/v0`.
- `ThreeMugenRenderer` presents the active fade above other overlays and exposes
  bounded diagnostics.
- Focused verification: 4 files / 290 tests; TypeScript 7 typecheck passes.
- Grouped verification: 233 test files / 2472 tests, Vite build, 633/633
  trace artifacts, boundaries, redirect boundary, CSS budget, and browser
  smoke pass with 64 capture paths, 0 console issues, and 0 page errors.

## Closure Audit

- Explicit `postKoFrames` remains authoritative for callers that already own a
  normalized runtime timing object.
- The local fade starts over the final configured fade frames of the bounded
  terminal window; this is an adapter, not a claim of exact `intro` ordering.
- No trace checksum or compatibility score moves in this slice.
- The renderer path has a green grouped checkpoint. Exact fight-screen asset
  ownership and frame ordering remain intentionally outside this slice.
