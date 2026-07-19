# Ticket 285: FightScreen fade-in boundary

- Status: resolved bounded
- Date: 2026-07-18
- Scope: carry imported `[Round] fadein.time`, `fadein.col`, `fadein.anim`,
  and `fadein.snd` through the source loader, round reset snapshot, Three.js
  presentation, and global audio path without claiming complete intro or
  release choreography
- Depends on: [T284](284-round-fade-assets-sound.md)
- Research: [`docs/research/2026-07-18-round-fadein-boundary.md`](../../../../docs/research/2026-07-18-round-fadein-boundary.md)

## Contract

1. Parse non-negative `fadein.anim` and `fadein.snd` values from imported
   `[Round]` timing, preserving color/time metadata and treating malformed
   values as absent.
2. Resolve the referenced FightFX AIR action after the FightFX package is
   loaded and derive the bounded pre-round duration from animation or color
   timing.
3. Publish optional `RuntimePreRound/v0` data with the existing additive
   `RuntimeRoundFade/v0` contract, including explicit `direction: "in"`.
4. Reset the pre-round frame on reset and next-round handoff; render the
   active AIR/SFF layer when resolved and use reverse-opacity color fallback
   when it is unavailable.
5. Play the imported global fade-in sound once per round through the existing
   FightFX archive without inventing an actor-owned event.

## Evidence

- Implementation commit: `c688f04d`.
- Focused batch: 4 files / 41 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- Grouped checkpoint: `pnpm test` passed 233 files / 2479 tests; Vite build
  passed with 316 modules; `pnpm qa:trace` passed 633/633 artifacts (599
  required / 34 optional); repository boundaries, redirect boundary, and CSS
  budget passed.
- Browser smoke passed against the real Vite server with `status=passed`, 64
  capture paths, 0 console issues, and 0 page errors. Diagnostics:
  `.scratch/qa/qa-smoke-t285-full/diagnostics.json`.

## Claim ceiling

Allowed: imported fade-in time/color/animation/sound parsing, AIR duration
resolution, bounded reset/next-round pre-round snapshot state, AIR/SFF
presentation, color fallback, and one-shot FightFX sound routing.

Blocked: exact `intro` and `FightScreenRound` frame-start ordering, shutter
interaction, localcoord/motif transforms, skip input and `RoundNoSkip`,
actor/input gating during the fade, dialogue, Common1/ZSS release, team/Turns
choreography, rollback/netplay, score movement, and full MUGEN/IKEMEN parity.

## Closure audit

- The local source confirms `fadeIn.init(..., true)` at round reset, a fade-out
  priority over fade-in during stepping/drawing, and a global sound at fade
  start. The adapter preserves those ownership boundaries without coupling the
  runtime snapshot to renderer or actor state.
- Animation-backed fades suppress the color opacity contribution while the
  resolved AIR/SFF layer is available. Missing actions or sprites remain
  visible through the color fallback and renderer diagnostics.
- `preRoundFrame` is reset for both explicit reset and `startNextRound`, and
  the sound deduplication key includes the fade direction and numbered round.
- No compatibility score or required trace checksum moves in this slice.
