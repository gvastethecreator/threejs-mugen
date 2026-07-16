# Research: Studio promoted compatibility snapshot

Date: 2026-07-16
Lane: R2 Studio evidence and export
Wayfinder ticket: 222

## Question

How should a machine-materialized compatibility snapshot become visible in
Studio without turning a repository checkpoint into a claim of full parity?

## Decision

Keep `docs/evidence/compatibility-corpus-snapshot-v1.json` canonical and ship a
generated source mirror consumed only through `parseCompatibilityCorpusSnapshot`.
Project Build/Evidence receives a typed projection with explicit status,
coverage, source revision, observed time, semantic digest, transport checksum,
and blocked claims. A malformed source fails closed instead of producing an
optimistic UI state.

## Findings

- The snapshot belongs in both surfaces because Evidence answers “what proof
  exists?” while Build answers “what can be exported?”; neither should infer
  proof from a green runtime-only gate.
- The Trust Chain needs a separate `compatibility-snapshot` row so a passed
  stage journey remains distinguishable from generic compatibility gates.
- The package must carry the same machine-readable snapshot as the UI. The
  required `qa/compatibility-corpus-snapshot-v1.json` entry prevents a ZIP
  from losing the promoted evidence at handoff.
- The UI labels the data as a promoted checkpoint and keeps source revision
  visible. The tracked status is not treated as an external engine run.

## Source alignment

The snapshot content and bounded stage route remain governed by the earlier
[repository stage promotion research](2026-07-16-repository-stage-snapshot-promotion.md)
and the tracked [snapshot artifact](../evidence/compatibility-corpus-snapshot-v1.json).
This slice changes evidence transport and visibility, not the compatibility
semantics or claim denominator.

## Verification policy

The focused browser gate checks Build, Evidence, Trust Chain routing, required
ZIP contents, parser-visible status/digests, desktop/mobile rendering, and
console/page diagnostics. The broader smoke remains separately reported when
an unrelated Workbench project-reopen assertion fails.
