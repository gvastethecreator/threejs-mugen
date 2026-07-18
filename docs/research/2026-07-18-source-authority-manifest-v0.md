# Research: SourceAuthorityManifest/v0

Date: 2026-07-18  
Ticket: [T266](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/266-source-authority-manifest-v0.md)

## Official source

The official [Ikemen-GO repository](https://github.com/ikemen-engine/Ikemen-GO)
is the upstream project used by the scanner and runtime research lanes. The
repository describes Ikemen-GO as an open-source engine that supports MUGEN
resources and maintains a public commit history. The current project roadmap
records `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` as the normative revision,
while the local shallow cache used by prior runtime slices is
`044da72008b8ba13caf7b0f820526ce16e955fb3`.

These are source identities, not an assertion that the two revisions are
semantically equivalent.

## Repository audit

- `PackageAnalysis/v1` already carries an upstream project/revision, but it is
  embedded inside an analysis result and cannot describe the local checkout
  state or file-level pin delta.
- Recent roadmap audits identify the normative object as unavailable in the
  local shallow cache and call the mutable local copy "pinned"; this is not
  sufficient provenance for a new IKEMEN parity claim.
- Existing digest-bearing contracts use canonical JSON and fail-closed parsing;
  the new model follows that local pattern without importing the app layer into
  the MUGEN compatibility boundary.
- Absolute local paths are intentionally excluded. A cache identifier and
  relative source paths preserve reproducibility without leaking a developer's
  machine layout.

## Decision

`SourceAuthorityManifest/v0` records:

- upstream project and repository URL;
- normative full commit plus required relative file SHA-256 records;
- local-cache full commit, clean/dirty/missing state, and local file digests;
- a derived file delta (`same`, `changed`, `missing`, or `unreviewed`);
- a separate semantic-review status that defaults to `unclassified`;
- allowed/blocked claims and a SHA-256 checksum over canonical payload bytes.

The parser validates the schema, full commit shape, URL, relative paths,
unique file records, digest format, derived delta, and checksum. It does not
infer semantic equivalence from matching bytes and does not allow a dirty cache
to be represented as clean.

## Deferred work

- T267 may use this manifest to attach file-level semantic-delta findings to
  `input.go`, compiler, default-config, round, projectile, and redirect source.
- Fetching or pinning the normative checkout is not part of this model pass.
- Runtime behavior, scanner breadth, scores, and full MUGEN/IKEMEN parity remain
  outside the claim.
