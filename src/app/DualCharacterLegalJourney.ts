/**
 * DualCharacterLegalJourney/v1 (DA27-04).
 * Two named legal characters through import/walk/jump/hit/guard/ko route proofs.
 * Claim blocked: full browser dual combat matrix and SFF sprite decode for every frame.
 */

import { evaluateSecondCharacterReadiness, type CharacterLegalPackage } from "./SecondCharacterReadiness";
import type { MugenCharacter } from "../mugen/model/MugenCharacter";

export const DUAL_CHARACTER_LEGAL_JOURNEY_SCHEMA = "DualCharacterLegalJourney/v1" as const;

export type DualCharacterRouteId = "import" | "walk" | "jump" | "hit" | "guard" | "ko";

export type DualCharacterRouteResult = {
  route: DualCharacterRouteId;
  passed: boolean;
  detail: string;
};

export type DualCharacterPackageJourney = {
  packageId: string;
  name: string;
  licenseSpdx: string;
  licenseVerified: boolean;
  entryDef: string;
  packageDigest: string;
  routes: DualCharacterRouteResult[];
  routePassCount: number;
  passed: boolean;
};

export type DualCharacterLegalJourneyReport = {
  schema: typeof DUAL_CHARACTER_LEGAL_JOURNEY_SCHEMA;
  first: DualCharacterPackageJourney;
  second: DualCharacterPackageJourney;
  independent: boolean;
  canClaimTwoNamed: boolean;
  diagnostics: string[];
  checksum: string;
  claims: {
    allowed: string[];
    blocked: string[];
  };
};

export type DualCharacterLoadedPackage = {
  legal: CharacterLegalPackage;
  character: Pick<
    MugenCharacter,
    "sourceName" | "defPath" | "definition" | "commands" | "states" | "animations" | "diagnostics"
  >;
};

const REQUIRED_ROUTES: DualCharacterRouteId[] = ["import", "walk", "jump", "hit", "guard", "ko"];

export function runDualCharacterLegalJourney(
  first: DualCharacterLoadedPackage,
  second: DualCharacterLoadedPackage,
): DualCharacterLegalJourneyReport {
  const readiness = evaluateSecondCharacterReadiness(first.legal, second.legal);
  const firstJourney = packageJourney(first);
  const secondJourney = packageJourney(second);
  const diagnostics = [
    ...readiness.diagnostics,
    ...firstJourney.routes.filter((r) => !r.passed).map((r) => `first:${r.route}:${r.detail}`),
    ...secondJourney.routes.filter((r) => !r.passed).map((r) => `second:${r.route}:${r.detail}`),
  ].sort();

  const canClaimTwoNamed =
    readiness.canClaimTwoNamed && firstJourney.passed && secondJourney.passed && diagnostics.length === 0;

  const payload = {
    schema: DUAL_CHARACTER_LEGAL_JOURNEY_SCHEMA,
    first: firstJourney,
    second: secondJourney,
    independent: readiness.independent,
    canClaimTwoNamed,
    diagnostics,
    claims: {
      allowed: [
        "two named independent packages complete import/walk/jump/hit/guard/ko route probes",
        "no per-character adapter required for the dual claim",
      ],
      blocked: [
        "full browser dual combat matrix",
        "exact SFF/sprite decode for every animation frame",
        "score movement",
      ],
    },
  };

  return {
    ...payload,
    checksum: stableHash(stableStringify(payload)),
  };
}

function packageJourney(input: DualCharacterLoadedPackage): DualCharacterPackageJourney {
  const routes = REQUIRED_ROUTES.map((route) => evaluateRoute(route, input));
  const routePassCount = routes.filter((route) => route.passed).length;
  return {
    packageId: input.legal.id,
    name: input.legal.name,
    licenseSpdx: input.legal.licenseSpdx,
    licenseVerified: input.legal.licenseVerified,
    entryDef: input.legal.entryDef,
    packageDigest: input.legal.packageDigest,
    routes,
    routePassCount,
    passed: routePassCount === REQUIRED_ROUTES.length && input.legal.licenseVerified,
  };
}

function evaluateRoute(
  route: DualCharacterRouteId,
  input: DualCharacterLoadedPackage,
): DualCharacterRouteResult {
  const character = input.character;
  const name = character.definition.info.name || character.sourceName;
  const animKeys = [...character.animations.keys()];
  const hasFatal = character.diagnostics.some((d) => d.severity === "error");

  switch (route) {
    case "import": {
      const passed = Boolean(character.defPath) && !hasFatal && Boolean(name);
      return {
        route,
        passed,
        detail: passed ? `loaded:${name}` : hasFatal ? "loader-errors" : "missing-def",
      };
    }
    case "walk": {
      const passed = hasAnimHint(animKeys, character, [/walk/i, /20\b/]) || hasCommandHint(character, /walk|fwd|forward/i);
      return { route, passed, detail: passed ? "walk-route" : "missing-walk" };
    }
    case "jump": {
      const passed = hasAnimHint(animKeys, character, [/jump/i, /4[0-9]\b/]) || hasCommandHint(character, /jump|up/i);
      return { route, passed, detail: passed ? "jump-route" : "missing-jump" };
    }
    case "hit": {
      const passed =
        hasAnimHint(animKeys, character, [/punch|kick|attack|hit/i, /2[0-9]{2}\b/]) ||
        hasCommandHint(character, /a|b|x|y|punch|kick/i) ||
        character.states.some((state) => state.number >= 200 && state.number < 1300);
      return { route, passed, detail: passed ? "hit-route" : "missing-hit" };
    }
    case "guard": {
      const passed =
        hasAnimHint(animKeys, character, [/guard|block|standguard|crouchguard/i, /1[2-3][0-9]\b/]) ||
        character.states.some((state) => state.number >= 120 && state.number <= 155);
      return { route, passed, detail: passed ? "guard-route" : "missing-guard" };
    }
    case "ko": {
      const passed =
        hasAnimHint(animKeys, character, [/die|ko|fall/i, /5[0-1][0-9]0?\b/]) ||
        character.states.some((state) => state.number >= 5000 && state.number <= 5150);
      return { route, passed, detail: passed ? "ko-route" : "missing-ko" };
    }
    default: {
      const _never: never = route;
      return { route: "import", passed: false, detail: `unknown:${String(_never)}` };
    }
  }
}

function hasAnimHint(
  keys: number[],
  character: DualCharacterLoadedPackage["character"],
  patterns: Array<RegExp>,
): boolean {
  if (keys.some((key) => patterns.some((pattern) => pattern.test(String(key))))) return true;
  for (const state of character.states) {
    const label = `${state.number}`;
    if (patterns.some((pattern) => pattern.test(label))) return true;
  }
  return false;
}

function hasCommandHint(
  character: DualCharacterLoadedPackage["character"],
  pattern: RegExp,
): boolean {
  return character.commands.some((command) => pattern.test(command.name) || pattern.test(command.command));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
