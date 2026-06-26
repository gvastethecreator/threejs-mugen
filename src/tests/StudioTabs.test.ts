import { describe, expect, it } from "vitest";
import { parseStudioTab, STUDIO_TABS } from "../app/StudioTabs";

describe("StudioTabs", () => {
  it("keeps the internal Studio surfaces stable and URL-addressable", () => {
    expect(STUDIO_TABS.map((tab) => tab.id)).toEqual(["workbench", "assets", "inspector", "stage", "debug", "evidence", "modules", "build"]);
    expect(parseStudioTab("workbench")).toBe("workbench");
    expect(parseStudioTab("assets")).toBe("assets");
    expect(parseStudioTab("stage")).toBe("stage");
    expect(parseStudioTab("debug")).toBe("debug");
    expect(parseStudioTab("evidence")).toBe("evidence");
    expect(parseStudioTab("modules")).toBe("modules");
    expect(parseStudioTab("missing")).toBeUndefined();
    expect(parseStudioTab(null)).toBeUndefined();
  });
});
