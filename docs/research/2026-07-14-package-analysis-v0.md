# PackageAnalysis/v0 research and closeout

Date: 2026-07-14

## Official basis

- [Elecbyte M.U.G.E.N 1.1 Beta 1 overview](https://www.elecbyte.com/mugendocs-11b1/mugen.html) separates `chars/`, `stages/`, `data/select.def`, motif files, and the character/stage asset extensions. This is the package-role boundary used by the analyzer.
- [Elecbyte CNS format](https://www.elecbyte.com/mugendocs/cns.html) defines CNS as editable text organized into StateDef/state-controller groups. The analyzer therefore preserves parser locations and does not treat a discovered text file as executed behavior.
- [Elecbyte stage/background documentation](https://www.elecbyte.com/mugendocs/bgs.html) defines stage `DEF` background and music references. Stage references are resolved through the same virtual package filesystem and remain unknown when their target is absent.
- [Elecbyte state controller reference](https://www.elecbyte.com/mugendocs/sctrls.html) is the compatibility boundary for controller semantics; this slice records unsupported IKEMEN controller signals without executing them.
- [Ikemen-GO repository](https://github.com/ikemen-engine/Ikemen-GO) and its [ZSS reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/ZSS) establish the `ikemen-go-scan` profile and the report-only ZSS/Lua ceiling.

## Contract

`src/mugen/compatibility/PackageAnalysis.ts` adds
`mugen-web-sandbox/package-analysis/v0` over the existing `VirtualFileSystem`.
It produces deterministic, checksum-protected findings for character, stage,
system, and screenpack files. Each finding carries a source path, optional line,
status (`recognized`, `unsupported`, or `unknown`), and dependency when the
finding represents a reference. The result also records MUGEN version/profile
metadata and the fixed `ikemen-go-scan` profile with an explicit scanner-only
claim.

The analyzer uses the existing DEF/stage/config parsers and `PathResolver`,
plus the existing IKEMEN scanner. `select.def` gets a small section-aware entry
reader because its roster rows are not ordinary key/value DEF assignments.
Missing references and malformed parser input remain `unknown`; scanner-only
IKEMEN signals remain `unsupported`. No finding promotes execution, rendering
parity, licensing, or score credit.

## Evidence

- `src/tests/PackageAnalysis.test.ts`: 4 focused tests pass.
- Mixed character/stage/system/screenpack fixture proves source locations,
  resolved and missing dependencies, ZSS scanner output, profile metadata,
  deterministic checksum, and tamper rejection.
- Stage-only and system-only VFS fixtures use the same analyzer entrypoint.
- `pnpm typecheck` passes on TypeScript 7.0.2.

## Claim ceiling

Allowed: bounded package analysis with source-located classification and
report-only IKEMEN recognition.

Blocked: ZSS/Lua execution, full screenpack/motif parity, runtime compatibility
credit from scanning, license validation, rollback/netplay, and full package
runtime parity.
