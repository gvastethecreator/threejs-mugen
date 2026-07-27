/**
 * DA30-050: controller/trigger support registry export from proof docs.
 * Rows require evidence path + explicit support language; name presence alone is not support.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type SupportState =
  | "parse"
  | "compile"
  | "execute"
  | "branch"
  | "trace"
  | "browser"
  | "profile"
  | "failure"
  | "source-review"
  | "recognized"
  | "unsupported"
  | "noop"
  | "unknown";

export type ControllerSupportRow = {
  name: string;
  states: SupportState[];
  evidence: string[];
  note: string;
};

const SKIP = new Set(
  [
    "State",
    "Trigger",
    "Controller",
    "true",
    "false",
    "null",
    "var",
    "fvar",
    "const",
    "Common",
    "MUGEN",
    "IKEMEN",
    "FightFX",
    "Common1",
  ].map((s) => s.toLowerCase()),
);

function classifyStates(context: string): SupportState[] {
  const states: SupportState[] = [];
  const rules: Array<[RegExp, SupportState]> = [
    [/executed-parity|parity/i, "execute"],
    [/executed-partial|executed/i, "execute"],
    [/\bcompiled\b|compile/i, "compile"],
    [/\brecognized\b|parser recognition|parse/i, "parse"],
    [/\bunsupported\b/i, "unsupported"],
    [/\bnoop\b/i, "noop"],
    [/\btrace\b/i, "trace"],
    [/\bbrowser\b/i, "browser"],
    [/\bprofile\b/i, "profile"],
    [/fail(?:ed|ure|s)?\s*closed|negative/i, "failure"],
    [/source[- ]review|official Elecbyte|pin/i, "source-review"],
  ];
  for (const [re, state] of rules) {
    if (re.test(context) && !states.includes(state)) states.push(state);
  }
  return states.length ? states : ["unknown"];
}

export function parseControllerSupportMarkdown(text: string, sourceRel: string): ControllerSupportRow[] {
  const byName = new Map<string, ControllerSupportRow>();
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    const tokens = [...line.matchAll(/`([A-Za-z][A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)`/g)].map((m) => m[1]!);
    if (!tokens.length) continue;
    const window = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(" ");
    for (const raw of tokens) {
      const name = raw.trim();
      if (name.length < 3 || name.length > 40) continue;
      if (SKIP.has(name.toLowerCase())) continue;
      if (!/^[A-Z]/.test(name) && !/^(Proj|Hit|Guard|Life|Power|Vel|Pos|Angle|After|Play|Stop|Snd|Env|Tag|Assert)/i.test(name)) {
        continue;
      }
      // Prefer controller-like tokens (no spaces) or short two-word specials
      if (/\s/.test(name) && !/^(NoKO|AssertSpecial)/i.test(name)) continue;
      const states = classifyStates(window);
      // Require support language near token — not name alone
      if (states.length === 1 && states[0] === "unknown" && !/executed|recognized|unsupported|compiled|noop|parity/i.test(window)) {
        continue;
      }
      const existing = byName.get(name);
      if (existing) {
        for (const s of states) {
          if (!existing.states.includes(s)) existing.states.push(s);
        }
      } else {
        byName.set(name, {
          name,
          states,
          evidence: [sourceRel],
          note: "derived from support-language context near token; name alone is not support",
        });
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function loadControllerSupportRegistry(root = process.cwd()): {
  rows: ControllerSupportRow[];
  sourcePath: string | null;
  ok: boolean;
} {
  const candidates = ["docs/CONTROLLER_SUPPORT_REGISTRY.md", "docs/SUPPORTED_FEATURES.md"];
  for (const rel of candidates) {
    const abs = resolve(root, rel);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, "utf8");
    const rows = parseControllerSupportMarkdown(text, rel);
    if (rows.length > 0) {
      return { rows: rows.slice(0, 400), sourcePath: abs, ok: true };
    }
  }
  return { rows: [], sourcePath: null, ok: false };
}

export function assertNoNameOnlySupport(rows: ControllerSupportRow[]): boolean {
  return rows.every(
    (r) =>
      r.evidence.length > 0 &&
      r.states.length > 0 &&
      !(r.states.length === 1 && r.states[0] === "unknown" && r.note.includes("name alone")),
  );
}
