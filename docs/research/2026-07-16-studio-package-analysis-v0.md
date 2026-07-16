# Research: Studio PackageAnalysis/v0

Date: 2026-07-16
Lane: R2 Studio editor reliability and compatibility evidence
Wayfinder ticket: 226
Implementation commit: `6d6bb985`

## Question

How can Studio tell the user what an imported MUGEN or IKEMEN package
contains, while keeping scanner recognition separate from runtime support?

## Primary sources

- [Elecbyte M.U.G.E.N 1.1 overview and file layout](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
- [Elecbyte M.U.G.E.N upgrade notes](https://www.elecbyte.com/mugendocs-11b1/upgrading.html)
- [Elecbyte M.U.G.E.N state controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [IKEMEN GO official repository](https://github.com/ikemen-engine/Ikemen-GO)
- [IKEMEN GO release notes and MUGEN-resource compatibility context](https://github.com/ikemen-engine/Ikemen-GO/releases)

The M.U.G.E.N documentation establishes the package vocabulary used by the
scanner: `chars/`, `stages/`, `data/select.def`, definition files, and the
character/stage resource families. IKEMEN GO is treated as a separate engine
profile because compatibility with MUGEN resources does not imply that
IKEMEN-specific scripts or screenpack behavior execute in this browser port.

## Repository findings

- `VirtualFileSystem` is already the source of truth for imported folder and
  ZIP content, making it the correct boundary for deterministic analysis.
- Existing DEF, stage, config, and IKEMEN feature scanners expose source paths,
  line numbers, dependencies, parser diagnostics, and unsupported findings.
- `PackageAnalysis.ts` can therefore compose bounded evidence without adding a
  second parser or inventing a parallel source identity.
- Existing Evidence, Build Readiness, Trust Chain, and ZIP manifest contracts
  provide the consumers; the missing piece was durable package-level
  materialization and export.

## Decision

Create an app-independent `PackageAnalysis/v0` report at source-import accept
time. Keep it immutable, parser-validated, checksum-protected, and explicitly
scanner-only for IKEMEN. Use one report in all Studio surfaces and in the
exported package rather than recomputing divergent summaries per view.

Status policy:

- `recognized`: entrypoints and findings are bounded with no unsupported or
  unknown finding;
- `partial`: a usable entrypoint exists but unsupported or unknown findings
  remain;
- `unknown`: no recognized runtime entrypoint exists.

## Verification

The focused tests cover deterministic ordering/checksums, tamper rejection,
missing-entrypoint failure, role classification, reference resolution, and
IKEMEN scanner findings. Browser smoke then proves the real source-import path,
Evidence/Trust targeting, folder/ZIP parity at the shared VFS boundary, and
required export payload.

## Boundaries

This report is compatibility evidence, not a loader promotion. It does not
execute IKEMEN Go, ZSS, Lua, screenpack controllers, or unsupported MUGEN
features. It also does not certify content licenses or claim full engine
parity. The next implementation must earn a separate runtime contract before
these claims can move.
