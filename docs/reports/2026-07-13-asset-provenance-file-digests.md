# AssetProvenance/v1 File Digest Report

Date: 2026-07-13
Status: closed; implementation and grouped verification passed

## Scope

Source packages now carry a sorted SHA-256 inventory per virtual file. Studio
persists that inventory in the project source contract and exposes provenance
file records that distinguish imported input bytes from files bundled by the
current browser export.

## Contract

- `SourceFingerprint` keeps the aggregate package digest and adds `files` with
  `path`, `digest`, and `byteLength`.
- `AssetProvenance/v1` exposes `inputFiles` and `outputFiles`; each path is
  redacted before publication and each digest is validated as SHA-256.
- `complete` requires complete evidence on both the input and output side.
- A missing file digest keeps the record `partial`; a required durable
  permission that is not granted remains `blocked`.
- Multi-file output does not receive a fabricated aggregate digest.

## Claim Ceiling

Allowed: source-file and exported-file hash coverage for the current session,
with path-redaction evidence.

Blocked: durable source editing/recovery, license certainty, arbitrary
transform-chain provenance, and full MUGEN/IKEMEN parity.

## Verification

- Focused identity/provenance/model/transaction tests: 4 files, 29 tests
  passed.
- Full test suite: 191 files, 1991 tests passed.
- TypeScript 7 typecheck, module boundaries, CSS budget, Node smoke syntax,
  and `git diff --check`: passed.
- Production build: 1,690.37 kB JavaScript, 424.86 kB gzip; the existing
  large-chunk advisory remains visible.
- Runtime traces: 581/581 artifacts passed (547 required, 34 optional, 0
  skipped).
- Browser smoke: passed with 0 page errors and 0 console issues. The imported
  Build route persisted 14 source file digests, exposed 10 input files and 53
  bundled output files, produced 2 complete provenance records, and reported 0
  absolute-path leaks. The native Asset Library route still correctly reports
  metadata-only records as partial.

## Official References

- [MDN `SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)
