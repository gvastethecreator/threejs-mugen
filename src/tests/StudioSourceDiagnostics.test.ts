import { describe, expect, it } from "vitest";
import { getStudioSourceDiagnosticRange } from "../app/StudioSourceDiagnostics";

describe("StudioSourceDiagnostics", () => {
  it("maps a one-based diagnostic line to a textarea selection range", () => {
    expect(getStudioSourceDiagnosticRange("one\r\ntwo\nthree", 2)).toEqual({
      line: 2,
      start: 5,
      end: 8,
    });
  });

  it("keeps an empty diagnostic line selectable and rejects invalid lines", () => {
    expect(getStudioSourceDiagnosticRange("one\n\nthree", 2)).toEqual({
      line: 2,
      start: 4,
      end: 4,
    });
    expect(getStudioSourceDiagnosticRange("one\nthree", 0)).toBeUndefined();
    expect(getStudioSourceDiagnosticRange("one\nthree", 4)).toBeUndefined();
    expect(getStudioSourceDiagnosticRange("one\nthree", undefined)).toBeUndefined();
  });
});
