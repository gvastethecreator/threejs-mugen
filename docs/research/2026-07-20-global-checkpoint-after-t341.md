# Global checkpoint after T341

Date: 2026-07-20
Head: `07df3a4d`
Status: green for the T339-T341 ownership block

## Evidence

- Full Vitest: 238 files / 2587 tests passed.
- `pnpm build`: passed with TypeScript 7 and 325 transformed modules.
- `pnpm qa:trace`: 633/633 artifacts passed, including 599 required and 34
  optional artifacts.
- Focused T341 Playable runtime: 1 file / 281 tests passed.
- Repository changes remain split from the pre-existing dirty roadmap and
  daily-research files.

## Block covered

- T339: verified nested Helper ancestry for root-victim TargetLifeAdd cause
  attribution.
- T340: verified nested Helper direct HitDef and Helper-parented Projectile
  source metadata in the `ikemen-go` combat bridge.
- T341: verified live Helper caller ancestry before `RedirectID` target and
  resource dispatch, with strict caller telemetry.

## Known advisories

- Vitest retains the existing jsdom `HTMLCanvasElement.getContext()` warning.
- Vite retains the existing post-minification chunk warning above 500 kB.
- Browser smoke is deferred because this block changed runtime ownership and
  redirect admission only; no renderer or Studio UI file changed.

## Claim ceiling

This checkpoint does not raise compatibility scores or the full-port claim.
Recursive redirect leases, Helper-victim result attribution,
reversal/reflection ownership, exact dispatch ordering, direct screenpack proof,
Studio authoring breadth, and complete MUGEN/IKEMEN parity remain open.
