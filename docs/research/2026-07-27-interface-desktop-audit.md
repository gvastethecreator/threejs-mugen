# Desktop and responsive interface audit

Date: 2026-07-27

Scope: Match, Inspect, and all Studio tabs at desktop, tablet, and mobile
viewports. The primary reproduction was the 2048x768 Rooftop Dojo Match view
shown in the user report.

## Findings

1. The Match stage toolbar received `top` from the redesign layer and `bottom`
   from the runtime layer. Its auto-sized grid item filled the space between
   both edges and rendered as a tall black panel over the stage.
2. The desktop stage status panel kept a narrow `42ch` maximum from the
   redesign layer. Its four metrics wrapped into unreadable narrow columns.
3. The base Studio grid used a more specific three-column selector than the
   responsive one-column rule. Studio therefore kept `300px 560px 300px` at
   narrow widths. The empty command-palette mount also became a grid item.

## Changes

- Desktop Match and Inspect toolbars now anchor to the lower edge, use their
  content height, and stay in a horizontal row.
- Desktop stage status panels use a bounded 430px width, a four-column metric
  grid, and stable icon/value placement. Match leaves room for the input deck.
- Match, Inspect, and Studio use an explicit one-column grid through 1160px.
  Rails stack below the stage and keep a bounded height for their own scroll
  regions.
- `#command-palette-root` uses `display: contents`, so its empty mount cannot
  add an accidental layout track.

## Evidence

The live audit covered 27 route and viewport cases:

- Match and Inspect: 1440x900, 1024x900, and 390x844.
- Studio Workbench, Build, Modules, Assets, Stage, Evidence, and Debug:
  1440x900, 1024x900, and 390x844.
- Exact user reproduction: 2048x768 with `p1=nova-boxer`, `p2=mira-volt`,
  and `stage=rooftop-dojo`.

Results from the current tree:

- HTTP status 200 for every case.
- Zero console errors or warnings, page errors, and failed requests.
- No document or body overflow in the 27-case audit.
- Desktop screenshot shows the full stage, readable status panel, visible
  fighters, and a horizontal bottom toolbar.
- `pnpm qa:browser:da31-010-studio` passed.
- `pnpm qa:browser:da31-011-reflow` passed across 320px, 390px, zoom 2x,
  zoom 4x, and reduced motion. The gate reports vertical page scroll and no
  horizontal overflow.
- `pnpm exec vite build` passed.
- `git diff --check` passed.

## Claim ceiling and open work

This closes the reported desktop layout regression and establishes measured
responsive geometry for the affected routes. It does not close the broader
mobile visual polish, full smoke gate, runtime play semantics, TypeScript
typecheck, or CSS duplication debt.

Known gates remain separate:

- `pnpm build` reaches the pre-existing unused `advanced` diagnostic at
  `src/mugen/da32/ClauseAdjudicationSample.ts:149`.
- `pnpm qa:css:budget` remains over its existing duplicate-selector and
  cross-file-shadow budgets.
- `pnpm qa:browser:da31-009-play` fails its desktop movement and damage
  assertions while mobile and negative paths pass; this belongs to runtime
  input/combat work.
- The long `pnpm qa:smoke` run did not finish within the available window.
