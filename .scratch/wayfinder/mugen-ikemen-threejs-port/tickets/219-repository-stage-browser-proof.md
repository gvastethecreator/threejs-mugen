# Prove repository stage folder and ZIP application routes

Type: task
Status: resolved
Blocked by: None

## Question

Can the same repository-authored character/stage package enter the visible
application through both ZIP and browser `webkitdirectory` inputs, preserve one
source identity, and render a bounded stage Studio surface at desktop and
mobile sizes?

## Answer

Yes. The package now composes the repository-owned MUGEN Lite character with
the CC0 Skyline Relay stage. ZIP and folder imports both load the character and
stage through the production loaders and produce the same source fingerprint
(`b24e60d63a09e0f68de62ace5b168487efcc738893df341b7c421cf69f1c655f`). The
browser QA route selects Skyline Relay in Studio and proves non-blank desktop
and mobile canvases, stage contract/layer/BGCtrl diagnostics, no horizontal
overflow, and no page or console diagnostics.

## Authority

- `ZipCharacterSource` owns ZIP policy and extraction.
- `FolderCharacterSource` owns native `webkitdirectory` ingestion; only that
  native FileList strips the selected directory root, while explicit source
  handle paths remain unchanged.
- `MugenCharacterLoader` prefers a root-level `chars/` path as well as nested
  `/chars/` paths, preventing a stage DEF from being selected as the character.
- `App` owns both import routes and the visible Studio stage surface.

## Boundaries

Included: one deterministic repository package VFS, ZIP generation, browser
folder/ZIP equivalence, app import evidence, stage report, desktop/mobile
screenshots, canvas pixel checks, and UI diagnostic checks.

Deferred: materializing the browser result into a full
`StageCompatibilityJourneyResult`, native regression fields, corpus snapshot
promotion, score movement, arbitrary third-party package breadth, and complete
MUGEN/IKEMEN stage parity.

## Verification

- Focused package/folder/journey tests: `7/7` passed.
- Full suite: `219/219` files and `2292/2292` tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; existing large-chunk warning remains.
- `pnpm run check:boundaries`: passed.
- `pnpm run qa:stage:repository`: passed.
- Browser artifacts: `.scratch/qa/repository-skyline-relay-browser/browser-diagnostics.json`,
  desktop/mobile full-page screenshots, and desktop/mobile canvas screenshots.
- Desktop canvas: non-blank, `45` sampled colors, no horizontal overflow.
- Mobile canvas: non-blank, `79` sampled colors, no horizontal overflow.
- Browser page errors and console issues: `0`.

Claim ceiling: the repository package is proven through both visible import
routes and stage Studio rendering. T06 remains open only for journey artifact
aggregation/native fields/snapshot policy; no score moves from this ticket.
