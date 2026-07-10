# Renderer Axis Parity Oracle

Date: 2026-07-10

## Question

How can the Three.js adapter prove sprite-axis placement instead of merely proving that a canvas rendered?

## Official sources

- Elecbyte AIR documentation defines element X/Y as offsets from the sprite axis, with positive X forward and negative Y upward: https://www.elecbyte.com/mugendocs/air.html
- Elecbyte SpriteMaker documentation defines the SFF axis as the bitmap point corresponding to sprite drawing coordinates: https://www.elecbyte.com/mugendocs-11b1/sprmake2.html
- Elecbyte sprite standard emphasizes stable axes around character center/feet: https://www.elecbyte.com/mugendocs-11b1/spr.html

## Decision

Expose actual CharacterRenderer mesh transforms plus the authored/runtime inputs needed to audit them. Browser smoke independently recomputes:

```text
x = actorX + facing * (offsetX + width/2 - axisX) * scaleX
y = -actorY + (axisY - height/2 - offsetY) * scaleY
meshScaleX = width * scaleX * facing
meshScaleY = height * scaleY
```

Require at least two player presentations and both facing directions on desktop and mobile.

## Renderer proof ladder

1. L0 Parsed metadata.
2. L1 Renderer-independent projection tests.
3. L2 Effective adapter diagnostics checked by an independent oracle.
4. L3 Visible screenshots/canvas framing.
5. L4 Reviewed deterministic visual baseline regression.
6. L5 Reference-engine side-by-side parity.

## Evidence

- Focused `CharacterRenderer` and projection tests pass, including asymmetric scale and reverse facing.
- Browser smoke reports two character presentations on desktop and mobile and validates both facings.
- Runtime/Studio screenshots and nonblank canvas checks remain green.

## Blocked claims

This reaches L2 for bounded player sprite axis placement plus general L3 visibility. It does not prove AIR H/V flags, rotation pivot, rotated collision boxes, draw-order occlusion, palette/remap fidelity, afterimage blending, shadows, screenpack composition, deterministic L4 screenshots, or L5 reference parity.
