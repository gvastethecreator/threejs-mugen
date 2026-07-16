# Research: productive multi-kind PackageAnalysis/v1 export

Date: 2026-07-16
Lane: R2 scanner evidence and Studio export trust
Wayfinder ticket: 228
Implementation commits: `9bce8fde`, `eee286a1`

## Question

What is the smallest export proof that demonstrates PackageAnalysis is useful
for a real MUGEN package without confusing static classification with runtime
compatibility?

## Primary sources

- [Elecbyte M.U.G.E.N 1.1 overview and file layout](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
- [Elecbyte M.U.G.E.N upgrade notes](https://www.elecbyte.com/mugendocs-11b1/upgrading.html)
- [IKEMEN GO official repository](https://github.com/ikemen-engine/Ikemen-GO)
- [Pinned IKEMEN GO revision](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)

The Elecbyte package vocabulary gives the report its MUGEN-facing role
categories: character content, stages, system data, and screenpack/motif
content. The pinned IKEMEN revision remains the authority for the scanner
profile identity, but the browser report is not an IKEMEN runtime.

## Repository facts

- `PackageAnalysis/v0` already classifies files, bounded references, parser
  diagnostics, and IKEMEN scanner findings from the import VFS.
- `PackageAnalysis/v1` adds source/per-file SHA-256 identity plus semantic and
  envelope markers, so the exported report can be compared and validated.
- Studio Build, Evidence, Trust Chain, and ZIP export consume the same v1
  object rather than independently rebuilding scanner output.
- The official KFM fixture contains character files, stage files, system CNS,
  and ending/intro DEF content that exercises the screenpack category.

## Decision

Use summary coverage as the productive export gate:

1. Require at least three entrypoints for a real package route.
2. Require non-zero `character`, `stage`, `system`, and `screenpack` category
   counts in the bridge projection.
3. Require the same coverage and v1 identity fields after ZIP round-trip.
4. Keep scanner status and claims explicit: static recognition can be
   `recognized` or `partial`, while IKEMEN-only findings remain
   `scanner-only`/unsupported for runtime purposes.

This tests the persistence boundary that matters to users: imported VFS,
Studio inspection, Trust Chain target, required package manifest, and the
actual ZIP payload all agree on one report identity.

## Evidence and residual uncertainty

The browser smoke passed with 14/14 recognized files, four entrypoints, 47
findings, and category counts `character:39`, `stage:5`, `system:1`,
`screenpack:2`. ZIP inspection found 68 files and no missing bundled files or
absolute path leaks. Console and page-error counts were both zero.

The category count proves report persistence and export integrity only. It
does not prove that a screenpack, ZSS/Lua feature, binary asset, or controller
executes equivalently in Three.js or in IKEMEN Go. Those need separate
runtime-backed or release-policy contracts.
