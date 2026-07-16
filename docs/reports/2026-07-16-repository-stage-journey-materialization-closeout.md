# Repository stage journey materialization closeout

Date: 2026-07-16
Slice: Wayfinder 220 (T06-c)
Implementation commits: `16ccc454`, `b95036ca`

## Result

The repository-authored Skyline Relay package now has one serialized journey
that links production runtime and browser evidence through the same package
digest. The artifact is parser-valid and remains `partial` because native
regression fields are explicitly `not-run`.

## Evidence

| Area | Result |
| --- | --- |
| Browser route | passed: ZIP and folder imports, desktop/mobile Stage Studio |
| Runtime artifact | passed: loader, depth, BGCtrl, and round-reset checks `4/4` |
| Next round | applied; outcome `draw`; `matchOver = false` |
| Journey parser | `0` errors |
| Journey status/checksum | `partial` / `d0be680a` |
| Package identity | `sha256:9c8a0b7cbd8d298eda5450518045e8d67e5d9a4a409e3186c5eef33a7183b456` |
| Native regression | explicit `not-run` |
| Browser diagnostics | `0` page errors, `0` console issues |
| Full test suite | `220/220` files, `2293/2293` tests passed |
| TypeScript 7 / build / boundaries | passed; existing large-chunk warning remains |
| Trace QA | `633/633` passed; `599` required, `34` optional, `0` skipped |

## Artifacts

Commands:

```text
pnpm run qa:stage:repository
pnpm run materialize:repository-stage-journey
```

Output directory: `.scratch/qa/repository-skyline-relay-browser/`

- `browser-diagnostics.json`
- `journey.json`
- `runtime.json`
- desktop/mobile full-page screenshots
- desktop/mobile canvas screenshots

## Source basis

- `src/mugen/runtime/RepositoryStageJourney.ts`
- `src/mugen/compatibility/StageCompatibilityJourney.ts`
- `src/tests/RepositoryStageJourneyMaterializer.test.ts`
- `scripts/materialize_repository_stage_journey.cjs`
- `scripts/qa_repository_stage_compatibility.cjs`

## Claim ceiling

Allowed: one repository-owned CC0 stage package has linked, parser-valid
runtime and browser evidence.

Blocked: native regression proof, compatibility snapshot promotion, score
movement, arbitrary third-party package breadth, and complete MUGEN/IKEMEN
stage parity.

## Next frontier

Run native regression against the same package identity, then adjudicate
whether the combined journey satisfies the corpus snapshot promotion gate.
