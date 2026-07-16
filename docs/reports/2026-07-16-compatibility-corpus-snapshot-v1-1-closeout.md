# CompatibilityCorpusSnapshot/v1.1 closeout

Date: 2026-07-16
Slice: Wayfinder 216
Implementation commit: `eb85b809`

## Result

The tracked compatibility corpus snapshot now has an evidence freshness
boundary. The producer injects the live Git revision and reference time,
validates the max-age window, probes each passed artifact, and records its
SHA-256 content digest. Missing, stale, mismatched, or unexpected-revision
inputs fail closed.

## Evidence

| Area | Result |
| --- | --- |
| Focused tests | `7/7` passed across the snapshot schema and materializer files |
| TypeScript 7 | `pnpm typecheck` passed |
| Writer syntax | `node --check scripts/materialize_compatibility_corpus_snapshot.cjs` passed |
| Materializer | `pnpm materialize:compatibility-snapshot` passed |
| Tracked snapshot | 2 entries, 1 required legal journey, 1 unavailable optional-private entry, 5 passed artifact refs with SHA-256 content digests |
| Diff hygiene | `git diff --check` passed |
| Browser smoke | Not applicable: no visible UI, renderer, or Studio surface changed |

Tracked evidence: `docs/evidence/compatibility-corpus-snapshot-v1.json`.
The stable path is retained for consumers while its schema is now v1.1.

## Adversarial coverage

- Observation/reference changes preserve semantic identity while changing the
  transport checksum when the record remains fresh.
- An observation outside `maxAgeHours` fails.
- A source revision different from `expectedSourceRevision` fails.
- A missing probed file fails the required artifact path.
- A catalog digest different from the probed digest fails the required path.
- A later standalone probe detects content drift in an existing snapshot.

## Quality audit

Manual source/diff audit plus focused failure-path tests were used. No
independent reviewer was available. The implementation is evidence-backed at
the snapshot/materializer boundary; it does not raise any compatibility or
score claim.

## Claim ceiling

Allowed: a revision- and content-verified snapshot for the current
repository-authored legal journey route.

Blocked: the second first-party CC0 route, independent package breadth,
stage parity, automatic license adjudication, Studio release consumption,
score movement, and complete MUGEN/IKEMEN parity.

## Commits

- `eb85b809 feat(compatibility): harden corpus snapshot freshness`

## Next frontier

Materialize the second repository-authored CC0 route with materially different
stage/package assumptions, then execute it through loader, runtime trace,
native, and browser evidence before score adjudication.
