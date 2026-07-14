# Research Note: CompatibilityCorpus/v0

Date: 2026-07-14
Entry: 525
Lane: R1 runtime compatibility

## Scope

The repository already has `CompatibilityJourney/v1`, which describes one
package and its loader, runtime, browser, and native regression evidence. The
next missing contract was a denominator that can distinguish legal evidence,
portable evidence, and private optional evidence without duplicating package
payloads.

## Primary sources

- [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html)
  establishes the need for deterministic canonical serialization when signed or
  hashed JSON is compared.
- [SPDX 3.0.1 license expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/)
  defines the expression vocabulary used by package license evidence.
- The existing local `CompatibilityJourney/v1` contract remains the runtime
  evidence source; the corpus does not rerun loader, trace, browser, or native
  gates.

## Decision

`CompatibilityCorpus/v0` is a normalized index over journey references. Each
entry has one availability class:

| Class | Meaning |
| --- | --- |
| `required-legal` | Required evidence with a verified license and a complete journey. |
| `portable-legal` | Independently portable legal evidence, kept distinct from the required baseline. |
| `optional-private` | Local/private evidence or an absent optional fixture; absence requires a reason. |

The result publishes entry/status counts, package identities, expected route
ids, unsupported feature ids, claim language, diagnostics, and a stable
checksum. It intentionally omits `package.files` and all binary/browser
payloads so the index cannot be mistaken for an asset bundle.

## Fail-closed rules

- A corpus without a required or portable entry is invalid.
- Required/portable entries without a journey are invalid.
- Duplicate entry ids or package ids are invalid.
- A journey with an unverified license is invalid.
- Optional private entries without an unavailable reason are invalid.
- Empty allowed/blocked claim sets are invalid.
- Parsed results must preserve canonical entry order, normalized claims,
  recomputed summary/status, and checksum.

The local implementation uses the repository's established stable-stringify
and project-local checksum convention. It does not claim to implement the full
RFC 8785 JCS algorithm or to validate SPDX grammar by itself; those remain
source and policy references around the existing journey verification.

## Evidence

- Focused `CompatibilityCorpus.test.ts`: 3/3 tests.
- TypeScript 7 typecheck: passed.
- Broad repository tests: 210 files / 2125 tests.
- Production build: 289 modules; the existing chunk-size advisory remains.
- Boundary check, CSS budget, and trace gate: passed; trace is 600/600 with
  566 required and 34 optional artifacts.
- Code commit: `8d33f126`.

## Claim ceiling

This closes the schema/aggregation boundary only. It does not establish a
larger public corpus, alter compatibility scores, execute Lua/ZSS, validate
commercial permissions, or prove stage, screenpack, renderer, rollback,
netplay, or full MUGEN/IKEMEN parity.

## Next research question

Which repository-authored or independently legal stage/package route can add a
new route family with its own loader/runtime/browser evidence while preserving
the corpus classes and claim ceiling?
