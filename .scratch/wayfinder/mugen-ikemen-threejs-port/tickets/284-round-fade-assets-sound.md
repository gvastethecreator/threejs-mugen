# Ticket 284: FightScreen fade animation and sound assets

- Status: resolved bounded
- Date: 2026-07-18
- Scope: carry imported `[Round] fadeout.anim` and `fadeout.snd` through the
  source loader, round snapshot, Three.js presentation, and global audio path
  without taking ownership of the complete fight-screen release sequence
- Depends on: [T282](282-round-fadeout-boundary.md) and
  [T283](283-studio-desktop-route-visibility.md)
- Research: [`docs/research/2026-07-18-round-fade-assets-sound.md`](../../../../docs/research/2026-07-18-round-fade-assets-sound.md)

## Contract

1. Parse non-negative `fadeout.anim` and `fadeout.snd` values from imported
   `[Round]` timing, treating `-1` and malformed values as absent.
2. Resolve the referenced FightFX AIR action after the FightFX package is
   loaded and derive its effective duration without changing explicit runtime
   `postKoFrames` ownership.
3. Publish optional animation and sound metadata from the existing additive
   `RuntimeRoundFade/v0` snapshot. The sound is an active-fade event, not an
   actor-owned event.
4. Render the resolved AIR/SFF animation as a viewport-wide Three.js layer,
   preserving frame duration, loop start, offsets, flips, additive blending,
   and a visible color fallback when the configured asset is unavailable.
5. Play the imported global fade sound once per round fade through the existing
   FightFX archive and expose unresolved asset diagnostics to renderer users.

## Evidence

- Implementation commit: `84fc1510`.
- Focused batch: 4 files / 38 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- Grouped checkpoint: `pnpm test` passed 233 files / 2476 tests; Vite build
  passed with 316 modules; `pnpm qa:trace` passed 633/633 artifacts (599
  required / 34 optional); repository boundaries, redirect boundary, and CSS
  budget passed.
- Browser smoke passed against the real Vite server with `status=passed`, 64
  capture paths, 0 console issues, and 0 page errors. Diagnostics:
  `.scratch/qa/qa-smoke-t284-full/diagnostics.json`.

## Claim ceiling

Allowed: imported `fadeout.anim`/`fadeout.snd` parsing, AIR duration
extension, renderer-independent snapshot metadata, bounded FightFX AIR/SFF
presentation, one-shot global fade sound routing, and fail-closed renderer
diagnostics.

Blocked: exact IKEMEN localcoord/viewport transform for every motif, complete
fade-in and fade-out choreography, `intro`/`roundOver` frame-start ordering,
motif ownership, match-end dialogue, skip input and `RoundNoSkip`, Common1/ZSS
release, team/Turns lifecycle, rollback/netplay, score movement, and full
MUGEN/IKEMEN parity.

## Closure audit

- The loader enriches timing only after the FightFX AIR map exists; missing
  actions remain explicit fallback diagnostics instead of silently extending
  the source window.
- Animation-backed fades suppress the color overlay when the asset resolves,
  matching the bounded source behavior. A missing sprite/action keeps the
  terminal window visible through the configured color fallback.
- Global fade sound deduplication is keyed by round/state/sound reference and
  does not depend on actor audio events.
- No compatibility score or required trace checksum moves in this slice.
