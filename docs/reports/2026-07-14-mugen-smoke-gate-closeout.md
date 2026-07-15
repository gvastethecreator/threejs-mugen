# MUGEN Smoke Gate Closeout

Date: 2026-07-14
Scope: browser QA for the legal MUGEN Lite fixture, imported Code Fu Man, and Studio surfaces.

## Result

The fresh external-server smoke passed with `status=passed`.

- Artifact: `.scratch/qa/qa-smoke/diagnostics.json`
- Artifact timestamp: `2026-07-15T04:38:17.084Z`
- Runner output: `.scratch/qa/qa-smoke-node-20260715-013035.out.log`
- Browser: Playwright against `http://127.0.0.1:5317`
- Console issues: `0`
- Page errors: `0`
- Captured screenshot paths: `64`

## Runtime Evidence

The legal MUGEN Lite fixture passed on desktop and mobile with nonblank canvas output and idle return:

- Direct combat: imported opponent `5000`, life `945`, then bounded `5050` and `5100` fall states.
- Recovery: imported player `5000 -> 5050 -> 5100 -> 5200`.
- Guard: imported player `150`, `guarding=true`, no chip damage.
- No-KO slow: imported player `210`, opponent life `0`, round `ko`, `noKoSlow=true`, post-round frame `4`, playback rate `1`.
- Palette: imported player `220`, AIR group `200`, remap `1,1 -> 1,2`.
- Desktop and mobile canvas pixel checks were nonblank for every captured route.

The imported Code Fu Man route passed in the same fresh smoke:

- Normal attack `200`.
- QCF special `1000`.
- Upper special `1100`.
- All three routes returned to idle.

Studio workbench, build, debug, source relink, stage, asset, and IKEMEN scan journeys also completed in the same run.

## QA Changes

Commits:

- `9a19bd9e` `test: synchronize scripted input journeys`
- `ea50030e` `test: make MUGEN Lite smoke journeys deterministic`

The harness now waits for the runtime snapshot tick after forced steps, drives authored command samples while paused where timing matters, and avoids persistent page-evaluation polling for the Code Fu Man, combat, recovery, guard, palette, and NoKOSlow gates. Failure messages include the last runtime snapshot for triage.

## Follow-up Gates

The post-round code gate is now closed:

- TypeScript `7.0.2`: `pnpm typecheck` passed.
- Production build: passed; Vite emitted the existing large-chunk advisory at `1,795.31 kB`.
- Full suite: `213/213` files and `2149/2149` tests passed with `--testTimeout=30000`. The default 5000 ms run had two timeout-only failures in the same slow trace file; the extended run passed both without assertion changes.
- Trace gate: `600/600` artifacts passed (`566` required, `34` optional).
- Boundaries: passed.
- CSS budget: passed at `324085/536051` bytes, `1519/2364` rules, `80/119` repeated declaration groups, and `55/108` cross-file overlaps.
- `git diff --check`: passed.

The browser smoke and code gates now form a complete checkpoint for this QA slice; this does not widen the full MUGEN/IKEMEN parity claim.

## Source Notes

- [Elecbyte CNS reference](https://www.elecbyte.com/mugendocs/cns.html)
- [Elecbyte state controllers](https://www.elecbyte.com/mugendocs/sctrls.html)
- [Ikemen-GO ZSS reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS)
