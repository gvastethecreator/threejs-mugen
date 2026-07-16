# PackageAnalysis/v1 multi-kind export closeout

Date: 2026-07-16
Wayfinder ticket: 228
Implementation commits: `9bce8fde`, `eee286a1`

## Status

| Area | Status | Evidence |
| --- | --- | --- |
| Character coverage | passed | v1 summary and required ZIP payload |
| Stage coverage | passed | v1 summary and required ZIP payload |
| System coverage | passed | v1 summary and required ZIP payload |
| Screenpack coverage | passed | v1 summary and required ZIP payload |
| Studio Build/Evidence/Trust | passed | one current v1 report and target |
| ZIP round-trip | passed | 68 files, 53 bundled binaries, no missing files |
| Workbench reopen regression | passed | clean/dirty conflict journey, revisions 2 -> 3 -> 4 |
| Browser runtime health | passed | 0 console issues, 0 page errors |

## Observed record

The imported KFM report carries 14/14 recognized files, four entrypoints, 47
findings, source SHA-256
`4b5ff597d4a17328d718d43281a4ab8634f9fc10519fe70ba58bc63170f3527d`, semantic
digest `c5497ed8`, and envelope checksum `caace7d0`. Category coverage is
`character:39`, `stage:5`, `system:1`, and `screenpack:2`.

The exported `studio/package-analysis.json` is required by the package
manifest and retains the v1 envelope plus nested v0 report. The package also
reports zero missing bundled files and zero absolute-path leaks.

## QA adjudication

The Workbench storage smoke was hardened after a diagnostic showed the stored
row could be attached but geometrically `0x0` during a live shell refresh. The
test now dispatches the delegated DOM event and emits bridge/selector state if
the project still fails to open. The subsequent full `pnpm run qa:smoke` passed
in 280.6s.

## Claim ceiling

This closes productive static multi-kind analysis export. It does not claim
IKEMEN execution, screenpack rendering, ZSS/Lua support, binary semantic
equivalence, licensing, external-engine parity, or full MUGEN/IKEMEN parity.
Asset provenance remains a separate release-readiness concern.

Artifacts:

- `.scratch/qa/qa-smoke/diagnostics.json`
- `.scratch/qa/qa-smoke/project-package.zip`
- [PackageAnalysis/v1 contract](../../src/mugen/compatibility/PackageAnalysis.ts)
- [Studio integration](../../src/app/App.ts)
