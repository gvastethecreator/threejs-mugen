# Promote repository stage into compatibility snapshot

Type: task
Status: resolved
Blocked by: None

## Question

Can the repository-authored Skyline Relay stage become a required legal entry
in `CompatibilityCorpusSnapshot/v1.1` after its browser, runtime, and local
native regression evidence pass?

## Answer

Yes. The stage journey is now `passed` with checksum `22f0770e`, its native
report is linked at `docs/evidence/repository-stage-native-regression-v1.json`,
and the tracked snapshot contains two passed required-legal entries: MUGEN
Lite Journey and repository Skyline Relay. Snapshot status is `passed`, with
semantic digest `2e3d7305` and transport checksum `d7ddacc9`.

## Authority

- `RepositoryStageJourney` owns stage loader/runtime/browser/native evidence.
- `CompatibilityCorpus` owns entry availability and package identity.
- `CompatibilityCorpusSnapshot/v1.1` owns freshness, artifact probing, and
  promotion status.
- The tracked JSON under `docs/evidence/` is the snapshot artifact, not a
  score or parity claim.

## Boundaries

Included: one second first-party CC0 stage route, ZIP/folder browser proof,
four runtime checks, local focused test/typecheck/build/boundary regression,
machine-readable native report, and snapshot promotion.

Deferred: external Ikemen-Go/native-engine regression, arbitrary third-party
package breadth, long-session stability, complete stage/music/FightFX parity,
and full MUGEN/IKEMEN parity.

## Verification

- `pnpm run qa:stage:repository`: passed; ZIP/folder fingerprint
  `b24e60d63a09e0f68de62ace5b168487efcc738893df341b7c421cf69f1c655f`, `12`
  files, desktop/mobile nonblank, no overflow, `0` page/console issues.
- `pnpm run qa:stage:repository:native`: passed; focused `4/4` files and
  `7/7` assertions, TypeScript 7, build, and boundaries passed.
- `pnpm run materialize:repository-stage-journey:native`: passed; journey
  parser errors `0`, runtime/browser/native all passed.
- `pnpm run materialize:compatibility-snapshot`: passed; `3` entries,
  `2` required-legal, `1` optional-private unavailable, `8` artifact refs.
- Full suite: `220/220` files and `2294/2294` tests passed.

Claim ceiling: the corpus now has a second evidence-backed legal route. This
does not move score or prove external-engine/native parity.
