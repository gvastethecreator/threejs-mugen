# Research: Official stage corpus promotion

## Question

How can the official Training Room stage join the existing compatibility
denominator without conflating a stage journey with a character journey,
copying external binaries, or moving the compatibility score on one bounded
route?

## Primary sources

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte stage/background tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html)
- [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html)
- [SPDX 3.0.1 license expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/)

## Decision

Keep `CompatibilityCorpus/v0` as the package-level denominator and widen its
journey input to the two existing typed envelopes:

- `CompatibilityJourney/v1` for character routes.
- `StageCompatibilityJourney/v1` for stage routes.

Every entry retains `journeySchema`, package identity, expected routes,
evidence references, and normalized unsupported-feature density. Stage reports
source that density from `StageCompatibilityReport` as `stage:*`; character
reports keep their existing loader namespace. The official Training Room route
is `optional-private`, because its external sample is legal evidence for the
bounded noncommercial route but is not a public redistribution grant.

The corpus remains reference-only. It does not embed DEF/SFF/readme bytes or
browser captures. Its local deterministic checksum convention remains distinct
from a claim of full RFC 8785 JCS compliance, and the parser now rejects an
unknown journey schema.

## Evidence

- Code commits: `590acb23` (stage journey promotion) and `440516e4` (schema
  validation hardening).
- `CompatibilityCorpus.test.ts`: 4/4 focused tests passed.
- TypeScript 7 `pnpm typecheck`: passed.
- Native closeout: 211 test files / 2129 tests with
  `pnpm test -- --maxWorkers=2 --testTimeout=20000`; `pnpm build` passed with
  289 modules; boundaries, CSS budget, and 600/600 trace artifacts passed.
- Browser closeout: `pnpm qa:stage` passed at desktop/mobile with decoded
  Training Room DEF/SFF, two rendered/tiled layers, nonblank canvases, no
  horizontal overflow, and zero page/console errors.

## Claim ceiling

Allowed: a deterministic optional-private corpus entry for the official sample
stage, with explicit schema, provenance, route, unsupported-feature, and gate
references.

Blocked: score movement, commercial redistribution, full BGCtrl/window/zoom/
mask/music/motif parity, full MUGEN/IKEMEN stage parity, and a committed binary
fixture corpus.

## Next

Adjudicate the written score band against the expanded denominator, then select
the next independently evidenced stage/runtime gap.
