import { describe, expect, it } from "vitest";
import { buildRuntimeA11ySummary } from "../app/RuntimeA11ySummary";
import type { MugenSnapshot } from "../mugen/runtime/types";

describe("RuntimeA11ySummary", () => {
  it("describes the current match and both controller paths", () => {
    const snapshot = {
      stage: { displayName: "Rooftop Dojo" },
      playing: true,
      round: { roundNo: 2, state: "fight", timer: 87 },
      matchPause: undefined,
      actors: [
        { label: "Nova Boxer", runtime: { life: 812, lifeMax: 1000, stateNo: 0, ctrl: true, guarding: false } },
        { label: "Mira Volt", runtime: { life: 640, lifeMax: 1000, stateNo: 150, ctrl: false, guarding: true } },
      ],
    } as unknown as MugenSnapshot;

    expect(
      buildRuntimeA11ySummary({
        snapshot,
        mode: "match",
        gamepads: [
          { seat: 1, connected: true, mapping: "standard" },
          { seat: 2, connected: false, mapping: "disconnected" },
        ],
      }),
    ).toBe(
      "Match viewport on Rooftop Dojo. Playing. Round 2, fight, timer 87. Nova Boxer: 812 of 1000 life, state 0, ready. Mira Volt: 640 of 1000 life, state 150, guarding. Controls: P1 keyboard and standard gamepad; P2 gamepad disconnected.",
    );
  });

  it("keeps an empty inspector viewport meaningful", () => {
    const snapshot = {
      stage: { displayName: "Training" },
      playing: false,
      actors: [],
    } as unknown as MugenSnapshot;

    expect(buildRuntimeA11ySummary({ snapshot, mode: "inspect" })).toBe(
      "Inspector viewport on Training. Paused. No fighter is loaded.",
    );
  });
});
