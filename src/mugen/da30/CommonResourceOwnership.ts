/**
 * DA30-059: Common CNS / FightFX / Common.Fx ownership without silent fallback.
 */

export type ResourceResolve = {
  id: string;
  source: "character" | "common" | "fightfx" | "missing";
  digest: string | null;
  profile: string;
  ok: boolean;
  reason?: string;
};

export function resolveCommonResource(opts: {
  name: string;
  characterHas?: boolean;
  commonHas?: boolean;
  fightFxHas?: boolean;
  profile: string;
  allowedProfiles: string[];
}): ResourceResolve {
  if (!opts.allowedProfiles.includes(opts.profile)) {
    return {
      id: opts.name,
      source: "missing",
      digest: null,
      profile: opts.profile,
      ok: false,
      reason: "profile-mismatch",
    };
  }
  if (opts.characterHas) {
    return {
      id: opts.name,
      source: "character",
      digest: `char:${opts.name}`,
      profile: opts.profile,
      ok: true,
    };
  }
  if (opts.name.startsWith("FightFX") && opts.fightFxHas) {
    return {
      id: opts.name,
      source: "fightfx",
      digest: `fx:${opts.name}`,
      profile: opts.profile,
      ok: true,
    };
  }
  if (opts.commonHas) {
    return {
      id: opts.name,
      source: "common",
      digest: `common:${opts.name}`,
      profile: opts.profile,
      ok: true,
    };
  }
  return {
    id: opts.name,
    source: "missing",
    digest: null,
    profile: opts.profile,
    ok: false,
    reason: "missing-bank-no-silent-fallback",
  };
}

export function runCommonOwnershipRoute(): {
  ok: boolean;
  routes: ResourceResolve[];
  noSilentFallback: boolean;
} {
  const routes = [
    resolveCommonResource({
      name: "State 5050",
      characterHas: false,
      commonHas: true,
      profile: "mugen",
      allowedProfiles: ["mugen", "ikemen"],
    }),
    resolveCommonResource({
      name: "FightFX spark",
      fightFxHas: true,
      profile: "mugen",
      allowedProfiles: ["mugen"],
    }),
    resolveCommonResource({
      name: "Common.Fx hit",
      commonHas: true,
      profile: "mugen",
      allowedProfiles: ["mugen"],
    }),
    resolveCommonResource({
      name: "missing.snd",
      characterHas: false,
      commonHas: false,
      profile: "mugen",
      allowedProfiles: ["mugen"],
    }),
    resolveCommonResource({
      name: "State 200",
      characterHas: true,
      commonHas: true,
      profile: "mugen",
      allowedProfiles: ["mugen"],
    }),
  ];
  const missing = routes.find((r) => r.id === "missing.snd");
  const charWins = routes.find((r) => r.id === "State 200");
  return {
    ok:
      routes.filter((r) => r.ok).length >= 4 &&
      missing?.ok === false &&
      missing?.reason === "missing-bank-no-silent-fallback" &&
      charWins?.source === "character",
    routes,
    noSilentFallback: true,
  };
}
