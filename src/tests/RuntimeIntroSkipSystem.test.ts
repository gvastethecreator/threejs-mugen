import { describe, expect, it } from "vitest";
import { preserveRuntimeIntroSkipAssertSpecial } from "../mugen/runtime/RuntimeIntroSkipSystem";

describe("RuntimeIntroSkipSystem", () => {
  it("preserves only the source display-skip flags through actor reset", () => {
    expect(preserveRuntimeIntroSkipAssertSpecial({
      flags: ["runfirst"],
      globalFlags: ["skiprounddisplay", "nokosnd"],
      skipFightDisplay: true,
      noKoSound: true,
    })).toEqual({
      flags: [],
      globalFlags: ["skiprounddisplay"],
      skipFightDisplay: true,
    });
  });

  it("does not recreate an AssertSpecial snapshot when no display flag is active", () => {
    expect(preserveRuntimeIntroSkipAssertSpecial({
      flags: ["runfirst"],
      globalFlags: ["nokosnd"],
      noKoSound: true,
    })).toBeUndefined();
    expect(preserveRuntimeIntroSkipAssertSpecial(undefined)).toBeUndefined();
  });
});
