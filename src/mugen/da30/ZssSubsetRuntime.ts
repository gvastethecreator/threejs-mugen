/**
 * DA30-094: one source-reviewed ZSS subset execution (named ops only).
 */

export type ZssOp = "let" | "if" | "call" | "map-get";

const GRANTED: ZssOp[] = ["let", "if", "map-get"];

export type ZssResult = {
  ok: boolean;
  op: string;
  value?: unknown;
  error?: string;
};

export function execZssOp(op: string, args: Record<string, unknown>, env: Record<string, unknown>): ZssResult {
  if (!GRANTED.includes(op as ZssOp)) {
    return { ok: false, op, error: `ungranted:${op}` };
  }
  if (op === "let") {
    const name = String(args.name ?? "");
    env[name] = args.value;
    return { ok: true, op, value: args.value };
  }
  if (op === "if") {
    return { ok: true, op, value: Boolean(args.cond) ? args.then : args.else };
  }
  if (op === "map-get") {
    const map = args.map as Record<string, unknown> | undefined;
    const key = String(args.key ?? "");
    if (!map || !(key in map)) return { ok: false, op, error: "missing-key" };
    return { ok: true, op, value: map[key] };
  }
  return { ok: false, op, error: "unreachable" };
}

export function runZssSubset(): {
  ok: boolean;
  granted: ZssOp[];
  rejected: string[];
  cases: ZssResult[];
} {
  const env: Record<string, unknown> = {};
  const cases = [
    execZssOp("let", { name: "x", value: 1 }, env),
    execZssOp("if", { cond: true, then: 2, else: 0 }, env),
    execZssOp("map-get", { map: { a: 9 }, key: "a" }, env),
    execZssOp("map-get", { map: { a: 9 }, key: "b" }, env),
    execZssOp("call", { name: "evil" }, env),
    execZssOp("eval", { code: "1+1" }, env),
  ];
  const rejected = cases.filter((c) => !c.ok).map((c) => c.error || c.op);
  return {
    ok:
      cases.filter((c) => c.ok).length >= 3 &&
      rejected.some((r) => r.includes("ungranted")) &&
      env.x === 1,
    granted: [...GRANTED],
    rejected,
    cases,
  };
}
