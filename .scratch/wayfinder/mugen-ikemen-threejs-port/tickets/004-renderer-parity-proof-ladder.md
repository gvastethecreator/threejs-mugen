# Define renderer parity proof ladder

Type: research
Status: resolved
Blocked by: None

## Question

What proof ladder should govern renderer parity work for axis pivot, sprite draw order, palettes/remaps, afterimages, FightFX/common effects, shadows, and screenpack/lifebar composition?

## Answer

Use this proof ladder per renderer feature:

- L0 Parsed: authored SFF/AIR/stage/screenpack metadata is decoded.
- L1 Projected: renderer-independent math and snapshot telemetry have focused tests.
- L2 Adapted: effective Three.js mesh/material/camera diagnostics match an independent browser oracle.
- L3 Visible: desktop/mobile screenshots and canvas checks prove nonblank, framed output without overlap.
- L4 Regressed: deterministic fixture screenshots or region signatures compare against reviewed baselines with explicit tolerance.
- L5 Reference parity: approved side-by-side evidence against MUGEN/IKEMEN reference capture covers timing, layering, palette, and motion.

Current axis slice reaches L2 plus general L3 smoke. It does not reach L4/L5.
