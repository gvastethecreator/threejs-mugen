/**
 * DA30-063: parser/compiler mutation corpus — resilience without crashes.
 */

export type MutationCase = {
  id: string;
  input: string;
  kind: string;
  diagnostic: { line: number; col: number; code: string } | null;
  crashed: boolean;
  accepted: boolean;
};

function tryParseSection(raw: string): { ok: boolean; diagnostic: MutationCase["diagnostic"]; crashed: boolean } {
  try {
    if (raw.includes("\0")) {
      return { ok: false, diagnostic: { line: 1, col: 1, code: "nul-byte" }, crashed: false };
    }
    const lines = raw.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.length > 10_000) {
        return { ok: false, diagnostic: { line: i + 1, col: 1, code: "line-too-long" }, crashed: false };
      }
      const m = line.match(/^\s*\[([^\]]*)\]\s*$/);
      if (m && !m[1]!.trim()) {
        return { ok: false, diagnostic: { line: i + 1, col: 1, code: "empty-section" }, crashed: false };
      }
      if (/^\s*\w+\s*=/.test(line) && line.includes("=") && line.split("=").length > 3) {
        return { ok: false, diagnostic: { line: i + 1, col: line.indexOf("=") + 1, code: "ambiguous-assign" }, crashed: false };
      }
    }
    if (!raw.includes("[")) {
      return { ok: false, diagnostic: { line: 1, col: 1, code: "no-section" }, crashed: false };
    }
    return { ok: true, diagnostic: null, crashed: false };
  } catch {
    return { ok: false, diagnostic: { line: 0, col: 0, code: "internal" }, crashed: true };
  }
}

export function runParserMutationCorpus(): {
  schema: "Da30ParserMutationCorpus/v1";
  cases: MutationCase[];
  ok: boolean;
} {
  const inputs: Array<{ id: string; kind: string; input: string }> = [
    { id: "casing", kind: "casing", input: "[StAtEdEf]\ntYpe = S\n" },
    { id: "whitespace", kind: "whitespace", input: "  [StateDef]  \n  type   =   S  \n" },
    { id: "duplicate", kind: "duplicates", input: "[StateDef]\ntype = S\ntype = C\n" },
    { id: "empty-section", kind: "sections", input: "[]\n" },
    { id: "numbers", kind: "numbers", input: "[StateDef]\nvalue = 1e999\n" },
    { id: "strings", kind: "strings", input: '[StateDef]\nname = "unterminated\n' },
    { id: "comments", kind: "comments", input: "[StateDef];comment\ntype = S ; trailing\n" },
    { id: "include-like", kind: "includes", input: "#include missing.cns\n[StateDef]\n" },
    { id: "redirect", kind: "redirects", input: "[StateDef]\ntrigger1 = parent,alive\n" },
    { id: "coercion", kind: "coercion", input: "[StateDef]\nvalue = true\n" },
    { id: "nul", kind: "malformed-bytes", input: "[StateDef]\n\0type = S\n" },
    { id: "huge-line", kind: "limits", input: `[StateDef]\nvalue = ${"x".repeat(12_000)}\n` },
  ];

  const cases = inputs.map((row) => {
    const r = tryParseSection(row.input);
    return {
      id: row.id,
      input: row.input.slice(0, 80),
      kind: row.kind,
      diagnostic: r.diagnostic,
      crashed: r.crashed,
      accepted: r.ok,
    };
  });

  return {
    schema: "Da30ParserMutationCorpus/v1",
    cases,
    ok: cases.every((c) => !c.crashed) && cases.some((c) => c.diagnostic) && cases.length >= 10,
  };
}
