# Research: stage quality checkpoint Entry 538

## Question

Did the three accumulated stage projection slices preserve the existing
runtime, build, trace, browser, and compatibility contracts?

## Audit scope

This checkpoint covers Entries 535-537: authored layer scale
(`scalestart`/`scaledelta`/`zoomdelta`), linked background positions
(`positionlink`), and legacy vertical scale (`yscalestart`/`yscaledelta`). The
official stage contract remains grounded in the
[Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html).

## Evidence

- Native suite: 211 files / 2140 tests passed.
- Stage focal suite: 4 files / 28 tests passed.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: 289 modules passed. The existing large-chunk advisory
  remains; output is 1,787.49 kB JavaScript / 449.08 kB gzip and 266.10 kB
  CSS / 36.76 kB gzip.
- Boundaries and CSS budget passed: 324085 bytes, 1519 rules, zero duplicate
  selector keys, zero exact duplicate rules.
- Official stage browser: Training Room loaded through the real ZIP input with
  2 decoded sprites, 2 rendered/tiled backgrounds, nonblank desktop/mobile
  canvases, no overflow, and zero page/console issues.
- Trace: 600/600 artifacts passed, 566 required / 34 optional, 0 skipped.

## Decision

Keep the current score unchanged. The checkpoint proves regression-safe
bounded stage projection and official-stage browser continuity, not exact
parallax, camera/window/mask, shared BGCtrl, or full MUGEN/IKEMEN parity.

## Next

Choose the next independent runtime or Studio slice and accumulate evidence
before another broad closeout.
