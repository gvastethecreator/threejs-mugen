# Findings after DA27-09

## Verified

- HEAD: `aa85cb84`; 23 commits after the prior daily-audit HEAD.
- Latest overall ledger: Entry 601, DA27-09.
- Formal/global: `b7d23801`, four commits behind HEAD.
- Full QA smoke: `f0234a`, one commit behind HEAD.
- Focal source gate: T406 at `07ad9227`, 21 commits behind HEAD.
- Bounded visual/product gate: T342 at `1085badb`, 167 commits behind HEAD.
- Selector queue: empty.
- Scores: held at 65 / 36 / 20 / 10-12 / 6-8 / 25.

## Main gaps

- Several DA26/DA27 parts stop at model, unit, or bridge state and have no live consumer.
- Snapshot persistence fails open and uses placeholder authority data in local storage.
- Source write journal runs after the write and lacks real preimage bytes.
- Browser gamepad input is a stub.
- Dual-character behavior proof is static rather than executed.
- DA27-09 does not prove browser audio output.
- Corpus v1.2 and score adjudication have no current material artifact.
- FNV behavior hashes need a distinct label from SHA-256 evidence integrity.
- HitDef and projectile source families remain unreviewed in the source epoch.

## Decisions proposed

- Use a cursor tuple and explicit capability integration state.
- Use one live combat transaction path.
- Use SHA-256 canonical evidence digests and label FNV as a behavior fingerprint.
- Use IndexedDB for durable Studio state and real pre-write recovery records.
- Require live execution for behavior claims.
- Make corpus, score, scanner, and boundary records material and consumed.
