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

  for (const feature of redirect.unsupportedFeatures) {
    unsupportedFeatures.add(feature);
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

function stripRedirectContextsForSupportScan(expression: string, unsupportedFeatures: Set<string>): string {
  const redirectPattern = /\b(enemynear|parent|root|target)\b/gi;
  let output = "";
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = redirectPattern.exec(expression)) !== null) {
    const redirectStart = match.index;
    const target = match[1]!.toLowerCase();
    let position = redirectPattern.lastIndex;
    while (/\s/.test(expression[position] ?? "")) {
      position += 1;
    }

    let index: string | undefined;
    if (expression[position] === "(") {
      let depth = 0;
      const indexStart = position + 1;
      while (position < expression.length) {
        const char = expression[position]!;
        if (char === "(") {
          depth += 1;
        } else if (char === ")") {
          depth -= 1;
          if (depth === 0) {
            index = expression.slice(indexStart, position).trim();
            position += 1;
            break;
          }
        }
        position += 1;
      }
    }

    while (/\s/.test(expression[position] ?? "")) {
      position += 1;
    }
    if (expression[position] !== ",") {
      continue;
    }

    if (target === "enemynear" && index && index !== "0") {
      unsupportedFeatures.add("enemynear(index)");
    }
    if ((target === "parent" || target === "root") && index) {
      unsupportedFeatures.add(`${target}(index)`);
    }
    if (target === "target" && index) {
      if (/^-?\d+$/.test(index)) {
        if (Number(index) < 0) {
          unsupportedFeatures.add("target(negative)");
        }
      } else {
        const indexScan = expressionForSupportScan(index);
        for (const feature of indexScan.unsupportedFeatures) {
          unsupportedFeatures.add(feature);
        }
        output += expression.slice(cursor, redirectStart);
        output += ` (${indexScan.expression}) `;
        cursor = position + 1;
        redirectPattern.lastIndex = cursor;
        continue;
      }
    }

    output += expression.slice(cursor, redirectStart);
    cursor = position + 1;
    redirectPattern.lastIndex = cursor;
  }
  return output + expression.slice(cursor);
}

function expressionForSupportScan(expression: string): { expression: string; unsupportedFeatures: string[] } {
  const unsupportedFeatures = new Set<string>();
  const scanExpression = stripRedirectContextsForSupportScan(expression, unsupportedFeatures);
  return {
    expression: scanExpression,
    unsupportedFeatures: [...unsupportedFeatures].sort((a, b) => a.localeCompare(b)),
  };
}

const supportedExpressionIdentifiers = new Set([
  "alive",
  "anim",
  "animelem",
  "animtime",
  "authorname",
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
  "hitcount",
  "hitover",
  "hitpausetime",
  "hitshakeover",
  "inguarddist",
  "ishelper",
  "life",
  "lifemax",
  "matchover",
  "movecontact",
  "moveguarded",
  "movehit",
  "movereversed",
  "movetype",
  "name",
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
  "p1name",
  "p2life",
  "p2movetype",
  "p2name",
  "p2power",
  "p2statetype",
  "physics",
  "posx",
  "posy",
  "power",
  "powermax",
  "prevanim",
  "prevmovetype",
  "prevstateno",
  "prevstatetype",
  "projcontact",
  "projcontacttime",
  "projguarded",
  "projguardedtime",
  "projhit",
  "projhittime",
  "random",
  "receiveddamage",
  "receivedhits",
  "roundno",
  "roundsexisted",
  "roundstate",
  "selfcommand",
  "gametime",
  "stagetime",
  "statetype",
  "stateno",
  "statetime",
  "time",
  "uniqhitcount",
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
  "ishelper",
  "numexplod",
  "numhelper",
  "numproj",
  "numprojid",
  "numtarget",
  "p2bodydist",
  "p2dist",
  "projcontact",
  "projcontacttime",
  "projguarded",
  "projguardedtime",
  "projhit",
  "projhittime",
  "selfcommand",
  "selfanimexist",
  "selfstatenoexist",
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
