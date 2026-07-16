# Research: repository stage browser proof

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 219

## Question

Which application boundary must be proven before a repository-authored stage
can enter the browser evidence lane?

## Decision

Use one combined package VFS containing the repository-owned MUGEN Lite
character and Skyline Relay stage. Generate its ZIP from that VFS, and feed the
same entries through the real browser `webkitdirectory` input. Compare the
application's source fingerprints rather than compressed ZIP bytes: archive
compression is a transport detail, while paths and file content are the
identity contract.

## Implementation findings

- Root-level `chars/` packages need explicit preference in
  `MugenCharacterLoader`; otherwise a sibling stage DEF can win fallback
  selection.
- Browser directory selection prepends the selected folder name to
  `webkitRelativePath`. `FolderCharacterSource` now strips only that common
  native FileList root. Explicit relative paths used by persisted source
  handles retain their existing semantics.
- The visible application exposes the imported stage report and Studio Stage
  surface, including layer status, BGCtrl status, unsupported feature rows,
  and stage contract data.

## Evidence design

- ZIP and folder imports are run in fresh browser pages.
- The source fingerprint and file count are compared across both transports.
- Desktop and mobile screenshots are accompanied by canvas pixel sampling and
  document width checks.
- Page errors and console warnings are captured as hard QA failures.

## Claim boundary

Allowed: the combined repository package enters the visible app through ZIP and
folder inputs, reaches the Skyline Relay Studio stage surface, and renders
non-blank bounded output in desktop/mobile viewports.

Blocked: native regression proof, full journey JSON aggregation, snapshot
promotion, score movement, arbitrary package compatibility, and complete
MUGEN/IKEMEN stage parity.
