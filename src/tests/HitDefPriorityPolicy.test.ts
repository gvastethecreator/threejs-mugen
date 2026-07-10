import { describe, expect, it } from "vitest";
import { resolveRuntimeHitDefSpritePriorities } from "../mugen/runtime/HitDefPriorityPolicy";

describe("HitDefPriorityPolicy", () => {
  it("resolves authored and omitted values under the MUGEN 1.1 profile", () => {
    expect(
      resolveRuntimeHitDefSpritePriorities({
        profile: "mugen-1.1",
        authored: { p1: 4 },
        current: { p1: 8, p2: 7 },
      }),
    ).toEqual({
      profile: "mugen-1.1",
      p1: { value: 4, source: "authored", supported: true },
      p2: { value: 0, source: "mugen-1.1-default", supported: true },
    });
  });

  it.each(["ikemen-go", "unknown"] as const)(
    "preserves omitted values for the %s profile without inheriting MUGEN defaults",
    (profile) => {
      expect(
        resolveRuntimeHitDefSpritePriorities({
          profile,
          authored: { p2: -4 },
          current: { p1: 8, p2: 7 },
        }),
      ).toEqual({
        profile,
        p1: { value: 8, source: "preserve-current", supported: false },
        p2: { value: -4, source: "authored", supported: true },
      });
    },
  );
});
