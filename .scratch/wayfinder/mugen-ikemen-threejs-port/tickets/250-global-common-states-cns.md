# Ticket 250: global Common.States CNS

- Status: selected, implementation pending
- Date: 2026-07-18
- Scope: imported character loading from `[Common] States` config entries
- Depends on: Ticket 249 / ADR 0016

## Question

IKEMEN can load common state files independently of a character DEF. How can
the sandbox expose that source without mixing it into character `st*`,
`stcommon`, CMD, or unsupported ZSS behavior?

## Bounded contract

- Read `[Common]` keys `States`, `States0`, `States1`, ... from the loaded game
  config in natural key order.
- Split comma-separated paths and resolve root-style `data/...` references,
  with config-relative fallback for simple filenames.
- Load CNS common-state sources after character `st*` and DEF `stcommon`.
- Preserve existing first-listed normal-state precedence and the explicit
  IKEMEN negative-state append policy from Ticket 249.
- Report missing global files as loader warnings and report `.zss` entries as
  unsupported instead of pretending they were compiled.
- Keep the source visible through existing common state provenance.

## Out of scope

JSON `CommonStates` save/config mutation, ZSS compilation, Lua insertion and
deletion, common commands/constants/air/fx, helper input buffers, and complete
IKEMEN parity.

## Evidence required

- loader fixture for natural config order, normal precedence, fallback state,
  missing path, and blocked ZSS;
- focused loader/config/compiler tests;
- TypeScript 7/build, global suite at checkpoint, and repository guards;
- ADR and closeout report with official IKEMEN source links.
