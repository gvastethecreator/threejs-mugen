# 05 - Modular Engine Boundaries

Status: ready-for-agent
Labels: docs, module-boundary, ready-for-agent

## Objective

Prepare the project to become a reusable browser game engine without extracting shared core too early from unstable fighting-specific behavior.

## 2026-07-18 Post-Wayfinder-256 non-vacuous extraction override

EvidenceEnvelope/v0 now has two domain adapters and a productive Studio
consumer, so the evidence shape is a proven candidate. It still lives in
`src/app`, imports MUGEN domain types, and the boundary check skips missing
`src/core`/platformer roots while allowlisting the only `src/engine` file.
Do not claim a reusable engine. After changed-source and reanalysis consumers
are proven, split generic facts from domain adapters, require configured roots
to exist, and add real import/deletion failures. Release policy stays outside
shared facts. See
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 Post-Wayfinder-229 non-vacuous extraction override

GateEvidence and PackageAnalysis now provide candidate facts, but the boundary
gate can still skip absent roots and allowlist the only active engine contract.
Do not claim a reusable engine. Extract `EvidenceEnvelope/v0` only after two
independent productive adapters, versioned canonical bytes/digests, a MUGEN
adapter, and deletion proof. Then require configured active roots to exist and
check real import edges fail-closed. Release policy remains outside shared
facts. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical 2026-07-16 Non-vacuous extraction override

Current module contracts are metadata and the boundary command can skip roots
that do not exist. Do not claim a reusable engine. Promote EvidenceContract/v0
only after at least two productive consumers exist, through an explicit MUGEN
adapter and deletion test. Strengthen the gate so missing roots fail and real
import edges are checked; fighting vocabulary remains forbidden in core. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical 2026-07-15 Post-Entry-554 Daily Audit Override

The runtime closeouts do not create a shared-engine contract. Keep the
metadata-only registry and boundary guard at their current ceiling. After
GateEvidenceResult/v0 and real scanner/asset producers exist, consider
EvidenceContract/v0 only with two production consumers, an explicit MUGEN
Adapter, a keep/delete rationale, and forbidden fighting vocabulary/import
checks. No platformer or multi-genre runtime claim follows. See
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.

## Historical 2026-07-15 Daily Audit Override

Do not promote metadata-only registries or vacuous boundary directories. After
GateEvidenceResult/v0 is backed by real artifacts, extract EvidenceContract/v0
as the first shared candidate: state, blockers, freshness, target, action, and
artifact identity with Build and Evidence production consumers plus a MUGEN
adapter. Keep CNS/CMD/HitDef/round/helper/target vocabulary outside the shared
owner. Generic input/tick/render, platformer runtime, and multi-genre engine
claims remain premature. See
`docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## Next Useful Cuts

- 2026-07-10 dependency note: do not start the module runtime from the current metadata-only registry. After priority/schedule/source/provenance/scanner dependencies, prove one concrete Project/Evidence/Build contract with a real production consumer, a MUGEN adapter, a keep/delete rationale, and a stronger import gate that rejects fighting-specific leakage.
- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: M1 Shared contract readiness.
- Keep parser/runtime/render/audio/UI boundaries clean.
- Identify shared candidates only after MatchWorld, Build, Evidence, input, snapshots, and asset contracts stabilize.
- Keep MUGEN-specific concepts out of future shared core interfaces.
- Plan platformer/other genre slices as contract consumers, not forks.
- Record any candidate shared contract with an explicit "no CNS/CMD/HitDef/round/helper/target leakage" check.
- Latest completed cut: `pnpm check:boundaries` now runs `scripts/check_boundaries.cjs` to guard future `src/core/**`, `src/platformer/**` / `src/modules/platformer/**`, and `src/engine/**` shared-contract leakage. `runtime-manifest/v0` exports this command as `contracts.verificationCommands.boundary`. This is a boundary safety net, not platformer/runtime support.

## Acceptance

- Boundary tests or docs explain what is fighting-specific vs. shared.
- The first promoted shared contract has a real production consumer, an explicit MUGEN adapter, a keep/delete rationale, and a stronger import test; metadata registration or an empty folder does not close the gate.
- `pnpm check:boundaries` passes when shared/core/platformer paths have no forbidden fighting imports or terminology.
- `docs/MODULE_BOUNDARY_CONTRACT.md` is updated when contracts move.
- Existing fighting runtime trace/smoke gates remain green.

## Blocked Claims

- Production multi-genre engine.
- Platformer runtime before fighting contracts stabilize.
- Moving CNS/CMD/HitDef/Common1 concepts into generic core.
- Claiming executable shared-core readiness from `ModuleContracts.ts` metadata or a vacuous boundary pass alone.
