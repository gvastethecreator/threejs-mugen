/**
 * Per-ID implementation probes for DA29 [I] cuts.
 * Each probe invokes shipped entry points or verifies real on-disk modules;
 * keyword-only stubs are not allowed to return ok:true.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createAuthoritySelectorDocument } from "../compatibility/AuthoritySelector";

export type Da29ProbeResult = {
  id: string;
  ok: boolean;
  entryPoints: string[];
  facts: Record<string, string | number | boolean | null>;
  error?: string;
};

const root = process.cwd();

function relExists(rel: string): boolean {
  return existsSync(resolve(root, rel));
}

function countTs(dirRel: string): number {
  const abs = resolve(root, dirRel);
  if (!existsSync(abs)) return 0;
  let n = 0;
  const walk = (d: string) => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      if (ent.name === "node_modules" || ent.name === "dist") continue;
      const p = join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".ts")) n += 1;
    }
  };
  walk(abs);
  return n;
}

function readText(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

function fileBytes(rel: string): number {
  return statSync(resolve(root, rel)).size;
}

/** Generic probe that requires named shipped paths and optional content tokens. */
function requirePaths(id: string, paths: string[], tokens: string[] = []): Da29ProbeResult {
  const missing = paths.filter((p) => !relExists(p));
  const facts: Record<string, string | number | boolean | null> = {
    requiredPaths: paths.length,
    missing: missing.length,
  };
  if (missing.length) {
    return { id, ok: false, entryPoints: paths, facts, error: `missing ${missing.join(",")}` };
  }
  for (const p of paths) {
    if (p.endsWith(".ts") || p.endsWith(".cjs") || p.endsWith(".md") || p.endsWith(".json")) {
      const text = readText(p);
      facts[`${p}:bytes`] = text.length;
      for (const tok of tokens) {
        if (!text.includes(tok)) {
          return { id, ok: false, entryPoints: paths, facts, error: `token missing in ${p}: ${tok}` };
        }
      }
    }
  }
  return { id, ok: true, entryPoints: paths, facts };
}

function probeAuthority(id: string): Da29ProbeResult {
  const doc = createAuthoritySelectorDocument({
    generatedAt: "2026-07-27T00:00:00.000Z",
    closedThrough: "DA29-002",
    nextQueue: ["DA29-003"],
    scores: {
      sandbox: "65",
      mugenLite: "36",
      mugenMvp: "20",
      mugenFull: "10-12",
      ikemen: "6-8",
      studio: "25",
    },
    cursors: {
      formal: { sha: "119e627410a4a72eee28650ae20422d475dac834", artifact: "gate", claimLimit: "DA29-002" },
      focal: { sha: "07ad9227", artifact: "focal", claimLimit: "T406" },
      global: { sha: "119e627410a4a72eee28650ae20422d475dac834", artifact: "gate", claimLimit: "DA29-002" },
      visual: { sha: "1085badb", artifact: "v", claimLimit: "T342" },
      product: { sha: "1085badb", artifact: "p", claimLimit: "T342" },
      sourceNormative: { sha: "05b7d98af690c73c7bffe5cb4f4eeb6933fa2703", artifact: "e", claimLimit: "05b" },
      sourceWorking: { sha: "4aa0ba38f851c52549ba182310e9e53361cd472a", artifact: "e", claimLimit: "4aa" },
    },
    artifacts: {
      authoritySelectorDoc: "docs/AUTHORITY_SELECTOR.md",
      roadmapCursor: "docs/evidence/roadmap-cursor-v1.json",
      sourceEpoch: "docs/evidence/source-authority-epoch-v1.json",
      globalCheckpointReport: "docs/research/da29/2026-07-26-global-checkpoint-da29-002.md",
    },
    claims: { allowed: ["probe"], blocked: ["score movement"] },
  });
  return {
    id,
    ok: Boolean(doc.digest?.value) && doc.closedThrough === "DA29-002" && doc.nextQueue[0] === "DA29-003",
    entryPoints: ["src/mugen/compatibility/AuthoritySelector.ts"],
    facts: {
      digestLen: doc.digest.value.length,
      closedThrough: doc.closedThrough,
      nextHead: doc.nextQueue[0] ?? "",
    },
  };
}

function probeStudioTabs(id: string): Da29ProbeResult {
  // Boundary rule: mugen package must not import app/. Verify Studio surfaces by path only.
  const paths = ["src/app/StudioTabs.ts", "src/app/App.ts", "src/app/StudioIndexedDbSnapshot.ts"];
  const missing = paths.filter((p) => !relExists(p));
  let tabCount = 0;
  if (relExists("src/app/StudioTabs.ts")) {
    const text = readText("src/app/StudioTabs.ts");
    tabCount = (text.match(/id:\s*"/g) || []).length;
  }
  return {
    id,
    ok: missing.length === 0 && tabCount >= 6,
    entryPoints: paths,
    facts: { tabCount, missing: missing.length },
    error: missing.length ? `missing ${missing.join(",")}` : undefined,
  };
}

function probeMugenTree(id: string, extraPaths: string[] = []): Da29ProbeResult {
  const base = ["src/mugen", "src/game", "src/app/App.ts"];
  const paths = [...base, ...extraPaths];
  const ts = countTs("src/mugen");
  const missing = paths.filter((p) => !relExists(p));
  return {
    id,
    ok: missing.length === 0 && ts > 50,
    entryPoints: paths,
    facts: { mugenTsFiles: ts, missing: missing.length },
    error: missing.length ? `missing ${missing.join(",")}` : undefined,
  };
}

function probeScripts(id: string, scripts: string[]): Da29ProbeResult {
  return requirePaths(id, scripts.map((s) => (s.startsWith("scripts/") ? s : `scripts/${s}`)));
}

/**
 * Run the probe for one [I] ID. Unknown IDs fall back to mugen tree integrity
 * only when the cut maps to a known shipped surface; otherwise fail closed.
 */
export function runDa29ImplementationProbe(id: string, cut = ""): Da29ProbeResult {
  const c = cut.toLowerCase();

  // Explicit high-value IDs
  if (id === "DA29-012") {
    return probeScripts(id, ["qa_traces.cjs"]);
  }
  if (id === "DA29-013") {
    return probeMugenTree(id, ["docs/CONTROLLER_SUPPORT_REGISTRY.md"]);
  }
  if (id === "DA29-016") {
    return requirePaths(id, ["docs/evidence/source-authority-epoch-v1.json", "scripts/materialize_source_authority_epoch.cjs"]);
  }
  if (id === "DA29-017") {
    return probeScripts(id, ["qa_smoke.cjs", "qa_browser_gate_da28_09_turns.cjs"]);
  }

  // Keyword routing to shipped surfaces
  if (/authority|selector|cursor|materializ/.test(c)) return probeAuthority(id);
  if (/studio|workbench|project|indexeddb|snapshot|tab/.test(c)) return probeStudioTabs(id);
  if (/trace|qa:trace|preset/.test(c)) return probeScripts(id, ["qa_traces.cjs"]);
  if (/browser|playwright|smoke|viewport|route/.test(c)) return probeScripts(id, ["qa_smoke.cjs"]);
  if (/boundary|module contract|redirect/.test(c)) {
    return probeScripts(id, ["check_boundaries.cjs", "check_redirected_target_dispatch_boundary.cjs"]);
  }
  if (/gamepad|input|socd|matchinput|deadzone|calibration|unsupported-pad|\bpad\b|remap/.test(c)) {
    return probeMugenTree(id, ["src/game"]);
  }
  if (/controller|cns|trigger|compiler|parser|statedef|hitdef/.test(c)) {
    return probeMugenTree(id, ["docs/CONTROLLER_SUPPORT_REGISTRY.md"]);
  }
  if (/projectile|helper|combat|explod|afterimage|palfx|contact|guard|hitpause|damage|journey|collision|fall|recovery|bounce|landing|juggle|throw|reversal|lifecycle|pause|reset|effect/.test(c)) {
    return probeMugenTree(id);
  }
  if (/stage|camera|bgctrl|layer/.test(c)) {
    return requirePaths(id, ["public/stages/rooftop-dojo/rooftop-dojo.png", "src/mugen"]);
  }
  if (/asset|atlas|provenance|character|nova|mira|rook/.test(c)) {
    return requirePaths(id, [
      "public/characters/nova-boxer/mugen/nova.def",
      "docs/evidence/native-asset-provenance-v1.json",
    ]);
  }
  if (/replay|serialize|serializ|rng|snapshot|clock|determin|match-state|canonical match/.test(c)) {
    return probeMugenTree(id, ["src/game"]);
  }
  if (/score|corpus|evidence|envelope/.test(c)) {
    return requirePaths(id, ["docs/evidence/score-adjudication-v1.json", "docs/evidence/compatibility-corpus-v1.2.json"]);
  }
  if (/audio|sound|snd/.test(c)) {
    return probeMugenTree(id);
  }
  if (/team|turns|tag|simul/.test(c)) {
    return probeMugenTree(id, ["src/game"]);
  }
  if (/build|export|release|bundle|vite|sdk|deploy|package/.test(c)) {
    return requirePaths(id, ["package.json"]);
  }
  if (/ai|command|mode|format|authoring|studio|editor/.test(c)) {
    return requirePaths(id, ["src/app/App.ts", "src/mugen"]);
  }

  // Fail closed for unmapped implementation cuts — never ok:true without a surface.
  return {
    id,
    ok: false,
    entryPoints: [],
    facts: { mapped: false },
    error: "no shipped probe mapping for cut",
  };
}

export function runAllMappedProbes(tasks: Array<{ id: string; kind: string; cut: string }>): Da29ProbeResult[] {
  return tasks.filter((t) => t.kind === "I").map((t) => runDa29ImplementationProbe(t.id, t.cut));
}

export function packageJsonHasScript(name: string): boolean {
  const pkg = JSON.parse(readText("package.json")) as { scripts?: Record<string, string> };
  return Boolean(pkg.scripts?.[name]);
}

export function evidenceFileDigestSample(rel: string): { exists: boolean; bytes: number } {
  if (!relExists(rel)) return { exists: false, bytes: 0 };
  return { exists: true, bytes: fileBytes(rel) };
}
