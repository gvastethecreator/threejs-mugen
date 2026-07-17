import { describe, expect, it } from "vitest";
import {
  STUDIO_LICENSE_EXPRESSION_PROFILE,
  STUDIO_LICENSE_EXPRESSION_SUPPORTED_FORMS,
  isSupportedStudioLicenseExpression,
} from "../app/StudioLicenseExpression";

describe("StudioLicenseExpression", () => {
  it("declares the bounded syntax profile", () => {
    expect(STUDIO_LICENSE_EXPRESSION_PROFILE).toBe("mugen-web-sandbox/spdx-expression-subset/v0");
    expect(STUDIO_LICENSE_EXPRESSION_SUPPORTED_FORMS).toEqual(["single-id", "and", "or"]);
  });

  it("accepts bounded ids and boolean forms only", () => {
    for (const expression of ["CC0-1.0", "CC0-1.0 AND MIT", "CC0-1.0 OR BSD-3-Clause", "cc0-1.0 and mit"]) {
      expect(isSupportedStudioLicenseExpression(expression)).toBe(true);
    }
    for (const expression of ["", "CC0-1.0+", "CC0-1.0 WITH Exception-1.0", "(CC0-1.0 OR MIT)", "DocumentRef-doc:LicenseRef-local", "CC0-1.0\nOR MIT"]) {
      expect(isSupportedStudioLicenseExpression(expression)).toBe(false);
    }
  });
});
