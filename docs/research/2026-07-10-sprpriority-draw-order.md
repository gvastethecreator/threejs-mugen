# SprPriority Draw Order

Date: 2026-07-10

## Question

Does player `SprPriority` reach effective Three.js ordering with the official range?

## Official sources

- Elecbyte State Controller Reference states higher-priority sprites draw over lower-priority sprites and `SprPriority value` is valid from `-5` to `5`: https://www.elecbyte.com/mugendocs/sctrls.html
- Elecbyte CNS documentation explains Common1 conventions: standing/crouching priority 0, jumping 1, and typical attacks 2: https://www.elecbyte.com/mugendocs/cns.html
- Elecbyte documents separate defaults/rules for Projectile and Explod sprite priorities, including Explod `ontop`, so their renderer range must not be conflated with the player controller.

## Decision

- Clamp player `SprPriority` controller output to `-5..5` at the runtime boundary.
- Preserve the generic CharacterRenderer `-5..10` depth range used by effect actors.
- Expose effective sprite priority, deterministic actor bias, and mesh z in renderer diagnostics.
- Browser smoke independently computes expected z and requires higher player priority to be in front on desktop/mobile.

## Evidence

- Focused SpriteEffect tests cover static and dynamic values above the official maximum.
- CharacterRenderer tests cover low/zero/high depth bounds and strict higher-priority ordering.
- Browser smoke checks effective z alongside the existing axis oracle for two players on desktop/mobile.
- Full runtime/Studio screenshots remain nonblank and correctly framed.

## Blocked claims

Equal-priority reference tie behavior, HitDef `p1sprpriority`/`p2sprpriority`, Explod `ontop`, stage foreground occlusion, transparency/depth sorting at overlap, L4 deterministic image baselines, and L5 reference-engine parity remain open.
