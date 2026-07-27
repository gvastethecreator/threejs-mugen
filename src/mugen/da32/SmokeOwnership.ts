/**
 * DA32-001…004: structured smoke lane ownership.
 */

export type SmokeLaneId =
  | "runtime-native"
  | "mugen-lite-visual"
  | "studio-workbench"
  | "studio-build"
  | "studio-modules"
  | "studio-source-relink"
  | "studio-assets"
  | "studio-evidence"
  | "studio-debug"
  | "ikemen-scan"
  | "studio-stage"
  | "a11y-command-palette"
  | "console"
  | "other";

export type SmokeLaneStatus = "open" | "partial" | "green" | "skipped";

export type SmokeLaneRow = {
  id: SmokeLaneId;
  status: SmokeLaneStatus;
  failureCount: number;
  failures: string[];
  owner: string;
  claimCeiling: string;
};

export function classifySmokeFailure(message: string): SmokeLaneId {
  const m = String(message);
  if (/^runtime-(desktop|mobile):/.test(m)) return "runtime-native";
  if (/^mugen-lite visual/.test(m)) return "mugen-lite-visual";
  if (/^studio-workbench/.test(m)) return "studio-workbench";
  if (/^studio-build/.test(m)) return "studio-build";
  if (/^studio-modules/.test(m)) return "studio-modules";
  if (/^studio-source-relink/.test(m)) return "studio-source-relink";
  if (/^studio-assets/.test(m)) return "studio-assets";
  if (/^studio-evidence/.test(m)) return "studio-evidence";
  if (/^studio-debug/.test(m)) return "studio-debug";
  if (/^ikemen-scan/.test(m)) return "ikemen-scan";
  if (/^studio-stage/.test(m)) return "studio-stage";
  if (/command palette|command-palette|a11y/i.test(m)) return "a11y-command-palette";
  if (/page errors|console issues/.test(m)) return "console";
  return "other";
}

export function buildSmokeOwnership(failures: string[]): {
  schema: "Da32SmokeOwnership/v1";
  ok: boolean;
  failureCount: number;
  lanes: SmokeLaneRow[];
  laneSummary: Record<string, number>;
  claimCeiling: string;
} {
  const map = new Map<SmokeLaneId, string[]>();
  for (const f of failures) {
    const id = classifySmokeFailure(f);
    const list = map.get(id) ?? [];
    list.push(f);
    map.set(id, list);
  }
  const lanes: SmokeLaneRow[] = [...map.entries()].map(([id, msgs]) => ({
    id,
    status: msgs.length ? "open" : "green",
    failureCount: msgs.length,
    failures: msgs,
    owner: `DA32-${id}`,
    claimCeiling: "lane open until green at named subject SHA",
  }));
  lanes.sort((a, b) => b.failureCount - a.failureCount || a.id.localeCompare(b.id));
  return {
    schema: "Da32SmokeOwnership/v1",
    ok: failures.length === 0,
    failureCount: failures.length,
    lanes,
    laneSummary: Object.fromEntries(lanes.map((l) => [l.id, l.failureCount])),
    claimCeiling: failures.length
      ? "structured smoke ownership only; full visual matrix not green"
      : "full qa:smoke green at this subject only",
  };
}

/** Parse multi-line smoke error body after "QA smoke failed:". */
export function parseSmokeFailureBody(text: string): string[] {
  const body = text.includes("QA smoke failed:")
    ? text.split("QA smoke failed:")[1] ?? text
    : text;
  return body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("at ") && !l.startsWith("Error:"));
}
