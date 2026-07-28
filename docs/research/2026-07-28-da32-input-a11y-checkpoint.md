# DA32 input and a11y checkpoint

Date: 2026-07-28
Commits: `47858f49`, `5db521b8`

## Decision

Keep browser polling as the source of live gamepad state. The adapter now
retains a small diagnostic record per logical seat. The record exposes index,
id, connection, mapping class, and active actions. The match surface shows the
same state so an unknown mapping stays visible during a device-lab run.

`start/stop` wires the browser connection events, re-polls when an event
arrives, and keeps the last eight event samples. The unit path proves that
stopping the adapter removes both listeners.

Expose the Three.js canvas as a focusable image and connect it to a separate
atomic polite status region. The region carries a compact text state for stage,
round, fighter life, runtime state, pause, and controller paths. It avoids
putting gameplay meaning in canvas pixels alone.

## Official references

- [MDN: Implementing controls using the Gamepad API](https://developer.mozilla.org/en-US/docs/Games/Techniques/Controls_Gamepad_API)
  describes `navigator.getGamepads()`, sparse device indexes, connection events,
  and the `standard` mapping contract.
- [MDN: `Gamepad.mapping`](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/mapping)
  defines the known mapping value used by the runtime diagnostic.
- [W3C: ARIA22 status technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22.html)
  documents polite status updates and the value of explicit atomic output.
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria/)
  defines the `status` role and its live-region semantics.

## Evidence

- `src/game/input/GamepadInputAdapter.ts` retains deterministic seat records
  after each poll and clears them on disconnect.
- `src/app/RuntimeA11ySummary.ts` builds the text alternative from the live
  snapshot.
- `src/game/render/ThreeMugenRenderer.ts` assigns canvas semantics and focus.
- `src/tests/GamepadInputAdapter.test.ts` and
  `src/tests/RuntimeA11ySummary.test.ts` pass as part of the 19-test focal run.
- `pnpm qa:browser:da32-029-a11y` passes at `1440x900` and `390x844`; the
  evidence records the canvas attributes, real focus, status text, pad metric,
  overflow, screenshots, and zero unexpected console errors.
- `pnpm typecheck` passes.

## Open work

- Exercise a real screen reader journey and retain its evidence separately
  from the simulated baseline.
- Add contrast and full landmark audits before any accessibility release claim.
- Run the physical gamepad matrix with at least one standard and one unknown
  mapping device.

Claim ceiling: simulated input diagnostics and a code-level canvas alternative
only. The project has no WCAG certification or physical-device parity claim.
