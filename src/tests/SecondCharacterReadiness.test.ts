import { describe, expect, it } from "vitest";
import {
  evaluateSecondCharacterReadiness,
  sandboxDualCharacterPackages,
} from "../app/SecondCharacterReadiness";

describe("SecondCharacterReadiness", () => {
  it("accepts two named independent legal packages without adapters", () => {
    const { first, second } = sandboxDualCharacterPackages();
    const readiness = evaluateSecondCharacterReadiness(first, second);
    expect(readiness.independent).toBe(true);
    expect(readiness.sharedAdapter).toBe(false);
    expect(readiness.canClaimTwoNamed).toBe(true);
    expect(readiness.diagnostics).toEqual([]);
  });

  it("rejects shared identity or per-character adapters", () => {
    const { first, second } = sandboxDualCharacterPackages();
    const shared = evaluateSecondCharacterReadiness(first, {
      ...second,
      id: first.id,
    });
    expect(shared.independent).toBe(false);
    expect(shared.diagnostics).toContain("shared-id");

    const adapted = evaluateSecondCharacterReadiness(
      { ...first, adapterId: "nova-only" },
      second,
    );
    expect(adapted.canClaimTwoNamed).toBe(false);
    expect(adapted.diagnostics).toContain("per-character-adapter-present");
  });
});
