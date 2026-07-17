export const STUDIO_LICENSE_EXPRESSION_PROFILE = "mugen-web-sandbox/spdx-expression-subset/v0" as const;

export const STUDIO_LICENSE_EXPRESSION_SUPPORTED_FORMS = [
  "single-id",
  "and",
  "or",
] as const;

export type StudioLicenseExpressionForm = (typeof STUDIO_LICENSE_EXPRESSION_SUPPORTED_FORMS)[number];

export function isSupportedStudioLicenseExpression(value: string): boolean {
  if (!value.trim() || /[\r\n]/.test(value)) {
    return false;
  }
  const tokens = value.trim().split(/\s+/);
  if (tokens.length % 2 === 0) {
    return false;
  }
  return tokens.every((token, index) => index % 2 === 0 ? isSubsetLicenseId(token) : isBooleanOperator(token));
}

function isBooleanOperator(value: string): boolean {
  return value === "AND" || value === "and" || value === "OR" || value === "or";
}

function isSubsetLicenseId(value: string): boolean {
  return /^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(value) && !/^DocumentRef-|^LicenseRef-/i.test(value);
}
