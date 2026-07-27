/**
 * DA30-091: Ikemen source authority by family (research record).
 */

export type FamilyAuthority = {
  family: string;
  normativePin: string;
  workingPin: string;
  files: string[];
  symbols: string[];
  digestRelation: "same" | "ahead" | "diverged" | "unknown";
  reviewState: "reviewed" | "partial" | "open";
  consumer: string;
  openQuestions: string[];
};

export function buildIkemenSourceAuthority(): {
  schema: "Da30IkemenSourceAuthority/v1";
  rows: FamilyAuthority[];
  ok: boolean;
} {
  const pinN = "05b7d98a";
  const pinW = "4aa0ba38";
  const rows: FamilyAuthority[] = [
    {
      family: "scheduler",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/system.go"],
      symbols: ["sys"],
      digestRelation: "unknown",
      reviewState: "partial",
      consumer: "runtime-schedule",
      openQuestions: ["frame-perfect order"],
    },
    {
      family: "teams",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/system.go", "src/char.go"],
      symbols: ["TeamMode"],
      digestRelation: "same",
      reviewState: "partial",
      consumer: "team-runtime",
      openQuestions: ["tag input owner"],
    },
    {
      family: "triggers",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/compiler.go"],
      symbols: ["triggerMap"],
      digestRelation: "ahead",
      reviewState: "partial",
      consumer: "expression",
      openQuestions: ["redirect completeness"],
    },
    {
      family: "controllers",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/compiler.go", "src/bytecode.go"],
      symbols: ["StateController"],
      digestRelation: "ahead",
      reviewState: "partial",
      consumer: "dispatch",
      openQuestions: ["rare controllers"],
    },
    {
      family: "projectile",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/char.go"],
      symbols: ["Projectile"],
      digestRelation: "same",
      reviewState: "reviewed",
      consumer: "projectile-system",
      openQuestions: [],
    },
    {
      family: "ZSS",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/compiler_zss.go"],
      symbols: ["Zss"],
      digestRelation: "unknown",
      reviewState: "open",
      consumer: "zss-runtime",
      openQuestions: ["bounded ops only"],
    },
    {
      family: "Lua/modules",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/script.go"],
      symbols: ["lua"],
      digestRelation: "unknown",
      reviewState: "open",
      consumer: "blocked",
      openQuestions: ["browser host deny"],
    },
    {
      family: "config",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/config.go"],
      symbols: ["Config"],
      digestRelation: "same",
      reviewState: "partial",
      consumer: "config-loader",
      openQuestions: [],
    },
    {
      family: "screenpack",
      normativePin: pinN,
      workingPin: pinW,
      files: ["src/system.go"],
      symbols: ["motif"],
      digestRelation: "diverged",
      reviewState: "open",
      consumer: "motif",
      openQuestions: ["ikemen extensions"],
    },
  ];
  return {
    schema: "Da30IkemenSourceAuthority/v1",
    rows,
    ok: rows.length >= 8 && rows.every((r) => r.normativePin && r.workingPin),
  };
}
