import { describe, expect, it } from "vitest";
import { needsStudioProjectNavigationGuard, studioProjectDiscardMessage } from "../app/StudioProjectNavigationGuard";

describe("StudioProjectNavigationGuard", () => {
  it("guards dirty Studio navigation only", () => {
    expect(needsStudioProjectNavigationGuard("studio", true)).toBe(true);
    expect(needsStudioProjectNavigationGuard("studio", false)).toBe(false);
    expect(needsStudioProjectNavigationGuard("match", true)).toBe(false);
    expect(needsStudioProjectNavigationGuard("inspect", true)).toBe(false);
  });

  it("keeps the destination in the discard prompt", () => {
    expect(studioProjectDiscardMessage("open another project")).toContain("open another project");
    expect(studioProjectDiscardMessage("load a new source package")).toContain("unsaved changes");
  });
});
