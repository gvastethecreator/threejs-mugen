# MUGEN-lite Visible Sprite Research

Date: 2026-07-12
Scope: repository-owned legal fixture art

## Sources

- Elecbyte defines SFF as the sprite/palette container and sprite axes as the bitmap point placed at drawing coordinates: https://www.elecbyte.com/mugendocs/sprmake2.html
- Elecbyte defines AIR actions as ordered sprite sequences and documents collision boxes plus reserved/recommended character action numbers: https://www.elecbyte.com/mugendocs-11b1/air.html

## Decision

Keep the fixture self-contained and generated. Replace 2x2 decoder probes with 32x64 indexed PCX frames, preserve one sprite per exercised action, and anchor each frame near the feet at `16,62`. Use visibly different silhouettes for crouch, air, attack, guard, fall, and recovery while keeping the package deterministic and CC0.

## Boundary

Allowed: decoded visible SFF frames with authored axes and distinct poses.

Blocked: production art, multi-frame animation, palette selection breadth, exact reserved-action art conventions, browser rendering until a dedicated smoke gate, and visual parity.
