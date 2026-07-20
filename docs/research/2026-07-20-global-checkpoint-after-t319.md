# Global checkpoint after T319

Date: 2026-07-20
Feature commit: `7c4db6be` (`feat(render): present FightScreen win type overlays`)
Status: green at bounded feature scope

## Delivered slice

T319 renders the selected FightScreen win type as separate background and FNT
text groups. It carries the winning side beside the result-family side, applies
the Ikemen-GO `time/displaytime` window, and records overlay diagnostics. The
feature ticket, source-backed research note, and Wayfinder map are committed
with the implementation.

## Global gates

| Gate | Result |
| --- | --- |
| `pnpm test` | Passed: 237 files / 2528 tests |
| `pnpm typecheck` | Passed with TypeScript 7 |
| `pnpm build` | Passed: 323 modules; JS 2,064.19 kB, gzip 517.94 kB |
| `pnpm qa:trace` | Passed: 633/633 artifacts; 599 required + 34 optional; 0 failed |
| `pnpm qa:smoke` | Passed: Runtime desktop/mobile, MUGEN Lite, tag flow, Studio flows |
| `git diff --check` | Passed for the feature closeout |

The build keeps the existing large-chunk warning. The smoke run reported the
existing Studio Debug warning for missing `sound/kfm.mid`; it reported zero
root page or console errors. Runtime desktop and mobile captures showed the
fight scene, HUD, debug surface, and controls without critical overlap. Studio
project authoring and Debug captures also remained legible at their checked
viewports.

Trace coverage remains source and fixture evidence for the validated corpus:
92 controller families, 87 operation families, 459 target-link routes, and
632 effect-store routes.

## Compatibility truth

This checkpoint confirms a green repository gate for the slice. It does not
raise the MUGEN/IKEMEN compatibility score or support a full-port claim. The
win-type sound edge, live perfect/clutch derivation, direct imported screenpack
proof, and broader runtime parity remain open. Studio readiness blockers and
asset review gates remain unchanged.

## Next build boundary

T320 should route the loaded win-type `snd` and `sndtime` fields through the
winner display runtime/audio edge. Keep playback evidence separate from the
visual overlay evidence, then repeat a focused close before the next global
checkpoint.

## Evidence paths

- `.scratch/qa/trace-gates/`
- `.scratch/qa/qa-smoke/runtime-desktop.png`
- `.scratch/qa/qa-smoke/runtime-mobile.png`
- `.scratch/qa/qa-smoke/studio-project-authoring.png`
- `.scratch/qa/qa-smoke/studio-debug.png`
- `docs/research/2026-07-20-fightscreen-wintype-overlay.md`
- `.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/319-fightscreen-wintype-overlay.md`
