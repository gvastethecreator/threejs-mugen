import type { RuntimeAssertSpecial } from "./types";

export const RUNTIME_GLOBAL_ASSERT_SPECIAL_SCHEMA = "mugen-web-sandbox/runtime-global-assert-special/v0";

export const RUNTIME_GLOBAL_ASSERT_SPECIAL_FLAGS = [
  "intro",
  "globalnoko",
  "globalnoshadow",
  "nobardisplay",
  "nobg",
  "nofg",
  "nokoslow",
  "nokosnd",
  "nomusic",
  "roundnotover",
  "timerfreeze",
] as const;

export type RuntimeGlobalAssertSpecialFlag = (typeof RUNTIME_GLOBAL_ASSERT_SPECIAL_FLAGS)[number];

export type RuntimeGlobalAssertSpecialActor = {
  id?: string;
  label?: string;
  runtime: {
    assertSpecial?: RuntimeAssertSpecial;
  };
};

export type RuntimeGlobalAssertSpecialSnapshot = {
  schema: typeof RUNTIME_GLOBAL_ASSERT_SPECIAL_SCHEMA;
  tick: number;
  activeFlags: RuntimeGlobalAssertSpecialFlag[];
  actorsByFlag: Partial<Record<RuntimeGlobalAssertSpecialFlag, string[]>>;
  unknownFlags: string[];
  noKoSlow: boolean;
  noKoSound: boolean;
  timerFreeze: boolean;
  roundNotOver: boolean;
};

export type RuntimeGlobalAssertSpecialSnapshotInput<TActor extends RuntimeGlobalAssertSpecialActor> = {
  tick?: number;
  actors: readonly TActor[];
};

export class RuntimeGlobalAssertSpecialWorld {
  snapshot<TActor extends RuntimeGlobalAssertSpecialActor>(
    input: RuntimeGlobalAssertSpecialSnapshotInput<TActor>,
  ): RuntimeGlobalAssertSpecialSnapshot {
    const knownSources = new Map<RuntimeGlobalAssertSpecialFlag, Set<string>>();
    const unknownFlags = new Set<string>();

    for (const [index, actor] of input.actors.entries()) {
      const actorId = actor.id?.trim() || actor.label?.trim() || `actor-${index + 1}`;
      const assertSpecial = actor.runtime.assertSpecial;
      if (!assertSpecial) {
        continue;
      }

      const globalFlags = new Set(assertSpecial.globalFlags.map(normalizeFlag).filter(Boolean));
      for (const flag of globalFlags) {
        if (!isRuntimeGlobalAssertSpecialFlag(flag)) {
          unknownFlags.add(flag);
        }
      }

      for (const flag of RUNTIME_GLOBAL_ASSERT_SPECIAL_FLAGS) {
        if (!isGlobalFlagActive(flag, assertSpecial, globalFlags)) {
          continue;
        }
        const sources = knownSources.get(flag) ?? new Set<string>();
        sources.add(actorId);
        knownSources.set(flag, sources);
      }
    }

    const activeFlags = RUNTIME_GLOBAL_ASSERT_SPECIAL_FLAGS.filter((flag) => knownSources.has(flag));
    const actorsByFlag: Partial<Record<RuntimeGlobalAssertSpecialFlag, string[]>> = {};
    for (const flag of activeFlags) {
      actorsByFlag[flag] = [...knownSources.get(flag)!].sort(compareStableStrings);
    }

    return {
      schema: RUNTIME_GLOBAL_ASSERT_SPECIAL_SCHEMA,
      tick: Number.isFinite(input.tick) ? Math.max(0, Math.round(input.tick!)) : 0,
      activeFlags: [...activeFlags],
      actorsByFlag,
      unknownFlags: [...unknownFlags].sort(compareStableStrings),
      noKoSlow: knownSources.has("nokoslow"),
      noKoSound: knownSources.has("nokosnd"),
      timerFreeze: knownSources.has("timerfreeze"),
      roundNotOver: knownSources.has("roundnotover"),
    };
  }
}

function isGlobalFlagActive(
  flag: RuntimeGlobalAssertSpecialFlag,
  assertSpecial: RuntimeAssertSpecial,
  globalFlags: Set<string>,
): boolean {
  if (globalFlags.has(flag)) {
    return true;
  }

  switch (flag) {
    case "nokoslow":
      return assertSpecial.noKoSlow === true;
    case "roundnotover":
      return assertSpecial.roundNotOver === true || hasFlag(assertSpecial.flags, flag);
    case "timerfreeze":
      return assertSpecial.timerFreeze === true || hasFlag(assertSpecial.flags, flag);
    default:
      return false;
  }
}

function hasFlag(flags: readonly string[], expected: string): boolean {
  return flags.some((flag) => normalizeFlag(flag) === expected);
}

function isRuntimeGlobalAssertSpecialFlag(flag: string): flag is RuntimeGlobalAssertSpecialFlag {
  return (RUNTIME_GLOBAL_ASSERT_SPECIAL_FLAGS as readonly string[]).includes(flag);
}

function normalizeFlag(flag: string): string {
  return flag.trim().replace(/^"|"$/g, "").replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
}

function compareStableStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
