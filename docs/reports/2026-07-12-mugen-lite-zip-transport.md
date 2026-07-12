# MUGEN-lite ZIP Transport Report

Date: 2026-07-12
Roadmap entry: 458

## Delivered

- Deterministic DEFLATE archive generation from the legal package VFS.
- Fixed entry timestamps and DOS platform metadata.
- Production `ZipCharacterSource` extraction in the required journey path.
- Focused signature, byte-repeatability, VFS parity, source-name, and loader assertions.

## Evidence

- Focused fixture tests: 3/3 passed.
- Full suite: 182 files / 1925 tests passed.
- TypeScript 7 typecheck: passed.
- Production build and architecture boundaries: passed; existing Vite large-chunk advisory remains.
- Required journey remains checksum `8b19b865`; full trace and regression totals are recorded after closeout gates.
- Full trace QA: 565/565 passed; 534 required, 31 optional.
- Independent review verified byte stability across UTC, America/Argentina/Buenos_Aires, and Asia/Tokyo, then found the initial VFS parity assertion compared paths only. Per-entry byte equality closed that P2; re-review found no remaining P1/P2.

## Claim boundary

One repository-owned package now crosses actual ZIP transport before import/runtime execution. Hostile/corrupt/password/multivolume archives, arbitrary third-party layouts, exact Common1 behavior, visual/audio parity, and full MUGEN/IKEMEN parity remain blocked.
