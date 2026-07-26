# Authority selector sync (DA26-11)

Date: 2026-07-26
Type: control / docs sync
Status: closed

## Question

Can one current authority selector drive main roadmap docs and issues 01–07,
with historical sections labeled and closed DA26-01..11 removed from the live
next queue, proven by a reference auditor?

## Answer

Yes.

## Deliverables

- Human selector: `docs/AUTHORITY_SELECTOR.md`
- Machine artifact: `docs/evidence/authority-selector-v1.json`
- Types/tests: `src/mugen/compatibility/AuthoritySelector.ts`,
  `src/tests/AuthoritySelector.test.ts`
- Materializer: `pnpm materialize:authority-selector`
- Auditor: `pnpm audit:authority-references` (17 surfaces)

## Live values

- `closedThrough`: DA26-11
- next head: DA26-12
- formal/global: `7d9b15f8` (DA26-08 gate)
- focal: T406 `07ad9227`
- visual/product: T342
- source: epoch 05b / 4aa

## Claim allowed

Control consistency across named surfaces.

## Claim blocked

Score movement; reopening closed DA26-01..11 as the live next queue.
