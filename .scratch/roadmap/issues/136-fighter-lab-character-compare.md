# Issue 136 — Fighter Lab Character Compare

- Status: `closed-bounded`
- Lane: `Studio/UI visual tooling`
- Priority: `P1`

## Objective

Add a roster comparison view for one animation action. The view must show
which fighters provide the action and must load any available result into the
isolated Fighter Lab runtime.

## Acceptance gate

- Add the route `?mode=lab&labView=compare`.
- List the union of loaded animation actions.
- Show one comparison card for each loaded fighter.
- Report action frames, duration, collision boxes, and package components.
- Load the selected fighter and action from a comparison card.
- Preserve the route and selection after reload.
- Pass the Fighter Lab browser gate with no console or page errors.
- Inspect the desktop screenshot.

## Claim ceiling

This view reads current runtime definitions. It does not execute all fighters
at the same time. It does not add AIR, SFF, CNS, CMD, VFX, or combat support.

## Closure evidence

- The route lists 17 unique actions and 2 roster cards.
- Action and fighter selection drive the isolated runtime and detail lens.
- URL state preserves the selected fighter and action after reload.
- `pnpm qa:browser:fighter-lab` passes with zero console or page errors.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and the CSS budget pass.
- Desktop overview and selected-action screenshots passed visual inspection.
- `pnpm qa:smoke` timed out after 124 seconds. Its result is inconclusive.
