import type { CompileSupportLevel, ExpressionIr } from "./RuntimeIr";

export function normalizeMugenExpression(expression: string): string {
  let normalized = expression.trim();
  normalized = normalized.replace(/\b(vel|pos|p2bodydist|p2dist)\s+([xy])\b/gi, (_match, base: string, axis: string) => {
    return `${base}${axis}`.toLowerCase();
  });
  normalized = normalized.replace(
    /([A-Za-z_][A-Za-z0-9_.]*(?:\([^()[\]]*\))?)\s*(=|!=)\s*\[\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*\]/gi,
    (_match, left: string, operator: string, min: string, max: string) => {
      if (operator === "!=") {
        return `((${left} < ${min}) || (${left} > ${max}))`;
      }
      return `((${left} >= ${min}) && (${left} <= ${max}))`;
    },
  );
  return normalized;
}

export function compileExpression(expression: string): ExpressionIr {
  const normalized = normalizeMugenExpression(expression);
  const redirect = expressionForSupportScan(normalized);
  const withoutStrings = stripRawFunctionArguments(redirect.expression).replace(/"[^"]*"/g, "\"\"");
  const unsupportedFeatures = new Set<string>();
  const identifiers = new Set<string>();
  const functions = new Set<string>();

  if (redirect.unsupportedFeature) {
    unsupportedFeatures.add(redirect.unsupportedFeature);
  }
  if (/[\[\]]/.test(withoutStrings)) {
    unsupportedFeatures.add("range syntax");
  }

  for (const identifier of withoutStrings.match(/[A-Za-z_][A-Za-z0-9_.]*/g) ?? []) {
    const lower = identifier.toLowerCase();
    if (supportedExpressionLiterals.has(lower)) {
      continue;
    }
    if (isFunctionCall(withoutStrings, identifier)) {
      functions.add(identifier);
      if (!supportedExpressionFunctions.has(lower)) {
        unsupportedFeatures.add(identifier);
      }
      continue;
    }
    identifiers.add(identifier);
    if (!supportedExpressionIdentifiers.has(lower)) {
      unsupportedFeatures.add(identifier);
    }
  }

  return {
    raw: expression,
    normalized,
    identifiers: [...identifiers].sort((a, b) => a.localeCompare(b)),
    functions: [...functions].sort((a, b) => a.localeCompare(b)),
    unsupportedFeatures: [...unsupportedFeatures].sort((a, b) => a.localeCompare(b)),
    supportLevel: unsupportedFeatures.size === 0 ? "executable" : "unsupported",
  };
}

export function expressionSupportLevel(expression: string): CompileSupportLevel {
  return compileExpression(expression).supportLevel;
}

function stripRawFunctionArguments(expression: string): string {
  return expression.replace(/\b(const|const720p|gethitvar|hitdefattr)\s*\([^)]*\)/gi, (_match, name: string) => `${name}()`);
}

function expressionForSupportScan(expression: string): { expression: string; unsupportedFeature?: string } {
  const redirect = /^enemynear(?:\s*\(([^)]*)\))?\s*,\s*(.+)$/i.exec(expression.trim());
  if (!redirect) {
    return { expression };
  }
  const index = redirect[1]?.trim();
  if (index && index !== "0") {
    return { expression: redirect[2] ?? "", unsupportedFeature: "enemynear(index)" };
  }
  return { expression: redirect[2] ?? "" };
}

const supportedExpressionIdentifiers = new Set([
  "alive",
  "anim",
  "animelem",
  "animtime",
  "command",
  "ctrl",
  "backedgebodydist",
  "backedgedist",
  "canrecover",
  "facing",
  "frontedgebodydist",
  "frontedgedist",
  "hitfall",
  "hitdefattr",
  "hitover",
  "hitshakeover",
  "inguarddist",
  "life",
  "matchover",
  "movecontact",
  "moveguarded",
  "movehit",
  "movetype",
  "numexplod",
  "numhelper",
  "numproj",
  "numprojid",
  "numenemy",
  "numtarget",
  "p2bodydistx",
  "p2bodydisty",
  "p2distx",
  "p2disty",
  "p2facing",
  "p2life",
  "p2movetype",
  "p2power",
  "p2statetype",
  "physics",
  "posx",
  "posy",
  "power",
  "prevstateno",
  "projcontact",
  "projguarded",
  "projhit",
  "random",
  "roundno",
  "roundsexisted",
  "roundstate",
  "statetype",
  "stateno",
  "statetime",
  "time",
  "velx",
  "vely",
]);

const supportedExpressionFunctions = new Set([
  "abs",
  "animelemtime",
  "command",
  "const",
  "const720p",
  "fvar",
  "gethitvar",
  "hitdefattr",
  "ifelse",
  "numexplod",
  "numhelper",
  "numproj",
  "numprojid",
  "numtarget",
  "p2bodydist",
  "p2dist",
  "projcontact",
  "projguarded",
  "projhit",
  "selfanimexist",
  "sysvar",
  "var",
]);

const supportedExpressionLiterals = new Set(["a", "c", "h", "i", "l", "n", "s", "sc", "na", "sa", "ha"]);

function isFunctionCall(expression: string, identifier: string): boolean {
  const index = expression.toLowerCase().indexOf(identifier.toLowerCase());
  if (index < 0) {
    return false;
  }
  return expression.slice(index + identifier.length).trimStart()[0] === "(";
}
