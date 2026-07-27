# Expanded master roadmap audit

Status: complete
Mode: audit and documentation only
Baseline HEAD: `119e627410a4a72eee28650ae20422d475dac834`

## Outcome

Replace the completed 30-task DA28 plan with a much longer evidence-backed
master roadmap. Every task must name its dependency, likely systems,
acceptance criteria, proof, risk, and claim ceiling. Closed DA26-DA28 gates
must not be planned again.

## Scope

In scope: repository inspection, primary-source research, roadmap,
architecture, ADR proposals, and local roadmap task documents under `docs/`
and `.scratch/roadmap/`.

Out of scope: source, runtime, UI, tests, assets, dependencies, commits, push,
and score movement without new adjudicated evidence.

## Acceptance

- Current HEAD and every evidence cursor are recorded separately.
- Completed DA28 tasks are reconciled against live consumers and artifacts.
- At least ten distinct audit loops produce evidence-backed findings.
- The master plan covers playable sandbox, MUGEN-lite, MUGEN, IKEMEN, Studio,
  assets, scanner, modular engine, QA, performance, security, and release.
- The plan is much longer than the prior 30-task series and stays executable.
- Control docs and issues point to the new plan without changing the generated
  selector.
- Tracked and new document whitespace checks pass; changed paths stay in scope.

## Phases

- [completed] Phase 1: restore baseline, bootstrap, and current cursors.
- [completed] Phase 2: measure repo topology and inspect DA28 consumers/artifacts.
- [completed] Phase 3: run ten evidence loops across runtime and product systems.
- [completed] Phase 4: design the expanded dependency graph and task catalog.
- [completed] Phase 5: update roadmap control surfaces and linked issues.
- [completed] Phase 6: adversarial autopsy, document checks, and handoff.

## Gate manifest

| Gate | State | Proof surface |
| --- | --- | --- |
| Scope | passed | Git changed-path audit: `docs/` and `.scratch/roadmap/` only |
| Baseline | passed | HEAD, status, prior audit, selector artifacts |
| Claim provenance | passed | Repo pointers and primary sources |
| Runtime | N/A | Static audit cannot prove new runtime behavior |
| Visual | N/A | No UI change; existing captures may support stale/current findings |
| Source | passed | Pinned Elecbyte, Ikemen, W3C, Three.js sources |
| Independent review | N/A | Multi-agent delegation was not requested and is disabled for this task |
| Adversarial autopsy | passed | Final fresh audit of roadmap artifact |

## Stop condition

Stop when the expanded plan is complete, internally coherent, tied to current
repo evidence, checked for padding/duplicates, and every applicable gate has
an honest state.
