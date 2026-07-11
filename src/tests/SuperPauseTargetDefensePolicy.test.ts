import { describe, expect, it } from "vitest";
import {
  defaultSuperPauseTargetDefenseValue,
  IKEMEN_DEFAULT_SUPER_PAUSE_TARGET_DEFENSE_VALUE,
} from "../mugen/runtime/SuperPauseTargetDefensePolicy";

describe("SuperPauseTargetDefensePolicy", () => {
  it("exposes the pinned IKEMEN default only for the explicit IKEMEN profile", () => {
    expect(defaultSuperPauseTargetDefenseValue("ikemen-go")).toBe(
      IKEMEN_DEFAULT_SUPER_PAUSE_TARGET_DEFENSE_VALUE,
    );
    expect(defaultSuperPauseTargetDefenseValue("mugen-1.1")).toBeUndefined();
    expect(defaultSuperPauseTargetDefenseValue("unknown")).toBeUndefined();
  });

  it("accepts a positive IKEMEN game-config override and rejects invalid configured values", () => {
    expect(defaultSuperPauseTargetDefenseValue("ikemen-go", 2)).toBe(2);
    expect(defaultSuperPauseTargetDefenseValue("ikemen-go", 0)).toBe(
      IKEMEN_DEFAULT_SUPER_PAUSE_TARGET_DEFENSE_VALUE,
    );
    expect(defaultSuperPauseTargetDefenseValue("ikemen-go", Number.NaN)).toBe(
      IKEMEN_DEFAULT_SUPER_PAUSE_TARGET_DEFENSE_VALUE,
    );
  });
});
