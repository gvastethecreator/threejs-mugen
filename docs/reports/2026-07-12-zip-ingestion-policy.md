# ZIP Ingestion Policy Report

Date: 2026-07-12
Roadmap entry: 459

## Delivered

- Versioned compressed/file/per-entry/aggregate limits.
- Typed rejection codes for malformed, oversized, unsafe-path, and duplicate-path archives.
- Early central-directory checks plus sequential actual-byte enforcement.
- UI rejection logging instead of unhandled async failures.
- Valid archive, malformed bytes, compressed-size, file-count, traversal, absolute-path, collision, per-entry, and aggregate tests.

## Verification

- Focused loader plus legal journey coverage: 2 files / 13 tests passed.
- Full suite: 183 files / 1935 tests passed.
- TypeScript 7 typecheck: passed.
- Production build and architecture boundaries: passed; existing Vite large-chunk advisory remains.
- Trace QA: 565/565 passed; 534 required, 31 optional; MUGEN-lite journey remains `8b19b865`.
- Browser smoke: passed across existing runtime/Studio desktop/mobile surfaces.
- Independent review found directory-entry count bypass and untyped entry-stream failures. Both P2 findings were closed with focused tests; re-review found no remaining P1/P2.

## Claim boundary

This is bounded upload defense in depth. Antivirus, arbitrary content scanning, parser isolation, metadata-free perfect pre-decompression limits, password/multivolume archives, and complete sandbox security remain blocked.
