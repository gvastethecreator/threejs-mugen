/**
 * DA30-108: reproducible CI workflow specification (named lanes).
 */

export type CiLane = {
  id: "pr" | "nightly" | "release";
  steps: string[];
  cacheKeys: string[];
  fatalWarnings: boolean;
};

export function buildCiWorkflowSpec(): {
  schema: "Da30CiWorkflowSpec/v1";
  runtime: string;
  lockfile: string;
  lanes: CiLane[];
  forcedFailureTest: string;
  ok: boolean;
} {
  const common = ["install-lockfile", "typecheck", "unit", "build", "boundaries", "control-audit"];
  const lanes: CiLane[] = [
    {
      id: "pr",
      steps: [...common, "upload-facts"],
      cacheKeys: ["pnpm-lock", "node-version"],
      fatalWarnings: true,
    },
    {
      id: "nightly",
      steps: [...common, "browser-smoke", "upload-facts"],
      cacheKeys: ["pnpm-lock", "node-version", "playwright"],
      fatalWarnings: true,
    },
    {
      id: "release",
      steps: [...common, "pack", "sbom", "upload-facts"],
      cacheKeys: ["pnpm-lock", "node-version"],
      fatalWarnings: true,
    },
  ];
  return {
    schema: "Da30CiWorkflowSpec/v1",
    runtime: "node-lts-pinned",
    lockfile: "pnpm-lock.yaml",
    lanes,
    forcedFailureTest: "boundaries-leak-fixture-must-fail",
    ok: lanes.length === 3 && lanes.every((l) => l.fatalWarnings && l.steps.includes("typecheck")),
  };
}
