# Studio promoted compatibility snapshot closeout

Date: 2026-07-16
Slice: Wayfinder 222
Implementation commit: `abfa4c77`

## Result

The repository's passed compatibility snapshot is now consumable from Studio
Evidence and Build. The implementation keeps the tracked artifact's status,
coverage, digests, source revision, and claim ceiling intact across the UI and
project ZIP export.

## Evidence

| Area | Result |
| --- | --- |
| Snapshot parser/source mirror | passed; malformed data fails closed |
| Studio Evidence record | `compat:snapshot`, status `ok` |
| Build Readiness | `compatibility-snapshot`, state `exportable` |
| Trust Chain | Build/Evidence row targets `compatibility` evidence |
| Package export | required snapshot file present in manifest and ZIP |
| Snapshot coverage | `2/2` required entries passed, `8` artifact refs |
| Snapshot identity | semantic `618279ad`, transport `7715b41e` |
| Focused unit batch | `5/5` tests passed |
| TypeScript 7 / build / syntax / diff hygiene | passed; existing large-chunk warning remains |
| Focused browser QA | desktop/mobile passed; `0` console issues, `0` page errors, no horizontal overflow |

Artifacts:

- `.scratch/qa/studio-compatibility-snapshot/browser-diagnostics.json`
- `.scratch/qa/studio-compatibility-snapshot/studio-evidence-snapshot.png`
- `.scratch/qa/studio-compatibility-snapshot/studio-evidence-snapshot-mobile.png`
- `.scratch/qa/studio-compatibility-snapshot/project-package.zip`

## Audit

The source mirror is generated only after the canonical materializer succeeds.
The browser projection is validated by the same parser as the corpus snapshot,
and the package inspector requires the same schema/status/coverage instead of
only checking that a file exists. The broader `pnpm run qa:smoke` reached and
passed the new assertions but stayed red on the existing Workbench reopen
check, where the saved project reopened as `Local Fighting Project` rather
than the authored name. That issue is recorded as a separate follow-up and is
not hidden by this feature gate.

## Claim ceiling

Allowed: the two repository-owned required-legal routes remain indexed by a
passed snapshot and are now visible/portable through Studio.

Blocked: external Ikemen-Go regression, complete MUGEN/IKEMEN parity,
arbitrary third-party package breadth, release readiness, and score movement.

## Next frontier

Fix the Workbench reopen path, then continue the open Studio editor/runtime
contracts from the roadmap rather than widening compatibility claims.
