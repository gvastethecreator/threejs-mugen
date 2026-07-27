/**
 * DA30-095: Lua and external-module scope research (decision input only).
 */

export type SurfaceDecision = "deny" | "isolate" | "translate" | "omit";

export type ModuleSurface = {
  surface: string;
  access: string[];
  browserConstraint: string;
  recommendation: SurfaceDecision;
  rationale: string;
};

export function buildLuaModuleScope(): {
  schema: "Da30LuaModuleScope/v1";
  rows: ModuleSurface[];
  ok: boolean;
} {
  const rows: ModuleSurface[] = [
    {
      surface: "filesystem",
      access: ["read", "write", "list"],
      browserConstraint: "no arbitrary FS",
      recommendation: "deny",
      rationale: "browser sandbox",
    },
    {
      surface: "network",
      access: ["http", "socket"],
      browserConstraint: "CORS + no raw sockets",
      recommendation: "deny",
      rationale: "trust boundary",
    },
    {
      surface: "process",
      access: ["exec", "env"],
      browserConstraint: "impossible",
      recommendation: "omit",
      rationale: "not portable",
    },
    {
      surface: "time",
      access: ["clock", "sleep"],
      browserConstraint: "performance.now",
      recommendation: "translate",
      rationale: "deterministic match clock separate",
    },
    {
      surface: "random",
      access: ["math.random"],
      browserConstraint: "seeded streams",
      recommendation: "translate",
      rationale: "match RNG authority",
    },
    {
      surface: "host-api-game",
      access: ["char", "stage hooks"],
      browserConstraint: "must be capability-gated",
      recommendation: "isolate",
      rationale: "optional future module host",
    },
    {
      surface: "packaging",
      access: ["require paths"],
      browserConstraint: "virtual FS only",
      recommendation: "isolate",
      rationale: "manifest digests",
    },
  ];
  return {
    schema: "Da30LuaModuleScope/v1",
    rows,
    ok: rows.length >= 6 && rows.every((r) => r.recommendation),
  };
}
