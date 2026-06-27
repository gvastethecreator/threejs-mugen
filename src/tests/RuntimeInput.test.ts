import { describe, expect, it } from "vitest";
import { hasRuntimeDirection, isRuntimeHoldingBack, runtimeCurrentDirection } from "../mugen/runtime/RuntimeInput";

describe("RuntimeInput", () => {
  it("normalizes atomic diagonal directions into direction families", () => {
    expect(runtimeCurrentDirection(["DB"])).toBe("DB");
    expect(hasRuntimeDirection(["DB"], "B")).toBe(true);
    expect(hasRuntimeDirection(["DB"], "D")).toBe(true);
    expect(isRuntimeHoldingBack(["DB"])).toBe(true);
  });

  it("preserves forward and upward diagonal families without reporting back", () => {
    expect(runtimeCurrentDirection(["UF"])).toBe("UF");
    expect(hasRuntimeDirection(["UF"], "U")).toBe(true);
    expect(hasRuntimeDirection(["UF"], "F")).toBe(true);
    expect(isRuntimeHoldingBack(["UF"])).toBe(false);
  });
});
