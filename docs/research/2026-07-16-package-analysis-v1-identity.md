# Research: PackageAnalysis/v1 identity and freshness

Date: 2026-07-16
Lane: R2 scanner evidence and Studio export trust
Wayfinder ticket: 227
Implementation commits: `4cbb1763`, `152097f3`

## Question

What identity fields are required for a scanner report to remain reproducible
and reviewable after import, export, and later observation, without turning
static recognition into runtime compatibility?

## Primary sources

- [Elecbyte M.U.G.E.N 1.1 package layout](https://www.elecbyte.com/mugendocs-11b1/mugen.html)
- [Elecbyte M.U.G.E.N upgrade notes](https://www.elecbyte.com/mugendocs-11b1/upgrading.html)
- [IKEMEN GO official repository](https://github.com/ikemen-engine/Ikemen-GO)
- [Pinned IKEMEN GO source revision](https://github.com/ikemen-engine/Ikemen-GO/tree/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
- [Pinned IKEMEN compiler source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go)

Elecbyte documents the `chars/`, `stages/`, `data/select.def`, DEF, AIR,
CNS, CMD, SFF, and SND package vocabulary. The pinned IKEMEN revision is the
authority for the scanner's IKEMEN-only profile identity; the browser scanner
does not execute that upstream engine or its scripts.

## Repository facts

- `StudioSourceIdentity.fingerprintVirtualFileSystem()` already produces a
  sorted aggregate SHA-256 plus per-file SHA-256 and byte lengths.
- `PackageAnalysis/v0` already owns normalized roles, references, parser
  diagnostics, IKEMEN findings, and source-located `path`/`line` targets.
- `GateEvidence` and `CompatibilityCorpusSnapshot` establish the repository
  pattern of separating semantic identity from observation/envelope integrity.
- Studio Build, Evidence, Trust Chain, and ZIP export already consume one
  report object; v1 can wrap it without duplicating scanner work.

## Decision

Use a nested v1 envelope:

1. source identity comes from the existing VFS SHA-256 fingerprint;
2. v0 remains the nested analysis projection, preserving targetable findings;
3. analyzer, ruleset, and pinned upstream identities are required and exact;
4. semantic digest omits `observedAt`, source display name, and nested
   transport checksum while including source file digests and normalized
   findings;
5. envelope checksum covers the complete record, including observation time;
6. parser validates nested v0 independently before accepting the v1 envelope.

The semantic and envelope digests use the repository's deterministic FNV-1a32
stable JSON helper. They are transport/semantic identity markers, not a
cryptographic substitute for the source SHA-256. This is explicit in the
contract so future stronger hashing can be versioned rather than silently
changing existing identities.

## Verification

Contract tests prove insertion-order determinism, observation-time separation,
nested tamper rejection, analyzer/ruleset/upstream version drift rejection,
source-to-analysis mismatch rejection, and the existing role/reference/IKEMEN
matrix. The browser smoke proves v1 materialization on the real KFM ZIP and
IKEMEN scan fixture, Bridge exposure, Trust target, and required ZIP export.

## Remaining uncertainty

The scanner still cannot prove that binary asset bytes are semantically
equivalent to renderer output, and the pinned upstream identity does not prove
that every scanner rule is a complete model of IKEMEN behavior. Those require
separate runtime or release-policy contracts. The immediate next proof is a
multi-kind export assertion for character, stage, system, and screenpack
findings.
