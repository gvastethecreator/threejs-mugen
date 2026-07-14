# Research - TeamRoundLifebar HUD Projection/v0

Date: 2026-07-13
Status: source-backed bounded visible contract

## Question

How should the main match HUD expose the team lifebar read model while keeping
active-root presentation, leader identity, and resource ownership separate?

## Primary evidence

- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) keeps the
  life bar distinct from the power bar. The HUD therefore renders team life
  slots without inventing a team power owner.
- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  exposes `TeamMode` and `TeamSide` as runtime context. The DOM projection
  consumes the snapshot side and slot ids instead of using draw order to infer
  team membership.
- [Elecbyte State Controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `nobardisplay` as hiding life/super bars. The adapter honors the
  snapshot visibility bit and leaves the diagnostic facts available to Studio.
- [Ikemen-GO release notes](https://github.com/ikemen-engine/Ikemen-GO/releases)
  mention team-side lifebar variants and top-element switching. The visible
  contract is therefore limited to stable slots, roles, status, and ratios; it
  does not claim screenpack or motif parity.

## Decision

The main HUD is a DOM adapter of `snapshot.teamRoundLifebar` when present:

1. Each side renders every ordered slot, including standby reserves.
2. Each slot exposes actor id, leader/member role, active/standby/KO/disabled
   state, life/max-life, and the normalized ratio through stable data
   attributes and visible labels.
3. The side's plural active ids are retained as a data attribute for browser
   evidence and do not replace the renderer's presentation root selection.
4. The legacy pair HUD remains the fallback for Single/unknown snapshots and
   now uses actor-provided life/power maxima instead of fixed divisors.

## Local evidence

- `src/app/App.ts` projects the runtime diagnostic into the main round HUD.
- `src/styles/base/app-shell.css` and `src/styles/redesign.css` keep slot
  labels and meters bounded on desktop/mobile layouts.
- `scripts/qa_smoke.cjs` captures the same Tag scenario before and after swap.
  The required run proves `p1,p3,p2,p4` slot identity, the expected standby /
  active states, and active ids `p1,p2` -> `p3,p2` on desktop and mobile.

## Claim boundary

Allowed: visible bounded team slot/life presentation for the exercised Tag
scenario, with browser diagnostics and desktop/mobile screenshots.

Blocked: motif/AIR animation, red-life interpolation, portraits, shared
resources, exact Tag choreography, automatic Turns continuation, KO/time-over/
winpose timing, screenpack parity, rollback/netplay, and full parity.
