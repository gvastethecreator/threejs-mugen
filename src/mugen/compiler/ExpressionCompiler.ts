import { isMalformedMugenExpression, tokenizeMugenExpression } from "./ExpressionLexer";
import type { CompileSupportLevel, ExpressionIr } from "./RuntimeIr";

export function normalizeMugenExpression(expression: string): string {
  let normalized = expression.trim();
  normalized = normalized.replace(/\b(vel|pos)\s+([xyz])\b/gi, (_match, base: string, axis: string) => {
    return `${base}${axis}`.toLowerCase();
  });
  normalized = normalized.replace(/\b(p2bodydist|p2dist)\s+([xy])\b/gi, (_match, base: string, axis: string) => {
    return `${base}${axis}`.toLowerCase();
  });
  normalized = normalizeLegacyTimeModTriggers(normalized);
  normalized = normalizeLegacyProjectileContactTriggers(normalized);
  return normalized;
}

function normalizeLegacyTimeModTriggers(expression: string): string {
  return expression.replace(
    /\btimemod\s*=\s*(-?\d+)\s*,\s*((?:<=|>=|!=|=|<|>)\s*)?(-?(?:\d+(?:\.\d+)?|\.\d+))/gi,
    (_match, divisorRaw: string, operatorRaw: string | undefined, remainderRaw: string) => {
      const divisor = Number(divisorRaw);
      if (!Number.isInteger(divisor) || divisor <= 0) {
        return _match;
      }
      const operator = (operatorRaw ?? "=").trim();
      return `((Time % ${divisor}) ${operator} ${remainderRaw})`;
    },
  );
}

function normalizeLegacyProjectileContactTriggers(expression: string): string {
  const numericFragment = "-?\\d+(?:\\.\\d+)?|\\.\\d+";
  const secondForm = new RegExp(
    `\\b(ProjContact|ProjHit|ProjGuarded)(\\d*)\\b\\s*=\\s*([01])\\s*,\\s*(<=|>=|!=|=|<|>)\\s*(${numericFragment})`,
    "gi",
  );
  const firstForm = /\b(ProjContact|ProjHit|ProjGuarded)(\d*)\b\s*(!=|=)\s*([01])\b/gi;
  return expression
    .replace(secondForm, (_match, trigger: string, rawId: string, expected: string, operator: string, ticks: string) => {
      const timeFunction = `${trigger}Time(${legacyProjectileIdArgument(rawId)})`;
      const matchExpression = `((${timeFunction} >= 0) && (${timeFunction} ${operator} ${ticks}))`;
      return expected === "1" ? matchExpression : `(!${matchExpression})`;
    })
    .replace(firstForm, (_match, trigger: string, rawId: string, operator: string, expected: string) => {
      return `${trigger}(${legacyProjectileIdArgument(rawId)}) ${operator} ${expected}`;
    });
}

function legacyProjectileIdArgument(rawId: string): string {
  if (!rawId || Number(rawId) === 0) {
    return "";
  }
  return String(Math.max(0, Math.trunc(Number(rawId))));
}

export function compileExpression(expression: string): ExpressionIr {
  const normalized = normalizeMugenExpression(expression);
  const redirect = expressionForSupportScan(normalized);
  const withoutStrings = stripRawFunctionArguments(
    stripGetHitVarHitFlagComparisons(stripGetHitVarGuardFlagComparisons(redirect.expression)),
  ).replace(/"[^"]*"/g, "\"\"");
  const unsupportedFeatures = new Set<string>();
  const identifiers = new Set<string>();
  const functions = new Set<string>();

  for (const feature of redirect.unsupportedFeatures) {
    unsupportedFeatures.add(feature);
  }
  if (isMalformedMugenExpression(tokenizeMugenExpression(normalized))) {
    unsupportedFeatures.add("malformed expression");
  }

  for (const match of withoutStrings.matchAll(/[A-Za-z_][A-Za-z0-9_.]*/g)) {
    const identifier = match[0];
    const lower = identifier.toLowerCase();
    if (supportedExpressionLiterals.has(lower)) {
      continue;
    }
    if (isFunctionCall(withoutStrings, identifier, match.index)) {
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
  return expression
    .replace(/\b(helpervar)\s*\(\s*(?:helpertype|id|keyctrl|clsnproxy|ownclsnscale|ownpal|ownprojectile|preserve)\s*\)/gi, (_match, name: string) => `${name}()`)
    .replace(/\b(const|gethitvar|hitdefattr)\s*\([^)]*\)/gi, (_match, name: string) => `${name}()`);
}

function stripGetHitVarGuardFlagComparisons(expression: string): string {
  return expression.replace(
    /\bgethitvar\s*\(\s*guardflag\s*\)\s*(?:=|!=)\s*[hlmadfp]+[+-]?/gi,
    "GetHitVar(guardflag)",
  );
}

function stripGetHitVarHitFlagComparisons(expression: string): string {
  return expression.replace(
    /\bgethitvar\s*\(\s*hitflag\s*\)\s*(?:=|!=)\s*[hlmadfpd]+[+-]?/gi,
    "GetHitVar(hitflag)",
  );
}

function stripRedirectContextsForSupportScan(expression: string, unsupportedFeatures: Set<string>): string {
  const redirectPattern = /\b(enemynear|partner|enemy|parent|root|target|playerid)\b/gi;
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

    if ((target === "enemynear" || target === "partner" || target === "enemy" || target === "playerid") && index) {
      if (/^-?\d+$/.test(index)) {
        if (Number(index) < 0) {
          unsupportedFeatures.add(`${target}(negative)`);
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
    if (target === "playerid" && !index) {
      unsupportedFeatures.add("playerid");
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
  "gameheight",
  "gamewidth",
  "gametime",
  "hitfall",
  "hitdefattr",
  "hitcount",
  "hitover",
  "hitpausetime",
  "hitshakeover",
  "id",
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
  "numpartner",
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
  "p3name",
  "p4name",
  "p5name",
  "p6name",
  "p7name",
  "p8name",
  "p2power",
  "p2statetype",
  "physics",
  "playerno",
  "posx",
  "posy",
  "power",
  "pi",
  "powermax",
  "e",
  "prevanim",
  "prevmovetype",
  "prevstateno",
  "prevstatetype",
  "projcontact",
  "projcontacttime",
  "projcanceltime",
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
  "screenheight",
  "screenwidth",
  "stagetime",
  "statetype",
  "stateno",
  "statetime",
  "teammode",
  "teamside",
  "win",
  "winko",
  "wintime",
  "winperfect",
  "lose",
  "loseko",
  "losetime",
  "drawgame",
  "time",
  "uniqhitcount",
  "velx",
  "vely",
]);

const supportedExpressionFunctions = new Set([
  "abs",
  "sin",
  "cos",
  "tan",
  "acos",
  "asin",
  "atan",
  "exp",
  "ln",
  "log",
  "floor",
  "ceil",
  "animelemtime",
  "animexist",
  "animelemno",
  "command",
  "const",
  "const240p",
  "const480p",
  "const720p",
  "fvar",
  "gethitvar",
  "helpervar",
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
  "playerid",
  "projcontact",
  "projcontacttime",
  "projcanceltime",
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

const supportedExpressionLiterals = new Set([
  "a",
  "c",
  "h",
  "i",
  "l",
  "n",
  "s",
  "ca",
  "sa",
  "sc",
  "sca",
  "na",
  "nt",
  "np",
  "st",
  "sp",
  "ha",
  "ht",
  "hp",
  "single",
  "simul",
  "turns",
  "tag",
]);

function isFunctionCall(expression: string, identifier: string, index: number): boolean {
  return expression.slice(index + identifier.length).trimStart()[0] === "(";
}
