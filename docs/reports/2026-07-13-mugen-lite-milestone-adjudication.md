# MUGEN-lite Milestone Adjudication

Date: 2026-07-13
Area: R2 MUGEN-lite Imported MVP
Roadmap entry: 479
Wayfinder ticket: 129

## Decision

**M2 Imported MUGEN-lite MVP: accepted with a bounded fixture-backed claim.**

The written exit gate is met by the current local KFM trace matrix plus the
repository-owned legal MUGEN-lite journey. This accepts the milestone as an
evidence-backed development target; it does not promote the project to broad
public character compatibility, exact Common1 timing, or full MUGEN/IKEMEN
parity.

Scores remain unchanged in this closeout. A separate scorecard change must
explicitly promote the practical/MUGEN-MVP bands after the current dirty
scorecard is reconciled with this decision and the next breadth gate is named.

## Gate Matrix

| Written criterion | Current evidence | Decision |
| --- | --- | --- |
| Local project opens and native roster remains playable | Existing `pnpm qa:smoke` diagnostics, runtime desktop/mobile captures, native roster and Studio route checks | Accepted |
| Imported idle/walk/crouch/jump | Optional local KFM `kfm-official-basic-movement.json`, trace `02b6bfc0`, final `81e3500f` | Accepted |
| Imported attack and special route | KFM normal `kfm-official-x.json`, trace `89bc15e0`, final `330f329a`; KFM QCF special `kfm-official-qcf-x.json`, trace `5242ac11`, final `9e559255` | Accepted |
| Imported guard | KFM `kfm-official-x-guard.json`, trace `07870510`, final `b4c3f3b9`; default stand/crouch/air guard artifacts are also green | Accepted |
| Imported get-hit, fall, and recovery-style routes | KFM get-hit `dc476568`, fall/get-hit `6d3d3ab2`, ground recovery `88a7c7aa`, and recovery-input `ecce3c63`; every listed artifact is passed | Accepted |
| Legal package loader/runtime/report journey | `CompatibilityJourney/v1` checksum `cabcd573`; package digest `sha256:f0389c3f95003bb16e26d6ae2020acdb57c12fa0f088d63ba25ca3466ed71eb0`; runtime refs `a372a02c` / `ceac9f37` | Accepted |
| Unsupported features visible | Loader preserves `JourneyUnknownController`; aggregate keeps warnings, errors, unsupported findings, and blocked claims addressable | Accepted |
| Trace/report export | `.scratch/qa/trace-gates/*.json`, aggregate report, and desktop/mobile smoke diagnostics are present | Accepted |

## Verification Snapshot

- `pnpm test`: 184 files passed, 1958 tests passed.
- `pnpm typecheck`: passed.
- `pnpm check:boundaries`: passed.
- `pnpm build`: passed; Vite reports the existing 1,662.07 kB JavaScript
  chunk advisory.
- `pnpm qa:trace`: 577/577 artifacts passed, 546 required, 31 optional, 0
  failed.
- `pnpm qa:smoke`: passed with runtime, imported MUGEN-lite desktop/mobile,
  and Studio evidence paths.
- No source or visible UI code changed in this adjudication; browser evidence
  is a regression gate and not a new score claim.

## Claim Ceiling

Allowed:

- The sandbox has an evidence-backed, fixture-limited imported MUGEN MVP route.
- Local KFM data proves bounded common movement, normal/special input, guard,
  get-hit, fall, and recovery behavior through the current loader/runtime.
- One repository-owned CC0 package crosses ZIP, loader, runtime, browser, and
  native evidence through `CompatibilityJourney/v1`.

Deferred or blocked:

- Broad public character/stage corpus compatibility.
- A second materially independent legal package or ACT/palette route.
- Exact Common1 controller/tick timing and complete VM semantics.
- Commercial or third-party asset compatibility claims.
- Teams, round replacement, screenpack/lifebar parity, rollback/netplay,
  ZSS/Lua execution, and full MUGEN/IKEMEN parity.

## Next Independent Gate

Wayfinder 130 selects one independent breadth proof. The preferred order is:

1. Add an independently sourced legal character package with source,
   permission/license, digest, loader result, and at least one trace matrix.
2. If a second package cannot be used without committing third-party content,
   add an ACT/palette route against the existing legal fixture with visible
   desktop/mobile crop evidence and a required runtime/report reference.

Neither option may reuse the current journey checksum as a substitute for new
input evidence.

## Closure Audit

- Strongest objection: the existing KFM artifacts are optional local fixtures,
  while the legal aggregate is repository-authored rather than a public corpus.
- Adversarial correction: the decision names both sources separately, keeps
  the optional KFM checksums, retains the legal package digest, and does not
  convert one package into corpus breadth.
- Strongest remaining gap: independent legal breadth or ACT/palette evidence.
- Score movement is intentionally not inferred from this report; the scorecard
  needs a separate synchronized update after this adjudication.
- Independent review was not used. The closure received a manual gate-by-gate
  audit against the written roadmap criteria and current artifacts.

## Global Status

- Playable sandbox: M2 imported MVP gate accepted at bounded fixture scope.
- Practical MUGEN compatibility: still 35/100 in the current scorecard until
  its explicit score update is reconciled.
- MUGEN 1.0/1.1 MVP: still 20/100 in the current scorecard until that same
  reconciliation.
- IKEMEN runtime: unchanged; active-root work remains a separate bounded lane.
- Studio/editor: unchanged; the evidence envelope is available to future
  trust-chain work but does not create authoring behavior.
